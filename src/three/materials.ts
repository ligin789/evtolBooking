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

/** Soft round sprite used for clouds (generated, no network fetch). */
export function makeCloudTexture(): string {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.45, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c.toDataURL('image/png');
}

/** Façade texture with floor bands and lit windows for the instanced towers. */
export function makeFacadeTexture(): THREE.CanvasTexture {
  const w = 64;
  const h = 256;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) {
    g.fillStyle = 'rgba(60,72,88,0.28)';
    g.fillRect(0, y + 2, w, 4);
    for (let x = 0; x < w; x += 8) {
      if (Math.random() < 0.12) {
        g.fillStyle = 'rgba(255,214,150,0.9)';
        g.fillRect(x + 1, y + 2, 6, 4);
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
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
