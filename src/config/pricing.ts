export const CURRENCY = 'USD';

export const PRICING = {
  /** Fixed launch fare per seat. */
  baseFare: 69,
  /** Per route-km. */
  perKm: 7.4,
  /** Departures in commuter peaks cost more. */
  peakMultiplier: 1.15,
  peakWindows: [
    [7, 9],
    [17, 19],
  ] as [number, number][],
  /** Urban air mobility levy (percentage of seat fares). */
  levyRate: 0.08,
  /** Per passenger vertiport facility charge. */
  vertiportFee: 12,
  /** Per booking service fee. */
  bookingFee: 4,
};

export interface FareQuote {
  seatFares: { seatId: string; amount: number }[];
  subtotal: number;
  levy: number;
  vertiportFees: number;
  bookingFee: number;
  taxesAndFees: number;
  total: number;
}
