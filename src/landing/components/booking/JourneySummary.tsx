import { motion } from "motion/react";
import {
  ArrowLeft,
  CheckCircle2,
  QrCode,
  RefreshCw,
  ShieldCheck,
  } from "lucide-react";
import { DemoJourneyOption, LocationNode } from "@landing/lib/demo-routes";
import { Button } from "@landing/components/ui/Button";
import { EASING } from "@landing/lib/animation-config";

interface JourneySummaryProps {
  fromNode: LocationNode;
  toNode: LocationNode;
  date: string;
  time: string;
  passengers: number;
  selectedOption: DemoJourneyOption;
  onBackToResults: () => void;
  onResetSearch: () => void;
}

export function JourneySummary({
  fromNode,
  toNode,
  date,
  time,
  passengers,
  selectedOption,
  onBackToResults,
  onResetSearch,
}: JourneySummaryProps) {
  const demoReference = `VLO-DEMO-${fromNode.code}${toNode.code}-842`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: EASING.editorial }}
      className="mt-10 pt-10 border-t border-velos-navy/12"
    >
      <div className="rounded-3xl bg-velos-navy text-velos-white p-7 sm:p-10 border border-velos-cyan/35 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-velos-white/10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-velos-cyan/20 border border-velos-cyan flex items-center justify-center text-velos-cyan">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
                DEMONSTRATION ITINERARY GENERATED
              </span>
              <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold text-velos-white">
                Orchestrated Journey Preview Confirmed
              </h3>
            </div>
          </div>

          <div className="rounded-xl bg-velos-white/10 border border-velos-white/15 px-4 py-2 font-mono text-xs text-velos-cyan">
            REF: {demoReference}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-velos-blue/60 border border-velos-white/10 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                  ORIGIN
                </span>
                <span className="mt-1 block font-velos-display text-lg font-semibold text-velos-white">
                  {fromNode.name}
                </span>
                <span className="text-xs text-velos-silver">
                  {fromNode.vertiportName}
                </span>
              </div>

              <div className="rounded-2xl bg-velos-blue/60 border border-velos-white/10 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                  DESTINATION
                </span>
                <span className="mt-1 block font-velos-display text-lg font-semibold text-velos-white">
                  {toNode.name}
                </span>
                <span className="text-xs text-velos-silver">
                  {toNode.vertiportName}
                </span>
              </div>

              <div className="rounded-2xl bg-velos-blue/60 border border-velos-white/10 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                  DEPARTURE WINDOW
                </span>
                <span className="mt-1 block font-velos-display text-lg font-semibold text-velos-white">
                  {time}
                </span>
                <span className="text-xs text-velos-silver">{date}</span>
              </div>

              <div className="rounded-2xl bg-velos-blue/60 border border-velos-white/10 p-4">
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-velos-silver">
                  TOTAL DURATION
                </span>
                <span className="mt-1 block font-velos-display text-lg font-semibold text-velos-cyan">
                  {selectedOption.totalDurationMin} mins
                </span>
                <span className="text-xs text-velos-silver">
                  Saves {selectedOption.timeSavedMin}m vs road
                </span>
              </div>
            </div>

            {/* Segment Checklist */}
            <div className="rounded-2xl bg-velos-blue/40 border border-velos-white/10 p-5 space-y-3">
              <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                SYNCHRONIZED MULTI-MODAL MANIFEST (PROTOTYPE PREVIEW)
              </span>
              {selectedOption.segments.map((seg, i) => (
                <div
                  key={seg.id}
                  className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-velos-white/10 last:border-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-velos-cyan">0{i + 1}</span>
                    <span className="text-velos-white font-medium">
                      {seg.title}
                    </span>
                  </div>
                  <span className="font-mono text-velos-silver">
                    {seg.durationMin} min
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Boarding Pass Prototype Card */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl bg-velos-ivory text-velos-navy p-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-velos-navy/15">
                <div>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-blue/70">
                    VIBE UNIFIED PASS
                  </span>
                  <span className="font-velos-display text-xl font-bold">
                    {fromNode.code} → {toNode.code}
                  </span>
                </div>
                <QrCode className="w-10 h-10 text-velos-navy" />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-velos-blue/70">Operator (Demo):</span>
                  <span className="font-semibold">
                    {selectedOption.operatorDemoName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-velos-blue/70">Party Size:</span>
                  <span className="font-semibold">{passengers} Pax</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-velos-blue/70">Illustrative Fare:</span>
                  <span className="font-semibold">
                    ${selectedOption.illustrativePricePerSeatUsd * passengers}{" "}
                    (Demo)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-velos-navy/15 text-[11px] text-velos-blue/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-velos-navy shrink-0 mt-0.5" />
              <span>
                This confirmation is an interactive frontend demonstration of
                VIBE journey orchestration. No reservation or charge has been
                created.
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-velos-white/10">
          <button
            type="button"
            onClick={onBackToResults}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-velos-silver hover:text-velos-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Route Options</span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={onResetSearch}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Plan Another Demo Journey
            </Button>
            <Button variant="primary" size="md" href="#partners" showArrow>
              Partner with VIBE
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
