import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Compass, Cpu, Sparkles } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { MotionImage } from "@landing/components/ui/MotionImage";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

const SUPPORTING_POINTS = [
  {
    num: "01",
    title: "Connected journeys",
    detail:
      "Unifying first-mile ground pickup, skyport boarding, electric flight, and onward arrival under one itinerary.",
    icon: Compass,
  },
  {
    num: "02",
    title: "Intelligent coordination",
    detail:
      "Synchronizing participating aircraft operators, vertiport pad slots, and surface vehicles in real time.",
    icon: Cpu,
  },
  {
    num: "03",
    title: "One seamless experience",
    detail:
      "Removing the friction between air and ground so urban travel feels effortless from doorstep to destination.",
    icon: Sparkles,
  },
];

export function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [35, -35]
  );

  const badgeY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [55, -55]
  );

  return (
    <section
      id="intro"
      ref={sectionRef}
      aria-label="A New Way to Move"
      className="relative bg-velos-ivory text-velos-navy py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      {/* Subtle architectural grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(8,19,31,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(8,19,31,0.04)_1px,transparent_1px)] bg-[size:5rem_5rem]"
      />

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Oversized Editorial Typography & Narrative */}
          <motion.div
            style={{ y: textY }}
            className="lg:col-span-6 space-y-8"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: EASING.editorial }}
              className="inline-flex items-center gap-2.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-velos-blue" />
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-velos-blue/80 font-semibold">
                01 / A NEW WAY TO MOVE
              </span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: 0.08,
                ease: EASING.editorial,
              }}
              className="font-velos-display text-4xl sm:text-5xl xl:text-[4rem] font-semibold tracking-[-0.038em] leading-[1.03] text-velos-navy"
            >
              THE CITY MOVES.
              <br />
              <span className="text-velos-blue/75">
                NOW YOUR JOURNEY CAN, TOO.
              </span>
            </motion.h2>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.8,
                delay: 0.16,
                ease: EASING.editorial,
              }}
              className="text-lg sm:text-xl text-velos-blue/85 leading-relaxed max-w-xl"
            >
              VIBE brings every part of an urban air journey together,
              connecting the passenger, the aircraft, the vertiport, and the
              ground journey through one coordinated experience.
            </motion.p>

            {/* Three Minimal Supporting Points */}
            <div className="pt-4 border-t border-velos-navy/10 space-y-5">
              {SUPPORTING_POINTS.map((pt, index) => {
                const Icon = pt.icon;
                return (
                  <motion.div
                    key={pt.num}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 20 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      duration: 0.65,
                      delay: 0.2 + index * 0.1,
                      ease: EASING.editorial,
                    }}
                    className="group flex items-start gap-5 p-4 rounded-2xl bg-velos-white/75 border border-velos-navy/8 hover:border-velos-navy/25 hover:bg-velos-white transition-all duration-300 shadow-sm"
                  >
                    <span className="font-mono text-xs font-semibold tracking-[0.18em] text-velos-blue/60 pt-1">
                      {pt.num} —
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-velos-display text-lg font-semibold text-velos-navy tracking-tight">
                          {pt.title}
                        </h3>
                        <Icon className="w-4 h-4 text-velos-blue/60 group-hover:text-velos-navy transition-colors" />
                      </div>
                      <p className="mt-1 text-sm text-velos-blue/75 leading-relaxed">
                        {pt.detail}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Cinematic Aerial Imagery with Layered Parallax & Image Masking */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={
                prefersReducedMotion
                  ? false
                  : { clipPath: "inset(8% 8% 8% 8% round 1.5rem)", opacity: 0 }
              }
              whileInView={{
                clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
                opacity: 1,
              }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: EASING.editorial }}
              className="relative aspect-[4/5] sm:aspect-[5/6] w-full rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(8,19,31,0.16)]"
            >
              <MotionImage
                src="/landing/images/aerial-city-section2.jpg"
                alt="High-altitude aerial photograph of a modern coastal metropolis with urban air mobility corridors"
                containerClassName="w-full h-full"
                parallaxStrength={12}
                overlayClassName="bg-gradient-to-t from-velos-navy/70 via-transparent to-velos-navy/15"
              />

              {/* Subtle SVG Route Vector Overlay inside the Aerial Composition */}
              <svg
                viewBox="0 0 500 600"
                fill="none"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 w-full h-full"
              >
                <path
                  d="M85 470 C 170 360, 260 280, 395 145"
                  stroke="#66D9F2"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeOpacity="0.85"
                />
                <circle cx="85" cy="470" r="6" fill="#FFFFFF" />
                <circle
                  cx="85"
                  cy="470"
                  r="14"
                  stroke="#66D9F2"
                  strokeWidth="1.5"
                />
                <circle cx="245" cy="300" r="5" fill="#66D9F2" />
                <circle cx="395" cy="145" r="6" fill="#66D9F2" />
                <circle
                  cx="395"
                  cy="145"
                  r="16"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Bottom Caption Bar inside Image */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-velos-navy/85 backdrop-blur-md border border-velos-white/15 px-5 py-4 text-velos-white">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                    METROPOLITAN CORRIDOR LAYER
                  </span>
                  <span className="text-sm font-medium text-velos-white">
                    Every journey. Orchestrated across air and ground.
                  </span>
                </div>
                <a
                  href="#journey"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .querySelector("#journey")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  aria-label="Explore the 5-stage journey"
                  className="p-2.5 rounded-full bg-velos-white/10 hover:bg-velos-cyan hover:text-velos-navy transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Layered Floating Parallax Telemetry Card */}
            <motion.div
              style={{ y: badgeY }}
              className="hidden sm:block absolute -left-8 top-10 z-20 rounded-2xl bg-velos-navy text-velos-white p-5 shadow-2xl border border-velos-white/10 max-w-[230px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                  JOURNEY SYNC
                </span>
                <span className="h-2 w-2 rounded-full bg-velos-cyan" />
              </div>
              <div className="font-velos-display text-2xl font-semibold tracking-tight">
                Doorstep → Sky
              </div>
              <p className="mt-1 text-xs text-velos-silver leading-relaxed">
                Single itinerary across ground EV, skyport lounge, and electric flight.
              </p>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
