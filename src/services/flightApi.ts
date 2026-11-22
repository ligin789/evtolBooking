import { getSeats, passengerCapacity } from '../config/aircraft';
import { PRICING } from '../config/pricing';
import { estimateDurationMin, getVertiport, routeKm } from '../config/vertiports';
import { addMinutes, toISODate } from '../lib/format';
import { hashString, seededRandom } from '../lib/random';
import type { Booking, BookingApi, BookingRequest, Flight, FlightSearch } from './types';

const LATENCY = 380;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Seats booked during this browser session on top of the seeded inventory. */
const sessionHolds = new Map<string, Set<string>>();

function buildFlights({ fromId, toId, date }: Omit<FlightSearch, 'passengers'>): Flight[] {
  if (fromId === toId) return [];
  const km = routeKm(fromId, toId);
  const duration = estimateDurationMin(fromId, toId);
  const from = getVertiport(fromId);
  const to = getVertiport(toId);
  const routeSeed = `${fromId}-${toId}`;
  const rnd = seededRandom(`${routeSeed}-${date}`);

  const now = new Date();
  const isToday = date === toISODate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes() + 20; // 20-minute check-in cutoff

  const flights: Flight[] = [];
  const interval = km > 18 ? 30 : 20;
  const offset = hashString(routeSeed) % interval;
  for (let m = 7 * 60 + offset; m <= 21 * 60 + 30; m += interval) {
    if (rnd() < 0.18) continue; // schedule gaps (charging turnarounds)
    if (isToday && m < nowMin) continue;
    const hh = Math.floor(m / 60);
    const departTime = `${String(hh).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
    const peak = PRICING.peakWindows.some(([a, b]) => hh >= a && hh < b);
    const aircraftId = (Math.floor(m / interval) + hashString(routeSeed)) % 4 === 0 ? 'aeris-s7' : 'aeris-s5';
    const id = `${from.code}${to.code}-${date.replace(/-/g, '')}-${departTime.replace(':', '')}`;

    const bookable = getSeats(aircraftId).filter((s) => s.bookable);
    const fill = peak ? 0.62 : 0.34;
    const occupied = bookable.filter(() => rnd() < fill).map((s) => s.id);
    for (const held of sessionHolds.get(id) ?? []) if (!occupied.includes(held)) occupied.push(held);

    const fare = Math.round((PRICING.baseFare + km * PRICING.perKm) * (peak ? PRICING.peakMultiplier : 1));
    flights.push({
      id,
      number: `AX ${100 + (hashString(id) % 800)}`,
      fromId,
      toId,
      date,
      departTime,
      arriveTime: addMinutes(departTime, duration),
      durationMin: duration,
      routeKm: km,
      aircraftId,
      occupiedSeats: occupied,
      baseFare: fare,
      peak,
      gate: `${from.code[0]}${1 + (hashString(id) % from.pads)}`,
    });
  }
  return flights;
}

export function seatsAvailable(f: Flight): number {
  return passengerCapacity(f.aircraftId) - f.occupiedSeats.length;
}

function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `AX-${s}`;
}

export const flightApi: BookingApi = {
  async searchFlights(search) {
    await wait(LATENCY);
    return buildFlights(search);
  },
  async getSeatMap(flightId) {
    await wait(120);
    const [codes, ymd] = flightId.split('-');
    const date = `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
    const from = codes.slice(0, 3).toLowerCase();
    const to = codes.slice(3, 6).toLowerCase();
    const f = buildFlights({ fromId: from, toId: to, date }).find((x) => x.id === flightId);
    return { occupied: f?.occupiedSeats ?? [] };
  },
  async createBooking(req: BookingRequest): Promise<Booking> {
    await wait(1400);
    const holds = sessionHolds.get(req.flight.id) ?? new Set<string>();
    for (const s of req.seats) {
      if (req.flight.occupiedSeats.includes(s) || holds.has(s)) {
        throw new Error(`Seat ${s} was just taken. Please choose another seat.`);
      }
    }
    req.seats.forEach((s) => holds.add(s));
    sessionHolds.set(req.flight.id, holds);
    return { ...req, reference: makeReference(), createdAt: new Date().toISOString(), status: 'confirmed' };
  },
};
