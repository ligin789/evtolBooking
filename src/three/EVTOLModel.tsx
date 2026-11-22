import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HULL_HEIGHT_SCALE, getAircraft, getSeats, hullRadiusAt, type AircraftConfig } from '../config/aircraft';
import { useExperience } from '../store/experienceStore';
import { CabinCutaway } from './CabinCutaway';
import { EVTOLCabin } from './EVTOLCabin';
import { cylinderBetween, hullHalfWidth, makeFinGeometry, makeHullGeometry, makeWingGeometry } from './geometry';
import { createAircraftMaterials, makeTextTexture, type AircraftMaterials } from './materials';
import { RotorAnimation } from './RotorAnimation';

/** Derived layout numbers shared by the airframe parts. */
export function airframeLayout(cfg: AircraftConfig) {
  const seats = getSeats(cfg.id);
  const rearSeatZ = Math.min(...seats.map((s) => s.position[2]));
  const cabinRear = rearSeatZ - 0.72;
  const cabinFront = cfg.length / 2 - cfg.length * 0.085;
  const wingZ = cabinRear - 0.5;
  const wingY = hullRadiusAt(cfg, wingZ) * HULL_HEIGHT_SCALE * 0.9;
  const boomX = 2.45;
  const boomY = wingY - 0.06;
  const boomFront = wingZ + 2.95;
  const boomRear = wingZ - 2.25;
  const halfSpan = 5.4;
  // Window line sits just below the hull centre for a panoramic canopy
  const canopyHalfAngle = 1.72;
  return { seats, cabinRear, cabinFront, wingZ, wingY, boomX, boomY, boomFront, boomRear, halfSpan, canopyHalfAngle };
}

export type AirframeLayout = ReturnType<typeof airframeLayout>;

interface Props {
  aircraftId: string;
  reducedMotion: boolean;
}

export function EVTOLModel({ aircraftId, reducedMotion }: Props) {
  const cfg = getAircraft(aircraftId);
  const mats = useMemo(() => createAircraftMaterials(), []);
  const layout = useMemo(() => airframeLayout(cfg), [cfg]);

  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  return (
    <group>
      <Fuselage cfg={cfg} layout={layout} mats={mats} />
      <CabinCutaway cfg={cfg} layout={layout} mats={mats} />
      <EVTOLCabin cfg={cfg} layout={layout} mats={mats} />
      <Wing layout={layout} mats={mats} reducedMotion={reducedMotion} />
      <Booms layout={layout} mats={mats} reducedMotion={reducedMotion} />
      <Tail cfg={cfg} mats={mats} />
      <Skids cfg={cfg} layout={layout} mats={mats} />
    </group>
  );
}

interface PartProps {
  cfg: AircraftConfig;
  layout: AirframeLayout;
  mats: AircraftMaterials;
}

