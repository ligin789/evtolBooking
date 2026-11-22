import { Copy, Plane, Printer, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { getVertiport } from '../../config/vertiports';
import { formatDateLong, formatMoneyExact } from '../../lib/format';
import type { Booking } from '../../services/types';
import { Button } from '../ui/Button';
import { DemoNotice } from '../ui/DemoNotice';
import { FloatingBookingTicket } from './FloatingBookingTicket';

const ease = [0.22, 1, 0.36, 1] as const;

export function BookingConfirmation({ booking, onNewBooking }: { booking: Booking; onNewBooking: () => void }) {
  const [copied, setCopied] = useState(false);
  const from = getVertiport(booking.flight.fromId);
  const to = getVertiport(booking.flight.toId);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(booking.reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="mx-auto max-w-[760px] text-center">
      <motion.svg width="92" height="92" viewBox="0 0 92 92" className="mx-auto" aria-hidden="true">
        <circle cx="46" cy="46" r="42" fill="none" stroke="#c9a86a" strokeWidth="2" pathLength={1} className="draw" />
        <motion.circle cx="46" cy="46" r="34" fill="#3d7bff" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 180, damping: 14 }} style={{ originX: '46px', originY: '46px' }} />
        <path d="M32 47l9 9 19-20" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="draw" style={{ animationDelay: '1s', animationDuration: '.6s' }} />
      </motion.svg>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease }}>
        <div className="eyebrow mt-6 text-champagne-soft">Booking confirmed · demo</div>
        <h1 className="font-display mt-3 text-[40px] leading-none font-light tracking-[-0.03em] text-ivory sm:text-6xl">
          Cleared for <span className="font-semibold">take-off.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[460px] text-[14.5px] text-ivory/70">
          {from.name} to {to.name} · {formatDateLong(booking.flight.date)} at {booking.flight.departTime}. Your pilot will meet you at pad {booking.flight.gate}.
        </p>
        <div className="glass-dark mx-auto mt-7 inline-flex items-center gap-4 rounded-2xl px-5 py-3.5 text-left">
          <div>
            <div className="eyebrow text-[9.5px] text-ivory/50">Booking reference</div>
            <div className="mt-0.5 font-mono text-2xl font-medium tracking-[0.12em] text-ivory">{booking.reference}</div>
          </div>
          <button type="button" onClick={copy} className="grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20" aria-label="Copy booking reference">
            <Copy className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Copied' : ''}
          </span>
        </div>
        {copied && <div className="mt-2 text-[12px] text-champagne-soft">Copied to clipboard</div>}
      </motion.div>

      <div className="mt-10 space-y-4 text-left">
        {booking.passengers.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3 + i * 0.15, duration: 0.9, ease }}>
            <FloatingBookingTicket seatId={booking.seats[i]} passengerName={`${p.firstName} ${p.lastName}`} reference={`${booking.reference}-${i + 1}`} compact={false} />
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="inline-flex items-center gap-2 text-[13px] text-ivory/70">
          <Plane className="h-4 w-4 -rotate-45 text-champagne" aria-hidden="true" /> Demo total {formatMoneyExact(booking.total)}
        </span>
        <Button variant="dark" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" /> Print passes
        </Button>
        <Button variant="accent" onClick={onNewBooking}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Book another flight
        </Button>
      </motion.div>
      <DemoNotice className="mx-auto mt-8 max-w-[520px] !text-ivory/45" />
    </div>
  );
}
