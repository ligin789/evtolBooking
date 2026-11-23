import { AnimatePresence } from 'motion/react';
import { lazy, Suspense, useEffect } from 'react';
import { FlightSearchPanel } from '../components/booking/FlightSearchPanel';
import { AircraftExplorer } from '../components/experience/AircraftExplorer';
import { CabinOverlay } from '../components/experience/CabinOverlay';
import { HeroOverlay } from '../components/experience/HeroOverlay';
import { SeatPovOverlay } from '../components/experience/SeatPovOverlay';
import { Sheet } from '../components/experience/Sheet';
import { useBooking } from '../store/bookingStore';
import { useExperience } from '../store/experienceStore';

const LandingContent = lazy(() => import('../landing/LandingContent'));

/** The single-page 3D journey: hero → explore → route → cabin → seat. */
export default function ExperiencePage() {
  const stage = useExperience((s) => s.stage);
  const setStage = useExperience((s) => s.setStage);
  const setHeroInView = useExperience((s) => s.setHeroInView);
  // The VIBE landing content scrolls in below the hero on the landing view only.
  const landingVisible = stage === 'intro' || stage === 'hero';

  // Entering any booking stage jumps back to the top so the 3D flow is in view.
  useEffect(() => {
    if (!landingVisible && window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [landingVisible]);

  // Track whether the hero is still on screen (pauses 3D rendering when it isn't).
  useEffect(() => {
    const onScroll = () => setHeroInView(window.scrollY < window.innerHeight * 1.05);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      setHeroInView(true);
    };
  }, [setHeroInView]);

  // Returning from the form steps (e.g. browser back) lands in the cabin.
  useEffect(() => {
    const st = useExperience.getState().stage;
    if (st === 'ambient' || st === 'departure') {
      const b = useBooking.getState();
      setStage(b.flight && !b.confirmation ? 'cabin' : 'hero');
    }
  }, [setStage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const st = useExperience.getState().stage;
      if (st === 'cabin') setStage(useBooking.getState().flight ? 'route' : 'explore');
      else if (st === 'explore' || st === 'route') setStage('hero');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setStage]);

  const onSelectSeats = () => {
    const b = useBooking.getState();
    const e = useExperience.getState();
    // carry a previewed seat into the booking if it is free on this flight
    if (b.flight && e.focusedSeat && !b.flight.occupiedSeats.includes(e.focusedSeat) && !b.seatAssignments.some(Boolean)) {
      b.assignSeat(e.focusedSeat);
    }
    setStage('cabin');
  };

  return (
    <main className="pointer-events-none relative">
      <h1 className="sr-only">VIBE eVTOL air taxi seat booking</h1>
      <AnimatePresence>
        {stage === 'hero' && <HeroOverlay key="hero" />}
        {stage === 'explore' && <AircraftExplorer key="explore" />}
        {stage === 'route' && (
          <Sheet key="route" label="Flight search">
            <FlightSearchPanel onSelectSeats={onSelectSeats} />
          </Sheet>
        )}
        {stage === 'cabin' && <CabinOverlay key="cabin" />}
        {stage === 'seat' && <SeatPovOverlay key="seat" />}
      </AnimatePresence>
      {landingVisible && (
        <Suspense fallback={null}>
          <LandingContent />
        </Suspense>
      )}
    </main>
  );
}
