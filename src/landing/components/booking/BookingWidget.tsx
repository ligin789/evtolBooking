import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeftRight,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Container } from "@landing/components/ui/Container";
import { SectionHeading } from "@landing/components/layout/SectionHeading";
import { Button } from "@landing/components/ui/Button";
import {
  SAMPLE_LOCATIONS,
  JourneyPreference,
  buildDemoJourneys,
} from "@landing/lib/demo-routes";
import {
  BookingFormValues,
  BookingValidationErrors,
  validateBookingForm,
} from "@landing/lib/booking-validation";
import { BookingResults } from "./BookingResults";
import { JourneySummary } from "./JourneySummary";
import { EASING, usePrefersReducedMotion } from "@landing/lib/animation-config";

const SAMPLE_CORRIDOR_PRESETS = [
  { label: "Downtown → Int'l Airport", from: "downtown", to: "airport" },
  {
    label: "Business District → Waterfront",
    from: "business-district",
    to: "waterfront",
  },
  {
    label: "City Vertiport → Int'l Airport",
    from: "city-vertiport",
    to: "airport",
  },
];

export function BookingWidget() {
  const prefersReducedMotion = usePrefersReducedMotion();

  const [formValues, setFormValues] = useState<BookingFormValues>({
    from: "downtown",
    to: "airport",
    date: "2026-11-12",
    time: "08:30",
    passengers: 2,
    preference: "fastest",
  });

  const [errors, setErrors] = useState<BookingValidationErrors>({});
  const [step, setStep] = useState<"search" | "results" | "confirmed">("results");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("opt-fastest");

  const demoOptions = buildDemoJourneys(
    formValues.from,
    formValues.to,
    formValues.passengers,
    formValues.preference
  );

  const fromNode =
    SAMPLE_LOCATIONS.find((l) => l.id === formValues.from) ||
    SAMPLE_LOCATIONS[0];
  const toNode =
    SAMPLE_LOCATIONS.find((l) => l.id === formValues.to) || SAMPLE_LOCATIONS[1];
  const activeOption =
    demoOptions.find((o) => o.id === selectedOptionId) || demoOptions[0];

  const handleSwapLocations = () => {
    setFormValues((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBookingForm(formValues);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setErrors({});
    setIsSearching(true);
    setTimeout(() => {
      const updated = buildDemoJourneys(
        formValues.from,
        formValues.to,
        formValues.passengers,
        formValues.preference
      );
      setSelectedOptionId(updated[0].id);
      setIsSearching(false);
      setStep("results");
    }, 320);
  };

  const handlePresetSelect = (from: string, to: string) => {
    setFormValues((prev) => ({ ...prev, from, to }));
    setErrors({});
    const updated = buildDemoJourneys(
      from,
      to,
      formValues.passengers,
      formValues.preference
    );
    setSelectedOptionId(updated[0].id);
    setStep("results");
  };

  return (
    <section
      id="booking"
      aria-label="The Booking Experience"
      className="relative bg-velos-ivory text-velos-navy py-24 sm:py-32 lg:py-40 overflow-hidden"
    >
      {/* Subtle architectural radial highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-velos-mist/50 to-transparent"
      />

      <Container size="wide" className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <SectionHeading
            eyebrow="04 / THE BOOKING EXPERIENCE"
            title="YOUR NEXT JOURNEY STARTS HERE."
            description="Explore a new way to plan connected journeys across the city."
            theme="light"
          />

          {/* Quick Sample Route Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/70 mr-1">
              Sample Routes:
            </span>
            {SAMPLE_CORRIDOR_PRESETS.map((preset) => {
              const isCurrent =
                formValues.from === preset.from && formValues.to === preset.to;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handlePresetSelect(preset.from, preset.to)}
                  className={`text-xs font-mono px-3.5 py-2 rounded-full border transition-all ${
                    isCurrent
                      ? "bg-velos-navy text-velos-white border-velos-navy"
                      : "bg-velos-white text-velos-navy border-velos-navy/15 hover:border-velos-navy"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Floating Booking Card */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.75, ease: EASING.editorial }}
          className="rounded-[2rem] bg-velos-white border border-velos-navy/10 p-6 sm:p-10 lg:p-12 shadow-[0_32px_90px_rgba(8,19,31,0.12)]"
        >
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-start">
              {/* From Field */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="booking-from"
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2"
                >
                  From Origin
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-velos-blue/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="booking-from"
                    value={formValues.from}
                    onChange={(e) => {
                      setFormValues({ ...formValues, from: e.target.value });
                      setErrors({ ...errors, from: undefined, to: undefined });
                    }}
                    className="w-full rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 pl-10 pr-4 py-3.5 text-sm font-medium text-velos-navy focus:outline-none focus:ring-2 focus:ring-velos-navy"
                  >
                    {SAMPLE_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code}) — {loc.vertiportName}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.from && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.from}</span>
                  </p>
                )}
              </div>

              {/* Swap Origin/Destination Button */}
              <div className="lg:col-span-1 flex items-center justify-center lg:pt-7">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  aria-label="Swap departure and destination locations"
                  className="p-3 rounded-2xl bg-velos-ivory border border-velos-navy/15 text-velos-navy hover:bg-velos-navy hover:text-velos-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-velos-navy"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* To Field */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="booking-to"
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2"
                >
                  To Destination
                </label>
                <div className="relative">
                  <Compass className="w-4 h-4 text-velos-blue/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="booking-to"
                    value={formValues.to}
                    onChange={(e) => {
                      setFormValues({ ...formValues, to: e.target.value });
                      setErrors({ ...errors, to: undefined });
                    }}
                    className="w-full rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 pl-10 pr-4 py-3.5 text-sm font-medium text-velos-navy focus:outline-none focus:ring-2 focus:ring-velos-navy"
                  >
                    <option value="">Select destination...</option>
                    {SAMPLE_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code}) — {loc.vertiportName}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.to && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.to}</span>
                  </p>
                )}
              </div>

              {/* Date Field */}
              <div className="lg:col-span-2">
                <label
                  htmlFor="booking-date"
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2"
                >
                  Departure Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-velos-blue/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="booking-date"
                    type="date"
                    value={formValues.date}
                    onChange={(e) => {
                      setFormValues({ ...formValues, date: e.target.value });
                      setErrors({ ...errors, date: undefined });
                    }}
                    className="w-full rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 pl-10 pr-3 py-3.5 text-sm font-medium text-velos-navy focus:outline-none focus:ring-2 focus:ring-velos-navy"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.date}</span>
                  </p>
                )}
              </div>

              {/* Departure Time Field */}
              <div className="lg:col-span-3">
                <label
                  htmlFor="booking-time"
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2"
                >
                  Departure Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-velos-blue/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="booking-time"
                    value={formValues.time}
                    onChange={(e) => {
                      setFormValues({ ...formValues, time: e.target.value });
                      setErrors({ ...errors, time: undefined });
                    }}
                    className="w-full rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 pl-10 pr-4 py-3.5 text-sm font-medium text-velos-navy focus:outline-none focus:ring-2 focus:ring-velos-navy"
                  >
                    <option value="07:00">07:00 AM — Morning Window</option>
                    <option value="08:30">08:30 AM — Peak Commute</option>
                    <option value="11:15">11:15 AM — Midday Express</option>
                    <option value="15:45">03:45 PM — Afternoon Slot</option>
                    <option value="18:15">06:15 PM — Golden Hour</option>
                    <option value="20:00">08:00 PM — Evening Corridor</option>
                  </select>
                </div>
                {errors.time && (
                  <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.time}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Row: Passengers, Journey Preference & Submit CTA */}
            <div className="mt-5 pt-5 border-t border-velos-navy/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Passenger Counter */}
              <div className="md:col-span-4">
                <span className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2">
                  Passengers (1 – 6)
                </span>
                <div className="flex items-center justify-between rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-velos-navy">
                    <Users className="w-4 h-4 text-velos-blue/70" />
                    <span>
                      {formValues.passengers}{" "}
                      {formValues.passengers === 1 ? "Passenger" : "Passengers"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease passengers"
                      onClick={() =>
                        setFormValues((prev) => ({
                          ...prev,
                          passengers: Math.max(1, prev.passengers - 1),
                        }))
                      }
                      className="h-8 w-8 rounded-full bg-velos-white border border-velos-navy/15 text-velos-navy font-semibold hover:bg-velos-navy hover:text-velos-white transition-colors"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      aria-label="Increase passengers"
                      onClick={() =>
                        setFormValues((prev) => ({
                          ...prev,
                          passengers: Math.min(6, prev.passengers + 1),
                        }))
                      }
                      className="h-8 w-8 rounded-full bg-velos-white border border-velos-navy/15 text-velos-navy font-semibold hover:bg-velos-navy hover:text-velos-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                {errors.passengers && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.passengers}
                  </p>
                )}
              </div>

              {/* Journey Preference */}
              <div className="md:col-span-5">
                <label
                  htmlFor="booking-preference"
                  className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-blue/75 mb-2"
                >
                  Journey Preference
                </label>
                <div className="relative">
                  <SlidersHorizontal className="w-4 h-4 text-velos-blue/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="booking-preference"
                    value={formValues.preference}
                    onChange={(e) =>
                      setFormValues({
                        ...formValues,
                        preference: e.target.value as JourneyPreference,
                      })
                    }
                    className="w-full rounded-2xl bg-velos-ivory/80 border border-velos-navy/15 pl-10 pr-4 py-3.5 text-sm font-medium text-velos-navy focus:outline-none focus:ring-2 focus:ring-velos-navy"
                  >
                    <option value="fastest">
                      Fastest Door-to-Door Orchestration
                    </option>
                    <option value="seamless-private">
                      Executive Private Cabin + Chauffeur
                    </option>
                    <option value="shared-shuttle">
                      Scheduled Skyport Commuter Shuttle
                    </option>
                  </select>
                </div>
              </div>

              {/* Submit Route Search Button */}
              <div className="md:col-span-3">
                <Button
                  type="submit"
                  variant="dark"
                  size="lg"
                  className="w-full py-3.5"
                >
                  <Search className="w-4 h-4 mr-1.5" />
                  {isSearching ? "Orchestrating..." : "Explore Route"}
                </Button>
              </div>
            </div>
          </form>

          {/* Interactive Demonstration Results or Confirmation Flow */}
          {step === "results" && (
            <BookingResults
              fromNode={fromNode}
              toNode={toNode}
              date={formValues.date}
              time={formValues.time}
              passengers={formValues.passengers}
              options={demoOptions}
              selectedOptionId={selectedOptionId}
              onSelectOption={(id) => setSelectedOptionId(id)}
              onContinueToConfirm={() => setStep("confirmed")}
            />
          )}

          {step === "confirmed" && (
            <JourneySummary
              fromNode={fromNode}
              toNode={toNode}
              date={formValues.date}
              time={formValues.time}
              passengers={formValues.passengers}
              selectedOption={activeOption}
              onBackToResults={() => setStep("results")}
              onResetSearch={() => {
                setFormValues({
                  from: "business-district",
                  to: "waterfront",
                  date: "2026-11-15",
                  time: "18:15",
                  passengers: 2,
                  preference: "fastest",
                });
                setStep("results");
              }}
            />
          )}
        </motion.div>
      </Container>
    </section>
  );
}
