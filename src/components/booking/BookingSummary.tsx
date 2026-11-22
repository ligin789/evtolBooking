import { CalendarDays, Clock, Plane, Users } from 'lucide-react';
import { getAircraft } from '../../config/aircraft';
import { getVertiport } from '../../config/vertiports';
import { quoteFor, seatFare } from '../../lib/fares';
import { formatDateLong, formatMoneyExact } from '../../lib/format';
import type { Flight, PassengerInput } from '../../services/types';

/** Itinerary + fare breakdown card used on the details and review steps. */
export function BookingSummary({ flight, seats, passengers, count }: { flight: Flight; seats: (string | null)[]; passengers?: PassengerInput[]; count: number }) {
  const from = getVertiport(flight.fromId);
  const to = getVertiport(flight.toId);
  const quote = quoteFor(flight, seats, count);
  const ac = getAircraft(flight.aircraftId);
  return (
    <section className="rounded-3xl border border-white/60 bg-paper/90 p-5 backdrop-blur-xl sm:p-6" aria-label="Booking summary">
      <div className="eyebrow text-mist">Your flight</div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="font-display text-2xl font-semibold">{from.code}</div>
          <div className="text-[11.5px] text-mist">{from.name}</div>
        </div>
        <Plane className="h-4 w-4 rotate-45 text-electric" aria-hidden="true" />
        <div className="text-right">
          <div className="font-display text-2xl font-semibold">{to.code}</div>
          <div className="text-[11.5px] text-mist">{to.name}</div>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 text-[12.5px] text-slate">
        <li className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {formatDateLong(flight.date)}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {flight.departTime} – {flight.arriveTime} · {flight.durationMin} min
        </li>
        <li className="flex items-center gap-2">
          <Plane className="h-3.5 w-3.5" aria-hidden="true" /> {ac.name} · {flight.number}
        </li>
        <li className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5" aria-hidden="true" /> {count} {count === 1 ? 'passenger' : 'passengers'}
        </li>
      </ul>
      <div className="mt-5 space-y-2 border-t border-graphite/8 pt-4">
        {seats.map((s, i) => (
          <div key={i} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2.5">
              <span className="font-display grid h-8 w-10 place-items-center rounded-lg bg-electric-soft text-[13px] font-semibold text-electric">{s ?? '—'}</span>
              <span className="text-slate">{passengers?.[i] ? `${passengers[i].firstName} ${passengers[i].lastName}` : `Passenger ${i + 1}`}</span>
            </span>
            <span className="font-display tabular-nums">{s ? formatMoneyExact(seatFare(flight, s)) : '—'}</span>
          </div>
        ))}
      </div>
      <dl className="mt-4 space-y-1.5 border-t border-graphite/8 pt-4 text-[12.5px] text-slate">
        <div className="flex justify-between">
          <dt>Seat fares</dt>
          <dd className="tabular-nums">{formatMoneyExact(quote.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>UAM levy (8%)</dt>
          <dd className="tabular-nums">{formatMoneyExact(quote.levy)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Vertiport facility fees</dt>
          <dd className="tabular-nums">{formatMoneyExact(quote.vertiportFees)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Booking fee</dt>
          <dd className="tabular-nums">{formatMoneyExact(quote.bookingFee)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-graphite/8 pt-3 text-graphite">
          <dt className="font-medium">Total</dt>
          <dd className="font-display text-2xl font-semibold tabular-nums">{formatMoneyExact(quote.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
