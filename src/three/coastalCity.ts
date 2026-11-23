import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { seededRandom } from '../lib/random';

/**
 * Procedural sunset beach city, modelled on the reference photo: a curved
 * sandy beach, palm-lined boulevard, white balconied condos on the beachfront,
 * glass towers behind, a pier with a Ferris wheel, and ocean to the horizon.
 *
 * Authored in a local "coast frame": +x = towards the sea, −z = along the
 * coast into the distance, y = 0 at sea level. CityEnvironment rotates the
 * frame by SCENE_YAW and lowers it below the aircraft.
 */

export const Z_MIN = -2800;
export const Z_MAX = 1100;
export const CITY_DEPTH = 1300; // how far inland buildings go

/** Waterline: a gentle bay curving left (inland) as it recedes. */
export function coastX(z: number) {
  return 40 + 0.12 * z - 0.000032 * z * z + 6 * Math.sin(z * 0.004);
}

/** Cross-section offsets (metres inland from the waterline). */
export const BAND = {
  wetSand: 7,
  drySand: 50,
  promenade: 62,
  roadEdge: 66,
  road: 92,
  sidewalk: 98,
} as const;

export const PIER_Z = -430;

// ─────────────────────────────────────────────────────────────────────────────
// Strip geometry following the coast. UVs are in metres (x, z) so tiled
// textures line up with the world.
// ─────────────────────────────────────────────────────────────────────────────
export function makeCoastStrip(fromOffset: number, toOffset: number, yFrom: number, yTo: number, steps = 260, zMin = Z_MIN, zMax = Z_MAX) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const z = zMin + ((zMax - zMin) * i) / steps;
    const c = coastX(z);
    const xa = c - fromOffset;
    const xb = c - toOffset;
    pos.push(xa, yFrom, z, xb, yTo, z);
    uv.push(xa, z, xb, z);
    if (i < steps) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  // make sure faces point up
  const n = g.attributes.normal;
  if (n.getY(0) < 0) {
    g.setIndex(idx.map((_, k) => idx[k - (k % 3) + (2 - (k % 3))]));
    g.computeVertexNormals();
  }
  return g;
}

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = true) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ground textures
// ─────────────────────────────────────────────────────────────────────────────

/** One city block, 70 m (x) × 90 m (z): streets, kerbs, sidewalks, lot. */
export const BLOCK_X = 70;
export const BLOCK_Z = 90;
export function makeBlockTexture() {
  const s = 8; // px per metre
  const t = canvasTexture(BLOCK_X * s, BLOCK_Z * s, (g) => {
    g.fillStyle = '#2f3136';
    g.fillRect(0, 0, BLOCK_X * s, BLOCK_Z * s);
    // asphalt grain
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.05)';
      g.fillRect(Math.random() * BLOCK_X * s, Math.random() * BLOCK_Z * s, 2, 2);
    }
    const st = 6; // half street width
    // sidewalk
    g.fillStyle = '#8d8a84';
    g.fillRect(st * s, st * s, (BLOCK_X - 2 * st) * s, (BLOCK_Z - 2 * st) * s);
    // lot
    g.fillStyle = '#5d5c55';
    g.fillRect((st + 3) * s, (st + 3) * s, (BLOCK_X - 2 * st - 6) * s, (BLOCK_Z - 2 * st - 6) * s);
    // lane dashes along both street axes (at the tile edges = street centrelines)
    g.fillStyle = 'rgba(240,230,200,0.7)';
    for (let z = 0; z < BLOCK_Z; z += 6) g.fillRect(0, z * s, 0.25 * s, 3 * s);
    for (let x = 0; x < BLOCK_X; x += 6) g.fillRect(x * s, 0, 3 * s, 0.25 * s);
    // crosswalks
    g.fillStyle = 'rgba(235,235,230,0.75)';
    for (let k = 0; k < 6; k++) {
      g.fillRect((st + 1 + k * 1.2) * s, 0.8 * s, 0.6 * s, 3.5 * s);
      g.fillRect(0.8 * s, (st + 1 + k * 1.2) * s, 3.5 * s, 0.6 * s);
    }
  });
  t.repeat.set(1 / BLOCK_X, 1 / BLOCK_Z);
  return t;
}

