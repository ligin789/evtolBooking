import { motion } from "motion/react";
import {
  Car,
  Clock,
  Info,
  Navigation,
  } from "lucide-react";
import {
  DemoJourneyOption,
  LocationNode,
} from "@landing/lib/demo-routes";
import { Button } from "@landing/components/ui/Button";
import { EASING } from "@landing/lib/animation-config";

interface BookingResultsProps {
  fromNode: LocationNode;
  toNode: LocationNode;
  date: string;
  time: string;
  passengers: number;
  options: DemoJourneyOption[];
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onContinueToConfirm: () => void;
}

export function BookingResults({
  fromNode,
  toNode,
  date,
  time,
  passengers,
  options,
  selectedOptionId,
  onSelectOption,
  onContinueToConfirm,
}: BookingResultsProps) {
  const activeOption =
    options.find((o) => o.id === selectedOptionId) || options[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASING.editorial }}
      className="mt-10 pt-10 border-t border-velos-navy/12"
    >
      {/* Honest Prototype Notice Banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-velos-navy text-velos-white px-5 py-3.5 border border-velos-cyan/30">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-velos-cyan shrink-0" />
          <span className="text-xs sm:text-sm text-velos-mist">
            <strong className="text-velos-white font-semibold">
              Interactive Platform Demonstration:
            </strong>{" "}
            Routes, durations, operators, and sample fares below are illustrative
            demonstration data. No real flight inventory or payment is processed.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-velos-cyan/15 text-velos-cyan self-start sm:self-auto shrink-0">
          DEMO DATA MODE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Route Options & Multi-Modal Segment Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-velos-blue/70">
              ILLUSTRATIVE ORCHESTRATED OPTIONS • {date} AT {time}
            </span>
            <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold text-velos-navy mt-1">
              {fromNode.name} ({fromNode.code}) → {toNode.name} ({toNode.code})
            </h3>
          </div>

          {/* 3 Journey Tier Selector Cards */}
          <div className="space-y-3" role="radiogroup" aria-label="Journey options">
            {options.map((opt) => {
              const isSelected = opt.id === activeOption.id;
              return (
                <div
                  key={opt.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => onSelectOption(opt.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectOption(opt.id);
                    }
                  }}
                  className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-navy ${
                    isSelected
                      ? "bg-velos-navy text-velos-white border-velos-navy shadow-xl"
                      : "bg-velos-ivory/70 text-velos-navy border-velos-navy/12 hover:border-velos-navy/35"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-velos-cyan text-velos-navy font-semibold"
                            : "bg-velos-navy/10 text-velos-navy"
                        }`}
                      >
                        {opt.badge}
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          isSelected ? "text-velos-silver" : "text-velos-blue/70"
                        }`}
                      >
                        Corridor {opt.corridorCode}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-velos-display text-xl font-semibold ${
                          isSelected ? "text-velos-cyan" : "text-velos-navy"
                        }`}
                      >
                        ${opt.illustrativePricePerSeatUsd}
                      </span>
                      <span
                        className={`text-[11px] block font-mono ${
                          isSelected ? "text-velos-silver" : "text-velos-blue/65"
                        }`}
                      >
                        Illustrative / passenger
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-velos-display text-lg font-semibold">
                        {opt.label}
                      </h4>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? "text-velos-silver" : "text-velos-blue/75"
                        }`}
                      >
                        {opt.operatorDemoName} • {opt.aircraftClass}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`rounded-xl px-3 py-1.5 text-xs font-mono ${
                          isSelected
                            ? "bg-velos-white/10 text-velos-white"
                            : "bg-velos-white text-velos-navy border border-velos-navy/10"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 inline mr-1.5 text-velos-cyan" />
                        {opt.totalDurationMin} min total
                      </div>
                      <span
                        className={`text-xs font-mono font-medium ${
                          isSelected ? "text-velos-cyan" : "text-velos-blue"
                        }`}
                      >
                        Saves {opt.timeSavedMin} min vs. road
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Door-to-Door Segment Breakdown */}
          <div className="rounded-2xl bg-velos-ivory/60 border border-velos-navy/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-velos-navy font-semibold">
                COORDINATED JOURNEY SEGMENTS ({activeOption.totalDurationMin} MIN TOTAL)
              </span>
              <span className="text-xs font-mono text-velos-blue/75">
                {activeOption.operatorIntegrationNote}
              </span>
            </div>

            <div className="space-y-4 relative before:absolute before:top-3 before:bottom-3 before:left-3.5 before:w-[1.5px] before:bg-velos-navy/15">
              {activeOption.segments.map((seg) => {
                const isAir = seg.mode === "air-evtol";
                return (
                  <div key={seg.id} className="relative pl-10">
                    <div
                      className={`absolute left-1.5 top-1.5 h-4 w-4 rounded-full flex items-center justify-center ${
                        isAir
                          ? "bg-velos-cyan text-velos-navy ring-4 ring-velos-cyan/25"
                          : "bg-velos-navy text-velos-white"
                      }`}
                    >
                      {isAir ? (
                        <Navigation className="w-2.5 h-2.5" />
                      ) : (
                        <Car className="w-2.5 h-2.5" />
                      )}
                    </div>

                    <div
                      className={`rounded-xl p-4 border ${
                        isAir
                          ? "bg-velos-navy text-velos-white border-velos-navy"
                          : "bg-velos-white text-velos-navy border-velos-navy/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-velos-display text-sm sm:text-base font-semibold">
                          {seg.title}
                        </span>
                        <span
                          className={`font-mono text-xs px-2.5 py-0.5 rounded-full ${
                            isAir
                              ? "bg-velos-cyan/20 text-velos-cyan"
                              : "bg-velos-ivory text-velos-navy"
                          }`}
                        >
                          {seg.durationMin} min • {seg.distanceLabel}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          isAir ? "text-velos-silver" : "text-velos-blue/75"
                        }`}
                      >
                        {seg.providerLabel} — {seg.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Schematic Route Visualization & Journey Summary */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          {/* Interactive Schematic Route Map */}
          <div className="rounded-3xl bg-velos-navy text-velos-white p-6 border border-velos-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                  SCHEMATIC CORRIDOR TELEMETRY
                </span>
                <h4 className="font-velos-display text-lg font-semibold">
                  {fromNode.vertiportName} → {toNode.vertiportName}
                </h4>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-velos-white/10 text-velos-cyan">
                {activeOption.cruiseAltitudeFt} FT AGL
              </span>
            </div>

            {/* Schematic Aerial & Ground Route SVG */}
            <div className="relative aspect-[16/10] rounded-2xl bg-velos-blue/60 border border-velos-white/10 overflow-hidden p-4">
              <svg
                viewBox="0 0 400 240"
                className="w-full h-full"
                aria-label={`Schematic route map from ${fromNode.name} to ${toNode.name}`}
              >
                {/* Grid lines */}
                {[40, 80, 120, 160, 200].map((y) => (
                  <line
                    key={`h-${y}`}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="rgba(220,227,231,0.08)"
                    strokeWidth="1"
                  />
                ))}
                {[60, 130, 200, 270, 340].map((x) => (
                  <line
                    key={`v-${x}`}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="240"
                    stroke="rgba(220,227,231,0.08)"
                    strokeWidth="1"
                  />
                ))}

                {/* First-mile Ground Segment */}
                <path
                  d="M 42 185 L 95 155"
                  stroke="#A8B6C2"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Primary eVTOL Air Corridor Curve */}
                <motion.path
                  key={activeOption.id}
                  d="M 95 155 Q 200 45 305 115"
                  stroke="#66D9F2"
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease: EASING.editorial }}
                />

                {/* Final-mile Ground Segment */}
                <path
                  d="M 305 115 L 358 82"
                  stroke="#A8B6C2"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Nodes & Labels */}
                <circle cx="42" cy="185" r="4.5" fill="#FFFFFF" />
                <text
                  x="24"
                  y="206"
                  fill="#DCE3E7"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ORIGIN CURB
                </text>

                <circle
                  cx="95"
                  cy="155"
                  r="8"
                  fill="rgba(102,217,242,0.22)"
                  stroke="#66D9F2"
                  strokeWidth="1.5"
                />
                <circle cx="95" cy="155" r="3.5" fill="#66D9F2" />
                <text
                  x="72"
                  y="140"
                  fill="#66D9F2"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {fromNode.code} PAD
                </text>

                {/* Mid-flight eVTOL vector icon */}
                <circle cx="200" cy="86" r="5" fill="#FFFFFF" />
                <text
                  x="162"
                  y="70"
                  fill="#FFFFFF"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  eVTOL AIR LEG
                </text>

                <circle
                  cx="305"
                  cy="115"
                  r="8"
                  fill="rgba(102,217,242,0.22)"
                  stroke="#66D9F2"
                  strokeWidth="1.5"
                />
                <circle cx="305" cy="115" r="3.5" fill="#66D9F2" />
                <text
                  x="280"
                  y="136"
                  fill="#66D9F2"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {toNode.code} PAD
                </text>

                <circle cx="358" cy="82" r="4.5" fill="#FFFFFF" />
                <text
                  x="312"
                  y="66"
                  fill="#DCE3E7"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  DEST ARRIVAL
                </text>
              </svg>
            </div>

            {/* Journey Summary Card */}
            <div className="mt-5 space-y-3 pt-4 border-t border-velos-white/10 text-xs">
              <div className="flex justify-between text-velos-silver">
                <span>Journey Preference</span>
                <span className="text-velos-white font-medium">
                  {activeOption.label}
                </span>
              </div>
              <div className="flex justify-between text-velos-silver">
                <span>Passengers</span>
                <span className="text-velos-white font-medium">
                  {passengers} {passengers === 1 ? "Passenger" : "Passengers"}
                </span>
              </div>
              <div className="flex justify-between text-velos-silver">
                <span>Estimated Total Time</span>
                <span className="text-velos-cyan font-mono font-semibold">
                  {activeOption.totalDurationMin} mins (saves{" "}
                  {activeOption.timeSavedMin} mins)
                </span>
              </div>
              <div className="flex justify-between text-velos-silver">
                <span>Illustrative Total Estimate</span>
                <span className="text-velos-white font-velos-display text-lg font-semibold">
                  ${activeOption.illustrativePricePerSeatUsd * passengers}{" "}
                  <span className="text-[10px] font-mono text-velos-silver font-normal">
                    (Demo Only)
                  </span>
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={onContinueToConfirm}
                showArrow
              >
                Continue to Itinerary Preview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
