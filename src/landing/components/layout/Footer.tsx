import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp, Globe, ShieldCheck, X } from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { VelosLogo } from "@landing/components/ui/VelosLogo";

const SOCIAL_PLACEHOLDERS = [
  { id: "linkedin", label: "LinkedIn", href: "#partners" },
  { id: "x", label: "X / Twitter", href: "#partners" },
  { id: "youtube", label: "YouTube", href: "#journey" },
  { id: "github", label: "Developer Docs", href: "#orchestration" },
];

export function Footer() {
  const [infoModal, setInfoModal] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    selector: string
  ) => {
    e.preventDefault();
    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      aria-label="VIBE Footer"
      className="relative bg-velos-navy text-velos-white border-t border-velos-white/10 pt-20 pb-14"
    >
      <Container size="wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-velos-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <a
              href="#top"
              onClick={(e) => scrollToSection(e, "#top")}
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-cyan rounded-lg"
            >
              <VelosLogo variant="light" showTagline />
            </a>
            <p className="text-sm text-velos-silver max-w-sm leading-relaxed">
              The intelligent digital operating layer connecting passengers,
              participating electric aircraft operators, vertiports, and ground
              mobility providers into one orchestrated journey.
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-velos-cyan">
              <span>“Every journey. Orchestrated.”</span>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.22em] text-velos-silver">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Platform", href: "#orchestration" },
                { label: "Journey Experience", href: "#journey" },
                { label: "Mobility Network", href: "#fleet" },
                { label: "Partners", href: "#partners" },
                { label: "About", href: "#intro" },
                { label: "Contact", href: "#partner-form" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Links Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.22em] text-velos-silver">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Passenger Experience", href: "#booking" },
                { label: "Journey Orchestration", href: "#orchestration" },
                { label: "Operator Integrations", href: "#fleet" },
                { label: "Mobility Infrastructure", href: "#operations" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => scrollToSection(e, link.href)}
                    className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Social Links Column */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.22em] text-velos-silver">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="#intro"
                  onClick={(e) => scrollToSection(e, "#intro")}
                  className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                >
                  About VIBE
                </a>
              </li>
              <li>
                <a
                  href="#partners"
                  onClick={(e) => scrollToSection(e, "#partners")}
                  className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                >
                  Partner With Us
                </a>
              </li>
              <li>
                <a
                  href="#partner-form"
                  onClick={(e) => scrollToSection(e, "#partner-form")}
                  className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    setInfoModal({
                      title: "Privacy Overview",
                      content:
                        "VIBE respects passenger and partner data privacy. In this interactive platform demonstration, form inputs (such as sample journey searches and partner inquiries) are processed locally in your browser session and are not transmitted to external third-party reservation or payment networks.",
                    })
                  }
                  className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                >
                  Privacy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    setInfoModal({
                      title: "Terms of Demonstration",
                      content:
                        "VIBE is a digital urban air mobility orchestration platform concept and interactive demonstration. All flight routes, durations, aircraft operator profiles, vertiport statuses, and pricing estimates shown on this site are illustrative demonstration data and do not constitute commercial air carrier offers or live flight reservations.",
                    })
                  }
                  className="text-velos-mist/85 hover:text-velos-cyan transition-colors"
                >
                  Terms
                </button>
              </li>
            </ul>

            {/* Configurable Social Link Placeholders */}
            <div className="pt-4">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-silver mb-2.5">
                CHANNELS (CONFIGURABLE)
              </span>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLACEHOLDERS.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    onClick={(e) => scrollToSection(e, s.href)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-velos-white/5 hover:bg-velos-white/15 border border-velos-white/10 px-3 py-1.5 text-xs text-velos-mist transition-colors"
                  >
                    <Globe className="w-3 h-3 text-velos-cyan" />
                    <span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Back-to-Top Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-velos-silver">
          <div className="flex flex-wrap items-center gap-3">
            <span>© {new Date().getFullYear()} VIBE. All rights reserved.</span>
            <span className="hidden sm:inline text-velos-white/20">•</span>
            <span className="text-velos-silver/80">
              Interactive Urban Air Mobility Platform Demonstration
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="group inline-flex items-center gap-2.5 rounded-full bg-velos-white/5 hover:bg-velos-cyan hover:text-velos-navy border border-velos-white/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-velos-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-cyan"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </Container>

      {/* Privacy / Terms Modal */}
      <AnimatePresence>
        {infoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInfoModal(null)}
            className="fixed inset-0 z-50 bg-velos-navy/80 backdrop-blur-md flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={infoModal.title}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full rounded-3xl bg-velos-blue border border-velos-white/15 p-7 text-velos-white shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-velos-white/10">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-velos-cyan" />
                  <h4 className="font-velos-display text-xl font-semibold">
                    {infoModal.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoModal(null)}
                  aria-label="Close dialog"
                  className="p-1.5 rounded-full hover:bg-velos-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-4 text-sm text-velos-mist leading-relaxed">
                {infoModal.content}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInfoModal(null)}
                  className="rounded-full bg-velos-cyan text-velos-navy px-5 py-2 text-xs font-semibold"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
