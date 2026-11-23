export interface LocationNode {
  id: string;
  name: string;
  code: string;
  district: string;
  vertiportName: string;
  coordinates: { x: number; y: number }; // Normalized 0-100 map coordinates
  elevationFt: number;
  padCount: number;
  groundAccess: string;
}

export type JourneyPreference = "fastest" | "seamless-private" | "shared-shuttle";

export interface DemoRouteSegment {
  id: string;
  mode: "ground-first" | "vertiport-checkin" | "air-evtol" | "ground-last";
  title: string;
  providerLabel: string;
  durationMin: number;
  distanceLabel: string;
  detail: string;
  departureNode: string;
  arrivalNode: string;
}

export interface DemoJourneyOption {
  id: string;
  preference: JourneyPreference;
  label: string;
  badge: string;
  totalDurationMin: number;
  groundComparisonMin: number;
  timeSavedMin: number;
  illustrativePricePerSeatUsd: number;
  aircraftClass: string;
  operatorDemoName: string;
  operatorIntegrationNote: string;
  corridorCode: string;
  cruiseAltitudeFt: number;
  carbonSavedKg: number;
  segments: DemoRouteSegment[];
}

export const SAMPLE_LOCATIONS: LocationNode[] = [
  {
    id: "downtown",
    name: "Downtown",
    code: "DTN",
    district: "Central Civic Core",
    vertiportName: "Meridian Tower Skyport",
    coordinates: { x: 44, y: 52 },
    elevationFt: 680,
    padCount: 4,
    groundAccess: "Dedicated subterranean EV concourse",
  },
  {
    id: "airport",
    name: "International Airport",
    code: "IAP",
    district: "South Airfield Terminal 4",
    vertiportName: "Terminal 4 Airside Vertiport",
    coordinates: { x: 82, y: 76 },
    elevationFt: 45,
    padCount: 8,
    groundAccess: "Direct airside walkway & autonomous shuttle",
  },
  {
    id: "business-district",
    name: "Business District",
    code: "FIN",
    district: "North Financial Quarter",
    vertiportName: "Exchange Plaza Rooftop Hub",
    coordinates: { x: 56, y: 28 },
    elevationFt: 820,
    padCount: 6,
    groundAccess: "Express elevator to ground mobility bay",
  },
  {
    id: "waterfront",
    name: "Waterfront",
    code: "WFT",
    district: "West Harbor Pier 9",
    vertiportName: "Harbor Pavilion Floating Skyport",
    coordinates: { x: 22, y: 64 },
    elevationFt: 30,
    padCount: 5,
    groundAccess: "Waterfront promenade & electric transfer dock",
  },
  {
    id: "city-vertiport",
    name: "City Vertiport",
    code: "CVP",
    district: "Midtown Innovation Corridor",
    vertiportName: "VIBE Central Nexus Vertiport",
    coordinates: { x: 35, y: 34 },
    elevationFt: 410,
    padCount: 6,
    groundAccess: "Multi-modal transit concourse Level B1",
  },
];

