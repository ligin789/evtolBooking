import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_FROM, DEFAULT_TO } from '../config/vertiports';
import { toISODate } from '../lib/format';
import type { Booking, Flight, FlightSearch, PassengerInput } from '../services/types';

export const MAX_PASSENGERS = 6;

interface BookingState {
  search: FlightSearch;
  flight: Flight | null;
  /** seatAssignments[i] = seat for passenger i */
  seatAssignments: (string | null)[];
  activePassenger: number;
  passengers: PassengerInput[];
  confirmation: Booking | null;

  setFrom: (id: string) => void;
  setTo: (id: string) => void;
  swapRoute: () => void;
  setDate: (date: string) => void;
  setPassengerCount: (n: number) => void;
  selectFlight: (f: Flight | null) => void;
  /** Assign a seat to the active passenger. Returns the passenger index used. */
  assignSeat: (seatId: string) => number;
  releaseSeat: (passengerIndex: number) => void;
  setActivePassenger: (i: number) => void;
  savePassengers: (p: PassengerInput[]) => void;
  confirm: (b: Booking) => void;
  reset: () => void;
}

const initialSearch = (): FlightSearch => ({ fromId: DEFAULT_FROM, toId: DEFAULT_TO, date: toISODate(new Date()), passengers: 1 });

const resize = <T,>(arr: T[], n: number, fill: T): T[] => Array.from({ length: n }, (_, i) => (i < arr.length ? arr[i] : fill));

export const useBooking = create<BookingState>()(
  persist(
    (set, get) => ({
      search: initialSearch(),
      flight: null,
      seatAssignments: [null],
      activePassenger: 0,
      passengers: [],
      confirmation: null,

      setFrom: (fromId) =>
        set((s) => ({
          search: { ...s.search, fromId, toId: s.search.toId === fromId ? s.search.fromId : s.search.toId },
          flight: null,
          seatAssignments: s.seatAssignments.map(() => null),
        })),
      setTo: (toId) =>
        set((s) => ({
          search: { ...s.search, toId, fromId: s.search.fromId === toId ? s.search.toId : s.search.fromId },
          flight: null,
          seatAssignments: s.seatAssignments.map(() => null),
        })),
      swapRoute: () =>
        set((s) => ({ search: { ...s.search, fromId: s.search.toId, toId: s.search.fromId }, flight: null, seatAssignments: s.seatAssignments.map(() => null) })),
      setDate: (date) => set((s) => ({ search: { ...s.search, date }, flight: null, seatAssignments: s.seatAssignments.map(() => null) })),
      setPassengerCount: (n) =>
        set((s) => {
          const count = Math.min(MAX_PASSENGERS, Math.max(1, n));
          return {
            search: { ...s.search, passengers: count },
            seatAssignments: resize(s.seatAssignments, count, null),
            activePassenger: Math.min(s.activePassenger, count - 1),
          };
        }),
      selectFlight: (flight) => set((s) => ({ flight, seatAssignments: s.seatAssignments.map(() => null), activePassenger: 0 })),
      assignSeat: (seatId) => {
        const s = get();
        const assignments = [...s.seatAssignments];
        const owner = assignments.indexOf(seatId);
        if (owner !== -1) {
          // Seat already belongs to a passenger: simply make them active.
          set({ activePassenger: owner });
          return owner;
        }
        const idx = s.activePassenger;
        assignments[idx] = seatId;
        const nextEmpty = assignments.findIndex((a) => a === null);
        set({ seatAssignments: assignments, activePassenger: nextEmpty === -1 ? idx : nextEmpty });
        return idx;
      },
      releaseSeat: (i) =>
        set((s) => {
          const assignments = [...s.seatAssignments];
          assignments[i] = null;
          return { seatAssignments: assignments, activePassenger: i };
        }),
      setActivePassenger: (activePassenger) => set({ activePassenger }),
      savePassengers: (passengers) => set({ passengers }),
      confirm: (confirmation) => set({ confirmation }),
      reset: () =>
        set({ search: initialSearch(), flight: null, seatAssignments: [null], activePassenger: 0, passengers: [], confirmation: null }),
    }),
    {
      name: 'aeris-booking',
      storage: createJSONStorage(() => sessionStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Never resume a search for a date that has passed.
        if (state && state.search.date < toISODate(new Date())) state.reset();
      },
    },
  ),
);

export const selectAllSeatsAssigned = (s: BookingState) => s.seatAssignments.length > 0 && s.seatAssignments.every(Boolean);
