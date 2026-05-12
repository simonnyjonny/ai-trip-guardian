export type MapProviderName = "amap" | "google" | "mock"
export type RouteMode = "taxi" | "driving" | "public_transport" | "walking" | "train" | "airport_bus" | "ride_hailing"
export type RouteComplexity = "low" | "medium" | "high"
export type RouteStepMode = "walk" | "subway" | "train" | "bus" | "taxi" | "ride_hailing" | "airport_bus" | "drive" | "transfer" | "wait" | "other"

export interface RouteStep {
  order: number
  mode: RouteStepMode
  instruction: string
  lineName?: string
  departureStop?: string
  arrivalStop?: string
  durationMinutes?: number
  distanceKm?: number
  notes?: string[]
}

export interface RouteOption {
  id: string
  mode: RouteMode
  title: string
  provider: MapProviderName
  origin: string
  destination: string
  estimatedDurationMinutes?: number
  estimatedDistanceKm?: number
  estimatedCostText?: string
  pickupPointHint?: string
  dropoffPointHint?: string
  complexity: RouteComplexity
  recommendedFor: string[]
  notRecommendedFor?: string[]
  steps: RouteStep[]
  pros: string[]
  cons: string[]
  warnings: string[]
  deepLink?: string
  rideHailingLinks?: {
    uber?: string
    googleMaps?: string
    amap?: string
  }
  dataQuality: "real_api" | "heuristic" | "mock"
  limitations: string[]
}

export interface TransferPlan {
  scenario: "arrival_to_hotel" | "hotel_to_departure"
  title: string
  origin: string
  destination: string
  recommendedOptionId?: string
  options: RouteOption[]
  summary: string
  riskNotes: string[]
  communicationScripts: TransferCommunicationScript[]
}

export interface TransferCommunicationScript {
  scenario: string
  chinese: string
  english?: string
  localLanguage?: string
  localLanguageName?: string
}