function Fuselage({ cfg, layout, mats }: PartProps) {
  const { cabinRear, cabinFront, canopyHalfAngle: a } = layout;
  const geos = useMemo(() => {
    const L = cfg.length / 2;
    const tail = makeHullGeometry(cfg, -L, cabinRear, { samples: 40 });
    const lower = makeHullGeometry(cfg, cabinRear, cabinFront, { phiStart: Math.PI + a, phiLength: Math.PI * 2 - 2 * a, samples: 56 });
    const nose = makeHullGeometry(cfg, cabinFront, L, { samples: 20 });
    // graphite belly band for a two-tone livery
    const belly = makeHullGeometry(cfg, -L * 0.82, L * 0.93, { phiStart: -0.62, phiLength: 1.24, radiusScale: 1.004, samples: 64 });
    return { tail, lower, nose, belly };
  }, [cfg, cabinRear, cabinFront, a]);

  // LED waistline strips following the hull
  const ledGeos = useMemo(() => {
    const make = (side: 1 | -1) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const z = THREE.MathUtils.lerp(-cfg.length * 0.36, cfg.length * 0.42, i / 40);
        const r = hullRadiusAt(cfg, z);
        const y = -0.32 * r * HULL_HEIGHT_SCALE;
        const x = hullHalfWidth(cfg, z, y) + 0.004;
        pts.push(new THREE.Vector3(side * x, y, z));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.011, 6, false);
    };
    return [make(1), make(-1)];
  }, [cfg]);

  const regTex = useMemo(() => makeTextTexture('AERIS', { color: '#1f2125', font: '700 84px "Inter Tight", system-ui, sans-serif' }), []);
  useEffect(() => () => regTex.dispose(), [regTex]);
  const brandZ = -cfg.length * 0.3;
  const brandR = hullRadiusAt(cfg, brandZ);
  const brandY = -0.05;
  const brandX = hullHalfWidth(cfg, brandZ, brandY) + 0.01;

  return (
    <group>
      <mesh geometry={geos.tail} material={mats.paint} castShadow receiveShadow />
      <mesh geometry={geos.lower} material={mats.paint} castShadow receiveShadow />
      <mesh geometry={geos.nose} material={mats.paint} castShadow />
      <mesh geometry={geos.belly} material={mats.graphite} castShadow />
      {ledGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={mats.ledBlue} />
      ))}
      {/* brand decals on the tail cone */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * brandX, brandY, brandZ]} rotation={[0, s * (Math.PI / 2), 0]} scale={[brandR * 0.95, brandR * 0.24, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={regTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {/* nose sensor window */}
      <mesh position={[0, -0.08, cfg.length / 2 - 0.07]} material={mats.graphite}>
        <sphereGeometry args={[0.09, 20, 12]} />
      </mesh>
    </group>
  );
}

function Wing({ layout, mats, reducedMotion }: { layout: AirframeLayout; mats: AircraftMaterials; reducedMotion: boolean }) {
  const { wingZ, wingY, halfSpan } = layout;
  const geo = useMemo(() => makeWingGeometry(halfSpan, 1.3, 0.38, 0.13, 0.035, 0.05), [halfSpan]);
  const tipY = wingY + 0.035 * halfSpan;
  return (
    <group position={[0, wingY, wingZ]}>
      {[1, -1].map((s) => (
        <group key={s} scale={[s, 1, 1]}>
          <mesh geometry={geo} material={mats.paint} castShadow receiveShadow />
          <TiltNacelle position={[halfSpan + 0.05, tipY - wingY, -0.05]} side={s as 1 | -1} mats={mats} reducedMotion={reducedMotion} />
        </group>
      ))}
      {/* wing root fairing */}
      <mesh position={[0, 0.04, -0.1]} scale={[0.9, 0.22, 1.1]} material={mats.paint} castShadow>
        <sphereGeometry args={[1, 24, 12]} />
      </mesh>
    </group>
  );
}

function TiltNacelle({ position, side, mats, reducedMotion }: { position: [number, number, number]; side: 1 | -1; mats: AircraftMaterials; reducedMotion: boolean }) {
  const tilt = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!tilt.current) return;
    const hover = useExperience.getState().flightMode === 'hover';
    const target = hover ? -Math.PI / 2 : 0;
    tilt.current.rotation.x += (target - tilt.current.rotation.x) * Math.min(1, (reducedMotion ? 6 : 1.4) * Math.min(dt, 0.05));
  });
  return (
    <group position={position}>
      <group ref={tilt}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.15]} material={mats.paint} castShadow>
          <capsuleGeometry args={[0.16, 0.95, 8, 20]} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.32]} material={mats.graphite}>
          <cylinderGeometry args={[0.165, 0.12, 0.12, 20]} />
        </mesh>
        {/* nav light */}
        <mesh position={[0.17, 0, 0.3]} material={side === 1 ? mats.navRed : mats.navGreen}>
          <sphereGeometry args={[0.035, 10, 8]} />
        </mesh>
        <group position={[0, 0, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
          <RotorAnimation radius={1.15} blades={5} role="tilt" direction={side} mats={mats} reducedMotion={reducedMotion} />
        </group>
      </group>
    </group>
  );
}

