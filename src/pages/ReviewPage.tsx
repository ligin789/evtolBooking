import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookingSummary } from '../components/booking/BookingSummary';
import { Button } from '../components/ui/Button';
import { DemoNotice } from '../components/ui/DemoNotice';
import { getVertiport } from '../config/vertiports';
import { quoteFor } from '../lib/fares';
import { formatDateLong, formatMoneyExact } from '../lib/format';
import { flightApi } from '../services/flightApi';
import { selectAllSeatsAssigned, useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';
import { PageFrame } from './PassengersPage';

export default function ReviewPage() {
  const navigate = useNavigate();
  const setStage = useExperience((s) => s.setStage);
  const { flight, search, seatAssignments, passengers, confirm } = useBooking();
  const ready = useBooking(selectAllSeatsAssigned);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setStage('ambient'), [setStage]);
  useEffect(() => window.scrollTo(0, 0), []);
  if (!flight || !ready) return <Navigate to="/" replace />;
  if (passengers.length !== search.passengers) return <Navigate to="/passengers" replace />;

  const quote = quoteFor(flight, seatAssignments, search.passengers);
  const from = getVertiport(flight.fromId);
  const to = getVertiport(flight.toId);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const booking = await flightApi.createBooking({ flight, seats: seatAssignments as string[], passengers, total: quote.total });
      confirm(booking);
      navigate('/confirmation');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <button type="button" onClick={() => navigate('/passengers')} className="mb-6 inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-ivory/75 hover:text-ivory">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Edit passengers
      </button>
      <div className="eyebrow text-champagne-soft">Step 05 · Review</div>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-ivory sm:text-5xl">Ready for boarding</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <section className="rounded-3xl border border-white/60 bg-paper/90 p-5 backdrop-blur-xl sm:p-6">
            <div className="eyebrow text-mist">Itinerary</div>
            <p className="font-display mt-2 text-xl font-semibold">
              {from.name} → {to.name}
            </p>
            <p className="mt-1 text-[13px] text-slate">
              {formatDateLong(flight.date)} · departs {flight.departTime} from pad {flight.gate} · arrive {flight.arriveTime}
            </p>
            <p className="mt-3 rounded-2xl bg-sand/60 p-3 text-[12.5px] text-slate">
              Arrive at {from.name} vertiport 15 minutes before departure. Boarding closes 5 minutes before lift-off.
            </p>
          </section>
          <section className="rounded-3xl border border-white/60 bg-paper/90 p-5 backdrop-blur-xl sm:p-6">
            <div className="eyebrow text-mist">Passengers</div>
            <ul className="mt-3 divide-y divide-graphite/8">
              {passengers.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-3 text-[14px]">
                  <span>
                    <span className="font-medium">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="block text-[12px] text-mist">
                      {i === 0 ? `${p.email} · ${p.phone}` : 'Companion'} · {p.weightKg} kg{p.carryOn ? ' · carry-on' : ''}
                    </span>
                  </span>
                  <span className="font-display grid h-9 w-11 place-items-center rounded-xl bg-electric-soft font-semibold text-electric">{seatAssignments[i]}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-3xl border border-white/60 bg-paper/90 p-5 backdrop-blur-xl sm:p-6">
            <label className="flex cursor-pointer items-start gap-3 text-[13.5px]">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#3d7bff]" />
              <span>I understand this is a demonstration booking: no real flight is reserved and no payment is taken.</span>
            </label>
            {error && (
              <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2 text-[13px] text-danger">
                {error}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-[12px] text-slate">
                <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" /> Total {formatMoneyExact(quote.total)} · demo, nothing is charged
              </span>
              <Button variant="accent" size="lg" disabled={!agreed || busy} onClick={submit}>
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Confirming…
                  </>
                ) : (
                  'Confirm demo booking'
                )}
              </Button>
            </div>
          </section>
          <DemoNotice className="px-1 !text-ivory/50" />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingSummary flight={flight} seats={seatAssignments} passengers={passengers} count={search.passengers} />
        </div>
      </div>
    </PageFrame>
  );
}
