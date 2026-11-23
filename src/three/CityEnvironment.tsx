import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BAND,
  CITY_DEPTH,
  FACADE_TILE,
  PIER_Z,
  coastX,
  generateBuildings,
  generateCars,
  generateLamps,
  generatePalms,
  makeBlockTexture,
  makeCoastStrip,
  makeFacadeTextures,
  makeFoamTexture,
  makeGlitterTexture,
  makePalmGeometry,
  makePavingTexture,
  makeRoadTexture,
  makeSandTexture,
  makeWaterNormals,
  type FacadeKind,
} from './coastalCity';
import { createFacadeMaterial } from './materials';
import { SCENE_YAW } from './SunSky';

/** Aircraft altitude above the sea (m). The whole coast is built at y = 0 and lowered by this. */
export const GROUND_Y = -85;

/** Local-frame sun heading (matches SUN_DIR before the SCENE_YAW turn). */
const SUN_LOCAL = new THREE.Vector2(0.375, -0.927).normalize();

/**
 * Sunset beach city in full 3D, modelled on the reference photo:
 * ocean with animated swell and a glittering sun path, surf lines, curved
 * beach, promenade and palm boulevard with traffic and street lights,
 * beachfront condos, downtown glass towers, a pier with a Ferris wheel,
 * and distant hills in the haze.
 */
export function CityEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <group rotation={[0, SCENE_YAW, 0]} position={[0, GROUND_Y, 0]}>
      <Ocean reducedMotion={reducedMotion} />
      <Shoreline reducedMotion={reducedMotion} />
      <Buildings />
      <Palms />
      <StreetLights />
      <Traffic reducedMotion={reducedMotion} />
      <Pier reducedMotion={reducedMotion} />
      <DistantHills />
    </group>
  );
}

// ── Ocean ────────────────────────────────────────────────────────────────────
function Ocean({ reducedMotion }: { reducedMotion: boolean }) {
  const normals = useMemo(() => makeWaterNormals(), []);
  const glitter = useMemo(() => makeGlitterTexture(), []);
  useEffect(
    () => () => {
      normals.dispose();
      glitter.dispose();
    },
    [normals, glitter],
  );
  const mat = useMemo(() => {
    // Standard (not Physical): the ocean covers most of the frame and uses no
    // clearcoat/transmission, so the cheaper shader looks the same.
    const m = new THREE.MeshStandardMaterial({
      color: '#16233a',
      roughness: 0.14,
      metalness: 0,
      normalMap: normals,
      normalScale: new THREE.Vector2(0.55, 0.55),
      envMapIntensity: 2.4,
    });
    normals.repeat.set(260, 260);
    return m;
  }, [normals]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame((_, dt) => {
    if (reducedMotion) return;
    const d = Math.min(dt, 0.05);
    normals.offset.x += d * 0.004;
    normals.offset.y -= d * 0.006;
    glitter.offset.y -= d * 0.035;
  });

  // glitter path: from just off the beach out to the horizon, along the sun heading
  const len = 2600;
  const angle = Math.atan2(SUN_LOCAL.x, -SUN_LOCAL.y); // rotation about y for a strip running along −z
  const start = new THREE.Vector2(160, -40);
  const center = start.clone().add(SUN_LOCAL.clone().multiplyScalar(len / 2));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={mat} receiveShadow={false}>
        <planeGeometry args={[12000, 12000]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, -angle]} position={[center.x, 0.5, center.y]} renderOrder={1}>
        <planeGeometry args={[230, len]} />
        <meshBasicMaterial map={glitter} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0.9} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
      </mesh>
    </group>
  );
}