function Booms({ layout, mats, reducedMotion }: { layout: AirframeLayout; mats: AircraftMaterials; reducedMotion: boolean }) {
  const { boomX, boomY, boomFront, boomRear } = layout;
  const len = boomFront - boomRear;
  const mid = (boomFront + boomRear) / 2;
  return (
    <group>
      {[1, -1].map((s) => (
        <group key={s} position={[s * boomX, boomY, 0]}>
          <mesh position={[0, 0, mid]} rotation={[Math.PI / 2, 0, 0]} material={mats.paint} castShadow receiveShadow>
            <capsuleGeometry args={[0.13, len - 0.26, 8, 20]} />
          </mesh>
          {/* graphite boom stripe */}
          <mesh position={[0, -0.02, mid]} rotation={[Math.PI / 2, 0, 0]} material={mats.graphite}>
            <cylinderGeometry args={[0.132, 0.132, len * 0.55, 20, 1, true, Math.PI * 0.65, Math.PI * 0.7]} />
          </mesh>
          {[boomFront - 0.28, boomRear + 0.28].map((z, i) => (
            <group key={i} position={[0, 0, z]}>
              <mesh position={[0, 0.17, 0]} material={mats.graphite} castShadow>
                <cylinderGeometry args={[0.07, 0.11, 0.26, 16]} />
              </mesh>
              <group position={[0, 0.32, 0]}>
                <RotorAnimation radius={1.02} blades={4} role="lift" direction={(i === 0 ? s : -s) as 1 | -1} mats={mats} reducedMotion={reducedMotion} />
              </group>
            </group>
          ))}
          {/* boom tip LED */}
          <mesh position={[0, 0, boomFront + 0.01]} material={mats.ledBlue}>
            <sphereGeometry args={[0.04, 10, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Tail({ cfg, mats }: { cfg: AircraftConfig; mats: AircraftMaterials }) {
  const L = cfg.length / 2;
  const fin = useMemo(() => makeFinGeometry(1.25, 0.95, 0.5), []);
  const boomStart = new THREE.Vector3(0, 0.12, -L + 0.7);
  const boomEnd = new THREE.Vector3(0, 0.3, -L - 1.05);
  const boomGeo = useMemo(() => cylinderBetween(boomStart, boomEnd, 0.13, 20), [cfg.length]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <group>
      <mesh geometry={boomGeo} material={mats.paint} castShadow />
      <group position={[0, 0.3, -L - 0.55]}>
        {[1, -1].map((s) => (
          <group key={s} rotation={[0, 0, s * -0.72]}>
            <mesh geometry={fin} material={mats.paint} castShadow />
            <mesh position={[0, 1.2, -0.95]} material={mats.graphite}>
              <boxGeometry args={[0.07, 0.06, 0.5]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* tail strobe */}
      <mesh position={[0, 0.3, -L - 1.08]} material={mats.ledWarm}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
    </group>
  );
}

function Skids({ cfg, layout, mats }: PartProps) {
  const geos = useMemo(() => {
    const out: THREE.BufferGeometry[] = [];
    const skidY = -cfg.maxRadius * HULL_HEIGHT_SCALE - 0.42;
    const zFront = layout.cabinFront - 0.4;
    const zRear = layout.cabinRear - 0.2;
    for (const s of [1, -1]) {
      const x = s * 0.82;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(x, skidY + 0.02, zRear - 0.15),
        new THREE.Vector3(x, skidY, zRear + 0.3),
        new THREE.Vector3(x, skidY, zFront - 0.3),
        new THREE.Vector3(x, skidY + 0.08, zFront + 0.15),
        new THREE.Vector3(x, skidY + 0.26, zFront + 0.36),
      ]);
      out.push(new THREE.TubeGeometry(curve, 48, 0.045, 10, false));
      for (const z of [zRear + 0.45, zFront - 0.55]) {
        const hullY = -hullRadiusAt(cfg, z) * HULL_HEIGHT_SCALE * 0.82;
        out.push(cylinderBetween(new THREE.Vector3(x, skidY, z), new THREE.Vector3(s * 0.38, hullY, z + 0.05), 0.04));
      }
    }
    return out;
  }, [cfg, layout.cabinFront, layout.cabinRear]);
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={i % 3 === 0 ? mats.graphite : mats.chrome} castShadow />
      ))}
    </group>
  );
}
