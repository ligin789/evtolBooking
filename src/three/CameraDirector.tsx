import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { DEFAULT_AIRCRAFT_ID } from '../config/aircraft';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';
import { resolveShot, type CameraShot } from './cameraViews';

const UP = new THREE.Vector3(0, 1, 0);

function applyFraming(shot: CameraShot, aspect: number) {
  const pos = shot.position.clone();
  const target = shot.target.clone();
  // Portrait screens need the camera further back to keep the aircraft in frame.
  if (shot.controls !== 'look') {
    const k = aspect < 1 ? THREE.MathUtils.clamp(0.85 / aspect, 1, 1.85) : aspect < 1.3 ? 1.12 : 1;
    const kk = shot.key.startsWith('focus') ? Math.pow(k, 0.55) : k;
    pos.sub(target).multiplyScalar(kk).add(target);
  }
  if (shot.frame) {
    const dir = new THREE.Vector3().subVectors(target, pos).normalize();
    const right = new THREE.Vector3().crossVectors(dir, UP).normalize();
    const up = new THREE.Vector3().crossVectors(right, dir).normalize();
    const offset = right.multiplyScalar(shot.frame.right).add(up.multiplyScalar(shot.frame.up));
    pos.add(offset);
    target.add(offset);
  }
  return { pos, target };
}

/**
 * Owns the camera. Every stage / view change resolves to a CameraShot and is
 * flown with a GSAP-driven Bézier arc, then hands control back to the user
 * with mode-specific limits (orbit, cabin, free-look or locked).
 */
