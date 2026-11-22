import { ArrowRight, ChevronDown, Plane } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, type CSSProperties } from 'react';
import { getAircraft, getSeats } from '../../config/aircraft';
import { getVertiport } from '../../config/vertiports';
import { quoteFor, seatFare } from '../../lib/fares';
import { formatDateShort, formatMoney, formatMoneyExact } from '../../lib/format';
import { useBooking } from '../../store/bookingStore';
import { Barcode } from './Barcode';

interface Props {
  /** Seat shown large on the stub (defaults to the active passenger's seat). */
  seatId?: string | null;
  compact?: boolean;
  /** Boarding-pass mode for the confirmation screen. */
  passengerName?: string;
  reference?: string;
  onContinue?: () => void;
  continueLabel?: string;
  className?: string;
}

/**
 * The floating boarding-pass ticket (ivory card, graphite header, tear-off
 * stub). Reads the live booking state, so it updates the moment a seat
 * changes. Without a selected flight it renders as a seat preview.
 */
export function FloatingBookingTicket({ seatId, compact = false, passengerName, reference, onContinue, continueLabel = 'Continue booking', className = '' }: Props) {
  const { flight, search, seatAssignments, activePassenger } = useBooking();
  const [showFare, setShowFare] = useState(!compact);

  const aircraft = getAircraft(flight?.aircraftId);
  const shownSeat = seatId ?? seatAssignments[activePassenger] ?? seatAssignments.find(Boolean) ?? null;
  const seatDef = getSeats(aircraft.id).find((s) => s.id === shownSeat);
  const from = getVertiport(flight?.fromId ?? search.fromId);
  const to = getVertiport(flight?.toId ?? search.toId);
  const quote = flight ? quoteFor(flight, seatAssignments, search.passengers) : null;
  const isPass = Boolean(reference);
  const available = flight && shownSeat ? !flight.occupiedSeats.includes(shownSeat) : true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, rotateX: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 160, damping: 22 }}
      className={`relative w-full overflow-hidden rounded-[22px] text-graphite shadow-[0_40px_80px_-30px_rgba(23,24,27,.55)] ${className}`}
      style={{ transformPerspective: 1200 }}
      aria-live="polite"
    >
      <div className="flex bg-paper/95 backdrop-blur-xl" style={notchMask(compact ? 112 : 140)}>
        {/* main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between bg-graphite px-5 py-2.5 text-champagne-soft">
            <span className="eyebrow flex items-center gap-2">
              <Plane className="h-3.5 w-3.5 -rotate-45" strokeWidth={2.2} aria-hidden="true" /> AERIS · {isPass ? 'Boarding pass' : 'Air taxi'}
            </span>
            <span className="eyebrow hidden text-champagne/80 sm:inline">{aircraft.name}</span>
          </div>
          <div className={compact ? 'px-5 pt-3.5 pb-3' : 'px-5 pt-4 pb-4 sm:px-6'}>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className={`font-display leading-none font-semibold tracking-tight ${compact ? 'text-3xl' : 'text-4xl sm:text-[44px]'}`}>{from.code}</div>
                <div className="mt-1 truncate text-[11px] text-mist">{from.name}</div>
                <div className="font-display mt-1 text-[15px] font-medium">{flight?.departTime ?? '--:--'}</div>
              </div>
              <div className="flex flex-1 flex-col items-center px-1 pb-6">
                <div className="flex w-full items-center gap-1.5 text-electric">
                  <span className="h-px flex-1 border-t border-dashed border-electric/50" />
                  <EvtolGlyph />
                  <span className="h-px flex-1 border-t border-dashed border-electric/50" />
                </div>
                <div className="eyebrow mt-1.5 text-[9px] text-mist">{flight ? `eVTOL · ${flight.durationMin} min` : 'eVTOL'}</div>
              </div>
              <div className="min-w-0 text-right">
                <div className={`font-display leading-none font-semibold tracking-tight ${compact ? 'text-3xl' : 'text-4xl sm:text-[44px]'}`}>{to.code}</div>
                <div className="mt-1 truncate text-[11px] text-mist">{to.name}</div>
                <div className="font-display mt-1 text-[15px] font-medium">{flight?.arriveTime ?? '--:--'}</div>
              </div>
            </div>
            <div className="mt-3.5 grid grid-cols-4 gap-2 border-t border-graphite/8 pt-3">
              <Field label={isPass ? 'Passenger' : compact ? 'Pax' : 'Passengers'} value={isPass ? passengerName ?? 'Guest' : search.passengers === 1 ? 'You' : `${search.passengers} pax`} />
              <Field label="Seat" value={shownSeat ?? '—'} accent />
              <Field label="Date" value={formatDateShort(flight?.date ?? search.date)} />
              <Field label={isPass ? 'Gate' : 'Boards'} value={isPass ? flight?.gate ?? '—' : flight ? boardTime(flight.departTime) : '—'} />
            </div>
            {!compact && search.passengers > 1 && !isPass && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {seatAssignments.map((s, i) => (
                  <span key={i} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${s ? 'bg-electric-soft text-electric' : 'bg-sand text-slate'}`}>
                    P{i + 1} · {s ?? 'select seat'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* perforation */}
        <div className="relative my-3 w-0 border-l-2 border-dashed border-graphite/15" />

        {/* stub */}
        <div className={`flex shrink-0 flex-col ${compact ? 'w-[111px]' : 'w-[139px]'}`}>
          <div className="bg-graphite px-3 py-2.5 text-center">
            <span className="eyebrow text-champagne-soft">{flight?.number ?? 'Preview'}</span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-between px-3 py-3 text-center">
            <div>
              <div className="eyebrow text-[9px] text-mist">Seat</div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={shownSeat ?? 'none'}
                  initial={{ y: 14, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -14, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`font-display leading-none font-semibold tracking-tight text-electric ${compact ? 'text-[34px]' : 'text-[44px]'}`}
                >
                  {shownSeat ?? '—'}
                </motion.div>
              </AnimatePresence>
              <div className={`mt-1 flex items-center justify-center gap-1 text-[10.5px] ${available ? 'text-success' : 'text-danger'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${available ? 'bg-success' : 'bg-danger'}`} />
                {isPass ? 'Confirmed' : shownSeat ? (available ? (seatDef?.column === 'A' ? 'Window · left' : 'Window · right') : 'Occupied') : 'Choose seat'}
              </div>
            </div>
            <Barcode value={reference ?? flight?.id ?? 'preview'} className="mt-2 h-8 w-full text-graphite" />
            <div className="mt-1.5 text-[11px] text-mist">
              {flight && shownSeat ? (
                <>
                  <span className="mr-1 text-[9px] tracking-wider">USD</span>
                  <span className="font-display text-[15px] font-semibold text-graphite">{seatFare(flight, shownSeat)}</span>
                </>
              ) : flight ? (
                <>from {formatMoney(flight.baseFare)}</>
              ) : (
                'Select a flight'
              )}
            </div>
          </div>
        </div>
      </div>

      {quote && !isPass && (
        <div className="border-t border-graphite/8 bg-paper/95 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setShowFare((v) => !v)}
            className="flex w-full cursor-pointer items-center justify-between px-5 py-2.5 text-left text-[12px] text-slate hover:bg-graphite/[.03] sm:px-6"
            aria-expanded={showFare}
          >
            <span>
              Total for {search.passengers} {search.passengers === 1 ? 'passenger' : 'passengers'}
              <span className="font-display ml-2 text-[15px] font-semibold text-graphite">{formatMoneyExact(quote.total)}</span>
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFare ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {showFare && (
              <motion.dl
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-5 text-[12px] sm:px-6"
              >
                <div className="space-y-1 pb-3">
                  <Row label={`Seat fare${quote.seatFares.length > 1 ? 's' : ''}`} value={formatMoneyExact(quote.subtotal)} />
                  <Row label="UAM levy (8%)" value={formatMoneyExact(quote.levy)} />
                  <Row label="Vertiport facility fees" value={formatMoneyExact(quote.vertiportFees)} />
                  <Row label="Booking fee" value={formatMoneyExact(quote.bookingFee)} />
                  <Row label="Taxes & fees" value={formatMoneyExact(quote.taxesAndFees)} strong />
                </div>
              </motion.dl>
            )}
          </AnimatePresence>
        </div>
      )}

      {onContinue && (
        <div className="flex items-center justify-between gap-3 border-t border-graphite/8 bg-ivory/95 backdrop-blur-xl px-4 py-3 sm:px-5">
          <span className="text-[11px] text-mist">{aircraft.model}</span>
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-electric px-5 text-[13px] font-medium text-white shadow-[0_10px_24px_-10px_rgba(61,123,255,.8)] transition hover:bg-[#2f6cf0] active:scale-[.98]"
          >
            {continueLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/** Cuts the two semicircular notches of a tear-off stub. */
function notchMask(stub: number): CSSProperties {
  const at = `calc(100% - ${stub}px)`;
  const img = `radial-gradient(circle 10px at ${at} 0, transparent 9.5px, #000 10px), radial-gradient(circle 10px at ${at} 100%, transparent 9.5px, #000 10px)`;
  return { maskImage: img, WebkitMaskImage: img, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' } as CSSProperties;
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow text-[9px] text-mist">{label}</div>
      <div className={`font-display mt-0.5 truncate text-[15px] font-semibold ${accent ? 'text-electric' : ''}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? 'border-t border-graphite/8 pt-1.5 font-medium text-graphite' : 'text-slate'}`}>
      <dt>{label}</dt>
      <dd className="font-display tabular-nums">{value}</dd>
    </div>
  );
}

function boardTime(depart: string) {
  const [h, m] = depart.split(':').map(Number);
  const t = h * 60 + m - 15;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

function EvtolGlyph() {
  return (
    <svg width="26" height="14" viewBox="0 0 26 14" aria-hidden="true" className="shrink-0">
      <path d="M5 8.5c3-1.6 5.5-2.2 8-2.2s5 .6 8 2.2" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M2 4.5h7M17 4.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5.5 4.5v2.2M20.5 4.5v2.2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13" cy="10.5" r="1.6" fill="currentColor" />
    </svg>
  );
}
