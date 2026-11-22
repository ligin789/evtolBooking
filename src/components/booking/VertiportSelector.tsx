import { ArrowUpDown, MapPin } from 'lucide-react';
import { VERTIPORTS } from '../../config/vertiports';
import { useBooking } from '../../store/bookingStore';

/** Departure / destination pickers with a swap control. */
export function VertiportSelector() {
  const { search, setFrom, setTo, swapRoute } = useBooking();
  return (
    <div className="relative rounded-2xl border border-graphite/8 bg-white/70">
      <Picker id="from" label="From" value={search.fromId} onChange={setFrom} />
      <div className="mx-4 border-t border-graphite/8" />
      <Picker id="to" label="To" value={search.toId} onChange={setTo} />
      <button
        type="button"
        onClick={swapRoute}
        className="absolute top-1/2 right-4 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-graphite/10 bg-paper text-graphite shadow-sm transition hover:rotate-180 hover:bg-white"
        aria-label="Swap departure and destination"
      >
        <ArrowUpDown className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function Picker({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const v = VERTIPORTS.find((p) => p.id === value)!;
  return (
    <label htmlFor={`vp-${id}`} className="relative flex cursor-pointer items-center gap-3 px-4 py-3 pr-16">
      <MapPin className={`h-4 w-4 shrink-0 ${id === 'from' ? 'text-graphite' : 'text-electric'}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="eyebrow block text-[9.5px] text-mist">{label}</span>
        <span className="font-display block truncate text-[15px] font-semibold">
          {v.name} <span className="font-normal text-mist">· {v.code}</span>
        </span>
      </span>
      <select
        id={`vp-${id}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={`${label} vertiport`}
      >
        {VERTIPORTS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.code}) — {p.district}
          </option>
        ))}
      </select>
    </label>
  );
}