export function buildDemoJourneys(
  fromId: string,
  toId: string,
  passengers: number,
  selectedPreference: JourneyPreference
): DemoJourneyOption[] {
  const fromNode =
    SAMPLE_LOCATIONS.find((l) => l.id === fromId) || SAMPLE_LOCATIONS[0];
  const toNode =
    SAMPLE_LOCATIONS.find((l) => l.id === toId) || SAMPLE_LOCATIONS[1];

  const dx = fromNode.coordinates.x - toNode.coordinates.x;
  const dy = fromNode.coordinates.y - toNode.coordinates.y;
  const distUnits = Math.max(18, Math.round(Math.hypot(dx, dy)));
  const airMiles = Math.max(8, Math.round(distUnits * 0.42));
  const baseFlightMin = Math.max(7, Math.round(airMiles * 0.65));
  const roadComparisonMin = Math.max(42, Math.round(airMiles * 3.6 + 18));

  const options: DemoJourneyOption[] = [
    {
      id: "opt-fastest",
      preference: "fastest",
      label: "Direct Air Corridor + Priority Curb Transfer",
      badge: "Recommended Orchestration",
      totalDurationMin: baseFlightMin + 11,
      groundComparisonMin: roadComparisonMin,
      timeSavedMin: roadComparisonMin - (baseFlightMin + 11),
      illustrativePricePerSeatUsd: Math.round((95 + airMiles * 5.5) * 1),
      aircraftClass: "4-Seat Tilt-Rotor eVTOL (Illustrative Class)",
      operatorDemoName: "AeroVantage Urban Air (Demonstration Operator)",
      operatorIntegrationNote:
        "Illustrative operator integration profile — demonstration telemetry only",
      corridorCode: `VLO-${fromNode.code}-${toNode.code}-01`,
      cruiseAltitudeFt: 1800,
      carbonSavedKg: +(airMiles * 0.38 * passengers).toFixed(1),
      segments: [
        {
          id: "seg-1",
          mode: "ground-first",
          title: `First-Mile EV Pickup in ${fromNode.district}`,
          providerLabel: "Coordinated Ground Mobility Partner (Demo)",
          durationMin: 5,
          distanceLabel: "1.4 mi",
          detail: `Synchronized curb pickup to ${fromNode.vertiportName}`,
          departureNode: `${fromNode.name} Origin`,
          arrivalNode: fromNode.vertiportName,
        },
        {
          id: "seg-2",
          mode: "vertiport-checkin",
          title: "Biometric Skyport Fast-Track",
          providerLabel: "VIBE Boarding Pass & Pad Assignment",
          durationMin: 2,
          distanceLabel: "Pad B2",
          detail: "Automated weight-and-balance & gate release",
          departureNode: `${fromNode.vertiportName} Lounge`,
          arrivalNode: `${fromNode.vertiportName} Pad 02`,
        },
        {
          id: "seg-3",
          mode: "air-evtol",
          title: `${fromNode.code} → ${toNode.code} Electric Air Corridor`,
          providerLabel: "Participating eVTOL Operator (Demo Data)",
          durationMin: baseFlightMin,
          distanceLabel: `${airMiles} mi aerial route`,
          detail: `1,800 ft AGL low-noise electric flight corridor`,
          departureNode: fromNode.vertiportName,
          arrivalNode: toNode.vertiportName,
        },
        {
          id: "seg-4",
          mode: "ground-last",
          title: `Final-Mile Transfer to ${toNode.name} Destination`,
          providerLabel: "Pre-Staged Ground EV Partner (Demo)",
          durationMin: 4,
          distanceLabel: "0.9 mi",
          detail: `Vehicle staged upon final approach to ${toNode.vertiportName}`,
          departureNode: toNode.vertiportName,
          arrivalNode: `${toNode.name} Final Address`,
        },
      ],
    },
    {
      id: "opt-private",
      preference: "seamless-private",
      label: "Executive Private Cabin + Chauffeur Synchronization",
      badge: "Private Cabin Demo",
      totalDurationMin: baseFlightMin + 9,
      groundComparisonMin: roadComparisonMin,
      timeSavedMin: roadComparisonMin - (baseFlightMin + 9),
      illustrativePricePerSeatUsd: Math.round(165 + airMiles * 7.5),
      aircraftClass: "Executive 4-Passenger eVTOL Cabin (Illustrative)",
      operatorDemoName: "Helios Electric Aviation (Demonstration Operator)",
      operatorIntegrationNote:
        "Illustrative operator integration profile — demonstration telemetry only",
      corridorCode: `VLO-${fromNode.code}-${toNode.code}-PVT`,
      cruiseAltitudeFt: 2100,
      carbonSavedKg: +(airMiles * 0.41 * passengers).toFixed(1),
      segments: [
        {
          id: "seg-p1",
          mode: "ground-first",
          title: `Dedicated Executive EV from ${fromNode.name}`,
          providerLabel: "Premier Chauffeur Partner (Demo)",
          durationMin: 4,
          distanceLabel: "1.4 mi",
          detail: `Direct ramp-side transfer at ${fromNode.vertiportName}`,
          departureNode: `${fromNode.name} Residence / Office`,
          arrivalNode: fromNode.vertiportName,
        },
        {
          id: "seg-p2",
          mode: "vertiport-checkin",
          title: "Private Lounge Direct-to-Pad",
          providerLabel: "VIBE Priority Clearance",
          durationMin: 1,
          distanceLabel: "Pad A1",
          detail: "Zero-wait boarding with synchronized luggage transfer",
          departureNode: `${fromNode.vertiportName} Private Suite`,
          arrivalNode: `${fromNode.vertiportName} Pad 01`,
        },
        {
          id: "seg-p3",
          mode: "air-evtol",
          title: `Direct Express Flight ${fromNode.code} → ${toNode.code}`,
          providerLabel: "Participating Private Fleet Operator (Demo)",
          durationMin: baseFlightMin,
          distanceLabel: `${airMiles} mi direct vector`,
          detail: "Dedicated cabin with live ground-vehicle arrival sync",
          departureNode: fromNode.vertiportName,
          arrivalNode: toNode.vertiportName,
        },
        {
          id: "seg-p4",
          mode: "ground-last",
          title: `Synchronized Arrival Chauffeur at ${toNode.name}`,
          providerLabel: "Premier Chauffeur Partner (Demo)",
          durationMin: 4,
          distanceLabel: "0.9 mi",
          detail: `Seamless doorstep arrival in ${toNode.district}`,
          departureNode: toNode.vertiportName,
          arrivalNode: `${toNode.name} Final Destination`,
        },
      ],
    },
    {
      id: "opt-shared",
      preference: "shared-shuttle",
      label: "Scheduled Skyport Shuttle + Autonomous Transit Link",
      badge: "High-Frequency Commuter",
      totalDurationMin: baseFlightMin + 14,
      groundComparisonMin: roadComparisonMin,
      timeSavedMin: roadComparisonMin - (baseFlightMin + 14),
      illustrativePricePerSeatUsd: Math.round(68 + airMiles * 4.2),
      aircraftClass: "6-Seat Commuter eVTOL Shuttle (Illustrative)",
      operatorDemoName: "Meridian Air Shuttle (Demonstration Operator)",
      operatorIntegrationNote:
        "Illustrative operator integration profile — demonstration telemetry only",
      corridorCode: `VLO-${fromNode.code}-${toNode.code}-SHT`,
      cruiseAltitudeFt: 1650,
      carbonSavedKg: +(airMiles * 0.48 * passengers).toFixed(1),
      segments: [
        {
          id: "seg-s1",
          mode: "ground-first",
          title: `Autonomous Electric Shuttle to ${fromNode.vertiportName}`,
          providerLabel: "Urban EV Transit Link (Demo)",
          durationMin: 6,
          distanceLabel: "1.4 mi",
          detail: "Departing every 6 minutes from district mobility hubs",
          departureNode: `${fromNode.name} Mobility Hub`,
          arrivalNode: fromNode.vertiportName,
        },
        {
          id: "seg-s2",
          mode: "vertiport-checkin",
          title: "Automated Turnstile Check-In",
          providerLabel: "VIBE Smart Pass",
          durationMin: 3,
          distanceLabel: "Gate C4",
          detail: "QR/NFC boarding verification & lounge access",
          departureNode: `${fromNode.vertiportName} Concourse`,
          arrivalNode: `${fromNode.vertiportName} Pad 04`,
        },
        {
          id: "seg-s3",
          mode: "air-evtol",
          title: `Scheduled Corridor Flight ${fromNode.code} → ${toNode.code}`,
          providerLabel: "Participating Commuter Operator (Demo)",
          durationMin: baseFlightMin,
          distanceLabel: `${airMiles} mi corridor`,
          detail: "High-frequency urban air corridor departure",
          departureNode: fromNode.vertiportName,
          arrivalNode: toNode.vertiportName,
        },
        {
          id: "seg-s4",
          mode: "ground-last",
          title: `Connected Last-Mile EV Shuttle in ${toNode.district}`,
          providerLabel: "Urban EV Transit Link (Demo)",
          durationMin: 5,
          distanceLabel: "0.9 mi",
          detail: "Timed connection waiting at lower terminal bay",
          departureNode: toNode.vertiportName,
          arrivalNode: `${toNode.name} Center`,
        },
      ],
    },
  ];

  // Sort so the user's selected preference comes first
  return options.sort((a, b) =>
    a.preference === selectedPreference
      ? -1
      : b.preference === selectedPreference
      ? 1
      : 0
  );
}

