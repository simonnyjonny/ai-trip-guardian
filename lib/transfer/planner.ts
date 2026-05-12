import type { TransferPlan } from "@/lib/maps/types"
import type { ItineraryItem, Trip } from "@/types/trip"
import { extractTransferPoints } from "./extract"
import { getTransferRouteOptions } from "@/lib/maps/provider"
import { mockTransferCommunicationScripts } from "@/lib/maps/mock-map"

export async function generateTransferPlans(params: {
  trip: Trip
  items: ItineraryItem[]
}): Promise<TransferPlan[]> {
  const points = extractTransferPoints(params.items)
  const plans: TransferPlan[] = []

  const tripRegion = (params.trip as Record<string, unknown>).trip_region as string || "auto"

  // Arrival → Hotel
  if (points.arrivalOrigin && points.firstHotel) {
    const options = await getTransferRouteOptions({
      tripRegion,
      origin: points.arrivalOrigin,
      destination: points.firstHotel,
      travelerType: params.trip.traveler_type,
    })

    const recommended = options.find(o => o.complexity === "low") || options[0]

    plans.push({
      scenario: "arrival_to_hotel",
      title: `从 ${points.arrivalOrigin} 到 ${points.firstHotel}`,
      origin: points.arrivalOrigin,
      destination: points.firstHotel,
      recommendedOptionId: recommended?.id,
      options,
      summary: `推荐${recommended?.title || "打车"}，预计 ${recommended?.estimatedDurationMinutes || "?"} 分钟。${getSummarySuffix(params.trip)}`,
      riskNotes: getRiskNotes(params.trip, tripRegion),
      communicationScripts: mockTransferCommunicationScripts({ destination: points.firstHotel, tripRegion }),
    })
  }

  // Hotel → Departure
  if (points.departureDestination && points.lastHotel) {
    const options = await getTransferRouteOptions({
      tripRegion,
      origin: points.lastHotel,
      destination: points.departureDestination,
      travelerType: params.trip.traveler_type,
    })

    const recommended = options.find(o => o.complexity === "low") || options[0]

    plans.push({
      scenario: "hotel_to_departure",
      title: `从 ${points.lastHotel} 到 ${points.departureDestination}`,
      origin: points.lastHotel,
      destination: points.departureDestination,
      recommendedOptionId: recommended?.id,
      options,
      summary: `推荐${recommended?.title || "打车"}，建议提前 ${getEarlyDepartureMin(params.trip)} 分钟出发。${getSummarySuffix(params.trip)}`,
      riskNotes: getDepartureRiskNotes(params.trip, tripRegion),
      communicationScripts: mockTransferCommunicationScripts({ destination: points.departureDestination, tripRegion }),
    })
  }

  return plans
}

function getSummarySuffix(trip: Trip): string {
  if (trip.traveler_type === "with_parents") return "带父母出行建议选择最省力的方案。"
  if (trip.traveler_type === "with_children") return "带孩子建议选择换乘最少的方案。"
  return ""
}

function getEarlyDepartureMin(trip: Trip): number {
  if (trip.traveler_type === "with_parents") return 120
  if (trip.traveler_type === "with_children") return 90
  return 60
}

function getRiskNotes(trip: Trip, region: string): string[] {
  const notes: string[] = []
  if (region === "domestic") notes.push("高铁站/机场出站口可能较复杂，预留足够时间找路")
  else notes.push("入境可能需要排队，预留额外时间")
  if (trip.traveler_type === "with_parents") notes.push("带父母时优先选择少换乘、有电梯的出行方式")
  if (trip.traveler_type === "with_children") notes.push("注意孩子体力，长途飞行后不宜立即安排复杂换乘")
  notes.push("当前为模拟路线，实际耗时和费用请以当地实时交通为准")
  return notes
}

function getDepartureRiskNotes(trip: Trip, region: string): string[] {
  const notes = getRiskNotes(trip, region)
  if (region === "domestic") notes.push("国内航班建议提前 1.5-2 小时到达机场，高铁提前 1 小时")
  else notes.push("国际航班建议提前 3 小时到达机场")
  return notes
}