// ── Beach, promenade, boulevard, city ground, surf ─────────────────────────
function Shoreline({ reducedMotion }: { reducedMotion: boolean }) {
  const tex = useMemo(
    () => ({
      wet: makeSandTexture(true),
      dry: makeSandTexture(false),
      paving: makePavingTexture(),
      road: makeRoadTexture(),
      block: makeBlockTexture(),
      foam: makeFoamTexture(),
    }),
    [],
  );
  useEffect(() => () => Object.values(tex).forEach((t) => t.dispose()), [tex]);

  const geo = useMemo(() => {
    const road = makeCoastStrip(BAND.roadEdge, BAND.road, 1.8, 1.8);
    // road texture runs across the carriageway: remap u to 0..1 across, v along length
    const uv = road.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, i % 2 === 0 ? 0 : 1, uv.getY(i) / 40);
    return {
      wet: makeCoastStrip(-10, BAND.wetSand, -0.7, 0.35),
      dry: makeCoastStrip(BAND.wetSand, BAND.drySand, 0.35, 1.7),
      promenade: makeCoastStrip(BAND.drySand, BAND.roadEdge, 1.9, 1.9),
      road,
      sidewalk: makeCoastStrip(BAND.road, BAND.sidewalk, 1.95, 1.95),
      city: makeCoastStrip(BAND.sidewalk, CITY_DEPTH + 700, 1.8, 1.8, 200),
      foam: [6, 16, 30].map((o) => makeCoastStrip(-o - 2.5, -o + 2.5, 0.3, 0.3, 300)),
    };
  }, []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => (Array.isArray(g) ? g.forEach((x) => x.dispose()) : g.dispose()));
    },
    [geo],
  );

  // foam: remap so the texture runs along the coast
  const foamMats = useMemo(
    () =>
      geo.foam.map((g, i) => {
        const uv = g.attributes.uv;
        for (let k = 0; k < uv.count; k++) uv.setXY(k, k % 2 === 0 ? 0 : 1, uv.getY(k) / 60);
        const t = tex.foam.clone();
        t.needsUpdate = true;
        return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, opacity: 0.85 - i * 0.2, color: '#ffe9da', polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
      }),
    [geo, tex.foam],
  );
  useEffect(() => () => foamMats.forEach((m) => m.dispose()), [foamMats]);

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    foamMats.forEach((m, i) => {
      m.opacity = (0.75 - i * 0.18) * (0.55 + 0.45 * Math.sin(t * 0.7 - i * 1.3));
      if (m.map) m.map.offset.y = t * 0.01 * (i % 2 ? 1 : -1);
    });
  });

  return (
    <group>
      <mesh geometry={geo.wet} receiveShadow>
        <meshStandardMaterial map={tex.wet} roughness={0.35} metalness={0.05} envMapIntensity={0.8} />
      </mesh>
      <mesh geometry={geo.dry} receiveShadow>
        <meshStandardMaterial map={tex.dry} roughness={0.95} />
      </mesh>
      <mesh geometry={geo.promenade} receiveShadow>
        <meshStandardMaterial map={tex.paving} roughness={0.85} />
      </mesh>
      <mesh geometry={geo.road} receiveShadow>
        <meshStandardMaterial map={tex.road} roughness={0.75} />
      </mesh>
      <mesh geometry={geo.sidewalk} receiveShadow>
        <meshStandardMaterial color="#9d968c" roughness={0.9} />
      </mesh>
      <mesh geometry={geo.city} receiveShadow>
        <meshStandardMaterial map={tex.block} roughness={0.85} />
      </mesh>
      {geo.foam.map((g, i) => (
        <mesh key={i} geometry={g} material={foamMats[i]} renderOrder={2} />
      ))}
    </group>
  );
}

// ── Buildings ───────────────────────────────────────────────────────────────
const KINDS: FacadeKind[] = ['condo', 'glass', 'stucco'];
const KIND_LOOK: Record<FacadeKind, { roughness: number; metalness: number; emissive: number }> = {
  condo: { roughness: 0.55, metalness: 0.05, emissive: 1.1 },
  glass: { roughness: 0.12, metalness: 0.65, emissive: 0.9 },
  stucco: { roughness: 0.85, metalness: 0, emissive: 1.0 },
};

