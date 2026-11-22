/**
 * Transport-agnostic booking types. The mock service in `flightApi.ts`
 * implements `BookingApi`; a real inventory / payment backend only needs to
 * provide the same interface.
 */

export interface FlightSearch {
  fromId: string;
  toId: string;
  date: string; // YYYY-MM-DD
  passengers: number;
}

export interface Flight {
  id: string;
  number: string;
  fromId: string;
  toId: string;
  date: string;
  departTime: string; // HH:mm
  arriveTime: string;
  durationMin: number;
  routeKm: number;
  aircraftId: string;
  occupiedSeats: string[];
  baseFare: number;
  peak: boolean;
  gate: string;
}

export interface PassengerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weightKg: number;
  carryOn: boolean;
}

export interface BookingRequest {
  flight: Flight;
  seats: string[];
  passengers: PassengerInput[];
  total: number;
}

export interface Booking extends BookingRequest {
  reference: string;
  createdAt: string;
  status: 'confirmed';
}

export interface BookingApi {
  searchFlights(search: FlightSearch): Promise<Flight[]>;
  getSeatMap(flightId: string): Promise<{ occupied: string[] }>;
  createBooking(req: BookingRequest): Promise<Booking>;
}
