import type { RouteOption } from "./types"
import { generateGoogleMapsLink, generateUberDeepLink } from "./links"

export async function fetchGoogleRoute(params: {
  origin: string
  destination: string
  travelerType: string
}): Promise<RouteOption[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY!
  const dirUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&mode=driving&key=${key}`
  const res = await fetch(dirUrl)
  if (!res.ok) throw new Error(`Google Directions failed: ${res.status}`)
  const d: { routes?: Array<{ legs?: Array<{ distance: { value: number }; duration: { value: number }; steps?: Array<{ html_instructions: string }> }> }> } = await res.json()

  const leg = d.routes?.[0]?.legs?.[0]
  if (!leg) throw new Error("No route found")

  const hasElderly = params.travelerType === "with_parents"

  const option: RouteOption = {
    id: "google_drive",
    mode: "taxi",
    title: "Taxi / Ride-hailing",
    provider: "google",
    origin: params.origin,
    destination: params.destination,
    estimatedDurationMinutes: Math.round(leg.duration.value / 60),
    estimatedDistanceKm: Math.round(leg.distance.value / 1000),
    complexity: hasElderly ? "low" : "low",
    recommendedFor: ["首次出行", "行李多", "深夜抵达"],
    steps: (leg.steps || []).map(s => ({ instruction: s.html_instructions.replace(/<[^>]+>/g, "") })),
    pros: ["最快", "直达", "实时路况"],
    cons: [],
    warnings: [],
    deepLink: generateGoogleMapsLink(params.origin, params.destination),
    limitations: [],
  }

  return [
    option,
    {
      id: "uber",
      mode: "ride_hailing",
      title: "Uber / Lyft",
      provider: "google",
      origin: params.origin,
      destination: params.destination,
      estimatedDurationMinutes: Math.round(leg.duration.value / 60),
      estimatedDistanceKm: Math.round(leg.distance.value / 1000),
      complexity: "low",
      recommendedFor: ["首次出行", "英文可沟通"],
      steps: [{ instruction: "Open Uber/Lyft app, set destination" }],
      pros: ["直接在 app 叫车", "价格透明"],
      cons: ["需要网络", "高峰期加价"],
      warnings: ["确认 pickup 地点", "核对车牌号"],
      deepLink: generateUberDeepLink(params.origin, params.destination),
      limitations: [],
    },
  ]
}
