import React from "react";
import { motion } from "motion/react";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  theme?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  theme = "dark",
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDark = theme === "dark";

  return (
    <div
      className={`${
        align === "center" ? "mx-auto text-center max-w-3xl" : "max-w-3xl"
      } ${className}`}
    >
      {eyebrow && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASING.editorial }}
          className="inline-flex items-center gap-2.5 mb-5"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDark ? "bg-velos-cyan" : "bg-velos-blue"
            }`}
          />
          <span
            className={`text-[11px] font-mono uppercase tracking-[0.22em] font-medium ${
              isDark ? "text-velos-cyan" : "text-velos-blue/80"
            }`}
          >
            {eyebrow}
          </span>
        </motion.div>
      )}

      <motion.h2
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, delay: 0.08, ease: EASING.editorial }}
        className={`font-velos-display text-3xl sm:text-5xl lg:text-[3.5rem] font-semibold tracking-[-0.035em] leading-[1.06] ${
          isDark ? "text-velos-white" : "text-velos-navy"
        }`}
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, delay: 0.16, ease: EASING.editorial }}
          className={`mt-5 text-base sm:text-lg leading-relaxed ${
            align === "center" ? "mx-auto max-w-2xl" : "max-w-xl"
          } ${isDark ? "text-velos-silver" : "text-velos-blue/80"}`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
