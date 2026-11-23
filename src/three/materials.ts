import * as THREE from 'three';

/** Shared materials so the procedural aircraft stays cheap to render. */
export function createAircraftMaterials() {
  const paint = new THREE.MeshPhysicalMaterial({
    color: '#f4f1ea',
    roughness: 0.24,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  });
  const graphite = new THREE.MeshPhysicalMaterial({
    color: '#1f2125',
    roughness: 0.38,
    metalness: 0.55,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const carbon = new THREE.MeshStandardMaterial({ color: '#202226', roughness: 0.45, metalness: 0.35 });
  const champagne = new THREE.MeshStandardMaterial({ color: '#c9a86a', roughness: 0.28, metalness: 0.85 });
  const chrome = new THREE.MeshStandardMaterial({ color: '#d9dbe0', roughness: 0.12, metalness: 1 });
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#9fb7c9',
    roughness: 0.04,
    metalness: 0.1,
    transparent: true,
    opacity: 0.28,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ledBlue = new THREE.MeshStandardMaterial({ color: '#3d7bff', emissive: '#3d7bff', emissiveIntensity: 2.2, toneMapped: false });
  const ledWarm = new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffcf8a', emissiveIntensity: 1.6, toneMapped: false });
  const navRed = new THREE.MeshBasicMaterial({ color: '#ff3b30', toneMapped: false });
  const navGreen = new THREE.MeshBasicMaterial({ color: '#30d158', toneMapped: false });
  const interior = new THREE.MeshStandardMaterial({ color: '#efe6d6', roughness: 0.85, metalness: 0, side: THREE.BackSide });
  const floor = new THREE.MeshStandardMaterial({ color: '#3a3530', roughness: 0.6, metalness: 0.1 });
  const tyre = new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.7 });
  return { paint, graphite, carbon, champagne, chrome, glass, ledBlue, ledWarm, navRed, navGreen, interior, floor, tyre };
}

export type AircraftMaterials = ReturnType<typeof createAircraftMaterials>;

/**
 * Instanced-building material. The façade texture is tiled by each instance's
 * real size (read from the instance matrix) so windows keep a constant scale
 * on every building; lit windows glow via the emissive map; roofs get a plain
 * concrete tone with no windows.
 */
export function createFacadeMaterial(opts: {
  map: THREE.Texture;
  emissiveMap?: THREE.Texture;
  tile: [number, number];
  roughness?: number;
  metalness?: number;
  emissiveIntensity?: number;
  key: string;
}): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    map: opts.map,
    emissiveMap: opts.emissiveMap ?? null,
    emissive: opts.emissiveMap ? new THREE.Color('#ffffff') : new THREE.Color('#000000'),
    emissiveIntensity: opts.emissiveIntensity ?? 1,
    roughness: opts.roughness ?? 0.6,
    metalness: opts.metalness ?? 0.1,
    envMapIntensity: 1.1,
  });
  const [tw, th] = opts.tile;
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vRoof;')
      .replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
#ifdef USE_INSTANCING
  vec3 instScale = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
#else
  vec3 instScale = vec3(1.0);
#endif
  float facadeWidth = abs(normal.x) > 0.5 ? instScale.z : instScale.x;
  vec2 facadeUv = uv * vec2(facadeWidth / ${tw.toFixed(2)}, instScale.y / ${th.toFixed(2)});
#ifdef USE_MAP
  vMapUv = facadeUv;
#endif
#ifdef USE_EMISSIVEMAP
  vEmissiveMapUv = facadeUv;
#endif
  vRoof = abs(normal.y) > 0.5 ? 1.0 : 0.0;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vRoof;')
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D( map, vMapUv );
  if ( vRoof > 0.5 ) sampledDiffuseColor = vec4( 0.6, 0.59, 0.57, 1.0 );
  diffuseColor *= sampledDiffuseColor;
#endif`,
      )
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  if ( vRoof > 0.5 ) totalEmissiveRadiance = vec3( 0.0 );');
  };
  mat.customProgramCacheKey = () => `facade-${opts.key}`;
  return mat;
}

/** Small text decal (registration / brand) drawn to canvas. */
export function makeTextTexture(text: string, opts: { color?: string; font?: string; w?: number; h?: number } = {}) {
  const w = opts.w ?? 512;
  const h = opts.h ?? 128;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.clearRect(0, 0, w, h);
  g.fillStyle = opts.color ?? '#1f2125';
  g.font = opts.font ?? '600 72px "Inter Tight", system-ui, sans-serif';
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
