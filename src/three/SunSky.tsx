import { Environment, Lightformer, Sky } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * The coastal scene is authored in a local "coast frame" (x → towards the sea,
 * −z → along the coast into the distance) that is turned by SCENE_YAW so the
 * hero camera looks down the beach, like the reference photo.
 */
export const SCENE_YAW = 0.672;

/**
 * Sunset sun: ~2.5° above the sea horizon, ~22° right of the hero camera's
 * line of sight, so it sets over the ocean on the right of the opening shot.
 */
export const SUN_DIR = new THREE.Vector3(0.375, 0.044, -0.927).normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), SCENE_YAW);

/** Dusk haze shared by fog and the horizon. */
export const HAZE_COLOR = '#e5a77c';

const SKY_PROPS = {
  distance: 4500,
  turbidity: 6,
  rayleigh: 4.2,
  mieCoefficient: 0.006,
  mieDirectionalG: 0.9,
} as const;

/** Radial glow sprite: hot white core fading through amber to transparent. */
function makeSunGlow(size: number, stops: [number, string][]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => grad.addColorStop(o, col));
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * Procedural golden-hour sky: atmospheric scattering sky dome, a visible sun
 * disc with layered glow, and a matching environment map so the aircraft
 * paint and glass reflect the same sky. With `backdrop={false}` only the
 * reflections and lighting remain (the photo provides the visible scene).
 */
export function SunSky({ backdrop = true }: { backdrop?: boolean }) {
  const sunPos = useMemo(() => SUN_DIR.clone().multiplyScalar(1000).toArray() as [number, number, number], []);
  const far = useMemo(() => SUN_DIR.clone().multiplyScalar(4000), []);

  const { core, halo, bloom } = useMemo(
    () => ({
      core: makeSunGlow(256, [
        [0, 'rgba(255,255,250,1)'],
        [0.22, 'rgba(255,250,235,1)'],
        [0.34, 'rgba(255,226,170,0.85)'],
        [0.6, 'rgba(255,190,110,0.25)'],
        [1, 'rgba(255,170,90,0)'],
      ]),
      halo: makeSunGlow(256, [
        [0, 'rgba(255,190,120,0.6)'],
        [0.35, 'rgba(255,196,120,0.22)'],
        [1, 'rgba(255,170,90,0)'],
      ]),
      bloom: makeSunGlow(256, [
        [0, 'rgba(255,205,140,0.22)'],
        [0.5, 'rgba(255,185,120,0.08)'],
        [1, 'rgba(255,170,90,0)'],
      ]),
    }),
    [],
  );
  useEffect(() => () => [core, halo, bloom].forEach((t) => t.dispose()), [core, halo, bloom]);

  return (
    <>
      {backdrop && <Sky {...SKY_PROPS} sunPosition={sunPos} />}
      {/* visible sun: core disc + two soft halos (additive, not fogged) */}
      <group position={far} visible={backdrop}>
        <sprite scale={[1700, 1700, 1]} renderOrder={-3}>
          <spriteMaterial map={bloom} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} transparent />
        </sprite>
        <sprite scale={[650, 650, 1]} renderOrder={-3}>
          <spriteMaterial map={halo} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} transparent />
        </sprite>
        <sprite scale={[200, 200, 1]} renderOrder={-3}>
          <spriteMaterial map={core} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} transparent toneMapped={false} />
        </sprite>
      </group>

      <Environment resolution={256} frames={1} environmentIntensity={0.9}>
        <Sky {...SKY_PROPS} sunPosition={sunPos} />
        {/* warm sun-side key and a cool sky fill for the reflections */}
        <Lightformer form="circle" intensity={7} color="#ffb070" position={SUN_DIR.clone().multiplyScalar(20).toArray()} scale={6} />
        <Lightformer form="rect" intensity={0.9} color="#e9d2ff" position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[24, 8, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#cfdcff" position={[12, 3, 8]} scale={[12, 4, 1]} />
      </Environment>
    </>
  );
}
