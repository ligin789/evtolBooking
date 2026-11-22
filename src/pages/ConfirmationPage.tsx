import { motion } from 'motion/react';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BookingConfirmation } from '../components/booking/BookingConfirmation';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const booking = useBooking((s) => s.confirmation);
  const reset = useBooking((s) => s.reset);
  const setStage = useExperience((s) => s.setStage);

  useEffect(() => setStage('departure'), [setStage]);
  useEffect(() => window.scrollTo(0, 0), []);
  if (!booking) return <Navigate to="/" replace />;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-20 min-h-full bg-gradient-to-b from-graphite/30 via-graphite/60 to-graphite/90 px-4 pt-28 pb-16 sm:px-8"
    >
      <BookingConfirmation
        booking={booking}
        onNewBooking={() => {
          reset();
          useExperience.getState().focusSeat(null);
          setStage('hero');
          navigate('/');
        }}
      />
    </motion.main>
  );
}
