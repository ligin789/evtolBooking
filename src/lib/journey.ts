import { DEFAULT_AIRCRAFT_ID, getSeats } from '../config/aircraft';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';

/**
 * Journey actions shared by the 3D scene and the 2D UI, so both entry points
 * behave identically.
 */
export function selectSeat(seatId: string): boolean {
  const book = useBooking.getState();
  const exp = useExperience.getState();
  const seat = getSeats(book.flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID).find((s) => s.id === seatId);
  if (!seat || !seat.bookable) return false;
  if (book.flight?.occupiedSeats.includes(seatId)) return false;
  if (book.flight) book.assignSeat(seatId);
  exp.focusSeat(seatId);
  exp.setAutoPov(true);
  exp.setSeatView('focus');
  exp.setStage('seat');
  return true;
}

export type ContinueResult = 'route' | 'cabin' | 'details';

/** Decide where "Continue booking" goes from the current state. */
export function continueBooking(): ContinueResult {
  const book = useBooking.getState();
  const exp = useExperience.getState();
  if (!book.flight) {
    exp.setStage('route');
    return 'route';
  }
  const next = book.seatAssignments.findIndex((s) => !s);
  if (next !== -1) {
    book.setActivePassenger(next);
    exp.focusSeat(null);
    exp.setStage('cabin');
    return 'cabin';
  }
  return 'details';
}
