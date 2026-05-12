import { z } from "zod";

export const riskLevelSchema = z.enum(["low", "medium", "medium_high", "high"]);

export const itineraryCategorySchema = z.enum([
  "flight", "hotel", "activity", "restaurant", "transport", "shopping", "rest", "other",
]);

export const parsedItineraryItemSchema = z.object({
  day_index: z.number().int().min(1),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  title: z.string().min(1),
  location_name: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  category: itineraryCategorySchema,
  notes: z.string().nullable().optional(),
});

export const parsedTripInputSchema = z.object({
  trip_title: z.string().min(1),
  destination: z.string().min(1),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  itinerary_items: z.array(parsedItineraryItemSchema).min(1),
  missing_info: z.array(z.string()).default([]),
});

export const topRiskSchema = z.object({
  title: z.string().min(1),
  level: riskLevelSchema,
  reason: z.string().min(1),
  suggestion: z.string().min(1),
});

export const dailyAnalysisSchema = z.object({
  day_index: z.number().int().min(1),
  risk_level: riskLevelSchema,
  estimated_walking_intensity: z.enum(["low", "medium", "high", "unknown"]),
  issues: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export const recommendationSchema = z.object({
  title: z.string().min(1),
  details: z.string().min(1),
});

export const dimensionScoresSchema = z.object({
  time_conflict: z.number().int().min(0).max(100),
  route_efficiency: z.number().int().min(0).max(100),
  physical_load: z.number().int().min(0).max(100),
  booking_risk: z.number().int().min(0).max(100),
  language_risk: z.number().int().min(0).max(100),
  contingency_readiness: z.number().int().min(0).max(100),
});

export const optimizedItineraryItemSchema = z.object({
  time: z.string().nullable().optional(),
  title: z.string().min(1),
  location_name: z.string().nullable().optional(),
  category: z.string().min(1),
  reason: z.string().nullable().optional(),
});

export const optimizedItineraryDaySchema = z.object({
  day_index: z.number().int().min(1),
  theme: z.string().min(1),
  risk_reduction_summary: z.string().min(1),
  items: z.array(optimizedItineraryItemSchema).default([]),
  changes_made: z.array(z.string()).default([]),
});

export const contingencyPlanSchema = z.object({
  scenario: z.string().min(1),
  plan: z.string().min(1),
});

export const communicationScriptSchema = z.object({
  scenario: z.string().min(1),
  chinese: z.string().min(1),
  english: z.string().optional(),
  local_language: z.string().optional(),
  local_language_name: z.string().optional(),
});

export const packingRecommendationsSchema = z.object({
  clothing: z.array(z.string()).default([]),
  footwear: z.array(z.string()).default([]),
  rainGear: z.array(z.string()).default([]),
  sunProtection: z.array(z.string()).default([]),
  healthAndComfort: z.array(z.string()).default([]),
  childOrElderlyNotes: z.array(z.string()).default([]),
  destinationSpecificNotes: z.array(z.string()).default([]),
});

export const riskReportSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  overall_level: riskLevelSchema,
  summary: z.string().min(1),
  dimension_scores: dimensionScoresSchema,
  top_risks: z.array(topRiskSchema).min(1),
  daily_analysis: z.array(dailyAnalysisSchema).min(1),
  recommendations: z.array(recommendationSchema).default([]),
  optimized_itinerary: z.array(optimizedItineraryDaySchema).default([]),
  contingency_plans: z.array(contingencyPlanSchema).default([]),
  communication_scripts: z.array(communicationScriptSchema).default([]),
  packing_recommendations: packingRecommendationsSchema.optional(),
});

// API input schema
export const createTripInputSchema = z.object({
  destination: z.string().min(1, "请输入目的地"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travelerType: z.enum([
    "solo", "couple", "friends", "family",
    "with_children", "with_parents", "business", "other",
  ]),
  pace: z.enum(["relaxed", "normal", "packed"]),
  languageLevel: z.enum(["strong", "medium", "weak"]),
  specialNeeds: z.array(z.string()).default([]),
  rawInput: z.string().min(10, "行程描述至少需要10个字符"),
});

export type ParsedTripInputSchema = z.infer<typeof parsedTripInputSchema>;
export type RiskReportSchema = z.infer<typeof riskReportSchema>;
