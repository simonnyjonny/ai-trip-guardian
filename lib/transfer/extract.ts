import type { ItineraryItem } from "@/types/trip"

function isTrainLikeItem(item: ItineraryItem): boolean {
  if (item.category === "train") return true
  if (item.category !== "transport") return false
  const text = `${item.title ?? ""} ${item.location_name ?? ""} ${item.notes ?? ""}`.toLowerCase()
  return /高铁|火车|新干线|jr\b|rail|train|eurostar|station|车站|火车站|高铁站|城际/i.test(text)
}

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
    if (!arrivalOrigin && (item.category === "flight" || isTrainLikeItem(item))) {
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
    if (!departureDestination && (item.category === "flight" || isTrainLikeItem(item))) {
      if (item.day_index === Math.max(...items.map(i => i.day_index))) {
        departureDestination = item.location_name || item.title
      }
    }
  }

  return { arrivalOrigin, firstHotel, departureDestination, lastHotel }
}