export function makeSandTexture(wet: boolean) {
  const t = canvasTexture(256, 256, (g) => {
    g.fillStyle = wet ? '#a88e72' : '#e2c7a0';
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 9000; i++) {
      const v = Math.random();
      g.fillStyle = v < 0.5 ? 'rgba(255,240,215,0.12)' : 'rgba(120,90,60,0.12)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
    if (!wet) {
      // footprints / wind ripples
      g.strokeStyle = 'rgba(150,120,85,0.18)';
      for (let i = 0; i < 40; i++) {
        g.beginPath();
        const y = Math.random() * 256;
        g.moveTo(0, y);
        g.bezierCurveTo(80, y + 6, 170, y - 6, 256, y);
        g.stroke();
      }
    }
  });
  t.repeat.set(1 / 12, 1 / 12);
  return t;
}

export function makePavingTexture() {
  const t = canvasTexture(128, 128, (g) => {
    g.fillStyle = '#b9a58e';
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(80,60,45,0.25)';
    for (let i = 0; i <= 128; i += 16) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, 128);
      g.moveTo(0, i);
      g.lineTo(128, i);
      g.stroke();
    }
  });
  t.repeat.set(1 / 4, 1 / 4);
  return t;
}

/** Boulevard: 4 lanes + palm median, lanes along z. UV u = metres across. */
export function makeRoadTexture() {
  const w = BAND.road - BAND.roadEdge; // 26 m
  const s = 10;
  const t = canvasTexture(w * s, 40 * s, (g) => {
    g.fillStyle = '#2c2e33';
    g.fillRect(0, 0, w * s, 40 * s);
    for (let i = 0; i < 3000; i++) {
      g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)';
      g.fillRect(Math.random() * w * s, Math.random() * 40 * s, 2, 2);
    }
    // median
    g.fillStyle = '#4b5a3a';
    g.fillRect(12 * s, 0, 2 * s, 40 * s);
    g.fillStyle = '#9c9a94';
    g.fillRect(11.8 * s, 0, 0.2 * s, 40 * s);
    g.fillRect(14 * s, 0, 0.2 * s, 40 * s);
    // lane dashes
    g.fillStyle = 'rgba(245,240,225,0.75)';
    for (const x of [6, 20]) for (let z = 0; z < 40; z += 8) g.fillRect(x * s, z * s, 0.18 * s, 4 * s);
    // edge lines
    g.fillRect(0.6 * s, 0, 0.15 * s, 40 * s);
    g.fillRect((w - 0.75) * s, 0, 0.15 * s, 40 * s);
  });
  t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

/** Foam band texture for the surf lines. */
export function makeFoamTexture() {
  const t = canvasTexture(64, 256, (g) => {
    g.clearRect(0, 0, 64, 256);
    for (let i = 0; i < 900; i++) {
      const x = 8 + Math.random() * 48;
      const a = 0.15 + Math.random() * 0.5 * (1 - Math.abs(x - 32) / 26);
      g.fillStyle = `rgba(255,250,245,${a})`;
      g.beginPath();
      g.ellipse(x, Math.random() * 256, 1 + Math.random() * 3, 2 + Math.random() * 6, 0, 0, Math.PI * 2);
      g.fill();
    }
  });
  return t;
}