function Buildings() {
  const buildings = useMemo(generateBuildings, []);
  const byKind = useMemo(() => Object.fromEntries(KINDS.map((k) => [k, buildings.filter((b) => b.kind === k)])) as Record<FacadeKind, typeof buildings>, [buildings]);
  const materials = useMemo(
    () =>
      Object.fromEntries(
        KINDS.map((k) => {
          const { map, emissive } = makeFacadeTextures(k);
          const look = KIND_LOOK[k];
          return [k, createFacadeMaterial({ map, emissiveMap: emissive, tile: FACADE_TILE[k], roughness: look.roughness, metalness: look.metalness, emissiveIntensity: look.emissive, key: k })];
        }),
      ) as Record<FacadeKind, THREE.MeshStandardMaterial>,
    [],
  );
  useEffect(
    () => () =>
      Object.values(materials).forEach((m) => {
        m.map?.dispose();
        m.emissiveMap?.dispose();
        m.dispose();
      }),
    [materials],
  );
  const refs = useRef<Partial<Record<FacadeKind, THREE.InstancedMesh | null>>>({});
  const roofRef = useRef<THREE.InstancedMesh>(null);
  const roofCount = Math.ceil(buildings.length * 0.6);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    for (const k of KINDS) {
      const mesh = refs.current[k];
      if (!mesh) continue;
      byKind[k].forEach((b, i) => {
        m.compose(new THREE.Vector3(b.x, 1.8 + b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d));
        mesh.setMatrixAt(i, m);
        mesh.setColorAt(i, b.color);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    // rooftop plant rooms / pool decks
    const roof = roofRef.current;
    if (roof) {
      let n = 0;
      buildings.forEach((b, i) => {
        if (n >= roofCount || i % 5 > 2) return;
        const w = b.w * (0.25 + ((i * 37) % 10) / 30);
        const d = b.d * (0.25 + ((i * 53) % 10) / 30);
        const h = 2.5 + ((i * 17) % 4);
        m.compose(new THREE.Vector3(b.x + b.w * 0.15, 1.8 + b.h + h / 2, b.z - b.d * 0.12), q, new THREE.Vector3(w, h, d));
        roof.setMatrixAt(n++, m);
      });
      roof.count = n;
      roof.instanceMatrix.needsUpdate = true;
      roof.computeBoundingSphere();
    }
  }, [byKind, buildings, roofCount]);

  return (
    <group>
      {KINDS.map((k) => (
        <instancedMesh
          key={k}
          ref={(el) => void (refs.current[k] = el)}
          args={[undefined, undefined, Math.max(1, byKind[k].length)]}
          material={materials[k]}
          castShadow={false}
          receiveShadow={false}
        >
          <boxGeometry args={[1, 1, 1]} />
        </instancedMesh>
      ))}
      <instancedMesh ref={roofRef} args={[undefined, undefined, roofCount]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#bdb8b0" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

// ── Palms ───────────────────────────────────────────────────────────────────
function Palms() {
  const palms = useMemo(generatePalms, []);
  const geo = useMemo(() => makePalmGeometry(), []);
  useEffect(() => () => geo.dispose(), [geo]);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    palms.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, 1.8, p.z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.r), new THREE.Vector3(p.s, p.s, p.s));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [palms]);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, palms.length]}>
      <meshStandardMaterial vertexColors roughness={0.8} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

// ── Street lights ───────────────────────────────────────────────────────────
function StreetLights() {
  const lamps = useMemo(generateLamps, []);
  const poles = useRef<THREE.InstancedMesh>(null);
  const heads = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    lamps.forEach(([x, z], i) => {
      m.compose(new THREE.Vector3(x, 1.8 + 4.5, z), q, new THREE.Vector3(1, 1, 1));
      poles.current?.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(x, 1.8 + 9.1, z), q, new THREE.Vector3(1, 1, 1));
      heads.current?.setMatrixAt(i, m);
    });
    [poles, heads].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      r.current.computeBoundingSphere();
    });
  }, [lamps]);
  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]}>
        <cylinderGeometry args={[0.12, 0.16, 9, 6]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.6} metalness={0.5} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, lamps.length]}>
        <sphereGeometry args={[0.55, 6, 4]} />
        <meshBasicMaterial color="#ffd08a" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// ── Traffic on the boulevard ────────────────────────────────────────────────
