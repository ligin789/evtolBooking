import { Cloud, Clouds } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { seededRandom } from '../lib/random';
import { makeCloudTexture, makeFacadeTexture } from './materials';

/** Altitude of the aircraft above the city ground plane (m). */
export const GROUND_Y = -125;
/** The city slowly rotates around a pivot so the aircraft appears to fly a coastal arc. */
const ORBIT_R = 230;
const LAND_R = 300;

interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: THREE.Color;
}

function generateCity(): { buildings: Building[]; pads: [number, number, number][] } {
  const rnd = seededRandom('port-meridian');
  const buildings: Building[] = [];
  const palette = ['#f2eee6', '#e6e1d7', '#d5d9de', '#c4ccd6', '#9aa6b4', '#3a3f47', '#e9dcc4'].map((c) => new THREE.Color(c));
  const downtown = new THREE.Vector2(120, -30);
  const step = 15;
  for (let gx = -LAND_R; gx <= LAND_R; gx += step) {
    for (let gz = -LAND_R; gz <= LAND_R; gz += step) {
      const x = gx + (rnd() - 0.5) * 6;
      const z = gz + (rnd() - 0.5) * 6;
      const r = Math.hypot(x, z);
      const coast = coastRadius(Math.atan2(z, x)) - 18;
      if (r > coast) continue;
      // streets / boulevards
      if (Math.abs(gx % 60) < 1 || Math.abs(gz % 75) < 1) continue;
      const dDown = Math.hypot(x - downtown.x, z - downtown.y);
      const density = 0.55 + 0.4 * Math.exp(-((dDown / 120) ** 2));
      if (rnd() > density) continue;
      // a ring of high-rises inside the corridor keeps a skyline in view as the city turns
      const ring = Math.exp(-(((r - 135) / 32) ** 2));
      let h = 8 + rnd() * 22 + (150 * Math.exp(-((dDown / 60) ** 2)) + 55 * ring * (rnd() < 0.45 ? 1 : 0.3)) * (0.35 + rnd() * 0.65);
      // keep the flight corridor clear
      if (Math.abs(r - ORBIT_R) < 40) h = Math.min(h, 45);
      if (r < 40) h = Math.min(h, 40);
      const w = 7 + rnd() * 6;
      const d = 7 + rnd() * 6;
      const color = palette[Math.floor(rnd() * palette.length)].clone();
      if (h > 90) color.copy(palette[rnd() < 0.5 ? 3 : 0]);
      buildings.push({ x, z, w, d, h, color });
    }
  }
  // rooftop vertiports on mid-rise buildings near the corridor
  const pads: [number, number, number][] = buildings
    .filter((b) => b.h > 25 && b.h < 55 && Math.abs(Math.hypot(b.x, b.z) - ORBIT_R) < 70)
    .filter((_, i) => i % 23 === 0)
    .slice(0, 8)
    .map((b) => {
      b.w = b.d = 18;
      return [b.x, b.h, b.z];
    });
  return { buildings, pads };
}

function coastRadius(angle: number) {
  return LAND_R + Math.sin(angle * 3) * 22 + Math.sin(angle * 7 + 1.3) * 10 + Math.cos(angle * 13) * 5;
}

export function CityEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  const pivot = useRef<THREE.Group>(null);
  const towers = useRef<THREE.InstancedMesh>(null);
  const { buildings, pads } = useMemo(generateCity, []);
  const facade = useMemo(() => makeFacadeTexture(), []);
  useEffect(() => () => facade.dispose(), [facade]);

  const landGeo = useMemo(() => {
    const s = new THREE.Shape();
    const n = 160;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = coastRadius(a);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, -y);
      else s.lineTo(x, -y);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 6, bevelEnabled: true, bevelThickness: 2, bevelSize: 6, bevelSegments: 2, curveSegments: 4 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -6, 0);
    return g;
  }, []);

  useLayoutEffect(() => {
    const mesh = towers.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    buildings.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, b.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [buildings]);

  useFrame((_, dt) => {
    if (pivot.current) pivot.current.rotation.y += Math.min(dt, 0.05) * (reducedMotion ? 0.004 : 0.03);
  });

  return (
    <group>
      {/* sea */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y - 1.5, 0]} receiveShadow={false}>
        <planeGeometry args={[6000, 6000]} />
        <meshStandardMaterial color="#2e6274" metalness={0.55} roughness={0.16} />
      </mesh>
      <group position={[-ORBIT_R, GROUND_Y, 0]}>
        <group ref={pivot}>
          <mesh geometry={landGeo}>
            <meshStandardMaterial color="#d6ccb9" roughness={0.95} />
          </mesh>
          {/* parks */}
          {[
            [-60, 150, 34],
            [80, -90, 46],
            [-200, -80, 28],
          ].map(([x, z, r], i) => (
            <mesh key={i} position={[x, 0.3, z]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[r, 32]} />
              <meshStandardMaterial color="#7f9a6e" roughness={1} />
            </mesh>
          ))}
          <instancedMesh ref={towers} args={[undefined, undefined, buildings.length]} frustumCulled={false}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial map={facade} roughness={0.5} metalness={0.25} />
          </instancedMesh>
          {pads.map(([x, h, z], i) => (
            <group key={i} position={[x, h + 0.3, z]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[7.5, 40]} />
                <meshStandardMaterial color="#2a2c31" roughness={0.7} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[6.4, 7, 48]} />
                <meshBasicMaterial color={i % 2 ? '#3d7bff' : '#e8c88a'} toneMapped={false} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}

/** Soft cumulus layer around and below the flight level. */
export function CloudLayer({ reducedMotion }: { reducedMotion: boolean }) {
  const texture = useMemo(() => makeCloudTexture(), []);
  const speed = reducedMotion ? 0 : 0.12;
  const clouds: { pos: [number, number, number]; bounds: [number, number, number]; seed: number; vol: number }[] = [
    { pos: [-60, -18, -90], bounds: [40, 6, 20], seed: 1, vol: 26 },
    { pos: [70, -30, -140], bounds: [60, 8, 26], seed: 2, vol: 32 },
    { pos: [-120, -8, 30], bounds: [40, 6, 26], seed: 3, vol: 26 },
    { pos: [30, -45, 80], bounds: [50, 8, 24], seed: 4, vol: 30 },
    { pos: [-30, 26, -180], bounds: [80, 8, 30], seed: 5, vol: 40 },
    { pos: [160, -12, -40], bounds: [40, 6, 30], seed: 6, vol: 28 },
  ];
  return (
    <Clouds texture={texture} limit={220} frustumCulled={false} material={THREE.MeshBasicMaterial}>
      {clouds.map((c) => (
        <Cloud key={c.seed} seed={c.seed} position={c.pos} bounds={c.bounds} segments={26} volume={c.vol} speed={speed} growth={4} opacity={0.55} fade={80} color="#fffaf2" />
      ))}
    </Clouds>
  );
}
