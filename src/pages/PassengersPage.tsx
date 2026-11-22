import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookingSummary } from '../components/booking/BookingSummary';
import { FloatingBookingTicket } from '../components/booking/FloatingBookingTicket';
import { PassengerDetailsForm } from '../components/booking/PassengerDetailsForm';
import { selectAllSeatsAssigned, useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';

export default function PassengersPage() {
  const navigate = useNavigate();
  const setStage = useExperience((s) => s.setStage);
  const { flight, search, seatAssignments, passengers, savePassengers } = useBooking();
  const ready = useBooking(selectAllSeatsAssigned);

  useEffect(() => setStage('ambient'), [setStage]);
  useEffect(() => window.scrollTo(0, 0), []);
  if (!flight || !ready) return <Navigate to="/" replace />;

  return (
    <PageFrame>
      <button
        type="button"
        onClick={() => {
          setStage('cabin');
          navigate('/');
        }}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-ivory/75 hover:text-ivory"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Back to seats
      </button>
      <div className="eyebrow text-champagne-soft">Step 04 · Passengers</div>
      <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-ivory sm:text-5xl">Who's flying?</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <PassengerDetailsForm
          count={search.passengers}
          seats={seatAssignments}
          initial={passengers}
          onSubmit={(p) => {
            savePassengers(p);
            navigate('/review');
          }}
        />
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <FloatingBookingTicket compact />
          <BookingSummary flight={flight} seats={seatAssignments} count={search.passengers} />
        </div>
      </div>
    </PageFrame>
  );
}

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-20 min-h-full bg-gradient-to-b from-graphite/70 via-graphite/55 to-graphite/80 backdrop-blur-[6px]"
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="mx-auto max-w-[1120px] px-4 pt-24 pb-16 sm:px-8 sm:pt-28"
      >
        {children}
      </motion.div>
    </motion.main>
  );
}
