import { BatteryCharging, Clock, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { getAircraft } from '../../config/aircraft';
import { formatMoney } from '../../lib/format';
import { flightApi, seatsAvailable } from '../../services/flightApi';
import type { Flight } from '../../services/types';
import { useBooking } from '../../store/bookingStore';

/** Available departures for the current search, fetched from the booking API. */
export function FlightSchedule({ onPick }: { onPick?: (f: Flight) => void }) {
  const { search, flight, selectFlight } = useBooking();
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setFlights(null);
    setError(null);
    flightApi
      .searchFlights(search)
      .then((f) => alive && setFlights(f))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [search.fromId, search.toId, search.date]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!flights)
    return (
      <div className="space-y-2" aria-busy="true" aria-label="Loading departures">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[62px] animate-pulse rounded-2xl bg-graphite/5" />
        ))}
      </div>
    );
  if (flights.length === 0)
    return <p className="rounded-2xl bg-white/60 p-4 text-sm text-slate">No more departures on this date. Try the next day.</p>;

  return (
    <ul className="space-y-2" role="listbox" aria-label="Departure times">
      {flights.map((f, i) => {
        const left = seatsAvailable(f);
        const enough = left >= search.passengers;
        const selected = flight?.id === f.id;
        const ac = getAircraft(f.aircraftId);
        return (
          <motion.li key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.03 }}>
            <button
              type="button"
              role="option"
              aria-selected={selected}
              disabled={!enough}
              onClick={() => {
                selectFlight(f);
                onPick?.(f);
              }}
              className={`group flex w-full cursor-pointer items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                selected ? 'border-electric bg-electric-soft/60 shadow-[0_0_0_3px_rgba(61,123,255,.15)]' : 'border-graphite/8 bg-white/70 hover:border-graphite/20 hover:bg-white'
              }`}
            >
              <div className="w-[62px]">
                <div className="font-display text-lg leading-none font-semibold">{f.departTime}</div>
                <div className="mt-1 text-[11px] text-mist">→ {f.arriveTime}</div>
              </div>
              <div className="min-w-0 flex-1 text-[11.5px] text-slate">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" /> {f.durationMin} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" aria-hidden="true" /> {enough ? `${left} seats left` : 'Not enough seats'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 truncate text-mist">
                  <BatteryCharging className="h-3 w-3" aria-hidden="true" /> {ac.name} · {f.number}
                  {f.peak && <span className="ml-1 rounded-full bg-champagne-soft/70 px-1.5 text-[9.5px] font-semibold tracking-wide text-[#7a5f2c] uppercase">Peak</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-mist">from</div>
                <div className="font-display text-[17px] font-semibold">{formatMoney(f.baseFare)}</div>
              </div>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
