// Sprint 6: Maps provider placeholder for future Sprite 7
// Do NOT call any map API in this sprint.

export type MapProviderName = "amap" | "google" | "mock"

export interface RouteOption {
  mode: "driving" | "public_transport" | "walking" | "taxi" | "train" | "airport_bus"
  origin: string
  destination: string
  estimatedDurationMinutes?: number
  estimatedDistanceKm?: number
  steps?: string[]
  provider: MapProviderName
  limitations?: string[]
}
