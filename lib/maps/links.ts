export function generateGoogleMapsLink(origin: string, destination: string, mode: "driving" | "transit" = "driving"): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=${mode}`
}

export function generateAmapLink(origin: string, destination: string): string {
  return `https://uri.amap.com/navigation?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&mode=car`
}

export function generateAmapSearchLink(keyword: string): string {
  return `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}`
}

export function generateUberDeepLink(destination: string): string {
  return `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination)}`
}

export function generateRideHailingLinks(params: {
  origin: string
  destination: string
  isDomestic: boolean
}): { uber?: string; googleMaps?: string; amap?: string } {
  const links: { uber?: string; googleMaps?: string; amap?: string } = {}
  if (params.isDomestic) {
    links.amap = generateAmapLink(params.origin, params.destination)
  } else {
    links.uber = generateUberDeepLink(params.destination)
    links.googleMaps = generateGoogleMapsLink(params.origin, params.destination, "driving")
  }
  return links
}