/** Tileable ocean normal map from layered sine swell + chop. */
export function makeWaterNormals(size = 256) {
  const h = new Float32Array(size * size);
  const rnd = seededRandom('waves');
  const waves = Array.from({ length: 14 }, () => ({
    kx: Math.round((rnd() - 0.5) * 16),
    ky: Math.round(rnd() * 14) + 1,
    a: 0.3 + rnd(),
    p: rnd() * Math.PI * 2,
  }));
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      let v = 0;
      for (const w of waves) v += (w.a * Math.sin(((w.kx * x + w.ky * y) / size) * Math.PI * 2 + w.p)) / (Math.abs(w.kx) + w.ky);
      h[y * size + x] = v;
    }
  const data = new Uint8Array(size * size * 4);
  const k = 2.6;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const l = h[y * size + ((x - 1 + size) % size)];
      const r = h[y * size + ((x + 1) % size)];
      const d = h[((y - 1 + size) % size) * size + x];
      const u = h[((y + 1) % size) * size + x];
      const n = new THREE.Vector3((l - r) * k, (d - u) * k, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

/** Sun glitter path on the water: sparkling dashes, brighter toward the horizon. */
export function makeGlitterTexture() {
  const t = canvasTexture(128, 1024, (g) => {
    g.clearRect(0, 0, 128, 1024);
    for (let i = 0; i < 2600; i++) {
      const y = Math.random() * 1024;
      const far = 1 - y / 1024; // top of texture = horizon end
      const spread = 20 + 44 * (1 - far);
      const x = 64 + (Math.random() - 0.5) * 2 * spread * Math.sqrt(Math.random());
      const a = (0.25 + 0.75 * far) * (0.3 + Math.random() * 0.7);
      g.fillStyle = `rgba(255,${190 + Math.random() * 50},${120 + Math.random() * 60},${a})`;
      g.fillRect(x, y, 2 + Math.random() * 7 * (1 - far * 0.6), 1 + Math.random() * 1.5);
    }
  });
  t.wrapS = THREE.ClampToEdgeWrapping;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// Façades (per-instance tiled via createFacadeMaterial)
// ─────────────────────────────────────────────────────────────────────────────
export type FacadeKind = 'condo' | 'glass' | 'stucco';

/** Metres covered by one texture repeat (width, height) per façade kind. */
export const FACADE_TILE: Record<FacadeKind, [number, number]> = {
  condo: [16, 12.8],
  glass: [18, 16],
  stucco: [15, 12],
};

export function makeFacadeTextures(kind: FacadeKind) {
  const W = 256;
  const H = 256;
  const lit: [number, number, number, number][] = [];
  const rnd = seededRandom(`facade-${kind}`);
  const map = canvasTexture(W, H, (g) => {
    if (kind === 'condo') {
      // white concrete slabs, glass balcony rails, recessed glazing
      const floors = 4;
      const bays = 4;
      const fh = H / floors;
      const bw = W / bays;
      g.fillStyle = '#f2efe9';
      g.fillRect(0, 0, W, H);
      for (let f = 0; f < floors; f++) {
        const y = f * fh;
        // recessed window wall
        g.fillStyle = '#3c4656';
        g.fillRect(0, y + fh * 0.2, W, fh * 0.62);
        for (let b = 0; b < bays; b++) {
          const x = b * bw;
          const glass = g.createLinearGradient(0, y + fh * 0.2, 0, y + fh * 0.82);
          glass.addColorStop(0, '#6d7f95');
          glass.addColorStop(1, '#2d3746');
          g.fillStyle = glass;
          g.fillRect(x + 4, y + fh * 0.22, bw - 8, fh * 0.58);
          g.fillStyle = 'rgba(25,30,38,0.7)';
          g.fillRect(x + bw / 2 - 1, y + fh * 0.22, 2, fh * 0.58);
          if (rnd() < 0.38) lit.push([x + 5, y + fh * 0.24, bw - 10, fh * 0.54]);
          // balcony divider wall
          g.fillStyle = '#e8e4dc';
          g.fillRect(x, y + fh * 0.2, 3, fh * 0.62);
        }
        // glass balcony rail (lighter, slightly blue) + slab edge
        g.fillStyle = 'rgba(190,215,225,0.55)';
        g.fillRect(0, y + fh * 0.6, W, fh * 0.22);
        g.fillStyle = '#ffffff';
        g.fillRect(0, y + fh * 0.82, W, fh * 0.18);
        g.fillStyle = 'rgba(0,0,0,0.12)';
        g.fillRect(0, y + fh * 0.82, W, 2);
      }
    } else if (kind === 'glass') {
      const floors = 4;
      const bays = 6;
      const fh = H / floors;
      const bw = W / bays;
      for (let f = 0; f < floors; f++)
        for (let b = 0; b < bays; b++) {
          const x = b * bw;
          const y = f * fh;
          const tint = 0.85 + rnd() * 0.3;
          const glass = g.createLinearGradient(x, y, x + bw, y + fh);
          glass.addColorStop(0, `rgb(${70 * tint},${110 * tint},${125 * tint})`);
          glass.addColorStop(1, `rgb(${38 * tint},${66 * tint},${80 * tint})`);
          g.fillStyle = glass;
          g.fillRect(x, y, bw, fh);
          if (rnd() < 0.16) lit.push([x + 2, y + 2, bw - 4, fh - 6]);
        }
      g.fillStyle = 'rgba(200,210,215,0.75)';
      for (let b = 0; b <= bays; b++) g.fillRect(b * bw - 1, 0, 2, H);
      for (let f = 0; f <= floors; f++) g.fillRect(0, f * fh - 2, W, 4);
    } else {
      const floors = 4;
      const bays = 5;
      const fh = H / floors;
      const bw = W / bays;
      g.fillStyle = '#e6d6bf';
      g.fillRect(0, 0, W, H);
      for (let f = 0; f < floors; f++)
        for (let b = 0; b < bays; b++) {
          const x = b * bw + bw * 0.22;
          const y = f * fh + fh * 0.25;
          g.fillStyle = '#3b3f46';
          g.fillRect(x, y, bw * 0.56, fh * 0.5);
          g.fillStyle = 'rgba(255,255,255,0.5)';
          g.fillRect(x - 2, y + fh * 0.5, bw * 0.56 + 4, 3);
          if (rnd() < 0.32) lit.push([x + 2, y + 2, bw * 0.56 - 4, fh * 0.5 - 4]);
        }
    }
  });
  const emissive = canvasTexture(W, H, (g) => {
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, H);
    for (const [x, y, w, h] of lit) {
      const warm = g.createLinearGradient(0, y, 0, y + h);
      warm.addColorStop(0, '#ffd39a');
      warm.addColorStop(1, '#f0a35c');
      g.fillStyle = warm;
      g.fillRect(x, y, w, h);
    }
  });
  return { map, emissive };
}

// ─────────────────────────────────────────────────────────────────────────────
// Buildings
// ─────────────────────────────────────────────────────────────────────────────
export interface BuildingSpec {
  kind: FacadeKind;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: THREE.Color;
}

export function generateBuildings(): BuildingSpec[] {
  const rnd = seededRandom('beach-city');
  const out: BuildingSpec[] = [];
  const condoTints = ['#ffffff', '#f6f2ea', '#efe9df', '#f3f1ee'];
  const glassTints = ['#ffffff', '#e3f0f2', '#d9e6ee', '#f0ecdf'];
  const stuccoTints = ['#ffffff', '#f2dcc2', '#e9cfb0', '#f7ead8', '#dcc7b4'];
  const pick = (arr: string[]) => new THREE.Color(arr[Math.floor(rnd() * arr.length)]);

  // 1) beachfront row: white balconied condos facing the sea
  for (let z = Z_MIN + 40; z < Z_MAX - 40; z += 0) {
    const w = 26 + rnd() * 16; // along coast
    const d = 22 + rnd() * 10;
    const zc = z + w / 2;
    if (Math.abs(zc - PIER_Z) < 25) {
      z += w + 10;
      continue;
    }
    const x = coastX(zc) - BAND.sidewalk - 6 - d / 2;
    const near = Math.hypot(x, zc) < 140;
    let h = 22 + rnd() * 34;
    if (rnd() < 0.18) h += 30;
    if (near) h = Math.min(h, 46);
    out.push({ kind: 'condo', x, z: zc, w: d, d: w, h, color: pick(condoTints) });
    z += w + 6 + rnd() * 10;
  }

  // 2) inland grid
  for (let gz = Z_MIN; gz < Z_MAX; gz += BLOCK_Z) {
    for (let gx = -CITY_DEPTH; gx < 200; gx += BLOCK_X) {
      const cz = gz + BLOCK_Z / 2;
      const cx = gx + BLOCK_X / 2;
      const coast = Math.min(coastX(gz), coastX(gz + BLOCK_Z));
      if (gx + BLOCK_X > coast - BAND.sidewalk - 40) continue; // keep clear of the beachfront row
      if (rnd() < 0.08) continue; // plazas / parks
      const inland = coast - cx; // metres from the waterline
      const dist = Math.hypot(cx, cz);
      // downtown glass towers cluster behind the beachfront, ahead-left of the hero camera
      const downtown = Math.exp(-(((cz + 520) / 380) ** 2)) * Math.exp(-(((inland - 330) / 220) ** 2));
      const lots = rnd() < 0.5 ? 2 : 1;
      for (let l = 0; l < lots; l++) {
        const lw = (lots === 2 ? 22 : 40) + rnd() * 8;
        const ld = 30 + rnd() * 30;
        const lx = cx + (lots === 2 ? (l === 0 ? -12 : 12) : 0) + (rnd() - 0.5) * 4;
        const lz = cz + (rnd() - 0.5) * 10;
        let kind: FacadeKind = 'stucco';
        let h = 9 + rnd() * 18;
        if (rnd() < downtown * 1.4) {
          kind = 'glass';
          h = 70 + rnd() * 120 * (0.5 + downtown);
        } else if (inland < 420 && rnd() < 0.45) {
          kind = 'condo';
          h = 24 + rnd() * 40;
        } else if (rnd() < 0.1) {
          kind = 'glass';
          h = 45 + rnd() * 50;
        }
        // keep the airspace around the aircraft clear (aircraft is ~85 m up)
        if (dist < 160) h = Math.min(h, 40);
        else if (dist < 260) h = Math.min(h, 70);
        const color = kind === 'glass' ? pick(glassTints) : kind === 'condo' ? pick(condoTints) : pick(stuccoTints);
        out.push({ kind, x: lx, z: lz, w: lw, d: Math.min(ld, BLOCK_Z - 22), h, color });
      }
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Palm tree (merged geometry with vertex colours)
// ─────────────────────────────────────────────────────────────────────────────
function paint(g: THREE.BufferGeometry, hex: string) {
  const c = new THREE.Color(hex);
  const n = g.attributes.position.count;
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const v = 0.85 + Math.random() * 0.25;
    col[i * 3] = c.r * v;
    col[i * 3 + 1] = c.g * v;
    col[i * 3 + 2] = c.b * v;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return g;
}

export function makePalmGeometry() {
  const height = 13;
  const trunkCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.6, height * 0.55, 0), new THREE.Vector3(1.4, height, 0));
  const trunk = new THREE.TubeGeometry(trunkCurve, 10, 0.32, 6, false);
  // taper the trunk
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) {
    const t = tp.getY(i) / height;
    const p = trunkCurve.getPoint(Math.min(1, Math.max(0, t)));
    const k = 1 - t * 0.4;
    tp.setX(i, p.x + (tp.getX(i) - p.x) * k);
    tp.setZ(i, p.z + (tp.getZ(i) - p.z) * k);
  }
  paint(trunk, '#6b5440');
  const parts: THREE.BufferGeometry[] = [trunk.toNonIndexed()];
  const top = trunkCurve.getPoint(1);
  const fronds = 9;
  for (let f = 0; f < fronds; f++) {
    const len = 5 + (f % 3) * 0.6;
    const leaf = new THREE.PlaneGeometry(len, 1.3, 8, 1);
    leaf.translate(len / 2, 0, 0);
    const lp = leaf.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      const x = lp.getX(i);
      const t = x / len;
      lp.setZ(i, lp.getY(i) * (1 - t * 0.85)); // taper
      lp.setY(i, -Math.pow(t, 1.8) * 2.6 + t * 0.9); // droop
    }
    leaf.computeVertexNormals();
    leaf.rotateY((f / fronds) * Math.PI * 2 + (f % 2) * 0.2);
    leaf.translate(top.x, top.y, top.z);
    paint(leaf, f % 3 === 0 ? '#3f6a2c' : '#4f7d33');
    parts.push(leaf.toNonIndexed());
  }
  const coconut = new THREE.IcosahedronGeometry(0.55, 0);
  coconut.translate(top.x, top.y - 0.4, top.z);
  paint(coconut, '#5a4a2a');
  parts.push(coconut.toNonIndexed());
  const merged = mergeGeometries(parts, false)!;
  merged.computeVertexNormals();
  return merged;
}

