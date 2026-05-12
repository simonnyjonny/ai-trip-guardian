import type { RouteOption } from "./types"
import { generateAmapLink } from "./links"

export async function fetchAmapRoute(params: {
  origin: string
  destination: string
  travelerType: string
}): Promise<RouteOption[]> {
  // Geocode both points
  const key = process.env.AMAP_API_KEY!
  const geo = async (addr: string) => {
    const url = `https://restapi.amap.com/v3/geocode/geo?key=${key}&address=${encodeURIComponent(addr)}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Geocode failed: ${res.status}`)
    const d: { geocodes: Array<{ location: string }> } = await res.json()
    if (!d.geocodes?.length) throw new Error("Location not found")
    return d.geocodes[0].location // "lng,lat"
  }

  const [originLoc, destLoc] = await Promise.all([geo(params.origin), geo(params.destination)])

  // Driving route
  const routeUrl = `https://restapi.amap.com/v3/direction/driving?key=${key}&origin=${originLoc}&destination=${destLoc}&strategy=0`
  const routeRes = await fetch(routeUrl)
  if (!routeRes.ok) throw new Error(`Route failed: ${routeRes.status}`)
  const rd: { route?: { paths?: Array<{ distance: string; duration: string; steps?: Array<{ instruction: string }> }> } } = await routeRes.json()

  const path = rd.route?.paths?.[0]
  if (!path) throw new Error("No route found")

  const distanceKm = Math.round(parseInt(path.distance) / 1000)
  const durationMin = Math.round(parseInt(path.duration) / 60)

  const hasElderly = params.travelerType === "with_parents"

  return [{
    id: "amap_drive",
    mode: "taxi",
    title: "打车 / 自驾",
    provider: "amap",
    origin: params.origin,
    destination: params.destination,
    estimatedDurationMinutes: durationMin,
    estimatedDistanceKm: distanceKm,
    estimatedCostText: `约 ¥${Math.round(distanceKm * 3)}-${Math.round(distanceKm * 5)}`,
    complexity: hasElderly ? "low" : "low",
    recommendedFor: ["带老人", "带孩子", "行李多", "首次出行"],
    steps: (path.steps || []).map((s, i) => ({ order: i + 1, mode: "drive" as const, instruction: s.instruction })),
    pros: ["最快", "直达", "高德实时路况"],
    cons: ["高峰期可能拥堵", "费用较高"],
    warnings: [],
    deepLink: generateAmapLink(params.origin, params.destination),
    limitations: [],
  }]
}
