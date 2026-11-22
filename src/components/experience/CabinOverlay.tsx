import { ArrowLeft, MousePointerClick } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_AIRCRAFT_ID, getAircraft, passengerCapacity } from '../../config/aircraft';
import { formatMoney } from '../../lib/format';
import { continueBooking } from '../../lib/journey';
import { useBooking } from '../../store/bookingStore';
import { useExperience } from '../../store/experienceStore';
import { FloatingBookingTicket } from '../booking/FloatingBookingTicket';
import { Button } from '../ui/Button';
import { SeatLegend, SeatSelector } from './SeatSelector';

/** Cutaway cabin view: title card, passenger tabs, seat map and live ticket. */
export function CabinOverlay() {
  const navigate = useNavigate();
  const setStage = useExperience((s) => s.setStage);
  const { flight, search, seatAssignments, activePassenger, setActivePassenger } = useBooking();
  const ac = getAircraft(flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID);
  const free = flight ? passengerCapacity(ac.id) - flight.occupiedSeats.length : passengerCapacity(ac.id);
  const anyAssigned = seatAssignments.some(Boolean);

  const onContinue = () => {
    if (continueBooking() === 'details') navigate('/passengers');
  };

  return (
    <motion.section className="pointer-events-none fixed inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-x-0 bottom-0 hidden h-[45%] bg-gradient-to-t from-graphite/55 to-transparent md:block" />
      {/* title card, like a class reveal */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-20 left-5 sm:top-24 sm:left-10 lg:left-14"
      >
        <button
          type="button"
          onClick={() => setStage(flight ? 'route' : 'explore')}
          className="pointer-events-auto mb-5 inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-graphite/70 hover:text-graphite"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {flight ? 'Change flight' : 'Exterior'}
        </button>
        <div className="eyebrow text-graphite/60">Cabin · {ac.name}</div>
        <h2 className="font-display mt-1.5 text-[34px] leading-none font-semibold tracking-tight text-graphite sm:text-5xl">Choose your seat</h2>
        <p className="mt-2 text-[13px] text-graphite/70">
          1 pilot + {passengerCapacity(ac.id)} passengers · {free} available{flight ? ` · from ${formatMoney(flight.baseFare)}` : ''}
        </p>
        <p className="mt-3 hidden items-center gap-1.5 text-[12px] text-graphite/60 sm:flex">
          <MousePointerClick className="h-3.5 w-3.5" aria-hidden="true" /> Hover a seat to preview, click to sit in it
        </p>
      </motion.div>

      {/* control panel */}
      <motion.aside
        aria-label="Seat selection"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 30 }}
        transition={{ type: 'spring', stiffness: 140, damping: 22, delay: 0.3 }}
        className="glass pointer-events-auto absolute inset-x-2 bottom-2 max-h-[46vh] overflow-y-auto rounded-[26px] p-4 md:inset-x-auto md:top-24 md:right-6 md:bottom-auto md:max-h-[calc(100vh-8rem)] md:w-[360px] md:p-5"
      >
        {flight && search.passengers > 1 && (
          <div className="mb-4">
            <div className="eyebrow mb-2 text-mist">Seating for</div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Passenger">
              {seatAssignments.map((s, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === activePassenger}
                  onClick={() => setActivePassenger(i)}
                  className={`group inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                    i === activePassenger ? 'border-graphite bg-graphite text-ivory' : 'border-graphite/10 bg-white/70 text-graphite'
                  }`}
                >
                  P{i + 1}
                  <span className={i === activePassenger ? 'text-champagne-soft' : 'text-electric'}>{s ?? '—'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-start gap-4 md:block">
          <div className="shrink-0 md:mb-4">
            <SeatSelector />
          </div>
          <div className="min-w-0 flex-1">
            <SeatLegend />
            {!flight && (
              <div className="mt-4 rounded-2xl bg-white/60 p-3.5 text-[12.5px] text-slate">
                You are previewing the cabin. Choose a route and departure time to see live seat availability.
                <Button size="sm" variant="primary" className="mt-3 w-full" onClick={() => setStage('route')}>
                  Plan your flight
                </Button>
              </div>
            )}
          </div>
        </div>
        <AnimatePresence>
          {flight && anyAssigned && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
              <FloatingBookingTicket compact onContinue={onContinue} continueLabel={seatAssignments.every(Boolean) ? 'Continue booking' : `Seat passenger ${seatAssignments.findIndex((s) => !s) + 1}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </motion.section>
  );
}