function Traffic({ reducedMotion }: { reducedMotion: boolean }) {
  const cars = useMemo(generateCars, []);
  const bodies = useRef<THREE.InstancedMesh>(null);
  const cabins = useRef<THREE.InstancedMesh>(null);
  const fronts = useRef<THREE.InstancedMesh>(null);
  const rears = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), p: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0), fwd: new THREE.Vector3() }), []);

  useLayoutEffect(() => {
    if (bodies.current) cars.forEach((c, i) => bodies.current!.setColorAt(i, c.color));
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true;
  }, [cars]);

  useFrame((_, dtRaw) => {
    const dt = reducedMotion ? 0 : Math.min(dtRaw, 0.05);
    const { m, q, s, p, up, fwd } = tmp;
    cars.forEach((c, i) => {
      c.z += c.dir * -1 * c.speed * dt; // dir 1 = heading into the distance (−z)
      if (c.z < -1750) c.z += 2350;
      if (c.z > 600) c.z -= 2350;
      const x = coastX(c.z) - c.lane;
      const ahead = coastX(c.z - c.dir * 2) - c.lane;
      const yaw = Math.atan2(ahead - x, -c.dir * 2) + Math.PI;
      q.setFromAxisAngle(up, yaw);
      p.set(x, 1.8 + 0.75, c.z);
      m.compose(p, q, s);
      bodies.current?.setMatrixAt(i, m);
      p.y = 1.8 + 1.55;
      m.compose(p, q, s);
      cabins.current?.setMatrixAt(i, m);
      fwd.set(0, 0, 1).applyQuaternion(q);
      p.set(x + fwd.x * 2.3, 1.8 + 0.8, c.z + fwd.z * 2.3);
      m.compose(p, q, s);
      fronts.current?.setMatrixAt(i, m);
      p.set(x - fwd.x * 2.3, 1.8 + 0.85, c.z - fwd.z * 2.3);
      m.compose(p, q, s);
      rears.current?.setMatrixAt(i, m);
    });
    [bodies, cabins, fronts, rears].forEach((r) => r.current && (r.current.instanceMatrix.needsUpdate = true));
  });

  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, cars.length]} frustumCulled={false}>
        <boxGeometry args={[1.9, 1.0, 4.5]} />
        <meshStandardMaterial roughness={0.3} metalness={0.6} />
      </instancedMesh>
      <instancedMesh ref={cabins} args={[undefined, undefined, cars.length]} frustumCulled={false}>
        <boxGeometry args={[1.7, 0.7, 2.4]} />
        <meshStandardMaterial color="#1a1f27" roughness={0.15} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={fronts} args={[undefined, undefined, cars.length]} frustumCulled={false}>
        <boxGeometry args={[1.6, 0.25, 0.1]} />
        <meshBasicMaterial color="#fff6e0" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={rears} args={[undefined, undefined, cars.length]} frustumCulled={false}>
        <boxGeometry args={[1.6, 0.25, 0.1]} />
        <meshBasicMaterial color="#ff2a1a" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// ── Pier with Ferris wheel ──────────────────────────────────────────────────
