import { Html } from '@react-three/drei';
import type { SeatDef } from '../config/aircraft';
import { formatMoney } from '../lib/format';
import type { SeatState } from './PassengerSeat';

/** Floating 3D-anchored label above a seat (screen-space sized). */
export function SeatTooltip({ seat, state, price, passengerTag }: { seat: SeatDef; state: SeatState; price: number | null; passengerTag: string | null }) {
  const status =
    state === 'pilot' ? 'Pilot · not bookable' : state === 'occupied' ? 'Occupied' : state === 'selected' ? (passengerTag ? `Selected · ${passengerTag}` : 'Selected') : 'Available';
  const dot = state === 'occupied' ? 'bg-danger' : state === 'pilot' ? 'bg-champagne' : 'bg-electric';
  return (
    <Html position={[0, 1.42, 0]} center zIndexRange={[30, 10]} style={{ pointerEvents: 'none' }}>
      <div className="glass min-w-[132px] rounded-2xl px-3.5 py-2.5 text-graphite select-none" style={{ animation: 'tip-in .28s var(--ease-cine)' }}>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-display text-[22px] leading-none font-semibold tracking-tight">{seat.kind === 'pilot' ? 'PIC' : seat.id}</span>
          {price !== null && state !== 'occupied' && state !== 'pilot' && <span className="font-display text-sm font-semibold">{formatMoney(price)}</span>}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {status}
        </div>
        {seat.kind === 'passenger' && <div className="mt-0.5 text-[10.5px] text-mist">{seat.label}</div>}
      </div>
      <style>{`@keyframes tip-in{from{opacity:0;transform:translateY(6px) scale(.96)}to{opacity:1;transform:none}}`}</style>
    </Html>
  );
}
