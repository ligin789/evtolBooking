import * as THREE from 'three';
import { HULL_HEIGHT_SCALE, hullRadiusAt, type AircraftConfig } from '../config/aircraft';

/**
 * Lathe a slice of the fuselage between z0 and z1. The lathe axis is local Y
 * and is rotated onto world +Z by the <HullMesh> wrapper below.
 * phi = 0 is the keel (bottom), phi = PI is the crown (top).
 */
export function makeHullGeometry(
  cfg: AircraftConfig,
  z0: number,
  z1: number,
  opts: { phiStart?: number; phiLength?: number; radiusScale?: number; samples?: number; radial?: number } = {},
) {
  const { phiStart = 0, phiLength = Math.PI * 2, radiusScale = 1, samples = 48, radial = 64 } = opts;
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) {
    const z = z0 + ((z1 - z0) * i) / samples;
    pts.push(new THREE.Vector2(Math.max(0.0001, hullRadiusAt(cfg, z) * radiusScale), z));
  }
  const g = new THREE.LatheGeometry(pts, radial, phiStart, phiLength);
  // bake orientation: lathe Y -> world Z, lathe Z -> world -Y, then stretch height
  g.rotateX(Math.PI / 2);
  g.scale(1, HULL_HEIGHT_SCALE, 1);
  g.computeVertexNormals();
  return g;
}

/** Half-width of the hull at height y and station z (elliptic section). */
export function hullHalfWidth(cfg: AircraftConfig, z: number, y: number, inset = 1) {
  const r = hullRadiusAt(cfg, z) * inset;
  const k = y / (r * HULL_HEIGHT_SCALE);
  return k >= 1 ? 0 : r * Math.sqrt(1 - k * k);
}

/** Cylinder mesh geometry spanning two points. */
export function cylinderBetween(a: THREE.Vector3, b: THREE.Vector3, radius: number, radial = 12) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const g = new THREE.CylinderGeometry(radius, radius, len, radial);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  g.applyQuaternion(q);
  const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
  g.translate(mid.x, mid.y, mid.z);
  return g;
}

/** Tapered airfoil wing panel. Span runs along +X, leading edge faces +Z. */
export function makeWingGeometry(span: number, rootChord: number, taper = 0.4, thickness = 0.12, dihedral = 0.05, sweep = 0.08) {
  const shape = new THREE.Shape();
  const n = 24;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos((i / n) * Math.PI)) / 2; // cosine spacing
    const yt = 5 * thickness * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    top.push([x * rootChord, yt * rootChord * 1.1]);
    bottom.push([x * rootChord, -yt * rootChord * 0.75]);
  }
  shape.moveTo(top[0][0], top[0][1]);
  top.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  bottom.reverse().forEach(([x, y]) => shape.lineTo(x, y));
  const g = new THREE.ExtrudeGeometry(shape, { depth: span, bevelEnabled: false, steps: 1, curveSegments: 4 });
  const pos = g.attributes.position;
  const quarter = rootChord * 0.25;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const s = z / span;
    const k = 1 - taper * s;
    pos.setX(i, quarter + (pos.getX(i) - quarter) * k + sweep * z);
    pos.setY(i, pos.getY(i) * k + dihedral * z);
  }
  // shape X (chord, aft) -> world -Z ; extrude Z (span) -> world +X
  g.rotateY(Math.PI / 2);
  g.translate(0, 0, quarter);
  g.computeVertexNormals();
  return g;
}

/** Flat tapered fin (used for the V-tail). Root on origin, grows along +Y. */
export function makeFinGeometry(height: number, rootChord: number, tipChord: number, thickness = 0.05) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(rootChord, 0);
  s.lineTo(rootChord * 0.85 + 0.25, height);
  s.lineTo(rootChord * 0.85 + 0.25 - tipChord, height);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
  g.translate(0, 0, -thickness / 2);
  // chord runs aft (-Z)
  g.rotateY(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
