import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { HULL_HEIGHT_SCALE, hullRadiusAt, type AircraftConfig } from '../config/aircraft';
import { useExperience } from '../store/experienceStore';
import type { AirframeLayout } from './EVTOLModel';
import { makeHullGeometry } from './geometry';
import type { AircraftMaterials } from './materials';

/** Whether the roof should be lifted away for the current stage. */
export function isCutaway(stage: string, seatView: string) {
  return stage === 'cabin' || (stage === 'seat' && seatView === 'focus');
}

/**
 * Panoramic glass canopy with structural pillars. In cabin stages it lifts
 * up and dissolves to reveal the interior (the "transparent roof" reveal).
 */
export function CabinCutaway({ cfg, layout, mats }: { cfg: AircraftConfig; layout: AirframeLayout; mats: AircraftMaterials }) {
  const group = useRef<THREE.Group>(null);
  const progress = useRef(1); // 1 = closed canopy, 0 = fully removed
  const { cabinRear, cabinFront, canopyHalfAngle: a } = layout;

  const local = useMemo(() => {
    const glass = mats.glass.clone();
    const frame = mats.graphite.clone();
    frame.transparent = true;
    const trim = mats.champagne.clone();
    trim.transparent = true;
    return { glass, frame, trim, glassOpacity: glass.opacity };
  }, [mats]);
  useEffect(() => () => [local.glass, local.frame, local.trim].forEach((m) => m.dispose()), [local]);

  const geos = useMemo(() => {
    const canopy = makeHullGeometry(cfg, cabinRear, cabinFront, { phiStart: Math.PI - a, phiLength: 2 * a, samples: 56, radiusScale: 1.001 });
    const spine = makeHullGeometry(cfg, cabinRear, cabinFront - 0.35, { phiStart: Math.PI - 0.16, phiLength: 0.32, samples: 40, radiusScale: 1.012 });
    // Pillars: rings at cabin rear, between rows and the windscreen header.
    const stations = [cabinRear + 0.03, (cabinRear + cabinFront) / 2 - 0.25, cabinFront - 0.9, cabinFront - 0.03];
    const pillars = stations.map((z) => {
      const r = hullRadiusAt(cfg, z) * 1.012;
      const g = new THREE.TorusGeometry(r, 0.022, 8, 64, 2 * a);
      g.rotateZ(Math.PI / 2 - a);
      g.scale(1, HULL_HEIGHT_SCALE, 1);
      g.translate(0, 0, z);
      return g;
    });
    // champagne sill line where glass meets body
    const sill = [1, -1].map((s) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const z = THREE.MathUtils.lerp(cabinRear, cabinFront, i / 40);
        const r = hullRadiusAt(cfg, z) * 1.006;
        pts.push(new THREE.Vector3(s * r * Math.sin(a), -r * Math.cos(Math.PI - a) * HULL_HEIGHT_SCALE, z));
      }
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.018, 6, false);
    });
    return { canopy, spine, pillars, sill };
  }, [cfg, cabinRear, cabinFront, a]);

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    const { stage, seatView } = useExperience.getState();
    const target = isCutaway(stage, seatView) ? 0 : 1;
    progress.current += (target - progress.current) * Math.min(1, dt * 2.6);
    const k = progress.current;
    if (!group.current) return;
    group.current.visible = k > 0.01;
    group.current.position.y = (1 - k) * 1.6;
    group.current.rotation.x = (1 - k) * -0.06;
    local.glass.opacity = local.glassOpacity * k;
    local.frame.opacity = k;
    local.trim.opacity = k;
    const solid = k > 0.98;
    local.frame.depthWrite = solid;
    local.trim.depthWrite = solid;
  });

  return (
    <group ref={group}>
      <mesh geometry={geos.canopy} material={local.glass} renderOrder={2} />
      <mesh geometry={geos.spine} material={local.frame} castShadow />
      {geos.pillars.map((g, i) => (
        <mesh key={i} geometry={g} material={local.frame} castShadow />
      ))}
      {geos.sill.map((g, i) => (
        <mesh key={i} geometry={g} material={local.trim} />
      ))}
    </group>
  );
}
