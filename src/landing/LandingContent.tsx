import { BookingWidget } from '@landing/components/booking/BookingWidget';
import { FinalCtaSection } from '@landing/components/layout/FinalCtaSection';
import { Footer } from '@landing/components/layout/Footer';
import { PartnerSection } from '@landing/components/partners/PartnerSection';
import { FeatureSection } from '@landing/components/platform/FeatureSection';
import { FleetShowcase } from '@landing/components/platform/FleetShowcase';
import { OperationsDashboard } from '@landing/components/platform/OperationsDashboard';
import { IntroSection } from '@landing/components/storytelling/IntroSection';
import { JourneySection } from '@landing/components/storytelling/JourneySection';
import { OrchestrationSection } from '@landing/components/storytelling/OrchestrationSection';

/**
 * VIBE landing content (ported from the EvtolLanding project), rendered
 * below the 3D hero. The first screen is a transparent spacer so the fixed
 * 3D scene and its hero overlay show through; the sections then scroll up
 * over it on their own navy / ivory backgrounds.
 */
export default function LandingContent() {
  return (
    <div className="velos-landing pointer-events-none relative z-30">
      <div id="top" aria-hidden="true" className="pointer-events-none h-[100svh]" />
      <div className="pointer-events-auto relative bg-velos-navy shadow-[0_-40px_80px_rgba(8,19,31,0.45)]">
        {/* Section 02: A New Way to Move */}
        <IntroSection />
        {/* Section 03: One Journey. Every Connection. */}
        <JourneySection />
        {/* Section 04: The VIBE Orchestration Engine */}
        <OrchestrationSection />
        {/* Section 05: The Booking Experience */}
        <BookingWidget />
        {/* Section 06: A Connected Fleet Ecosystem */}
        <FleetShowcase />
        {/* Section 07: Intelligence in Motion */}
        <OperationsDashboard />
        {/* Section 08: Designed Around the Journey */}
        <FeatureSection />
        {/* Section 09: Built for a Connected Ecosystem */}
        <PartnerSection />
        {/* Section 10: Final CTA */}
        <FinalCtaSection />
        {/* Section 11: Footer */}
        <Footer />
      </div>
    </div>
  );
}
