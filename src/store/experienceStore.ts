import { create } from 'zustand';

/**
 * Scene / camera state. Kept separate from booking data so the 3D layer can be
 * driven (or replaced) without touching the booking flow.
 */
export type Stage =
  | 'intro' // aircraft flies in
  | 'hero' // cinematic orbit
  | 'explore' // exterior configurator
  | 'route' // vertiport + schedule selection
  | 'cabin' // cutaway seat map
  | 'seat' // selected seat focus / passenger view
  | 'ambient' // background while filling forms
  | 'departure'; // confirmation take-off

export type ExteriorView = 'hero' | 'front' | 'side' | 'top' | 'rear' | 'rotor';
export type SeatView = 'focus' | 'pov';
export type FlightMode = 'cruise' | 'hover';

interface ExperienceState {
  stage: Stage;
  exteriorView: ExteriorView;
  seatView: SeatView;
  flightMode: FlightMode;
  hoveredSeat: string | null;
  focusedSeat: string | null;
  sceneReady: boolean;
  cameraBusy: boolean;
  /** After a seat is focused, glide into the passenger's perspective automatically. */
  autoPov: boolean;
  /** False once the landing content has scrolled over the 3D hero (rendering pauses). */
  heroInView: boolean;
  setHeroInView: (b: boolean) => void;
  setAutoPov: (b: boolean) => void;
  setStage: (s: Stage) => void;
  setExteriorView: (v: ExteriorView) => void;
  setSeatView: (v: SeatView) => void;
  setFlightMode: (m: FlightMode) => void;
  setHoveredSeat: (id: string | null) => void;
  focusSeat: (id: string | null) => void;
  setSceneReady: (r: boolean) => void;
  setCameraBusy: (b: boolean) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  stage: 'intro',
  exteriorView: 'hero',
  seatView: 'focus',
  flightMode: 'cruise',
  hoveredSeat: null,
  focusedSeat: null,
  sceneReady: false,
  cameraBusy: false,
  autoPov: true,
  heroInView: true,
  setHeroInView: (heroInView) => set({ heroInView }),
  setAutoPov: (autoPov) => set({ autoPov }),
  setStage: (stage) =>
    set((s) => ({
      stage,
      hoveredSeat: null,
      // the seat stage keeps its focus; leaving the cabin clears it
      focusedSeat: stage === 'seat' ? s.focusedSeat : stage === 'cabin' ? s.focusedSeat : null,
      flightMode: stage === 'cabin' || stage === 'seat' || stage === 'route' ? 'hover' : stage === 'hero' || stage === 'departure' ? 'cruise' : s.flightMode,
      exteriorView: stage === 'hero' ? 'hero' : s.exteriorView,
    })),
  setExteriorView: (exteriorView) => set({ exteriorView }),
  setSeatView: (seatView) => set({ seatView }),
  setFlightMode: (flightMode) => set({ flightMode }),
  setHoveredSeat: (hoveredSeat) => set({ hoveredSeat }),
  focusSeat: (focusedSeat) => set({ focusedSeat }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setCameraBusy: (cameraBusy) => set({ cameraBusy }),
}));
