import { ArrowRight, Minus, Plus } from 'lucide-react';
import { estimateDurationMin, routeKm } from '../../config/vertiports';
import { formatMoney, nextDays, parseISODate } from '../../lib/format';
import { seatsAvailable } from '../../services/flightApi';
import { MAX_PASSENGERS, useBooking } from '../../store/bookingStore';
import { Button } from '../ui/Button';
import { FlightRouteMap } from './FlightRouteMap';
import { FlightSchedule } from './FlightSchedule';
import { VertiportSelector } from './VertiportSelector';

/** Route booking: vertiports, map, date, passengers and departure time. */
export function FlightSearchPanel({ onSelectSeats }: { onSelectSeats: () => void }) {
  const { search, flight, setDate, setPassengerCount } = useBooking();
  const days = nextDays(7);
  const duration = estimateDurationMin(search.fromId, search.toId);

  return (
    <div className="space-y-5">
      <header>
        <div className="eyebrow text-mist">Step 02 · Route</div>
        <h2 className="font-display mt-1.5 text-[28px] leading-tight font-semibold tracking-tight">Plan your flight</h2>
        <p className="mt-1 text-[13px] text-slate">
          {routeKm(search.fromId, search.toId)} km corridor · approx. {duration} min door-to-pad
        </p>
      </header>

      <VertiportSelector />
      <FlightRouteMap />

      <section aria-labelledby="date-label">
        <div id="date-label" className="eyebrow mb-2 text-mist">
          Date
        </div>
        <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {days.map((d) => {
            const date = parseISODate(d);
            const active = d === search.date;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setDate(d)}
                aria-pressed={active}
                className={`flex w-[52px] shrink-0 cursor-pointer flex-col items-center rounded-2xl border py-2 transition ${
                  active ? 'border-graphite bg-graphite text-ivory' : 'border-graphite/8 bg-white/70 text-graphite hover:bg-white'
                }`}
              >
                <span className={`text-[10px] font-medium uppercase ${active ? 'text-champagne-soft' : 'text-mist'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="font-display text-lg leading-tight font-semibold">{date.getDate()}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-graphite/8 bg-white/70 px-4 py-3" aria-label="Passengers">
        <div>
          <div className="eyebrow text-[9.5px] text-mist">Passengers</div>
          <div className="font-display text-[15px] font-semibold">
            {search.passengers} {search.passengers === 1 ? 'adult' : 'adults'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StepBtn label="Remove passenger" onClick={() => setPassengerCount(search.passengers - 1)} disabled={search.passengers <= 1}>
            <Minus className="h-4 w-4" />
          </StepBtn>
          <span className="font-display w-5 text-center text-lg font-semibold tabular-nums" aria-live="polite">
            {search.passengers}
          </span>
          <StepBtn label="Add passenger" onClick={() => setPassengerCount(search.passengers + 1)} disabled={search.passengers >= MAX_PASSENGERS}>
            <Plus className="h-4 w-4" />
          </StepBtn>
        </div>
      </section>

      <section aria-labelledby="dep-label">
        <div id="dep-label" className="eyebrow mb-2 text-mist">
          Departures
        </div>
        <FlightSchedule />
      </section>

      <div className="sticky bottom-0 -mx-5 border-t border-graphite/8 bg-paper/90 px-5 py-3.5 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-[12px] text-slate">
            {flight ? (
              <>
                <span className="font-display text-[15px] font-semibold text-graphite">{flight.departTime}</span> · {seatsAvailable(flight)} seats left · from{' '}
                {formatMoney(flight.baseFare)}
              </>
            ) : (
              'Choose a departure time'
            )}
          </div>
          <Button variant="accent" onClick={onSelectSeats} disabled={!flight}>
            Select seats <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepBtn({ children, label, ...rest }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-graphite/12 bg-paper transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
      {...rest}
    >
      {children}
    </button>
  );
}
