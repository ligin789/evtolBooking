import { useFrame } from '@react-three/fiber';
import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HULL_HEIGHT_SCALE, hullRadiusAt, type AircraftConfig, type SeatDef } from '../config/aircraft';
import { seatFare } from '../lib/fares';
import { selectSeat } from '../lib/journey';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { AirframeLayout } from './EVTOLModel';
import { hullHalfWidth, makeHullGeometry } from './geometry';
import type { AircraftMaterials } from './materials';
import { PassengerSeat, type SeatState } from './PassengerSeat';

/**
 * Luxury cabin interior: upholstered side walls, walnut-tone floor with
 * ambient LED edge lighting, consoles, pilot instrument panel and the
 * configurable seat set.
 */
export function EVTOLCabin({ cfg, layout, mats }: { cfg: AircraftConfig; layout: AirframeLayout; mats: AircraftMaterials }) {
  const { cabinRear, cabinFront, canopyHalfAngle: a, seats } = layout;
  const reducedMotion = useReducedMotion();
  const floorY = cfg.floorY;

  const stage = useExperience((s) => s.stage);
  const seatView = useExperience((s) => s.seatView);
  const hoveredSeat = useExperience((s) => s.hoveredSeat);
  const focusedSeat = useExperience((s) => s.focusedSeat);
  const setHoveredSeat = useExperience((s) => s.setHoveredSeat);
  const flight = useBooking((s) => s.flight);
  const assignments = useBooking((s) => s.seatAssignments);

  const interactive = stage === 'cabin' || (stage === 'seat' && seatView === 'focus');
  const tooltipsOn = interactive;

  const geos = useMemo(() => {
    const walls = makeHullGeometry(cfg, cabinRear, cabinFront, { phiStart: Math.PI + a, phiLength: Math.PI * 2 - 2 * a, radiusScale: 0.965, samples: 48 });
    // floor outline sampled from the hull section at floor height
    const zs = Array.from({ length: 25 }, (_, i) => THREE.MathUtils.lerp(cabinRear + 0.05, cabinFront - 0.15, i / 24));
    const half = zs.map((z) => Math.max(0.05, hullHalfWidth(cfg, z, floorY, 0.955)));
    const shape = new THREE.Shape();
    zs.forEach((z, i) => (i === 0 ? shape.moveTo(half[i], -z) : shape.lineTo(half[i], -z)));
    for (let i = zs.length - 1; i >= 0; i--) shape.lineTo(-half[i], -zs[i]);
    shape.closePath();
    const floor = new THREE.ShapeGeometry(shape, 4);
    floor.rotateX(-Math.PI / 2);
    const leds = [1, -1].map(
      (s) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zs.map((z, i) => new THREE.Vector3(s * (half[i] - 0.03), floorY + 0.012, z))), 60, 0.008, 6, false),
    );
    // ceiling-less cabin: a warm cove light under the window sill
    const cove = [1, -1].map((s) => {
      const pts = zs.map((z) => {
        const r = hullRadiusAt(cfg, z) * 0.95;
        return new THREE.Vector3(s * r * Math.sin(a), r * Math.cos(a) * HULL_HEIGHT_SCALE - 0.03, z);
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.01, 6, false);
    });
    const rearR = hullRadiusAt(cfg, cabinRear + 0.02) * 0.965;
    return { walls, floor, leds, cove, rearR };
  }, [cfg, cabinRear, cabinFront, a, floorY]);

  const lights = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!lights.current) return;
    const { stage: st } = useExperience.getState();
    const on = st === 'cabin' || st === 'seat' ? 1 : 0.25;
    lights.current.children.forEach((l) => {
      const light = l as THREE.PointLight;
      const target = (light.userData.base as number) * on;
      light.intensity += (target - light.intensity) * Math.min(1, dt * 3);
    });
  });

  const onSelect = useCallback((seat: SeatDef) => void selectSeat(seat.id), []);

  const passengerSeats = seats;
  const rows = useMemo(() => Array.from(new Set(seats.filter((s) => s.kind === 'passenger').map((s) => s.position[2]))), [seats]);
  const pilot = seats.find((s) => s.kind === 'pilot');

  return (
    <group>
      <mesh geometry={geos.walls} material={mats.interior} receiveShadow />
      <mesh geometry={geos.floor} position={[0, floorY, 0]} material={mats.floor} receiveShadow />
      {geos.leds.map((g, i) => (
        <mesh key={`l${i}`} geometry={g} material={mats.ledBlue} />
      ))}
      {geos.cove.map((g, i) => (
        <mesh key={`c${i}`} geometry={g} material={mats.ledWarm} />
      ))}
      {/* rear bulkhead with champagne inlay */}
      <group position={[0, 0, cabinRear + 0.03]}>
        <mesh scale={[1, HULL_HEIGHT_SCALE, 1]} receiveShadow>
          <circleGeometry args={[geos.rearR, 48]} />
          <meshStandardMaterial color="#e9dfcd" roughness={0.85} />
        </mesh>
        <mesh position={[0, floorY + 0.75, 0.01]} material={mats.champagne}>
          <boxGeometry args={[0.9, 0.012, 0.01]} />
        </mesh>
        <mesh position={[0, floorY + 0.4, 0.06]} material={mats.graphite}>
          <boxGeometry args={[1.1, 0.5, 0.1]} />
        </mesh>
      </group>
      {/* centre consoles between seat pairs */}
      {rows.map((z) => (
        <group key={z} position={[0, floorY, z]}>
          <mesh position={[0, 0.25, 0.02]} material={mats.graphite} castShadow>
            <boxGeometry args={[0.2, 0.5, 0.46]} />
          </mesh>
          <mesh position={[0, 0.505, 0.02]} material={mats.champagne}>
            <boxGeometry args={[0.18, 0.012, 0.44]} />
          </mesh>
          <mesh position={[0, 0.51, 0.12]} material={mats.ledBlue}>
            <boxGeometry args={[0.1, 0.004, 0.04]} />
          </mesh>
        </group>
      ))}
      {/* pilot instrument panel */}
      {pilot && (
        <group position={[0, floorY, pilot.position[2] + 0.72]}>
          <mesh position={[0, 0.72, 0]} rotation={[-0.5, 0, 0]} material={mats.graphite} castShadow>
            <boxGeometry args={[1.05, 0.08, 0.36]} />
          </mesh>
          {[-0.26, 0.26].map((x) => (
            <mesh key={x} position={[x, 0.78, -0.04]} rotation={[-0.5, 0, 0]}>
              <planeGeometry args={[0.42, 0.22]} />
              <meshBasicMaterial color="#9fc0ff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {passengerSeats.map((seat) => {
        const occupied = flight?.occupiedSeats.includes(seat.id) ?? false;
        const owner = assignments.indexOf(seat.id);
        const isPreview = !flight && focusedSeat === seat.id;
        const state: SeatState = seat.kind === 'pilot' ? 'pilot' : occupied ? 'occupied' : owner !== -1 || isPreview ? 'selected' : 'available';
        const hovered = hoveredSeat === seat.id;
        const focused = focusedSeat === seat.id;
        return (
          <PassengerSeat
            key={`${cfg.id}-${seat.id}`}
            seat={seat}
            state={state}
            hovered={hovered}
            focused={focused}
            interactive={interactive}
            showTooltip={tooltipsOn && (hovered || (focused && stage === 'seat'))}
            price={flight && seat.bookable ? seatFare(flight, seat.id) : null}
            passengerTag={owner !== -1 ? `Passenger ${owner + 1}` : null}
            onHover={setHoveredSeat}
            onSelect={onSelect}
            reducedMotion={reducedMotion}
          />
        );
      })}
      <group ref={lights}>
        {rows.map((z) => (
          <pointLight key={z} position={[0, 0.55, z]} color="#ffd7a1" distance={2.6} decay={2} intensity={0} userData={{ base: 1.6 }} />
        ))}
      </group>
    </group>
  );
}