export interface JourneyStage {
  number: string;
  stage: string;
  headline: string;
  description: string;
  image: string;
  imageAlt: string;
  telemetryTag: string;
  uiCard: {
    statusLabel: string;
    metricPrimary: string;
    metricSecondary: string;
    detail: string;
  };
}

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    number: "01",
    stage: "Plan",
    headline: "Start with where you want to be.",
    description:
      "Discover available journeys, compare travel options, and plan your route around your schedule.",
    image: "/landing/images/journey-01-plan.jpg",
    imageAlt:
      "A passenger exploring the VIBE mobility application inside a sunlit city apartment overlooking a coastal metropolis",
    telemetryTag: "MULTI-MODAL ROUTE DISCOVERY",
    uiCard: {
      statusLabel: "ROUTE ENGINE ACTIVE",
      metricPrimary: "18 min total",
      metricSecondary: "vs. 64 min by road",
      detail: "First-mile EV + eVTOL air leg + final-mile arrival",
    },
  },
  {
    number: "02",
    stage: "Connect",
    headline: "Every connection, considered.",
    description:
      "Coordinate the first mile, vertiport access, and onward ground transportation.",
    image: "/landing/images/journey-02-connect.jpg",
    imageAlt:
      "A sleek electric ground vehicle arriving outside a contemporary architectural building for first-mile transfer",
    telemetryTag: "FIRST-MILE SYNCHRONIZATION",
    uiCard: {
      statusLabel: "GROUND TRANSFER SYNCED",
      metricPrimary: "Vehicle En Route",
      metricSecondary: "Pad B2 Pre-Assigned",
      detail: "Dynamic curb ETA matched to vertiport boarding window",
    },
  },
  {
    number: "03",
    stage: "Fly",
    headline: "Move beyond the road.",
    description:
      "Discover eligible air routes and connect with participating aircraft operators.",
    image: "/landing/images/journey-03-fly.jpg",
    imageAlt:
      "A sleek white and silver eVTOL aircraft resting on a rooftop vertiport pad at golden hour",
    telemetryTag: "ELECTRIC AIR CORRIDOR",
    uiCard: {
      statusLabel: "BOARDING CLEARANCE",
      metricPrimary: "Corridor DTN → IAP",
      metricSecondary: "1,800 ft AGL • 11 min",
      detail: "Zero operational emissions • Low acoustic signature",
    },
  },
  {
    number: "04",
    stage: "Coordinate",
    headline: "Everything working together.",
    description:
      "Coordinate booking information, operational updates, partner services, and journey status through a unified platform.",
    image: "/landing/images/journey-04-coordinate.jpg",
    imageAlt:
      "A modern skyport operations observation lounge displaying city routes, vertiports, and flight telemetry",
    telemetryTag: "LIVE JOURNEY TELEMETRY",
    uiCard: {
      statusLabel: "ORCHESTRATION STATE",
      metricPrimary: "4 Systems Linked",
      metricSecondary: "99.4% Schedule Sync",
      detail: "Air operator, arrival pad, and onward vehicle aligned",
    },
  },
  {
    number: "05",
    stage: "Arrive",
    headline: "Arrive with more of your day.",
    description:
      "Connect the final stage of your journey without treating each leg as a separate trip.",
    image: "/landing/images/journey-05-arrive.jpg",
    imageAlt:
      "A passenger stepping out of a modern glass skyport pavilion onto a sunlit waterfront destination plaza",
    telemetryTag: "SEAMLESS FINAL MILE",
    uiCard: {
      statusLabel: "DESTINATION HANDOFF",
      metricPrimary: "46 Minutes Saved",
      metricSecondary: "Single Unified Itinerary",
      detail: "Onward ground transfer waiting at skyport concourse",
    },
  },
];