function Pier({ reducedMotion }: { reducedMotion: boolean }) {
  const wheel = useRef<THREE.Group>(null);
  const z = PIER_Z;
  const x0 = coastX(z) - BAND.drySand + 10;
  const len = 300;
  const deckY = 6;
  const pylons = useRef<THREE.InstancedMesh>(null);
  const bulbs = useRef<THREE.InstancedMesh>(null);
  const pylonCount = Math.floor(len / 10) * 2;
  const bulbCount = Math.floor(len / 6) * 2;

  const rimGeo = useMemo(() => {
    const g = new THREE.TorusGeometry(24, 0.45, 8, 120);
    const col = new Float32Array(g.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < g.attributes.position.count; i++) {
      const a = Math.atan2(g.attributes.position.getY(i), g.attributes.position.getX(i));
      c.setHSL(((a / (Math.PI * 2) + 1) % 1) * 0.9, 0.9, 0.62);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  useEffect(() => () => rimGeo.dispose(), [rimGeo]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    let i = 0;
    for (let d = 0; d < len - 5; d += 10) {
      for (const side of [-6, 6]) {
        m.compose(new THREE.Vector3(x0 + d, deckY / 2 - 3, z + side), q, new THREE.Vector3(1, 1, 1));
        pylons.current?.setMatrixAt(i++, m);
      }
    }
    i = 0;
    for (let d = 0; d < len - 3; d += 6) {
      for (const side of [-7, 7]) {
        m.compose(new THREE.Vector3(x0 + d, deckY + 2.2, z + side), q, new THREE.Vector3(1, 1, 1));
        bulbs.current?.setMatrixAt(i++, m);
      }
    }
    [pylons, bulbs].forEach((r) => {
      if (!r.current) return;
      r.current.instanceMatrix.needsUpdate = true;
      r.current.computeBoundingSphere();
    });
  }, [x0, z]);

  useFrame((_, dt) => {
    if (wheel.current && !reducedMotion) wheel.current.rotation.z += Math.min(dt, 0.05) * 0.06;
  });

  const wheelX = x0 + 110;
  const hubY = deckY + 28;
  return (
    <group>
      {/* deck */}
      <mesh position={[x0 + len / 2, deckY, z]}>
        <boxGeometry args={[len, 1, 15]} />
        <meshStandardMaterial color="#7d6650" roughness={0.9} />
      </mesh>
      <instancedMesh ref={pylons} args={[undefined, undefined, pylonCount]}>
        <cylinderGeometry args={[0.35, 0.35, deckY + 6, 6]} />
        <meshStandardMaterial color="#3d332c" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={bulbs} args={[undefined, undefined, bulbCount]}>
        <sphereGeometry args={[0.3, 5, 3]} />
        <meshBasicMaterial color="#ffd9a0" toneMapped={false} />
      </instancedMesh>
      {/* pier buildings */}
      {[
        [x0 + 40, 9, 12, 7],
        [x0 + 165, 14, 13, 8],
        [x0 + 270, 26, 14, 9],
      ].map(([x, w, d, h], i) => (
        <group key={i} position={[x, deckY + h / 2 + 0.5, z]}>
          <mesh>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={i === 2 ? '#e9e2d6' : '#f1ece4'} roughness={0.7} />
          </mesh>
          <mesh position={[0, h / 2 + 0.4, 0]}>
            <boxGeometry args={[w + 1.2, 0.8, d + 1.2]} />
            <meshStandardMaterial color="#3f5a7a" roughness={0.6} />
          </mesh>
          <mesh position={[0, -h / 2 + 1.6, d / 2 + 0.05]}>
            <planeGeometry args={[w * 0.8, 1.6]} />
            <meshBasicMaterial color="#ffcf8f" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Ferris wheel */}
      <group position={[wheelX, hubY, z]}>
        {[-2.2, 2.2].map((s) => (
          <group key={s} position={[0, 0, s]}>
            <mesh position={[-8, -hubY / 2 + deckY / 2 + 0.5, 0]} rotation={[0, 0, -0.32]}>
              <cylinderGeometry args={[0.35, 0.5, hubY - deckY + 2, 8]} />
              <meshStandardMaterial color="#d8d6d2" metalness={0.6} roughness={0.35} />
            </mesh>
            <mesh position={[8, -hubY / 2 + deckY / 2 + 0.5, 0]} rotation={[0, 0, 0.32]}>
              <cylinderGeometry args={[0.35, 0.5, hubY - deckY + 2, 8]} />
              <meshStandardMaterial color="#d8d6d2" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        ))}
        <group ref={wheel}>
          {[-1.6, 1.6].map((s) => (
            <mesh key={s} geometry={rimGeo} position={[0, 0, s]}>
              <meshBasicMaterial vertexColors toneMapped={false} />
            </mesh>
          ))}
          <WheelSpokesAndCabins />
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 4.6, 16]} />
            <meshStandardMaterial color="#cfcac2" metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

const CABIN_COLORS = ['#ff6b6b', '#ffd166', '#4ecdc4', '#a78bfa'];
const WHEEL_SPOKES = 24;

/** 24 spokes + 24 gondolas as 5 instanced draws instead of 48 separate meshes. */
function WheelSpokesAndCabins() {
  const spokes = useRef<THREE.InstancedMesh>(null);
  const cabins = useRef<(THREE.InstancedMesh | null)[]>([]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const r = new THREE.Matrix4();
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < WHEEL_SPOKES; i++) {
      const a = (i / WHEEL_SPOKES) * Math.PI * 2;
      // spoke: rotate by a, push out 12 along x, lay the cylinder along x
      m.makeRotationZ(a).multiply(r.makeTranslation(12, 0, 0)).multiply(r.makeRotationZ(Math.PI / 2));
      spokes.current?.setMatrixAt(i, m);
      // gondola hangs level at the rim
      m.makeTranslation(24 * Math.cos(a), 24 * Math.sin(a), 0);
      const k = i % CABIN_COLORS.length;
      cabins.current[k]?.setMatrixAt(counts[k]++, m);
    }
    [spokes.current, ...cabins.current].forEach((mesh) => {
      if (!mesh) return;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, []);
  return (
    <>
      <instancedMesh ref={spokes} args={[undefined, undefined, WHEEL_SPOKES]}>
        <cylinderGeometry args={[0.08, 0.08, 24, 4]} />
        <meshStandardMaterial color="#e6e4e0" metalness={0.5} roughness={0.4} />
      </instancedMesh>
      {CABIN_COLORS.map((c, k) => (
        <instancedMesh key={c} ref={(el) => void (cabins.current[k] = el)} args={[undefined, undefined, WHEEL_SPOKES / CABIN_COLORS.length]}>
          <boxGeometry args={[1.8, 2.2, 2.4]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.6} roughness={0.5} />
        </instancedMesh>
      ))}
    </>
  );
}

// ── Distant hills on the horizon ────────────────────────────────────────────
function DistantHills() {
  const hills: [number, number, number, number][] = [
    [-1400, -3600, 900, 140],
    [-500, -3900, 1100, 110],
    [-2300, -3100, 800, 170],
    [-2600, -1800, 700, 150],
  ];
  return (
    <group>
      {hills.map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, 0, z]} scale={[r, h, r * 0.6]}>
          <sphereGeometry args={[1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#5a4c5c" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}
