import { useState } from "react";
import {
  Building,
  Car,
  Compass,
  Cpu,
  Globe,
  Layers,
  Navigation,
} from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { Button } from "@landing/components/ui/Button";
import { PartnerInquiryForm } from "./PartnerInquiryForm";

const ECOSYSTEM_PARTNER_TYPES = [
  {
    title: "eVTOL Manufacturers",
    categoryValue: "eVTOL Manufacturers",
    desc: "Aircraft performance modeling, range-payload envelopes, and charging telemetry specifications.",
    icon: Navigation,
  },
  {
    title: "Aircraft Operators",
    categoryValue: "Aircraft Operators",
    desc: "Part 135 / air carrier dispatch integration, seat inventory publishing, and manifest coordination.",
    icon: Compass,
  },
  {
    title: "Vertiport Operators",
    categoryValue: "Vertiport Operators",
    desc: "Pad slot scheduling, high-power charger turnaround orchestration, and biometric gate control.",
    icon: Building,
  },
  {
    title: "Ground Mobility Providers",
    categoryValue: "Ground Mobility Providers",
    desc: "First-mile and final-mile EV fleet dispatch synchronized dynamically with flight approach times.",
    icon: Car,
  },
  {
    title: "Airports",
    categoryValue: "Airports & Aviation Authorities",
    desc: "Interline commercial airline transfers, airside vertiport access, and regional terminal links.",
    icon: Globe,
  },
  {
    title: "Enterprise Travel Platforms",
    categoryValue: "Enterprise Travel Platforms",
    desc: "Corporate travel booking APIs, hospitality concierge portals, and unified expense reporting.",
    icon: Layers,
  },
  {
    title: "Mobility Infrastructure Providers",
    categoryValue: "Mobility Infrastructure Providers",
    desc: "Grid energy management, low-altitude weather sensing, and municipal transit integrations.",
    icon: Cpu,
  },
];

export function PartnerSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    "Aircraft Operators"
  );

  return (
    <section
      id="partners"
      aria-label="Built for a Connected Ecosystem"
      className="relative bg-velos-navy text-velos-white py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-velos-white/10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-glow opacity-60"
      />

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left 5 Columns: Narrative, CTAs & 7 Partner Pillar Cards */}
          <div className="lg:col-span-5 space-y-8">
            <SectionHeading
              eyebrow="08 / BUILT FOR A CONNECTED ECOSYSTEM"
              title={
                <>
                  THE FUTURE OF FLIGHT
                  <br />
                  <span className="text-velos-cyan">IS CONNECTED.</span>
                </>
              }
              description="VIBE is designed to bring the urban air mobility ecosystem closer together through a unified digital experience."
              theme="dark"
            />

            <div className="flex flex-wrap items-center gap-3.5">
              <Button
                variant="primary"
                size="md"
                href="#partner-form"
                showArrow
              >
                Partner with VIBE
              </Button>
              <Button variant="secondary" size="md" href="#orchestration">
                Explore the Platform
              </Button>
            </div>

            {/* 7 Partner Ecosystem Categories */}
            <div className="pt-4 space-y-2.5">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-silver mb-3">
                SELECT A PARTNER CATEGORY TO PRE-CONFIGURE YOUR INQUIRY
              </span>

              {ECOSYSTEM_PARTNER_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = selectedCategory === pt.categoryValue;
                return (
                  <button
                    key={pt.title}
                    type="button"
                    onClick={() => setSelectedCategory(pt.categoryValue)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? "bg-velos-blue border-velos-cyan text-velos-white shadow-lg"
                        : "bg-velos-white/[0.03] border-velos-white/10 text-velos-mist hover:border-velos-white/30"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                        isSelected
                          ? "bg-velos-cyan text-velos-navy"
                          : "bg-velos-white/10 text-velos-cyan"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-velos-display text-sm sm:text-base font-semibold text-velos-white">
                        {pt.title}
                      </div>
                      <p className="text-xs text-velos-silver mt-0.5 leading-relaxed">
                        {pt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right 7 Columns: Partner Inquiry Form */}
          <div className="lg:col-span-7 lg:sticky lg:top-28">
            <PartnerInquiryForm selectedCategoryPreset={selectedCategory} />
          </div>
        </div>
      </Container>
    </section>
  );
}
