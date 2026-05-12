import type { RiskLevel } from "./trip";

export interface TopRisk {
  title: string;
  level: RiskLevel;
  reason: string;
  suggestion: string;
}

export interface DailyAnalysis {
  day_index: number;
  risk_level: RiskLevel;
  estimated_walking_intensity: "low" | "medium" | "high" | "unknown";
  issues: string[];
  suggestions: string[];
}

export interface Recommendation {
  title: string;
  details: string;
}

export interface ContingencyPlan {
  scenario: string;
  plan: string;
}

export interface CommunicationScript {
  scenario: string;
  chinese: string;
  english?: string;
  local_language?: string;
  local_language_name?: string;
}

export interface DimensionScores {
  time_conflict: number;
  route_efficiency: number;
  physical_load: number;
  booking_risk: number;
  language_risk: number;
  contingency_readiness: number;
}

export interface OptimizedItineraryItem {
  time?: string | null;
  title: string;
  location_name?: string | null;
  category: string;
  reason?: string | null;
}

export interface OptimizedItineraryDay {
  day_index: number;
  theme: string;
  risk_reduction_summary: string;
  items: OptimizedItineraryItem[];
  changes_made: string[];
}

export interface RiskReport {
  id: string;
  trip_id?: string;
  overall_score: number;
  overall_level: RiskLevel;
  summary: string;
  dimension_scores: DimensionScores;
  top_risks: TopRisk[];
  daily_analysis: DailyAnalysis[];
  recommendations: Recommendation[];
  optimized_itinerary: OptimizedItineraryDay[];
  contingency_plans: ContingencyPlan[];
  communication_scripts: CommunicationScript[];
}
