import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, Layers, ShieldCheck, X } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { MotionImage } from "@landing/components/ui/MotionImage";
import { Button } from "@landing/components/ui/Button";
import { FLEET_CATEGORIES, FleetCategory } from "@landing/lib/demo-routes";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

export function FleetShowcase() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedCategory, setSelectedCategory] =
    useState<FleetCategory | null>(null);

  return (
    <section
      id="fleet"
      aria-label="A Connected Fleet Ecosystem"
      className="relative bg-velos-white text-velos-navy py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      <Container size="wide">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 sm:mb-20">
          <SectionHeading
            eyebrow="05 / A CONNECTED FLEET ECOSYSTEM"
            title={
              <>
                NOT ONE AIRCRAFT.
                <br />
                <span className="text-velos-blue/75">
                  A NETWORK OF POSSIBILITIES.
                </span>
              </>
            }
            description="VIBE is hardware-agnostic by design—built to orchestrate participating urban air operators, regional electric fleets, vertiport terminals, and surface mobility providers through one intelligent digital layer."
            theme="light"
          />

          <div className="rounded-2xl bg-velos-ivory border border-velos-navy/10 px-5 py-4 max-w-sm self-start lg:self-end">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-velos-navy font-semibold mb-1">
              <Layers className="w-3.5 h-3.5 text-velos-blue" />
              <span>MULTI-OPERATOR INTEROPERABILITY</span>
            </div>
            <p className="text-xs text-velos-blue/80 leading-relaxed">
              Aircraft and vehicle visuals represent illustrative ecosystem
              categories supported by VIBE integration standards.
            </p>
          </div>
        </div>

        {/* Asymmetrical Editorial Showcase Grid */}
        <div className="space-y-12 lg:space-y-16">
          {/* Row 1: Featured 7/5 Asymmetrical Split (Categories 01 & 02) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {[FLEET_CATEGORIES[0], FLEET_CATEGORIES[1]].map((cat, idx) => {
              const colSpan =
                idx === 0 ? "lg:col-span-7" : "lg:col-span-5";
              return (
                <motion.article
                  key={cat.id}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 28 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.75,
                    delay: idx * 0.12,
                    ease: EASING.editorial,
                  }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${colSpan} group cursor-pointer rounded-[2rem] bg-velos-ivory/75 border border-velos-navy/10 hover:border-velos-navy/35 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-[0_28px_70px_rgba(8,19,31,0.12)]`}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <MotionImage
                      src={cat.image}
                      alt={cat.imageAlt}
                      containerClassName="w-full h-full"
                      parallaxStrength={9}
                      overlayClassName="bg-gradient-to-t from-velos-navy/55 via-transparent to-transparent group-hover:from-velos-navy/40 transition-colors duration-500"
                    />
                    <div className="absolute top-5 left-5 rounded-full bg-velos-navy/85 backdrop-blur-md text-velos-white px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em]">
                      {cat.index} / {cat.subtitle}
                    </div>
                  </div>

                  <div className="p-7 sm:p-9 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold tracking-tight text-velos-navy group-hover:text-velos-blue transition-colors">
                        {cat.title}
                      </h3>
                      <p className="mt-3 text-sm sm:text-base text-velos-blue/80 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-velos-navy/10 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-4">
                        {cat.specs.slice(0, 2).map((sp) => (
                          <div key={sp.label}>
                            <span className="block text-[10px] font-mono uppercase tracking-[0.16em] text-velos-blue/65">
                              {sp.label}
                            </span>
                            <span className="text-xs font-semibold text-velos-navy">
                              {sp.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(cat);
                        }}
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] font-semibold text-velos-navy group-hover:text-velos-blue"
                      >
                        <span>Discover the ecosystem</span>
                        <span className="h-8 w-8 rounded-full bg-velos-navy text-velos-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Row 2: Asymmetrical 3-Column Editorial Sequence (Categories 03, 04, 05) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {FLEET_CATEGORIES.slice(2).map((cat, idx) => {
              const colClass =
                idx === 1
                  ? "md:col-span-12 lg:col-span-5"
                  : idx === 0
                  ? "md:col-span-6 lg:col-span-4"
                  : "md:col-span-6 lg:col-span-3";

              return (
                <motion.article
                  key={cat.id}
                  initial={
                    prefersReducedMotion ? false : { opacity: 0, y: 28 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.75,
                    delay: idx * 0.1,
                    ease: EASING.editorial,
                  }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`${colClass} group cursor-pointer rounded-[2rem] bg-velos-ivory/75 border border-velos-navy/10 hover:border-velos-navy/35 overflow-hidden flex flex-col justify-between transition-all duration-500 hover:shadow-[0_24px_60px_rgba(8,19,31,0.12)]`}
                >
                  <div className="relative aspect-[16/11] w-full overflow-hidden">
                    <MotionImage
                      src={cat.image}
                      alt={cat.imageAlt}
                      containerClassName="w-full h-full"
                      parallaxStrength={8}
                      overlayClassName="bg-gradient-to-t from-velos-navy/60 via-transparent to-transparent"
                    />
                    <div className="absolute top-4 left-4 rounded-full bg-velos-navy/85 backdrop-blur-md text-velos-white px-3 py-1 text-[10px] font-mono uppercase tracking-[0.18em]">
                      {cat.index} / ECOSYSTEM
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-velos-blue/70">
                        {cat.subtitle}
                      </span>
                      <h3 className="mt-1 font-velos-display text-xl sm:text-2xl font-semibold tracking-tight text-velos-navy">
                        {cat.title}
                      </h3>
                      <p className="mt-2.5 text-sm text-velos-blue/80 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-velos-navy/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(cat);
                        }}
                        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] font-semibold text-velos-navy group-hover:text-velos-blue"
                      >
                        <span>Discover the ecosystem</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Interactive Ecosystem Category Detail Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-velos-navy/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={selectedCategory.title}
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.35, ease: EASING.editorial }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full rounded-3xl bg-velos-navy text-velos-white border border-velos-white/15 p-6 sm:p-9 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-velos-white/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
                    ECOSYSTEM SPECIFICATION // {selectedCategory.index}
                  </span>
                  <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold mt-1">
                    {selectedCategory.title}
                  </h3>
                  <p className="text-xs font-mono text-velos-silver mt-0.5">
                    {selectedCategory.subtitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  aria-label="Close ecosystem specification"
                  className="p-2 rounded-full border border-velos-white/15 text-velos-silver hover:text-velos-white hover:border-velos-cyan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-5 text-sm sm:text-base text-velos-mist leading-relaxed">
                {selectedCategory.description}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedCategory.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-2xl bg-velos-blue/60 border border-velos-white/10 p-4"
                  >
                    <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                      {spec.label}
                    </span>
                    <span className="mt-1 block text-xs sm:text-sm font-semibold text-velos-cyan">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-velos-white/5 border border-velos-white/10 p-4 flex items-start gap-3 text-xs text-velos-silver">
                <ShieldCheck className="w-4 h-4 text-velos-cyan shrink-0 mt-0.5" />
                <span>{selectedCategory.integrationNote}</span>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const target = selectedCategory.targetAnchor;
                    setSelectedCategory(null);
                    setTimeout(() => {
                      document
                        .querySelector(target)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                  showArrow
                >
                  Explore in Platform
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