export interface OrchestrationNode {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  protocolLabel: string;
  latencyMetric: string;
  angleDeg: number; // Position around the central VIBE core
  xPercent: number;
  yPercent: number;
  connectedSystems: string[];
}

export const ORCHESTRATION_NODES: OrchestrationNode[] = [
  {
    id: "passenger-booking",
    title: "Passenger Booking",
    category: "EXPERIENCE LAYER",
    shortDesc:
      "Unifies door-to-door route discovery, multi-leg ticketing, and real-time itinerary adjustments in a single reservation.",
    protocolLabel: "ITINERARY GRAPH ENGINE",
    latencyMetric: "< 120ms route solver",
    angleDeg: 270,
    xPercent: 50,
    yPercent: 12,
    connectedSystems: ["scheduling", "ground-mobility", "journey-status"],
  },
  {
    id: "aircraft-operators",
    title: "Aircraft Operators",
    category: "AVIATION FLEET LAYER",
    shortDesc:
      "Connects participating eVTOL and regional electric fleet operators through standardized dispatch, manifest, and availability APIs.",
    protocolLabel: "OPERATOR DISPATCH API",
    latencyMetric: "Bi-directional telemetry",
    angleDeg: 315,
    xPercent: 80,
    yPercent: 23,
    connectedSystems: ["vertiports", "scheduling", "operations-systems"],
  },
  {
    id: "vertiports",
    title: "Vertiports",
    category: "INFRASTRUCTURE LAYER",
    shortDesc:
      "Coordinates landing pad slot allocation, charging turnaround windows, gate assignments, and passenger lounge flow.",
    protocolLabel: "SKYPORT SLOT LEDGER",
    latencyMetric: "Real-time pad state",
    angleDeg: 0,
    xPercent: 86,
    yPercent: 50,
    connectedSystems: ["aircraft-operators", "operations-systems", "ground-mobility"],
  },
  {
    id: "ground-mobility",
    title: "Ground Mobility",
    category: "SURFACE LAYER",
    shortDesc:
      "Synchronizes first-mile pickup and final-mile drop-off vehicles dynamically against live flight approach times.",
    protocolLabel: "CURB-TO-PAD SYNC",
    latencyMetric: "Dynamic ETA lock",
    angleDeg: 45,
    xPercent: 80,
    yPercent: 77,
    connectedSystems: ["passenger-booking", "vertiports", "journey-status"],
  },
  {
    id: "scheduling",
    title: "Scheduling",
    category: "TIMING ENGINE",
    shortDesc:
      "Aligns multi-modal transfer buffers, crew and charging windows, and airspace corridor slots across independent providers.",
    protocolLabel: "TEMPORAL SOLVER V4",
    latencyMetric: "Sub-minute precision",
    angleDeg: 90,
    xPercent: 50,
    yPercent: 88,
    connectedSystems: ["passenger-booking", "aircraft-operators", "vertiports"],
  },
  {
    id: "journey-status",
    title: "Journey Status",
    category: "LIVE TELEMETRY",
    shortDesc:
      "Streams unified boarding notifications, gate clearances, flight vectors, and arrival handoffs to passengers and operators.",
    protocolLabel: "EVENT STREAM BUS",
    latencyMetric: "Continuous state sync",
    angleDeg: 135,
    xPercent: 20,
    yPercent: 77,
    connectedSystems: ["passenger-booking", "ground-mobility", "operations-systems"],
  },
  {
    id: "partner-integrations",
    title: "Partner Integrations",
    category: "ENTERPRISE ECOSYSTEM",
    shortDesc:
      "Provides SDKs and enterprise webhooks for airlines, hospitality groups, corporate travel platforms, and municipal transit.",
    protocolLabel: "OPEN MOBILITY GATEWAY",
    latencyMetric: "ISO/Aviation compliant",
    angleDeg: 180,
    xPercent: 14,
    yPercent: 50,
    connectedSystems: ["passenger-booking", "aircraft-operators", "ground-mobility"],
  },
  {
    id: "operations-systems",
    title: "Operations Systems",
    category: "COMMAND & CONTROL",
    shortDesc:
      "Monitors network health, weather holds, re-accommodation workflows, and inter-operator contingency routing.",
    protocolLabel: "NETWORK ORCHESTRATOR",
    latencyMetric: "Automated recovery",
    angleDeg: 225,
    xPercent: 20,
    yPercent: 23,
    connectedSystems: ["aircraft-operators", "vertiports", "journey-status"],
  },
];

