import { useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  Car,
  CheckCircle2,
  Info,
  Navigation,
  Radio,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { SAMPLE_LOCATIONS } from "@landing/lib/demo-routes";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

interface SimulatedFlight {
  id: string;
  callsign: string;
  route: string;
  fromCode: string;
  toCode: string;
  status: "IN FLIGHT — CRUISE" | "FINAL APPROACH" | "BOARDING GATE B2" | "TURNAROUND CHARGE";
  altitude: string;
  speed: string;
  etaMin: number;
  groundSync: string;
  batteryPct: number;
  paxCount: string;
  coords: { x1: number; y1: number; x2: number; y2: number; curX: number; curY: number };
}

const SIMULATED_FLIGHTS: SimulatedFlight[] = [
  {
    id: "sim-1",
    callsign: "VLO-204X",
    route: "Meridian Downtown → Terminal 4 Airside",
    fromCode: "DTN",
    toCode: "IAP",
    status: "IN FLIGHT — CRUISE",
    altitude: "1,850 ft AGL",
    speed: "148 kts",
    etaMin: 6,
    groundSync: "EV-14 Staged at IAP Bay 03",
    batteryPct: 84,
    paxCount: "4 / 4 Booked",
    coords: { x1: 44, y1: 52, x2: 82, y2: 76, curX: 65, curY: 65 },
  },
  {
    id: "sim-2",
    callsign: "VLO-118A",
    route: "Exchange Plaza → West Harbor Pier 9",
    fromCode: "FIN",
    toCode: "WFT",
    status: "FINAL APPROACH",
    altitude: "420 ft AGL",
    speed: "52 kts",
    etaMin: 2,
    groundSync: "Chauffeur Docked at Pier 9",
    batteryPct: 76,
    paxCount: "3 / 4 Booked",
    coords: { x1: 56, y1: 28, x2: 22, y2: 64, curX: 29, curY: 56 },
  },
  {
    id: "sim-3",
    callsign: "VLO-309C",
    route: "Central Nexus → Exchange Plaza",
    fromCode: "CVP",
    toCode: "FIN",
    status: "BOARDING GATE B2",
    altitude: "Pad 02 Deck",
    speed: "0 kts",
    etaMin: 9,
    groundSync: "First-Mile Shuttle Arrived",
    batteryPct: 98,
    paxCount: "4 / 4 Booked",
    coords: { x1: 35, y1: 34, x2: 56, y2: 28, curX: 35, curY: 34 },
  },
  {
    id: "sim-4",
    callsign: "VLO-412R",
    route: "Terminal 4 Airside → Central Nexus",
    fromCode: "IAP",
    toCode: "CVP",
    status: "IN FLIGHT — CRUISE",
    altitude: "2,100 ft AGL",
    speed: "156 kts",
    etaMin: 8,
    groundSync: "2 Autonomous Shuttles Assigned",
    batteryPct: 81,
    paxCount: "4 / 4 Booked",
    coords: { x1: 82, y1: 76, x2: 35, y2: 34, curX: 54, curY: 51 },
  },
];

export function OperationsDashboard() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [selectedFlightId, setSelectedFlightId] = useState<string>(
    SIMULATED_FLIGHTS[0].id
  );

  const activeFlight =
    SIMULATED_FLIGHTS.find((f) => f.id === selectedFlightId) ||
    SIMULATED_FLIGHTS[0];

  return (
    <section
      id="operations"
      aria-label="Intelligence in Motion — Operations Platform"
      className="relative bg-velos-navy text-velos-white py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-velos-white/10"
    >
      {/* Ambient Radial Illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-radial-glow opacity-80"
      />

      <Container size="wide" className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
          <SectionHeading
            eyebrow="06 / INTELLIGENCE IN MOTION"
            title={
              <>
                EVERY CONNECTION.
                <br />
                <span className="text-velos-cyan">IN BETTER COORDINATION.</span>
              </>
            }
            description="A unified operational command layer that aligns flight corridors, vertiport pad availability, ground transfer handoffs, and passenger journey timelines."
            theme="dark"
          />

          {/* Clear Simulated Telemetry Badge */}
          <div className="inline-flex items-center gap-3 rounded-2xl bg-velos-blue/70 border border-velos-cyan/30 px-4 py-3 self-start lg:self-end">
            <Info className="w-4 h-4 text-velos-cyan shrink-0" />
            <span className="text-xs font-mono text-velos-mist">
              SIMULATED TELEMETRY ENVIRONMENT — ILLUSTRATIVE OPERATIONAL DATA
            </span>
          </div>
        </div>

        {/* Aviation Operations Platform Frame */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASING.editorial }}
          className="rounded-[2rem] bg-velos-blue/40 border border-velos-white/15 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.65)] overflow-hidden"
        >
          {/* Top Aviation Telemetry Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-4 bg-velos-navy/90 border-b border-velos-white/10 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2 text-velos-cyan font-semibold">
                <span className="h-2 w-2 rounded-full bg-velos-cyan animate-pulse" />
                VIBE SKYPORT OPS CONSOLE // SIMULATED FEED
              </span>
              <span className="hidden md:inline text-velos-white/25">|</span>
              <span className="hidden md:inline text-velos-silver">
                METROPOLITAN SECTOR: COASTAL BAY CORRIDOR
              </span>
            </div>

            <div className="flex items-center gap-5 text-velos-silver">
              <span className="inline-flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-velos-cyan" />
                <span>5 VERTIPORTS LINKED</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-velos-white">
                <Activity className="w-3.5 h-3.5 text-velos-cyan" />
                <span>99.4% SYNC INDEX (DEMO)</span>
              </span>
            </div>
          </div>

          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-velos-white/10 bg-velos-navy/45">
            {[
              {
                label: "SIMULATED ACTIVE CORRIDORS",
                value: "14 Routes",
                sub: "All airspace sectors nominal",
              },
              {
                label: "VERTIPORT PAD OCCUPANCY",
                value: "18 / 29 Pads",
                sub: "Fast-charge turnaround ready",
              },
              {
                label: "GROUND TRANSFER LOCK",
                value: "99.2% Matched",
                sub: "< 90s curb-to-pad buffer",
              },
              {
                label: "MEAN JOURNEY TIME SAVED",
                value: "44 Mins",
                sub: "Illustrative metro average",
              },
            ].map((kpi, idx) => (
              <div
                key={kpi.label}
                className={`p-5 sm:p-6 ${
                  idx < 3 ? "border-r border-velos-white/10" : ""
                }`}
              >
                <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-velos-silver">
                  {kpi.label}
                </span>
                <span className="mt-1.5 block font-velos-display text-2xl sm:text-3xl font-semibold text-velos-white">
                  {kpi.value}
                </span>
                <span className="mt-1 block text-xs text-velos-cyan font-mono">
                  {kpi.sub}
                </span>
              </div>
            ))}
          </div>

          {/* Main Dashboard Workspace: Stylized City Map + Flight & Ground Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left 7 Columns: Interactive Stylized City Airspace Map */}
            <div className="lg:col-span-7 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-velos-white/10 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                    INTERACTIVE SECTOR MAP (ILLUSTRATIVE)
                  </span>
                  <h3 className="font-velos-display text-xl font-semibold text-velos-white">
                    Live Corridor Vector & Vertiport Network
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-velos-silver">
                  Click any flight vector or vertiport marker
                </span>
              </div>

              {/* Stylized City Airspace SVG Canvas */}
              <div className="relative aspect-[16/10] w-full rounded-2xl bg-velos-navy border border-velos-white/12 overflow-hidden">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                  aria-label="Stylized city map showing simulated flight corridors and vertiport markers"
                >
                  {/* Stylized Coastal Harbor Water Contour */}
                  <path
                    d="M 0 58 Q 28 62, 42 78 T 100 92 L 100 100 L 0 100 Z"
                    fill="rgba(16, 37, 56, 0.55)"
                  />

                  {/* Subtle Sector Coordinate Grid */}
                  {[20, 40, 60, 80].map((pos) => (
                    <g key={pos}>
                      <line
                        x1={pos}
                        y1="0"
                        x2={pos}
                        y2="100"
                        stroke="rgba(220,227,231,0.06)"
                        strokeWidth="0.25"
                      />
                      <line
                        x1="0"
                        y1={pos}
                        x2="100"
                        y2={pos}
                        stroke="rgba(220,227,231,0.06)"
                        strokeWidth="0.25"
                      />
                    </g>
                  ))}

                  {/* Flight Corridors */}
                  {SIMULATED_FLIGHTS.map((flight) => {
                    const isSelected = flight.id === activeFlight.id;
                    return (
                      <g
                        key={flight.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedFlightId(flight.id)}
                      >
                        <line
                          x1={flight.coords.x1}
                          y1={flight.coords.y1}
                          x2={flight.coords.x2}
                          y2={flight.coords.y2}
                          stroke={
                            isSelected ? "#66D9F2" : "rgba(168,182,194,0.28)"
                          }
                          strokeWidth={isSelected ? "0.9" : "0.45"}
                          strokeDasharray={isSelected ? "none" : "1.5 1.5"}
                        />

                        {/* Aircraft Position Marker */}
                        <circle
                          cx={flight.coords.curX}
                          cy={flight.coords.curY}
                          r={isSelected ? "2.6" : "1.6"}
                          fill={isSelected ? "#66D9F2" : "#FFFFFF"}
                          opacity={isSelected ? 0.3 : 0.15}
                        />
                        <circle
                          cx={flight.coords.curX}
                          cy={flight.coords.curY}
                          r={isSelected ? "1.3" : "0.9"}
                          fill={isSelected ? "#66D9F2" : "#FFFFFF"}
                        />
                      </g>
                    );
                  })}

                  {/* 5 Vertiport Nodes */}
                  {SAMPLE_LOCATIONS.map((loc) => {
                    const isEndpoint =
                      loc.code === activeFlight.fromCode ||
                      loc.code === activeFlight.toCode;
                    return (
                      <g
                        key={loc.id}
                        transform={`translate(${loc.coordinates.x}, ${loc.coordinates.y})`}
                      >
                        <circle
                          r={isEndpoint ? "3.2" : "2.1"}
                          fill={
                            isEndpoint
                              ? "rgba(102,217,242,0.22)"
                              : "rgba(8,19,31,0.9)"
                          }
                          stroke={isEndpoint ? "#66D9F2" : "#A8B6C2"}
                          strokeWidth="0.45"
                        />
                        <circle
                          r="0.9"
                          fill={isEndpoint ? "#66D9F2" : "#DCE3E7"}
                        />
                        <text
                          x="3.8"
                          y="1.2"
                          fill={isEndpoint ? "#FFFFFF" : "#A8B6C2"}
                          fontSize="3.1"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {loc.code}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Active Flight Floating Telemetry Overlay */}
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-velos-navy/90 backdrop-blur-md border border-velos-white/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-velos-cyan text-velos-navy font-mono text-xs font-bold">
                      {activeFlight.callsign}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-velos-white">
                        {activeFlight.route}
                      </div>
                      <div className="text-[11px] font-mono text-velos-silver">
                        {activeFlight.altitude} • {activeFlight.speed} •{" "}
                        {activeFlight.groundSync}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-velos-cyan">
                    ETA {activeFlight.etaMin} MIN
                  </div>
                </div>
              </div>

              {/* Vertiport Status Legend */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SAMPLE_LOCATIONS.map((loc) => (
                  <div
                    key={loc.id}
                    className="rounded-xl bg-velos-navy/60 border border-velos-white/10 px-3 py-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-bold text-velos-cyan">
                        {loc.code}
                      </span>
                      <span className="text-velos-silver">
                        {loc.padCount} Pads
                      </span>
                    </div>
                    <div className="text-[11px] text-velos-white truncate mt-0.5">
                      {loc.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Simulated Aircraft Status, Journey Timelines & Ground Sync */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                    SIMULATED AIRCRAFT & JOURNEY QUEUE
                  </span>
                  <span className="text-[11px] font-mono text-velos-silver">
                    Select flight to inspect
                  </span>
                </div>

                <div className="space-y-3">
                  {SIMULATED_FLIGHTS.map((flight) => {
                    const isSelected = flight.id === activeFlight.id;
                    return (
                      <button
                        key={flight.id}
                        type="button"
                        onClick={() => setSelectedFlightId(flight.id)}
                        className={`w-full text-left rounded-2xl p-4 border transition-all ${
                          isSelected
                            ? "bg-velos-navy border-velos-cyan shadow-lg"
                            : "bg-velos-navy/50 border-velos-white/10 hover:border-velos-white/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <Navigation className="w-3.5 h-3.5 text-velos-cyan" />
                            <span className="font-mono text-xs font-bold text-velos-white">
                              {flight.callsign}
                            </span>
                            <span className="text-xs font-mono text-velos-silver">
                              ({flight.fromCode} → {flight.toCode})
                            </span>
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.16em] px-2.5 py-0.5 rounded-full bg-velos-cyan/15 text-velos-cyan">
                            {flight.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-velos-silver mt-2 pt-2 border-t border-velos-white/10">
                          <span className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-velos-cyan" />
                            {flight.groundSync}
                          </span>
                          <span className="font-mono text-velos-white">
                            SOC {flight.batteryPct}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coordinated Journey Timeline Card for Selected Flight */}
              <div className="rounded-2xl bg-velos-navy/80 border border-velos-white/12 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-velos-cyan">
                    JOURNEY TIMELINE // {activeFlight.callsign}
                  </span>
                  <span className="text-xs font-mono text-velos-white">
                    {activeFlight.paxCount}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-velos-blue/50 p-3 border border-velos-white/10">
                    <CheckCircle2 className="w-4 h-4 text-velos-cyan mx-auto mb-1" />
                    <div className="text-[11px] font-semibold text-velos-white">
                      First-Mile EV
                    </div>
                    <div className="text-[10px] font-mono text-velos-silver">
                      Completed
                    </div>
                  </div>
                  <div className="rounded-xl bg-velos-cyan/15 p-3 border border-velos-cyan/40">
                    <Radio className="w-4 h-4 text-velos-cyan mx-auto mb-1" />
                    <div className="text-[11px] font-semibold text-velos-white">
                      eVTOL Leg
                    </div>
                    <div className="text-[10px] font-mono text-velos-cyan">
                      ETA {activeFlight.etaMin}m
                    </div>
                  </div>
                  <div className="rounded-xl bg-velos-blue/50 p-3 border border-velos-white/10">
                    <ShieldCheck className="w-4 h-4 text-velos-cyan mx-auto mb-1" />
                    <div className="text-[11px] font-semibold text-velos-white">
                      Onward EV
                    </div>
                    <div className="text-[10px] font-mono text-velos-silver">
                      Pre-Staged
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
