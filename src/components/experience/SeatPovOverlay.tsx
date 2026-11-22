import { ArrowLeft, Eye, EyeOff, LayoutGrid, Move, ScanSearch, Ticket } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { seatFare } from '../../lib/fares';
import { formatMoney } from '../../lib/format';
import { useIsMobile } from '../../hooks/useReducedMotion';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_AIRCRAFT_ID, getSeats } from '../../config/aircraft';
import { continueBooking } from '../../lib/journey';
import { useBooking } from '../../store/bookingStore';
import { useExperience } from '../../store/experienceStore';
import { FloatingBookingTicket } from '../booking/FloatingBookingTicket';

/**
 * Selected-seat stage: the floating boarding pass hovers over the window
 * while the camera sits in the passenger's position.
 */
export function SeatPovOverlay() {
  const navigate = useNavigate();
  const { seatView, setSeatView, setStage, focusedSeat, setAutoPov, cameraBusy } = useExperience();
  const { flight, seatAssignments } = useBooking();
  const seat = getSeats(flight?.aircraftId ?? DEFAULT_AIRCRAFT_ID).find((s) => s.id === focusedSeat);
  const allSeated = seatAssignments.every(Boolean);
  const nextUnseated = seatAssignments.findIndex((s) => !s);
  const isMobile = useIsMobile();
  // On phones the ticket starts collapsed so the passenger view is visible first.
  const [ticketOpen, setTicketOpen] = useState(!isMobile);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setStage('cabin');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setStage]);

  const onContinue = () => {
    if (continueBooking() === 'details') navigate('/passengers');
  };
  const label = !flight ? 'Choose a flight' : allSeated ? 'Continue booking' : `Seat passenger ${nextUnseated + 1}`;

  return (
    <motion.section className="pointer-events-none fixed inset-0 z-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-graphite/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-graphite/50 to-transparent" />

      {/* Docked ticket: bottom-left on desktop, above the controls on mobile; collapsible so the view stays clear */}
      <div className="pointer-events-auto absolute inset-x-2 bottom-[88px] md:inset-x-auto md:bottom-8 md:left-6 md:w-[420px]">
        <AnimatePresence mode="wait" initial={false}>
          {ticketOpen ? (
            <motion.div key="open" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.35 }}>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTicketOpen(false)}
                  className="glass-dark inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[11.5px] text-ivory"
                  aria-label="Hide ticket to see the view"
                >
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> Hide ticket
                </button>
              </div>
              <FloatingBookingTicket key={focusedSeat} seatId={focusedSeat} compact onContinue={onContinue} continueLabel={label} />
            </motion.div>
          ) : (
            <motion.button
              key="closed"
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setTicketOpen(true)}
              className="glass inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-full pr-4 pl-1.5 text-[12.5px] font-medium text-graphite"
            >
              <span className="font-display grid h-8 min-w-10 place-items-center rounded-full bg-electric px-2 text-[13px] font-semibold text-white">{focusedSeat}</span>
              {flight && focusedSeat ? formatMoney(seatFare(flight, focusedSeat)) : 'Preview'} · Show ticket
              <Ticket className="h-4 w-4 text-slate" aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-2 bottom-2 flex flex-col items-center gap-2.5 md:bottom-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pointer-events-auto flex flex-wrap items-center justify-center gap-2"
        >
          <button type="button" onClick={() => setStage('cabin')} className="glass-dark inline-flex h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-[12.5px] text-ivory">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Not this seat?
          </button>
          <div className="glass flex rounded-full p-1" role="tablist" aria-label="Seat view">
            <ViewTab active={seatView === 'pov'} onClick={() => setSeatView('pov')} icon={<Eye className="h-3.5 w-3.5" />} label="Passenger view" />
            <ViewTab
              active={seatView === 'focus'}
              onClick={() => {
                setAutoPov(false);
                setSeatView('focus');
              }}
              icon={<ScanSearch className="h-3.5 w-3.5" />}
              label="Inspect seat"
            />
            <ViewTab active={false} onClick={() => setStage('cabin')} icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Cabin" />
          </div>
        </motion.div>
        {seatView === 'pov' && !cameraBusy && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden items-center gap-1.5 text-[11.5px] text-ivory/80 md:flex">
            <Move className="h-3.5 w-3.5" aria-hidden="true" /> Drag to look around · {seat?.label ?? ''}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}

function ViewTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${active ? 'bg-graphite text-ivory' : 'text-graphite/70 hover:text-graphite'}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
