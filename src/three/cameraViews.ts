import * as THREE from 'three';
import { getSeats } from '../config/aircraft';
import type { ExteriorView, SeatView, Stage } from '../store/experienceStore';

export type ControlsMode = 'orbit' | 'cabin' | 'look' | 'locked';

export interface CameraShot {
  key: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  controls: ControlsMode;
  /** Screen-space framing nudge (world units along camera right / up). */
  frame?: { right: number; up: number };
  duration?: number;
  /** Height of the arc for long moves. */
  arc?: number;
  autoRotate?: boolean;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const EXTERIOR: Record<ExteriorView, Omit<CameraShot, 'key'>> = {
  hero: { position: v(8.6, 2.6, 10.8), target: v(0, 0.2, 0), fov: 38, controls: 'orbit', autoRotate: true, duration: 2.4 },
  front: { position: v(0.6, 0.9, 13.5), target: v(0, 0.3, 0), fov: 34, controls: 'orbit', duration: 2 },
  side: { position: v(14.5, 0.9, 0.2), target: v(0, 0.1, -0.4), fov: 34, controls: 'orbit', duration: 2 },
  top: { position: v(0.05, 17, 1.2), target: v(0, 0, -0.4), fov: 38, controls: 'orbit', duration: 2.2 },
  rear: { position: v(-7.5, 3.2, -11.5), target: v(0, 0.3, -0.6), fov: 36, controls: 'orbit', duration: 2.2 },
  rotor: { position: v(4.9, 2.7, 4.4), target: v(2.45, 0.9, 1.2), fov: 36, controls: 'orbit', duration: 2 },
};

export interface ShotContext {
  stage: Stage;
  exteriorView: ExteriorView;
  seatView: SeatView;
  focusedSeat: string | null;
  aircraftId: string;
  aspect: number;
  isMobile: boolean;
}

export function resolveShot(ctx: ShotContext): CameraShot {
  const { stage, aircraftId, isMobile } = ctx;
  switch (stage) {
    case 'intro':
      return { key: 'intro', position: v(11.5, 3.4, 15.5), target: v(0, 0.2, -2), fov: 36, controls: 'locked', duration: 0 };
    case 'hero':
      return { key: 'hero', ...EXTERIOR.hero, frame: isMobile ? { right: 0, up: -3.2 } : { right: -1.2, up: -0.4 } };
    case 'explore': {
      const s = EXTERIOR[ctx.exteriorView];
      return { key: `explore-${ctx.exteriorView}`, ...s, autoRotate: false, frame: isMobile ? { right: 0, up: -1.6 } : { right: 0, up: -0.2 } };
    }
    case 'route':
      return {
        key: 'route',
        position: v(9.5, 3.8, 9.5),
        target: v(0, 0, 0),
        fov: 38,
        controls: 'orbit',
        frame: isMobile ? { right: 0, up: -5.5 } : { right: 3.6, up: 0 },
        duration: 2.2,
      };
    case 'cabin': {
      const seats = getSeats(aircraftId);
      const zs = seats.map((s) => s.position[2]);
      const mid = (Math.max(...zs) + Math.min(...zs)) / 2;
      const span = Math.max(...zs) - Math.min(...zs);
      return {
        key: `cabin-${aircraftId}`,
        position: v(0.01, 8.2 + span * 1.1, mid - 1.15 - span * 0.2),
        target: v(0, -0.55, mid + 0.05),
        fov: 38,
        controls: 'cabin',
        frame: isMobile ? { right: 0, up: -1.6 } : { right: 0.2, up: 0 },
        duration: 2.6,
        arc: 2.5,
      };
    }
    case 'seat': {
      const seat = getSeats(aircraftId).find((s) => s.id === ctx.focusedSeat) ?? getSeats(aircraftId)[1];
      const [x, y, z] = seat.position;
      const side = Math.sign(x) || 1;
      if (ctx.seatView === 'pov') {
        // seated eye point, gazing forward and toward the window
        const eye = v(x - side * 0.04, y + 1.12, z - 0.12);
        return { key: `pov-${seat.id}`, position: eye, target: eye.clone().add(v(side * 1.0, -0.16, 0.62)), fov: 64, controls: 'look', duration: 1.8, arc: 0.4 };
      }
      return {
        key: `focus-${seat.id}`,
        position: v(x - side * 0.9, y + 2.35, z + 1.9),
        target: v(x, y + 0.5, z - 0.05),
        fov: 40,
        controls: 'cabin',
        frame: isMobile ? { right: 0, up: -0.55 } : { right: 0, up: 0 },
        duration: 1.6,
      };
    }
    case 'ambient':
      return { key: 'ambient', position: v(-10, 2.2, 9), target: v(0, 0.3, 0), fov: 36, controls: 'locked', autoRotate: true, frame: isMobile ? { right: 0, up: 1.2 } : { right: -3.4, up: 0 }, duration: 2.4 };
    case 'departure':
      return { key: 'departure', position: v(7.5, -4.5, 14), target: v(0, 3, -4), fov: 42, controls: 'locked', duration: 2.4 };
  }
}
