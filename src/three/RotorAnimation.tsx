import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useExperience } from '../store/experienceStore';
import type { AircraftMaterials } from './materials';

interface RotorProps {
  radius: number;
  blades?: number;
  /** 'lift' rotors slow down in cruise; 'tilt' props always run. */
  role: 'lift' | 'tilt';
  direction?: 1 | -1;
  mats: AircraftMaterials;
  reducedMotion: boolean;
}

const MAX_RAD_PER_S = 42;

/**
 * A rotor assembly: hub, spinner, twisted carbon blades and a translucent
 * blur disc whose opacity rises with RPM (prevents strobing at high speed).
 * The rotor spins around its local Y axis.
 */
export function RotorAnimation({ radius, blades = 5, role, direction = 1, mats, reducedMotion }: RotorProps) {
  const spin = useRef<THREE.Group>(null);
  const speed = useRef(0);

  const bladeGeo = useMemo(() => {
    // Tapered blade: wide at root, narrow tip, slight twist baked in.
    const len = radius * 0.94;
    const g = new THREE.BoxGeometry(len, 0.022, 0.14, 8, 1, 1);
    g.translate(len / 2 + radius * 0.06, 0, 0);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const k = x / radius; // 0..1 along span
      pos.setZ(i, pos.getZ(i) * (1 - k * 0.55));
      const twist = (1 - k) * 0.32;
      const y = pos.getY(i);
      const z = pos.getZ(i);
      pos.setY(i, y * Math.cos(twist) - z * Math.sin(twist));
      pos.setZ(i, y * Math.sin(twist) + z * Math.cos(twist));
    }
    g.computeVertexNormals();
    return g;
  }, [radius]);

  const bladeMat = useMemo(() => {
    const m = mats.carbon.clone();
    m.transparent = true;
    return m;
  }, [mats]);

  const discMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#c8ccd4',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const tipMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#3d7bff', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
    [],
  );

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const mode = useExperience.getState().flightMode;
    let target = role === 'lift' ? (mode === 'hover' ? 1 : 0.32) : 1;
    if (reducedMotion) target *= 0.12;
    speed.current += (target - speed.current) * Math.min(1, dt * 1.6);
    if (spin.current) spin.current.rotation.y += direction * speed.current * MAX_RAD_PER_S * dt;
    const blur = THREE.MathUtils.smoothstep(speed.current, 0.25, 0.9);
    bladeMat.opacity = 1 - blur * 0.72;
    discMat.opacity = blur * 0.16;
    tipMat.opacity = blur * 0.35;
  });

  return (
    <group>
      {/* hub + spinner */}
      <mesh material={mats.graphite} castShadow>
        <cylinderGeometry args={[radius * 0.1, radius * 0.12, 0.12, 24]} />
      </mesh>
      <mesh material={mats.chrome} position={[0, 0.09, 0]}>
        <sphereGeometry args={[radius * 0.085, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <group ref={spin} position={[0, 0.04, 0]}>
        {Array.from({ length: blades }, (_, i) => (
          <mesh key={i} geometry={bladeGeo} material={bladeMat} rotation={[0, (i / blades) * Math.PI * 2, 0]} />
        ))}
      </group>
      <mesh material={discMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <ringGeometry args={[radius * 0.14, radius, 48]} />
      </mesh>
      <mesh material={tipMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.046, 0]}>
        <ringGeometry args={[radius * 0.97, radius * 1.0, 64]} />
      </mesh>
    </group>
  );
}
