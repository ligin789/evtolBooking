import { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { CheckCircle2, Navigation, Radio } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { JOURNEY_STAGES } from "@landing/lib/demo-routes";
import { EASING } from "@landing/lib/animation-config";

export function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const stageCount = JOURNEY_STAGES.length;
    const nextIdx = Math.min(
      stageCount - 1,
      Math.max(0, Math.floor(latest * stageCount))
    );
    if (nextIdx !== activeIndex) {
      setActiveIndex(nextIdx);
    }
  });

  // Allow keyboard left/right arrow navigation when focused inside the stage tabs
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        document.activeElement?.closest("[data-journey-tabs]") &&
        (e.key === "ArrowRight" || e.key === "ArrowLeft")
      ) {
        e.preventDefault();
        setActiveIndex((prev) =>
          e.key === "ArrowRight"
            ? (prev + 1) % JOURNEY_STAGES.length
            : (prev - 1 + JOURNEY_STAGES.length) % JOURNEY_STAGES.length
        );
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const currentStage = JOURNEY_STAGES[activeIndex];
  const progressFraction = (activeIndex + 1) / JOURNEY_STAGES.length;

  return (
    <section
      id="journey"
      aria-label="One Journey. Every Connection."
      className="relative bg-velos-navy text-velos-white"
    >
      {/* Desktop Sticky Scroll Narrative Container */}
      <div ref={containerRef} className="hidden lg:block relative h-[380vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-20 xl:py-24">
          {/* Background Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-radial-glow opacity-70"
          />

          <Container size="wide" className="relative z-10">
            <div className="flex items-end justify-between gap-8 border-b border-velos-white/10 pb-6">
              <div>
                <div className="inline-flex items-center gap-2.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-velos-cyan" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
                    02 / ONE JOURNEY. EVERY CONNECTION.
                  </span>
                </div>
                <h2 className="font-velos-display text-3xl xl:text-4xl font-semibold tracking-[-0.03em] text-velos-white">
                  Five coordinated stages. One continuous flow.
                </h2>
              </div>

              {/* Interactive Stage Selector Tabs */}
              <div
                data-journey-tabs
                role="tablist"
                aria-label="Journey stages"
                className="flex items-center gap-2 rounded-full bg-velos-white/[0.04] border border-velos-white/10 p-1.5"
              >
                {JOURNEY_STAGES.map((st, idx) => {
                  const isActive = idx === activeIndex;
                  const isPassed = idx < activeIndex;
                  return (
                    <button
                      key={st.number}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveIndex(idx)}
                      className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-[0.16em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-cyan ${
                        isActive
                          ? "bg-velos-cyan text-velos-navy font-semibold shadow-[0_0_20px_rgba(102,217,242,0.4)]"
                          : isPassed
                          ? "text-velos-cyan/90 hover:bg-velos-white/5"
                          : "text-velos-silver hover:text-velos-white hover:bg-velos-white/5"
                      }`}
                    >
                      {st.number} — {st.stage}
                    </button>
                  );
                })}
              </div>
            </div>
          </Container>

          {/* Main Sticky Split Narrative Area */}
          <Container size="wide" className="relative z-10 my-auto py-6">
            <div className="grid grid-cols-12 gap-12 items-center">
              {/* Left Column: Stage Narrative & Progressive Route Line */}
              <div className="col-span-5 space-y-7">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage.number}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.45, ease: EASING.editorial }}
                    className="space-y-5"
                  >
                    <div className="inline-flex items-center gap-3 rounded-full bg-velos-blue/70 border border-velos-cyan/30 px-4 py-1.5">
                      <span className="font-mono text-xs font-semibold text-velos-cyan">
                        STAGE {currentStage.number}
                      </span>
                      <span className="text-velos-white/30">•</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-velos-mist">
                        {currentStage.telemetryTag}
                      </span>
                    </div>

                    <h3 className="font-velos-display text-4xl xl:text-5xl font-semibold tracking-[-0.035em] leading-[1.06] text-velos-white">
                      “{currentStage.headline}”
                    </h3>

                    <p className="text-lg text-velos-silver leading-relaxed max-w-lg">
                      {currentStage.description}
                    </p>

                    {/* Floating Contextual UI Telemetry Panel */}
                    <div className="pt-2">
                      <div className="rounded-2xl bg-velos-blue/60 border border-velos-white/12 p-5 backdrop-blur-md">
                        <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-velos-cyan mb-2">
                          <span className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5" />
                            {currentStage.uiCard.statusLabel}
                          </span>
                          <span>{currentStage.uiCard.metricSecondary}</span>
                        </div>
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-velos-display text-2xl font-semibold text-velos-white">
                            {currentStage.uiCard.metricPrimary}
                          </span>
                          <span className="text-xs text-velos-silver">
                            {currentStage.uiCard.detail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Diagonal / Horizontal Progressive Journey Vector SVG */}
                <div className="pt-4">
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-velos-silver mb-2">
                    <span>Origin Doorstep</span>
                    <span className="text-velos-cyan">
                      Stage 0{activeIndex + 1} / 05 Active
                    </span>
                    <span>Destination Arrival</span>
                  </div>
                  <svg
                    viewBox="0 0 500 44"
                    fill="none"
                    className="w-full h-11 overflow-visible"
                    aria-hidden="true"
                  >
                    {/* Base muted trajectory */}
                    <path
                      d="M 16 32 Q 140 8, 250 22 T 484 12"
                      stroke="rgba(220,227,231,0.18)"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Animated active cyan trajectory */}
                    <motion.path
                      d="M 16 32 Q 140 8, 250 22 T 484 12"
                      stroke="#66D9F2"
                      strokeWidth="2.5"
                      fill="none"
                      initial={{ pathLength: 0.2 }}
                      animate={{ pathLength: progressFraction }}
                      transition={{ duration: 0.55, ease: EASING.editorial }}
                    />
                    {[
                      { cx: 16, cy: 32 },
                      { cx: 133, cy: 19 },
                      { cx: 250, cy: 22 },
                      { cx: 367, cy: 24 },
                      { cx: 484, cy: 12 },
                    ].map((pt, idx) => {
                      const reached = idx <= activeIndex;
                      const current = idx === activeIndex;
                      return (
                        <g key={idx}>
                          {current && (
                            <circle
                              cx={pt.cx}
                              cy={pt.cy}
                              r="10"
                              fill="rgba(102, 217, 242, 0.22)"
                            />
                          )}
                          <circle
                            cx={pt.cx}
                            cy={pt.cy}
                            r={current ? "5" : "3.5"}
                            fill={reached ? "#66D9F2" : "#102538"}
                            stroke={reached ? "#FFFFFF" : "#A8B6C2"}
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Right Column: Large Cinematic Scene Canvas with Diagonal Route Overlay */}
              <div className="col-span-7">
                <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-velos-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.65)] bg-velos-blue">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStage.image}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.65, ease: EASING.editorial }}
                      className="absolute inset-0"
                    >
                      <img loading="lazy" decoding="async"
                        src={currentStage.image}
                        alt={currentStage.imageAlt}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-velos-navy/85 via-velos-navy/20 to-transparent" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Diagonal Route Line Overlay across the Visual Frame */}
                  <svg
                    viewBox="0 0 800 500"
                    fill="none"
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 w-full h-full"
                  >
                    <motion.path
                      d="M 70 420 C 230 370, 390 220, 730 95"
                      stroke="#66D9F2"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      initial={{ pathLength: 0.2 }}
                      animate={{ pathLength: progressFraction }}
                      transition={{ duration: 0.65, ease: EASING.editorial }}
                    />
                  </svg>

                  {/* Top-left Stage Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-3 rounded-full bg-velos-navy/80 backdrop-blur-md border border-velos-white/15 px-4 py-2">
                    <Navigation className="w-3.5 h-3.5 text-velos-cyan" />
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-velos-white">
                      Stage {currentStage.number} — {currentStage.stage}
                    </span>
                  </div>

                  {/* Bottom-right Live Orchestration Indicator */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-velos-navy/85 backdrop-blur-md border border-velos-white/15 px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-velos-cyan shrink-0" />
                      <span className="text-xs sm:text-sm text-velos-mist">
                        {currentStage.stage}: {currentStage.headline}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-velos-cyan">
                      0{activeIndex + 1} / 05
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Container>

          {/* Bottom Scroll Hint */}
          <Container size="wide" className="relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-velos-silver/70 border-t border-velos-white/10 pt-4">
              <span>SCROLL TO ADVANCE THROUGH THE 5 STAGES OF A VIBE JOURNEY</span>
              <span>
                ACTIVE STAGE: {currentStage.number} ({currentStage.stage.toUpperCase()})
              </span>
            </div>
          </Container>
        </div>
      </div>

      {/* Mobile & Tablet Vertical Storytelling Sequence */}
      <div className="lg:hidden py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="02 / ONE JOURNEY. EVERY CONNECTION."
            title="Five coordinated stages. One continuous flow."
            description="From planning in your apartment to stepping into your destination, VIBE connects every leg into one orchestrated experience."
            theme="dark"
          />

          <div className="mt-14 space-y-12 relative before:absolute before:top-4 before:bottom-4 before:left-4 before:w-[1px] before:bg-velos-cyan/30">
            {JOURNEY_STAGES.map((stage) => (
              <div key={stage.number} className="relative pl-12">
                <div className="absolute left-1.5 top-1.5 h-5 w-5 rounded-full bg-velos-navy border-2 border-velos-cyan flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-velos-cyan" />
                </div>

                <div className="rounded-3xl bg-velos-blue/45 border border-velos-white/10 overflow-hidden shadow-xl">
                  <div className="relative aspect-[16/10] w-full">
                    <img loading="lazy" decoding="async"
                      src={stage.image}
                      alt={stage.imageAlt}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-velos-navy via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 rounded-full bg-velos-navy/85 border border-velos-white/15 px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-velos-cyan">
                      Stage {stage.number} — {stage.stage}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                      {stage.telemetryTag}
                    </span>
                    <h3 className="font-velos-display text-2xl font-semibold text-velos-white">
                      “{stage.headline}”
                    </h3>
                    <p className="text-sm text-velos-silver leading-relaxed">
                      {stage.description}
                    </p>
                    <div className="pt-3 mt-3 border-t border-velos-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-velos-white">
                        {stage.uiCard.metricPrimary}
                      </span>
                      <span className="text-velos-cyan">
                        {stage.uiCard.metricSecondary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
