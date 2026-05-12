import type { ItineraryItem } from "@/types/trip"

export function extractTransferPoints(items: ItineraryItem[]): {
  arrivalOrigin?: string
  firstHotel?: string
  departureDestination?: string
  lastHotel?: string
} {
  let arrivalOrigin: string | undefined
  let departureDestination: string | undefined
  let firstHotel: string | undefined
  let lastHotel: string | undefined

  for (const item of items) {
    if (!arrivalOrigin && (item.category === "flight" || item.category === "train")) {
      if (item.day_index === 1) {
        arrivalOrigin = item.location_name || item.title
      }
    }
    if (!firstHotel && item.category === "hotel") {
      firstHotel = item.location_name || item.title
    }
    if (item.category === "hotel") {
      lastHotel = item.location_name || item.title
    }
  }

  // Find last airport/station for departure
  const reversed = [...items].reverse()
  for (const item of reversed) {
    if (!departureDestination && (item.category === "flight" || item.category === "train")) {
      if (item.day_index === Math.max(...items.map(i => i.day_index))) {
        departureDestination = item.location_name || item.title
      }
    }
  }

  return { arrivalOrigin, firstHotel, departureDestination, lastHotel }
}
