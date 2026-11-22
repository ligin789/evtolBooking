import { DEFAULT_AIRCRAFT_ID, getAircraft, getSeats } from '../../config/aircraft';
import { seatFare } from '../../lib/fares';
import { formatMoney } from '../../lib/format';
import { selectSeat } from '../../lib/journey';
import { useBooking } from '../../store/bookingStore';
import { useExperience } from '../../store/experienceStore';

/**
 * Compact, keyboard-accessible top-down seat schematic. It mirrors the 3D
 * cabin (hover here highlights the 3D seat) and is the primary control when
 * WebGL is unavailable.
 */
export function SeatSelector() {
  const flight = useBooking((s) => s.flight);
  const assignments = useBooking((s) => s.seatAssignments);
  const focused = useExperience((s) => s.focusedSeat);
  const hovered = useExperience((s) => s.hoveredSeat);
  const setHovered = useExperience((s) => s.setHoveredSeat);
  const aircraftId = flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID;
  const seats = getSeats(aircraftId);
  const rows = getAircraft(aircraftId).rows;
  const pilot = seats.find((s) => s.kind === 'pilot')!;

  return (
    <div className="relative mx-auto w-[176px]" role="group" aria-label="Seat map">
      {/* fuselage outline */}
      <div className="rounded-t-[88px] rounded-b-[44px] border border-graphite/12 bg-white/55 px-4 pt-6 pb-5">
        <div className="mx-auto mb-3 flex w-12 flex-col items-center">
          <div className="grid h-10 w-12 place-items-center rounded-xl bg-graphite text-[10px] font-semibold tracking-wider text-champagne-soft" title="Pilot seat — not bookable">
            PIC
          </div>
          <span className="sr-only">{pilot.label}: not bookable</span>
        </div>
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r.row} className="flex items-center justify-between">
              {r.columns.map((c, ci) => {
                const id = `${r.row}${c.column}`;
                const occupied = flight?.occupiedSeats.includes(id) ?? false;
                const owner = assignments.indexOf(id);
                const selected = owner !== -1 || (!flight && focused === id);
                const isHover = hovered === id;
                const price = flight ? seatFare(flight, id) : null;
                return (
                  <div key={id} className="contents">
                    {ci === 1 && <span className="h-8 w-3 rounded-full bg-graphite/10" aria-hidden="true" />}
                    <button
                      type="button"
                      disabled={occupied}
                      aria-pressed={selected}
                      aria-label={`Seat ${id}, ${c.label}${occupied ? ', occupied' : price ? `, ${formatMoney(price)}` : ''}${owner !== -1 ? `, assigned to passenger ${owner + 1}` : ''}`}
                      onMouseEnter={() => setHovered(id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => selectSeat(id)}
                      className={`font-display relative grid h-11 w-12 cursor-pointer place-items-center rounded-xl text-[13px] font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                        occupied
                          ? 'bg-graphite/70 text-ivory/50'
                          : selected
                            ? 'bg-electric text-white shadow-[0_8px_18px_-8px_rgba(61,123,255,.9)]'
                            : isHover
                              ? 'bg-electric-soft text-electric ring-2 ring-electric/40'
                              : 'bg-champagne-soft/70 text-graphite hover:bg-champagne-soft'
                      }`}
                    >
                      {id}
                      {owner !== -1 && assignments.length > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-graphite px-1 text-[9px] text-ivory">P{owner + 1}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SeatLegend() {
  const items = [
    { c: 'bg-champagne-soft', l: 'Available' },
    { c: 'bg-electric', l: 'Selected' },
    { c: 'bg-graphite/70', l: 'Occupied' },
    { c: 'bg-graphite', l: 'Pilot' },
  ];
  return (
    <ul className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[11px] text-slate">
      {items.map((i) => (
        <li key={i.l} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-[4px] ${i.c}`} /> {i.l}
        </li>
      ))}
    </ul>
  );
}
