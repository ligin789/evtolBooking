/**
 * Demonstration network for the fictional coastal city of "Port Meridian".
 * None of these vertiports or routes are real operational services.
 * Coordinates are in kilometres on a local map grid (x east, y south).
 */

export interface Vertiport {
  id: string;
  code: string;
  name: string;
  district: string;
  x: number;
  y: number;
  pads: number;
}

export const CITY_NAME = 'Port Meridian';

export const VERTIPORTS: Vertiport[] = [
  { id: 'hbr', code: 'HBR', name: 'Harbourfront', district: 'Old Harbour', x: 14.5, y: 13.2, pads: 4 },
  { id: 'ctr', code: 'CTR', name: 'Central Spire', district: 'Downtown', x: 18.2, y: 9.4, pads: 6 },
  { id: 'apt', code: 'APT', name: 'Meridian Airport Link', district: 'Airport', x: 33.5, y: 15.8, pads: 8 },
  { id: 'mrn', code: 'MRN', name: 'Marina Deck', district: 'West Marina', x: 6.2, y: 16.4, pads: 3 },
  { id: 'ntp', code: 'NTP', name: 'North Tech Park', district: 'Innovation District', x: 22.8, y: 2.6, pads: 4 },
  { id: 'clf', code: 'CLF', name: 'Cliffside Heights', district: 'Headland', x: 3.4, y: 6.1, pads: 2 },
];

export const DEFAULT_FROM = 'hbr';
export const DEFAULT_TO = 'apt';

export function getVertiport(id: string): Vertiport {
  const v = VERTIPORTS.find((p) => p.id === id);
  if (!v) throw new Error(`Unknown vertiport ${id}`);
  return v;
}

export function distanceKm(a: Vertiport, b: Vertiport): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Flight path length is longer than the straight line: eVTOL corridors route
 * over the water and around the downtown core.
 */
export function routeKm(fromId: string, toId: string): number {
  const d = distanceKm(getVertiport(fromId), getVertiport(toId));
  return Math.round(d * 1.18 * 10) / 10;
}

/** Block time in minutes: vertical phases + cruise at ~190 km/h. */
export function estimateDurationMin(fromId: string, toId: string): number {
  const km = routeKm(fromId, toId);
  return Math.max(6, Math.round(4 + (km / 190) * 60));
}
