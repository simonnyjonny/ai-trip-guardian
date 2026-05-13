export type TripInputMode = "itinerary" | "wish";
export type TripRegion = "domestic" | "outbound" | "auto";

export type GeneratedItineraryIntensity = "low" | "medium" | "high";
export type GeneratedItineraryTimeOfDay = "morning" | "late_morning" | "afternoon" | "evening" | "flexible";

export interface GeneratedItineraryItem {
  timeOfDay?: GeneratedItineraryTimeOfDay; title: string; locationName?: string | null;
  category: ItineraryCategory; why: string; estimatedIntensity?: GeneratedItineraryIntensity; notes?: string[];
}

export interface GeneratedItineraryDay {
  dayIndex: number; theme: string; userWishesSatisfied: string[];
  items: GeneratedItineraryItem[]; restBuffers: string[]; riskAvoidanceNotes: string[];
}

export interface TripWishInput {
  destination: string; startDate?: string | null; endDate?: string | null;
  durationDays?: number | null; travelers?: string | null;
  pace?: "relaxed" | "normal" | "packed"; tripRegion?: TripRegion;
  primaryTransport?: PrimaryTransport; travelStyles: string[];
  mustVisitPlaces: string[]; optionalPlaces: string[];
  thingsToDo: string[]; avoid: string[]; specialNeeds: string[];
}

export type PrimaryTransport =
  | "flight" | "train" | "self_drive"
  | "public_transport" | "taxi" | "mixed" | "unknown";

export type TravelerType =
  | "solo"
  | "couple"
  | "friends"
  | "family"
  | "with_children"
  | "with_parents"
  | "business"
  | "other";

export type TripPace = "relaxed" | "normal" | "packed";

export type LanguageLevel = "strong" | "medium" | "weak";

export type RiskLevel = "low" | "medium" | "medium_high" | "high";

export type ItineraryCategory =
  | "flight"
  | "train"
  | "hotel"
  | "activity"
  | "restaurant"
  | "transport"
  | "shopping"
  | "rest"
  | "other";

export type TripStatus = "draft" | "analyzing" | "completed" | "failed";

// ── Database row types ──

export interface Trip {
  id: string;
  user_id?: string | null;
  title: string | null;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  traveler_type: TravelerType;
  pace: TripPace;
  language_level: LanguageLevel;
  special_needs: string[];
  raw_input: string | null;
  input_mode: TripInputMode;
  wish_input: TripWishInput;
  generated_itinerary: unknown[];
  trip_region: TripRegion;
  primary_transport: PrimaryTransport;
  status: TripStatus;
  // Sprint 2 analysis fields
  analysis_stage?: string;
  analysis_error?: string | null;
  analysis_started_at?: string | null;
  analysis_completed_at?: string | null;
  analysis_attempt_count?: number;
  last_analyzed_input_hash?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripDocument {
  id: string;
  trip_id: string;
  file_url: string;
  file_name?: string | null;
  file_type?: string | null;
  file_size_bytes?: number | null;
  extracted_text: string | null;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  trip_id: string;
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  title: string;
  location_name: string | null;
  address: string | null;
  category: ItineraryCategory;
  notes: string | null;
  risk_level: RiskLevel;
  risk_reasons: string[];
  sort_order: number;
  created_at: string;
}

// ── API input / output types ──

export interface TripProfile {
  destination: string;
  startDate?: string;
  endDate?: string;
  travelerType: TravelerType;
  pace: TripPace;
  languageLevel: LanguageLevel;
  specialNeeds: string[];
  rawInput: string;
}

export interface ParsedItineraryItem {
  day_index: number;
  start_time?: string | null;
  end_time?: string | null;
  title: string;
  location_name?: string | null;
  address?: string | null;
  category: ItineraryCategory;
  notes?: string | null;
}

export interface ParsedTripInput {
  trip_title: string;
  destination: string;
  start_date?: string | null;
  end_date?: string | null;
  itinerary_items: ParsedItineraryItem[];
  missing_info: string[];
}
