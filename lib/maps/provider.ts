import type { RouteOption } from "./types"
import { mockTransferRouteOptions } from "./mock-map"

export async function getTransferRouteOptions(params: {
  tripRegion?: string
  origin: string
  destination: string
  travelerType: string
}): Promise<RouteOption[]> {
  // Try real providers first, fallback to mock
  const region = params.tripRegion || "auto"

  if (region === "domestic" && process.env.AMAP_API_KEY) {
    try {
      const { fetchAmapRoute } = await import("./amap")
      return await fetchAmapRoute(params)
    } catch (err) {
      console.warn("[maps] AMap route failed:", err instanceof Error ? err.message : String(err))
    }
  }

  if (region === "outbound" && process.env.GOOGLE_MAPS_API_KEY) {
    try {
      const { fetchGoogleRoute } = await import("./google")
      return await fetchGoogleRoute(params)
    } catch (err) {
      console.warn("[maps] Google route failed:", err instanceof Error ? err.message : String(err))
    }
  }

  // Fallback: mock
  return mockTransferRouteOptions(params)
}
