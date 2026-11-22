/**
 * Aircraft configuration.
 *
 * Every visual and booking concern that depends on the airframe (cabin length,
 * seat positions, seat premiums) is derived from these objects, so a new eVTOL
 * model only needs a new entry here.
 *
 * Coordinate system (metres, aircraft local space):
 *   +z = nose, +y = up, +x = passenger's LEFT when seated facing forward.
 */

export type SeatKind = 'pilot' | 'passenger';

export interface SeatDef {
  id: string;
  kind: SeatKind;
  row: number;
  /** Column letter for passengers (A = left window, B = right window). */
  column: string;
  position: [number, number, number];
  /** Extra fare over the flight base fare, in USD. */
  premium: number;
  label: string;
  bookable: boolean;
}

export interface SeatRowDef {
  row: number;
  z: number;
  columns: { column: string; x: number; premium: number; label: string }[];
}

export interface AircraftConfig {
  id: string;
  name: string;
  model: string;
  tagline: string;
  /** Fuselage pod length (m). The wing, booms and canopy scale from this. */
  length: number;
  maxRadius: number;
  floorY: number;
  pilot: { x: number; z: number };
  rows: SeatRowDef[];
  specs: { label: string; value: string }[];
}

function seatsFromRows(cfg: Pick<AircraftConfig, 'pilot' | 'rows' | 'floorY'>): SeatDef[] {
  const y = cfg.floorY;
  const seats: SeatDef[] = [
    {
      id: 'P1',
      kind: 'pilot',
      row: 0,
      column: 'P',
      position: [cfg.pilot.x, y, cfg.pilot.z],
      premium: 0,
      label: 'Pilot',
      bookable: false,
    },
  ];
  for (const r of cfg.rows) {
    for (const c of r.columns) {
      seats.push({
        id: `${r.row}${c.column}`,
        kind: 'passenger',
        row: r.row,
        column: c.column,
        position: [c.x, y, r.z],
        premium: c.premium,
        label: c.label,
        bookable: true,
      });
    }
  }
  return seats;
}

const S5: AircraftConfig = {
  id: 'aeris-s5',
  name: 'AERIS S5',
  model: 'S5 · 1 pilot + 4',
  tagline: 'Six-rotor electric air taxi',
  length: 6.2,
  maxRadius: 1,
  floorY: -0.56,
  pilot: { x: 0, z: 1.42 },
  rows: [
    {
      row: 1,
      z: 0.38,
      columns: [
        { column: 'A', x: 0.43, premium: 24, label: 'Forward window · left' },
        { column: 'B', x: -0.43, premium: 24, label: 'Forward window · right' },
      ],
    },
    {
      row: 2,
      z: -0.52,
      columns: [
        { column: 'A', x: 0.43, premium: 0, label: 'Panorama window · left' },
        { column: 'B', x: -0.43, premium: 0, label: 'Panorama window · right' },
      ],
    },
  ],
  specs: [
    { label: 'Cruise', value: '200 km/h' },
    { label: 'Range', value: '160 km' },
    { label: 'Rotors', value: '6 electric' },
    { label: 'Cabin noise', value: '45 dB' },
  ],
};

const S7: AircraftConfig = {
  id: 'aeris-s7',
  name: 'AERIS S7',
  model: 'S7 · 1 pilot + 6',
  tagline: 'Stretched six-passenger cabin',
  length: 7.2,
  maxRadius: 1.02,
  floorY: -0.57,
  pilot: { x: 0, z: 1.78 },
  rows: [
    {
      row: 1,
      z: 0.82,
      columns: [
        { column: 'A', x: 0.44, premium: 24, label: 'Forward window · left' },
        { column: 'B', x: -0.44, premium: 24, label: 'Forward window · right' },
      ],
    },
    {
      row: 2,
      z: -0.06,
      columns: [
        { column: 'A', x: 0.44, premium: 10, label: 'Panorama window · left' },
        { column: 'B', x: -0.44, premium: 10, label: 'Panorama window · right' },
      ],
    },
    {
      row: 3,
      z: -0.94,
      columns: [
        { column: 'A', x: 0.44, premium: 0, label: 'Aft window · left' },
        { column: 'B', x: -0.44, premium: 0, label: 'Aft window · right' },
      ],
    },
  ],
  specs: [
    { label: 'Cruise', value: '210 km/h' },
    { label: 'Range', value: '180 km' },
    { label: 'Rotors', value: '6 electric' },
    { label: 'Cabin noise', value: '47 dB' },
  ],
};

export const AIRCRAFT: Record<string, AircraftConfig> = { [S5.id]: S5, [S7.id]: S7 };
export const DEFAULT_AIRCRAFT_ID = S5.id;

const seatCache = new Map<string, SeatDef[]>();
export function getSeats(aircraftId: string): SeatDef[] {
  const cached = seatCache.get(aircraftId);
  if (cached) return cached;
  const cfg = getAircraft(aircraftId);
  const seats = seatsFromRows(cfg);
  seatCache.set(aircraftId, seats);
  return seats;
}

export function getAircraft(id: string | undefined | null): AircraftConfig {
  return (id && AIRCRAFT[id]) || AIRCRAFT[DEFAULT_AIRCRAFT_ID];
}

export function passengerCapacity(aircraftId: string): number {
  return getSeats(aircraftId).filter((s) => s.bookable).length;
}

/** Hull radius at a given z for an aircraft (unit profile × maxRadius). */
export function hullRadiusAt(cfg: AircraftConfig, z: number): number {
  const t = (z + cfg.length / 2) / cfg.length;
  return cfg.maxRadius * hullProfile(t);
}

/** Teardrop fuselage profile, t = 0 (tail) … 1 (nose). Peak ≈ t 0.59. */
export function hullProfile(t: number): number {
  const c = Math.min(Math.max(t, 0), 1);
  return Math.pow(Math.sin(Math.PI * Math.pow(c, 1.3)), 0.6);
}

/** Fuselage height is slightly taller than wide. */
export const HULL_HEIGHT_SCALE = 1.08;