export interface FleetCategory {
  id: string;
  index: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  specs: { label: string; value: string }[];
  integrationNote: string;
  targetAnchor: string;
}

export const FLEET_CATEGORIES: FleetCategory[] = [
  {
    id: "urban-evtol",
    index: "01",
    title: "Urban Passenger eVTOLs",
    subtitle: "Metropolitan Point-to-Point Air Mobility",
    description:
      "Designed to integrate multi-rotor and winged tilt-rotor electric aircraft operating high-frequency corridors between city centers, business districts, and international airports.",
    image: "/landing/images/fleet-urban-evtol.jpg",
    imageAlt:
      "Sleek white and silver 4-passenger electric tilt-rotor eVTOL aircraft banking over a coastal metropolitan bay",
    specs: [
      { label: "Typical Mission", value: "10 – 45 mi urban corridors" },
      { label: "Cabin Profile", value: "4 – 6 passengers + pilot" },
      { label: "VIBE Integration", value: "Dispatch, Weight/Balance & Seat Inventory" },
    ],
    integrationNote:
      "Illustrative aircraft category — built for interoperability with certified commercial eVTOL operators.",
    targetAnchor: "#booking",
  },
  {
    id: "regional-electric",
    index: "02",
    title: "Regional Electric Aircraft",
    subtitle: "Inter-City & Coastal Commuter Corridors",
    description:
      "Extends orchestration beyond the metropolitan core to short-takeoff and distributed-electric regional aircraft linking secondary airports, island hubs, and regional campuses.",
    image: "/landing/images/fleet-regional-electric.jpg",
    imageAlt:
      "High-wing distributed-electric regional commuter aircraft flying over coastal headlands at sunrise",
    specs: [
      { label: "Typical Mission", value: "50 – 200 mi regional hops" },
      { label: "Cabin Profile", value: "9 – 19 passenger commuter" },
      { label: "VIBE Integration", value: "Interline Ticketing & Regional Transfers" },
    ],
    integrationNote:
      "Illustrative aircraft category — supports multi-operator interline connections.",
    targetAnchor: "#booking",
  },
  {
    id: "ground-transportation",
    index: "03",
    title: "Ground Transportation",
    subtitle: "First-Mile & Final-Mile Fleet Synchronization",
    description:
      "Coordinates executive electric sedans, autonomous shuttles, and dedicated mobility hubs so surface transport is dispatched and staged in lockstep with live flight telemetry.",
    image: "/landing/images/fleet-ground-mobility.jpg",
    imageAlt:
      "Sleek autonomous electric executive shuttles docked at a modern skyport transfer concourse",
    specs: [
      { label: "Dispatch Mode", value: "Flight-synchronized ETA lock" },
      { label: "Curb Handoff", value: "< 90 sec terminal transfer" },
      { label: "VIBE Integration", value: "Live Fleet Telemetry & Curb Access API" },
    ],
    integrationNote:
      "Connects ground fleet APIs directly to air arrival and departure states.",
    targetAnchor: "#orchestration",
  },
  {
    id: "vertiport-infrastructure",
    index: "04",
    title: "Vertiport Infrastructure",
    subtitle: "Rooftop Skyports & Multimodal Terminals",
    description:
      "Orchestrates landing pad occupancy, high-power aircraft charging turnarounds, biometric lounge gates, and ground bay staging across urban and airport vertiports.",
    image: "/landing/images/fleet-vertiport-infra.jpg",
    imageAlt:
      "Circular waterfront vertiport terminal with glass passenger lounge and rooftop eVTOL landing pads at twilight",
    specs: [
      { label: "Pad Management", value: "Dynamic slot & charging schedule" },
      { label: "Passenger Flow", value: "Biometric fast-track boarding" },
      { label: "VIBE Integration", value: "Vertiport Operating System (V-OS) Link" },
    ],
    integrationNote:
      "Hardware-agnostic digital layer for public and private skyport operators.",
    targetAnchor: "#operations",
  },
  {
    id: "future-mobility",
    index: "05",
    title: "Future Mobility Services",
    subtitle: "Priority Medical, Logistics & Autonomous Operations",
    description:
      "Architected to scale toward time-critical medical transport, automated inter-hub cargo logistics, and next-generation autonomous aerial corridors as regulatory frameworks mature.",
    image: "/landing/images/fleet-future-services.jpg",
    imageAlt:
      "Autonomous electric priority air-logistics craft resting on a high-rise modular sky-deck at twilight",
    specs: [
      { label: "Service Modes", value: "Priority MedEvac & Express Air Cargo" },
      { label: "Corridor Priority", value: "Dynamic airspace slot preemption" },
      { label: "VIBE Integration", value: "Enterprise & Civic API Gateways" },
    ],
    integrationNote:
      "Forward-compatible orchestration architecture for emerging urban air services.",
    targetAnchor: "#partners",
  },
];
