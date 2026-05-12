/** Generate deep links for map providers */
export function generateDeepLink(params: {
  provider: "amap" | "google" | "mock"
  origin: string
  destination: string
}): string {
  switch (params.provider) {
    case "amap":
      return `https://uri.amap.com/navigation?from=${encodeURIComponent(params.origin)}&to=${encodeURIComponent(params.destination)}&mode=car`
    case "google":
      return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(params.origin)}&destination=${encodeURIComponent(params.destination)}&travelmode=driving`
    default:
      return `https://www.google.com/maps/search/${encodeURIComponent(params.destination)}`
  }
}

export function generateUberDeepLink(origin: string, destination: string): string {
  return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination)}`
}
