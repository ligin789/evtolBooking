import { getSeats } from '../config/aircraft';
import { PRICING, type FareQuote } from '../config/pricing';
import type { Flight } from '../services/types';

export function seatFare(flight: Flight, seatId: string): number {
  const seat = getSeats(flight.aircraftId).find((s) => s.id === seatId);
  return flight.baseFare + (seat?.premium ?? 0);
}

export function quoteFor(flight: Flight, seatIds: (string | null)[], passengerCount: number): FareQuote {
  const chosen = seatIds.filter((s): s is string => Boolean(s));
  const seatFares = chosen.map((seatId) => ({ seatId, amount: seatFare(flight, seatId) }));
  // Unassigned passengers are quoted at the base fare so totals stay honest.
  const unassigned = Math.max(0, passengerCount - chosen.length);
  const subtotal = seatFares.reduce((sum, s) => sum + s.amount, 0) + unassigned * flight.baseFare;
  const levy = round2(subtotal * PRICING.levyRate);
  const vertiportFees = PRICING.vertiportFee * passengerCount;
  const bookingFee = PRICING.bookingFee;
  const taxesAndFees = round2(levy + vertiportFees + bookingFee);
  return { seatFares, subtotal, levy, vertiportFees, bookingFee, taxesAndFees, total: round2(subtotal + taxesAndFees) };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
