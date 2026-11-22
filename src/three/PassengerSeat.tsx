import { RoundedBox } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SeatDef } from '../config/aircraft';
import { SeatTooltip } from './SeatTooltip';

export type SeatState = 'available' | 'selected' | 'occupied' | 'pilot';

interface Props {
  seat: SeatDef;
  state: SeatState;
  hovered: boolean;
  focused: boolean;
  interactive: boolean;
  showTooltip: boolean;
  price: number | null;
  passengerTag: string | null;
  onHover: (id: string | null) => void;
  onSelect: (seat: SeatDef) => void;
  reducedMotion: boolean;
}

const LEATHER: Record<SeatState, string> = {
  available: '#ece1cd',
  selected: '#f3ead9',
  occupied: '#55575d',
  pilot: '#2b2d32',
};
const PANEL: Record<SeatState, string> = {
  available: '#d4c3a3',
  selected: '#dccaa8',
  occupied: '#3c3e43',
  pilot: '#1d1f23',
};

/**
 * A premium eVTOL passenger seat built from rounded primitives.
 * Hover lifts a ring of light on the floor; selection plays a spring pulse
 * and lights the seat piping in electric blue.
 */
export function PassengerSeat({ seat, state, hovered, focused, interactive, showTooltip, price, passengerTag, onHover, onSelect, reducedMotion }: Props) {
  const root = useRef<THREE.Group>(null);
  const pulseStart = useRef<number | null>(null);
  const prevState = useRef(state);

  const mats = useMemo(() => {
    const leather = new THREE.MeshStandardMaterial({ color: LEATHER[state], roughness: 0.62, metalness: 0 });
    const panel = new THREE.MeshStandardMaterial({ color: PANEL[state], roughness: 0.5, metalness: 0.1 });
    const piping = new THREE.MeshStandardMaterial({ color: '#c9a86a', emissive: '#000000', roughness: 0.3, metalness: 0.6, toneMapped: false });
    const ring = new THREE.MeshBasicMaterial({ color: '#3d7bff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const base = new THREE.MeshStandardMaterial({ color: '#2a2c31', roughness: 0.4, metalness: 0.7 });
    return { leather, panel, piping, ring, base };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);

  // colour targets
  const targets = useMemo(() => {
    const leather = new THREE.Color(LEATHER[state]);
    if (hovered && state === 'available') leather.offsetHSL(0, 0.04, 0.04);
    return {
      leather,
      panel: new THREE.Color(PANEL[state]),
      pipeEmissive: new THREE.Color(state === 'selected' ? '#3d7bff' : hovered && state === 'available' ? '#7aa4ff' : state === 'pilot' ? '#5b4a28' : '#000000'),
      pipeColor: new THREE.Color(state === 'selected' || (hovered && state === 'available') ? '#3d7bff' : state === 'occupied' ? '#6b6d72' : '#c9a86a'),
      ring: state === 'selected' ? (focused ? 0.95 : 0.6) : hovered ? (state === 'available' ? 0.55 : 0.25) : 0,
      ringColor: new THREE.Color(state === 'selected' || state === 'available' ? '#3d7bff' : state === 'pilot' ? '#c9a86a' : '#d4533b'),
      lift: state === 'selected' ? 0.025 : hovered && state === 'available' ? 0.012 : 0,
    };
  }, [state, hovered, focused]);

  useEffect(() => {
    if (state === 'selected' && prevState.current !== 'selected') pulseStart.current = performance.now();
    prevState.current = state;
  }, [state]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const k = Math.min(1, dt * 8);
    mats.leather.color.lerp(targets.leather, k);
    mats.panel.color.lerp(targets.panel, k);
    mats.piping.emissive.lerp(targets.pipeEmissive, k);
    mats.piping.color.lerp(targets.pipeColor, k);
    mats.ring.color.lerp(targets.ringColor, k);
    mats.ring.opacity += (targets.ring - mats.ring.opacity) * k;
    if (!root.current) return;
    root.current.position.y += (targets.lift - root.current.position.y) * k;
    let scale = 1;
    if (pulseStart.current !== null && !reducedMotion) {
      const s = (performance.now() - pulseStart.current) / 1000;
      if (s > 1.4) pulseStart.current = null;
      else scale = 1 + Math.exp(-s * 4) * Math.sin(s * 16) * 0.07;
    }
    root.current.scale.setScalar(scale);
  });

  const [x, y, z] = seat.position;
  const cursorFor = () => (state === 'available' || state === 'selected' ? 'pointer' : 'not-allowed');

  const handlers = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(seat.id);
          document.body.style.cursor = cursorFor();
        },
        onPointerOut: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = '';
        },
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(seat);
        },
      }
    : {};

  useEffect(() => {
    if (!interactive && hovered) document.body.style.cursor = '';
  }, [interactive, hovered]);

  const isPilot = seat.kind === 'pilot';
  return (
    <group position={[x, y, z]}>
      {/* floor halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} material={mats.ring}>
        <ringGeometry args={[0.36, 0.42, 48]} />
      </mesh>
      <group ref={root}>
        {/* pedestal */}
        <mesh position={[0, 0.14, 0.02]} material={mats.base} castShadow>
          <boxGeometry args={[0.3, 0.28, 0.34]} />
        </mesh>
        {/* cushion */}
        <RoundedBox args={[0.52, 0.13, 0.52]} radius={0.05} smoothness={3} position={[0, 0.34, 0.02]} material={mats.leather} castShadow receiveShadow />
        {/* backrest */}
        <group position={[0, 0.38, -0.23]} rotation={[-0.16, 0, 0]}>
          <RoundedBox args={[0.52, 0.74, 0.12]} radius={0.05} smoothness={3} position={[0, 0.37, 0]} material={mats.leather} castShadow receiveShadow />
          <RoundedBox args={[0.5, 0.7, 0.06]} radius={0.025} smoothness={2} position={[0, 0.37, -0.07]} material={mats.panel} castShadow />
          {/* headrest */}
          <RoundedBox args={[0.34, 0.17, 0.11]} radius={0.045} smoothness={3} position={[0, 0.83, 0.02]} material={mats.leather} castShadow />
          {/* piping */}
          {[-0.245, 0.245].map((px) => (
            <mesh key={px} position={[px, 0.37, 0.062]} material={mats.piping}>
              <boxGeometry args={[0.014, 0.62, 0.012]} />
            </mesh>
          ))}
          {isPilot && (
            <mesh position={[0, 0.06, 0.062]} material={mats.piping}>
              <boxGeometry args={[0.44, 0.012, 0.012]} />
            </mesh>
          )}
        </group>
        {/* armrests */}
        {[-0.29, 0.29].map((ax) => (
          <RoundedBox key={ax} args={[0.07, 0.07, 0.42]} radius={0.03} smoothness={2} position={[ax, 0.5, -0.02]} material={mats.panel} castShadow />
        ))}
        {isPilot && (
          <mesh position={[0.24, 0.62, 0.22]} material={mats.base}>
            <cylinderGeometry args={[0.018, 0.022, 0.18, 10]} />
          </mesh>
        )}
      </group>
      {/* hit area */}
      <mesh position={[0, 0.55, -0.02]} {...handlers} visible={interactive}>
        <boxGeometry args={[0.62, 1.15, 0.68]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {showTooltip && <SeatTooltip seat={seat} state={state} price={price} passengerTag={passengerTag} />}
    </group>
  );
}