export interface PalmSpot {
  x: number;
  z: number;
  s: number;
  r: number;
}

export function generatePalms(): PalmSpot[] {
  const rnd = seededRandom('palms');
  const out: PalmSpot[] = [];
  const add = (x: number, z: number) => out.push({ x, z, s: 0.8 + rnd() * 0.45, r: rnd() * Math.PI * 2 });
  for (let z = Z_MIN; z < Z_MAX; z += 11 + rnd() * 5) {
    const c = coastX(z);
    add(c - BAND.drySand - 3 + rnd() * 2, z); // beach edge
    add(c - (BAND.roadEdge + BAND.road) / 2 + 0.3, z + 5); // boulevard median
    if (rnd() < 0.7) add(c - BAND.sidewalk + 1.5, z + 3); // city sidewalk
  }
  // scattered through the city streets
  for (let i = 0; i < 220; i++) {
    const z = Z_MIN + rnd() * (Z_MAX - Z_MIN);
    const gx = -CITY_DEPTH + Math.floor(rnd() * (CITY_DEPTH / BLOCK_X)) * BLOCK_X;
    const x = gx + (rnd() < 0.5 ? 7 : BLOCK_X - 7);
    if (x > coastX(z) - BAND.sidewalk - 45) continue;
    add(x, z);
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Street lights & traffic
// ─────────────────────────────────────────────────────────────────────────────
export function generateLamps() {
  const out: [number, number][] = [];
  for (let z = Z_MIN; z < Z_MAX; z += 28) {
    const c = coastX(z);
    out.push([c - BAND.promenade + 1, z]);
    out.push([c - BAND.road - 1.5, z + 14]);
  }
  return out;
}

export interface Car {
  lane: number; // metres inland from the waterline
  dir: 1 | -1;
  z: number;
  speed: number;
  color: THREE.Color;
}

export function generateCars(): Car[] {
  const rnd = seededRandom('traffic');
  const lanes: [number, 1 | -1][] = [
    [BAND.roadEdge + 3, 1],
    [BAND.roadEdge + 8.5, 1],
    [BAND.roadEdge + 17.5, -1],
    [BAND.roadEdge + 23, -1],
  ];
  const colors = ['#f4f4f2', '#16171a', '#8a9098', '#a8312a', '#284a78', '#cfc8ba', '#3b3f45'];
  const out: Car[] = [];
  for (let i = 0; i < 90; i++) {
    const [lane, dir] = lanes[i % 4];
    out.push({ lane, dir, z: -1700 + rnd() * 2300, speed: 11 + rnd() * 6, color: new THREE.Color(colors[Math.floor(rnd() * colors.length)]) });
  }
  return out;
}
