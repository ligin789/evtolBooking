import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "@landing/lib/animation-config";

interface MotionImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  parallaxStrength?: number;
  priority?: boolean;
  sizes?: string;
  overlayClassName?: string;
}

export function MotionImage({
  src,
  alt,
  className = "",
  containerClassName = "",
  parallaxStrength = 10,
  overlayClassName = "",
}: MotionImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yPercent = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ["0%", "0%"] : [`-${parallaxStrength}%`, `${parallaxStrength}%`]
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [1.08, 1.03, 1.08]
  );

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
    >
      <motion.div
        style={{ y: yPercent, scale }}
        className="relative w-full h-full will-change-transform"
      >
        <img loading="lazy" decoding="async"
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover ${className}`}
        />
      </motion.div>
      {overlayClassName && (
        <div className={`pointer-events-none absolute inset-0 ${overlayClassName}`} />
      )}
    </div>
  );
}
