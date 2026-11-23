import { motion } from "motion/react";
import { Compass, Layers, Sparkles } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { MotionImage } from "@landing/components/ui/MotionImage";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

export function FeatureSection() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section
      id="features"
      aria-label="Designed Around the Journey"
      className="relative bg-velos-ivory text-velos-navy py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      <Container size="wide">
        <SectionHeading
          eyebrow="07 / DESIGNED AROUND THE JOURNEY"
          title="TECHNOLOGY SHOULD FEEL EFFORTLESS."
          description="Behind every quiet arrival is an intelligent digital foundation orchestrating dozens of variables without asking the traveler to think about any of them."
          theme="light"
          className="mb-16 sm:mb-20"
        />

        {/* Asymmetric Editorial Grid */}
        <div className="space-y-10 lg:space-y-12">
          {/* Panel 01: Full-Bleed Horizontal Asymmetric Editorial Panel */}
          <motion.article
            initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.85, ease: EASING.editorial }}
            className="grid grid-cols-1 lg:grid-cols-12 rounded-[2.25rem] bg-velos-white border border-velos-navy/10 overflow-hidden shadow-[0_24px_70px_rgba(8,19,31,0.08)]"
          >
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-[0.22em] text-velos-blue/70">
                  01 / HUMAN-CENTERED DISCOVERY
                </span>
                <div className="h-10 w-10 rounded-full bg-velos-ivory flex items-center justify-center text-velos-navy">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              <div className="my-8 lg:my-0">
                <h3 className="font-velos-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-velos-navy">
                  Intelligent planning
                </h3>
                <p className="mt-4 text-lg sm:text-xl text-velos-blue/85 leading-relaxed">
                  “Discover connected journey options through a single,
                  intuitive experience.”
                </p>
                <p className="mt-4 text-sm text-velos-blue/70 leading-relaxed">
                  Instead of piecing together separate ground rides, vertiport
                  check-ins, and operator schedules, travelers plan by
                  destination and arrival window.
                </p>
              </div>

              <div className="pt-6 border-t border-velos-navy/10 flex items-center justify-between text-xs font-mono text-velos-blue/75">
                <span>DOOR-TO-DOOR SOLVER</span>
                <span>UNIFIED TICKETING</span>
              </div>
            </div>

            <div className="lg:col-span-7 relative min-h-[320px] sm:min-h-[420px]">
              <MotionImage
                src="/landing/images/feature-planning.jpg"
                alt="Minimalist warm ivory skyport lounge overlooking a coastal city skyline"
                containerClassName="w-full h-full"
                parallaxStrength={10}
              />
            </div>
          </motion.article>

          {/* Panels 02 & 03: Asymmetric 5 / 7 Staggered Editorial Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Panel 02: Seamless Coordination */}
            <motion.article
              initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.85,
                delay: 0.1,
                ease: EASING.editorial,
              }}
              className="lg:col-span-5 rounded-[2.25rem] bg-velos-navy text-velos-white overflow-hidden flex flex-col justify-between shadow-[0_28px_80px_rgba(8,19,31,0.18)]"
            >
              <div className="relative aspect-[16/11] w-full">
                <MotionImage
                  src="/landing/images/feature-coordination.jpg"
                  alt="Elevated angle of an electric eVTOL lifting off from a circular pad while a ground EV departs below"
                  containerClassName="w-full h-full"
                  parallaxStrength={8}
                  overlayClassName="bg-gradient-to-t from-velos-navy via-transparent to-transparent"
                />
              </div>

              <div className="p-8 sm:p-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-velos-cyan">
                      02 / MULTI-MODAL FLOW
                    </span>
                    <Sparkles className="w-4 h-4 text-velos-cyan" />
                  </div>
                  <h3 className="font-velos-display text-3xl font-semibold tracking-[-0.03em] text-velos-white">
                    Seamless coordination
                  </h3>
                  <p className="mt-3 text-base sm:text-lg text-velos-mist leading-relaxed">
                    “Bring flight, ground mobility, and journey updates into one
                    coordinated flow.”
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-velos-white/12 flex items-center justify-between text-xs font-mono text-velos-silver">
                  <span>CURB-TO-PAD SYNC</span>
                  <span className="text-velos-cyan">LIVE HANDOFFS</span>
                </div>
              </div>
            </motion.article>

            {/* Panel 03: An Evolving Network */}
            <motion.article
              initial={prefersReducedMotion ? false : { opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.85,
                delay: 0.2,
                ease: EASING.editorial,
              }}
              className="lg:col-span-7 rounded-[2.25rem] bg-velos-white border border-velos-navy/10 overflow-hidden flex flex-col justify-between shadow-[0_24px_70px_rgba(8,19,31,0.08)]"
            >
              <div className="relative aspect-[16/9] w-full">
                <MotionImage
                  src="/landing/images/feature-network.jpg"
                  alt="High-altitude twilight aerial view of an illuminated coastal metropolis bay network"
                  containerClassName="w-full h-full"
                  parallaxStrength={9}
                  overlayClassName="bg-gradient-to-t from-velos-navy/50 via-transparent to-transparent"
                />
              </div>

              <div className="p-8 sm:p-11 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs uppercase tracking-[0.22em] text-velos-blue/70">
                      03 / SCALABLE DIGITAL INFRASTRUCTURE
                    </span>
                    <Layers className="w-4 h-4 text-velos-blue" />
                  </div>
                  <h3 className="font-velos-display text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-velos-navy">
                    An evolving network
                  </h3>
                  <p className="mt-3 text-lg sm:text-xl text-velos-blue/85 leading-relaxed">
                    “Build the digital foundation for a more connected urban
                    mobility ecosystem.”
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-velos-navy/10 flex items-center justify-between text-xs font-mono text-velos-blue/75">
                  <span>CITY-SCALE ARCHITECTURE</span>
                  <span>OPEN PARTNER GATEWAYS</span>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </Container>
    </section>
  );
}
