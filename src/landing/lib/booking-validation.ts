import { JourneyPreference } from "./demo-routes";

export interface BookingFormValues {
  from: string;
  to: string;
  date: string;
  time: string;
  passengers: number;
  preference: JourneyPreference;
}

export interface BookingValidationErrors {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  passengers?: string;
}

export function validateBookingForm(
  values: BookingFormValues
): BookingValidationErrors {
  const errors: BookingValidationErrors = {};

  if (!values.from) {
    errors.from = "Please select a departure location.";
  }

  if (!values.to) {
    errors.to = "Please select a destination.";
  } else if (values.from && values.to === values.from) {
    errors.to = "Destination must be different from departure location.";
  }

  if (!values.date) {
    errors.date = "Please choose a departure date.";
  }

  if (!values.time) {
    errors.time = "Please select a preferred departure window.";
  }

  if (!values.passengers || values.passengers < 1 || values.passengers > 6) {
    errors.passengers = "Select between 1 and 6 passengers.";
  }

  return errors;
}

export interface PartnerInquiryValues {
  name: string;
  email: string;
  organization: string;
  category: string;
  message: string;
}

export interface PartnerInquiryErrors {
  name?: string;
  email?: string;
  organization?: string;
  category?: string;
  message?: string;
}

export const PARTNER_CATEGORIES = [
  "eVTOL Manufacturers",
  "Aircraft Operators",
  "Vertiport Operators",
  "Ground Mobility Providers",
  "Airports & Aviation Authorities",
  "Enterprise Travel Platforms",
  "Mobility Infrastructure Providers",
];

export function validatePartnerInquiry(
  values: PartnerInquiryValues
): PartnerInquiryErrors {
  const errors: PartnerInquiryErrors = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = "Please enter your full name.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email || !emailRegex.test(values.email.trim())) {
    errors.email = "Please enter a valid work email address.";
  }

  if (!values.organization || values.organization.trim().length < 2) {
    errors.organization = "Please enter your organization name.";
  }

  if (!values.category) {
    errors.category = "Please select a partner category.";
  }

  if (!values.message || values.message.trim().length < 15) {
    errors.message =
      "Please share a brief overview of your integration goals (at least 15 characters).";
  }

  return errors;
}