export function CameraDirector({ reducedMotion, isMobile }: { reducedMotion: boolean; isMobile: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);

  const stage = useExperience((s) => s.stage);
  const exteriorView = useExperience((s) => s.exteriorView);
  const seatView = useExperience((s) => s.seatView);
  const focusedSeat = useExperience((s) => s.focusedSeat);
  const aircraftId = useBooking((s) => s.flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID);

  const aspect = size.width / Math.max(1, size.height);
  const aspectBucket = aspect < 0.8 ? 'p' : aspect < 1.3 ? 's' : 'l';

  const shot = useMemo(
    () => resolveShot({ stage, exteriorView, seatView, focusedSeat, aircraftId, aspect, isMobile }),
    // aspect bucket instead of raw aspect avoids re-flying on every resize pixel
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, exteriorView, seatView, focusedSeat, aircraftId, aspectBucket, isMobile],
  );

  const tween = useRef<gsap.core.Tween | null>(null);
  const look = useRef({ active: false, yaw: 0, pitch: 0, baseDir: new THREE.Vector3(0, 0, 1), dragging: false, lx: 0, ly: 0 });
  const autoPovTimer = useRef<number | null>(null);

  // Fly to shot
  useEffect(() => {
    if (!controls) return;
    const { pos: endPos, target: endTarget } = applyFraming(shot, aspect);
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startFov = camera.fov;
    const dist = startPos.distanceTo(endPos);
    const arcHeight = shot.arc ?? Math.min(3, dist * 0.12);
    const ctrl = startPos.clone().lerp(endPos, 0.5).add(new THREE.Vector3(0, arcHeight, 0));
    const curve = new THREE.QuadraticBezierCurve3(startPos, ctrl, endPos);

    tween.current?.kill();
    look.current.active = false;
    controls.enabled = false;
    controls.autoRotate = false;
    useExperience.getState().setCameraBusy(true);

    const duration = reducedMotion ? 0.001 : shot.duration ?? 2;
    const p = { t: 0 };
    const tmpTarget = new THREE.Vector3();
    tween.current = gsap.to(p, {
      t: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        curve.getPoint(p.t, camera.position);
        tmpTarget.lerpVectors(startTarget, endTarget, p.t);
        controls.target.copy(tmpTarget);
        camera.fov = THREE.MathUtils.lerp(startFov, shot.fov, p.t);
        camera.updateProjectionMatrix();
        camera.lookAt(tmpTarget);
      },
      onComplete: () => {
        configureControls(controls, shot, reducedMotion);
        if (shot.controls === 'look') {
          look.current = { ...look.current, active: true, yaw: 0, pitch: 0, baseDir: new THREE.Vector3().subVectors(endTarget, endPos).normalize() };
        } else {
          controls.update();
        }
        useExperience.getState().setCameraBusy(false);
        // After focusing a seat, settle into the passenger's perspective.
        const st = useExperience.getState();
        if (st.stage === 'seat' && st.seatView === 'focus' && shot.key.startsWith('focus')) {
          if (autoPovTimer.current) window.clearTimeout(autoPovTimer.current);
          autoPovTimer.current = window.setTimeout(() => {
            const now = useExperience.getState();
            if (now.stage === 'seat' && now.seatView === 'focus' && now.focusedSeat === st.focusedSeat && now.autoPov) now.setSeatView('pov');
          }, 1100);
        }
      },
    });
    return () => {
      if (autoPovTimer.current) window.clearTimeout(autoPovTimer.current);
    };
  }, [shot, controls, camera, reducedMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => void tween.current?.kill(), []);

  // Free-look (passenger perspective): drag / touch to glance around.
  useEffect(() => {
    const el = gl.domElement;
    const down = (e: PointerEvent) => {
      if (!look.current.active) return;
      look.current.dragging = true;
      look.current.lx = e.clientX;
      look.current.ly = e.clientY;
    };
    const move = (e: PointerEvent) => {
      const l = look.current;
      if (!l.active || !l.dragging) return;
      const dx = e.clientX - l.lx;
      const dy = e.clientY - l.ly;
      l.lx = e.clientX;
      l.ly = e.clientY;
      l.yaw = THREE.MathUtils.clamp(l.yaw + dx * 0.004, -1.3, 1.3);
      l.pitch = THREE.MathUtils.clamp(l.pitch + dy * 0.003, -0.55, 0.45);
    };
    const up = () => (look.current.dragging = false);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [gl]);

  const lookDir = useMemo(() => new THREE.Vector3(), []);
  const smooth = useRef({ yaw: 0, pitch: 0 });
  useFrame((_, dt) => {
    const l = look.current;
    if (!l.active) {
      smooth.current.yaw = 0;
      smooth.current.pitch = 0;
      return;
    }
    const k = Math.min(1, dt * 6);
    smooth.current.yaw += (l.yaw - smooth.current.yaw) * k;
    smooth.current.pitch += (l.pitch - smooth.current.pitch) * k;
    lookDir.copy(l.baseDir).applyAxisAngle(UP, -smooth.current.yaw);
    const right = new THREE.Vector3().crossVectors(lookDir, UP).normalize();
    lookDir.applyAxisAngle(right, -smooth.current.pitch);
    camera.lookAt(camera.position.clone().add(lookDir));
  });

  return null;
}

function configureControls(c: OrbitControlsImpl, shot: CameraShot, reducedMotion: boolean) {
  const dist = c.object.position.distanceTo(c.target);
  c.autoRotate = Boolean(shot.autoRotate) && !reducedMotion;
  c.autoRotateSpeed = 0.35;
  c.enablePan = false;
  c.rotateSpeed = 0.6;
  c.zoomSpeed = 0.7;
  switch (shot.controls) {
    case 'orbit':
      c.enabled = true;
      c.enableRotate = true;
      c.enableZoom = true;
      c.minDistance = Math.min(4.5, dist);
      c.maxDistance = Math.max(30, dist);
      c.minPolarAngle = 0.05;
      c.maxPolarAngle = Math.PI * 0.62;
      break;
    case 'cabin':
      c.enabled = true;
      c.enableRotate = true;
      c.enableZoom = true;
      c.minDistance = Math.min(1.6, dist);
      c.maxDistance = Math.max(11, dist);
      c.minPolarAngle = 0;
      c.maxPolarAngle = Math.PI * 0.42;
      break;
    case 'look':
      c.enabled = false;
      break;
    case 'locked':
      c.enabled = true;
      c.enableRotate = false;
      c.enableZoom = false;
      break;
  }
}
