import React, { useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
  User,
} from "lucide-react";
import {
  PARTNER_CATEGORIES,
  PartnerInquiryErrors,
  PartnerInquiryValues,
  validatePartnerInquiry,
} from "@landing/lib/booking-validation";
import { Button } from "@landing/components/ui/Button";
import { EASING } from "@landing/lib/animation-config";

interface PartnerInquiryFormProps {
  selectedCategoryPreset?: string;
}

export function PartnerInquiryForm({
  selectedCategoryPreset,
}: PartnerInquiryFormProps) {
  const [values, setValues] = useState<PartnerInquiryValues>({
    name: "",
    email: "",
    organization: "",
    category: selectedCategoryPreset || PARTNER_CATEGORIES[1],
    message: "",
  });

  React.useEffect(() => {
    if (selectedCategoryPreset) {
      setValues((prev) => ({ ...prev, category: selectedCategoryPreset }));
    }
  }, [selectedCategoryPreset]);

  const [errors, setErrors] = useState<PartnerInquiryErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePartnerInquiry(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 400);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: EASING.editorial }}
        className="rounded-3xl bg-velos-blue/60 border border-velos-cyan/40 p-8 sm:p-10 text-velos-white shadow-2xl"
      >
        <div className="h-12 w-12 rounded-2xl bg-velos-cyan/20 border border-velos-cyan flex items-center justify-center text-velos-cyan mb-6">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
          ECOSYSTEM INQUIRY LOGGED
        </span>
        <h3 className="font-velos-display text-2xl sm:text-3xl font-semibold mt-2">
          Thank you, {values.name}.
        </h3>
        <p className="mt-3 text-sm sm:text-base text-velos-mist leading-relaxed">
          We have recorded your partnership inquiry for{" "}
          <strong className="text-velos-white">{values.organization}</strong>{" "}
          under <span className="text-velos-cyan">{values.category}</span>. Our
          ecosystem integrations team will review your message and follow up at{" "}
          <span className="underline">{values.email}</span>.
        </p>

        <div className="mt-8 pt-6 border-t border-velos-white/10 flex items-center justify-between">
          <span className="text-xs font-mono text-velos-silver">
            FRONTEND DEMO CONFIRMATION STATE
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setValues({
                name: "",
                email: "",
                organization: "",
                category: PARTNER_CATEGORIES[0],
                message: "",
              });
            }}
          >
            Submit Another Inquiry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      id="partner-form"
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl bg-velos-blue/45 border border-velos-white/15 p-7 sm:p-10 backdrop-blur-xl shadow-2xl space-y-5"
    >
      <div className="border-b border-velos-white/10 pb-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-velos-cyan">
          ECOSYSTEM INTEGRATION BRIEFING
        </span>
        <h3 className="font-velos-display text-2xl font-semibold text-velos-white mt-1">
          Initiate a Partnership Conversation
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label
            htmlFor="partner-name"
            className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-2"
          >
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-velos-silver/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="partner-name"
              type="text"
              placeholder="Elena Rostova"
              value={values.name}
              onChange={(e) => {
                setValues({ ...values, name: e.target.value });
                setErrors({ ...errors, name: undefined });
              }}
              className="w-full rounded-2xl bg-velos-navy/85 border border-velos-white/15 pl-10 pr-4 py-3 text-sm text-velos-white placeholder:text-velos-silver/40 focus:outline-none focus:ring-2 focus:ring-velos-cyan"
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Work Email */}
        <div>
          <label
            htmlFor="partner-email"
            className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-2"
          >
            Work Email *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-velos-silver/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="partner-email"
              type="email"
              placeholder="elena@organization.aero"
              value={values.email}
              onChange={(e) => {
                setValues({ ...values, email: e.target.value });
                setErrors({ ...errors, email: undefined });
              }}
              className="w-full rounded-2xl bg-velos-navy/85 border border-velos-white/15 pl-10 pr-4 py-3 text-sm text-velos-white placeholder:text-velos-silver/40 focus:outline-none focus:ring-2 focus:ring-velos-cyan"
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Organization */}
        <div>
          <label
            htmlFor="partner-org"
            className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-2"
          >
            Organization *
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-velos-silver/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="partner-org"
              type="text"
              placeholder="Aether Skyports / Fleet Ops"
              value={values.organization}
              onChange={(e) => {
                setValues({ ...values, organization: e.target.value });
                setErrors({ ...errors, organization: undefined });
              }}
              className="w-full rounded-2xl bg-velos-navy/85 border border-velos-white/15 pl-10 pr-4 py-3 text-sm text-velos-white placeholder:text-velos-silver/40 focus:outline-none focus:ring-2 focus:ring-velos-cyan"
            />
          </div>
          {errors.organization && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.organization}</span>
            </p>
          )}
        </div>

        {/* Partner Category */}
        <div>
          <label
            htmlFor="partner-category"
            className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-2"
          >
            Partner Category *
          </label>
          <select
            id="partner-category"
            value={values.category}
            onChange={(e) => {
              setValues({ ...values, category: e.target.value });
              setErrors({ ...errors, category: undefined });
            }}
            className="w-full rounded-2xl bg-velos-navy/85 border border-velos-white/15 px-4 py-3 text-sm text-velos-white focus:outline-none focus:ring-2 focus:ring-velos-cyan"
          >
            {PARTNER_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.category}</span>
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="partner-message"
          className="block text-[11px] font-mono uppercase tracking-[0.18em] text-velos-silver mb-2"
        >
          Integration Scope & Objectives *
        </label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-velos-silver/60 absolute left-3.5 top-3.5 pointer-events-none" />
          <textarea
            id="partner-message"
            rows={4}
            placeholder="Share your target metropolitan markets, fleet or vertiport infrastructure profile, or API integration timeline..."
            value={values.message}
            onChange={(e) => {
              setValues({ ...values, message: e.target.value });
              setErrors({ ...errors, message: undefined });
            }}
            className="w-full rounded-2xl bg-velos-navy/85 border border-velos-white/15 pl-10 pr-4 py-3 text-sm text-velos-white placeholder:text-velos-silver/40 focus:outline-none focus:ring-2 focus:ring-velos-cyan"
          />
        </div>
        {errors.message && (
          <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.message}</span>
          </p>
        )}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-[11px] text-velos-silver">
          All partner inquiries are handled under mutual confidentiality.
        </span>
        <Button type="submit" variant="primary" size="lg" showArrow>
          <Send className="w-4 h-4 mr-1.5" />
          {isSubmitting ? "Submitting..." : "Partner with VIBE"}
        </Button>
      </div>
    </form>
  );
}
