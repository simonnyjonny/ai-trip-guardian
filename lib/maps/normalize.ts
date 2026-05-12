import type { RouteStep, RouteStepMode } from "./types"

export function stripHtml(input?: string): string {
  return (input || "").replace(/<[^>]+>/g, "").trim()
}

export function normalizeSimpleStep(instruction: string, index: number, mode: RouteStepMode = "other"): RouteStep {
  return { order: index + 1, mode, instruction }
}

export function normalizeGoogleStep(
  step: { html_instructions?: string; travel_mode?: string; duration?: { value?: number }; distance?: { value?: number } },
  index: number
): RouteStep {
  return {
    order: index + 1,
    mode: googleTravelMode(step.travel_mode),
    instruction: stripHtml(step.html_instructions) || "Continue per Google Maps",
    durationMinutes: step.duration?.value ? Math.round(step.duration.value / 60) : undefined,
    distanceKm: step.distance?.value ? step.distance.value / 1000 : undefined,
  }
}

function googleTravelMode(mode?: string): RouteStepMode {
  switch (mode) {
    case "WALKING": return "walk"
    case "TRANSIT": return "train"
    case "DRIVING": return "drive"
    case "BICYCLING": return "other"
    default: return "other"
  }
}
