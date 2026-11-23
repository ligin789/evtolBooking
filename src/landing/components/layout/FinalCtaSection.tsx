import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Container } from "@landing/components/ui/Container";
import { Button } from "@landing/components/ui/Button";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

export function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgScale = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [1, 1] : [1.02, 1.15]
  );

  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : ["-8%", "8%"]
  );

  return (
    <section
      ref={sectionRef}
      aria-label="The Next Way Forward Is Above"
      className="relative min-h-[88vh] w-full overflow-hidden bg-velos-navy flex items-center justify-center py-28 sm:py-36"
    >
      {/* Slow Scaling Sunset Flight Visual & Parallax */}
      <motion.div
        style={{ scale: bgScale, y: bgY }}
        className="absolute inset-0 z-0 will-change-transform"
      >
        <img loading="lazy" decoding="async"
          src="/landing/images/cta-sunset-flight.jpg"
          alt="A sleek electric eVTOL aircraft flying above a coastal city at sunset with warm reflections across glass buildings"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-velos-navy via-velos-navy/55 to-velos-navy/75" />
        <div className="absolute inset-0 bg-radial-glow opacity-50" />
      </motion.div>

      <Container size="narrow" className="relative z-10 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASING.editorial }}
          className="inline-flex items-center gap-2.5 rounded-full bg-velos-navy/75 border border-velos-white/20 px-4 py-1.5 backdrop-blur-md mb-7"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-velos-cyan" />
          <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-velos-mist">
            EVERY JOURNEY. ORCHESTRATED.
          </span>
        </motion.div>

        <motion.h2
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.08, ease: EASING.editorial }}
          className="font-velos-display text-4xl sm:text-6xl md:text-7xl lg:text-[5rem] font-semibold tracking-[-0.04em] leading-[1.0] text-velos-white"
        >
          THE NEXT WAY FORWARD
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-velos-white via-velos-mist to-velos-cyan">
            IS ABOVE.
          </span>
        </motion.h2>

        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.16, ease: EASING.editorial }}
          className="mt-6 text-lg sm:text-xl text-velos-mist/90 max-w-xl mx-auto leading-relaxed"
        >
          Connect your world to a new dimension of mobility.
        </motion.p>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.85, delay: 0.24, ease: EASING.editorial }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="primary" size="lg" href="#booking" showArrow>
            Discover VIBE
          </Button>
          <Button variant="secondary" size="lg" href="#partners">
            Talk to Our Team
          </Button>
        </motion.div>
      </Container>

      {/* Bottom gentle gradient fade into Footer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-velos-navy to-transparent"
      />
    </section>
  );
}
