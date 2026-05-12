import type { TripWeatherSummary, WeatherProviderName } from "./types"
import { generateMockWeather } from "./mock-weather"

export async function getTripWeatherForecast(params: {
  destination: string
  startDate?: string
  endDate?: string
  tripRegion?: string
}): Promise<TripWeatherSummary> {
  const { destination, startDate, endDate, tripRegion } = params

  // No dates → seasonal
  if (!startDate || !endDate) {
    const mock = generateMockWeather(destination, undefined, undefined)
    return { ...mock, provider: "seasonal" as WeatherProviderName, forecastReliability: "low", limitations: ["出行日期未提供，使用目的地季节性气候建议。"] }
  }

  // Determine provider
  const provider = getProvider(tripRegion)

  if (provider === "amap") {
    try {
      const { fetchAmapWeather } = await import("./amap-weather")
      return await fetchAmapWeather({ destination, startDate, endDate })
    } catch (err) {
      console.warn("[weather] Amap fetch failed, trying openweather:", err instanceof Error ? err.message : String(err))
    }
  }

  if (provider === "openweather") {
    try {
      const { fetchOpenWeather } = await import("./openweather")
      return await fetchOpenWeather({ destination, startDate, endDate })
    } catch (err) {
      console.warn("[weather] OpenWeather fetch failed:", err instanceof Error ? err.message : String(err))
    }
  }

  // Fallback to mock
  return {
    ...generateMockWeather(destination, startDate, endDate),
    provider: "mock" as WeatherProviderName,
    limitations: ["实时天气数据暂不可用，当前为季节性模拟数据。请以当地官方天气预报为准。"],
  }
}

function getProvider(tripRegion?: string): "amap" | "openweather" | "mock" {
  const envProvider = process.env.WEATHER_PROVIDER || "auto"

  if (envProvider === "amap" && process.env.AMAP_API_KEY) return "amap"
  if (envProvider === "openweather" && process.env.OPENWEATHER_API_KEY) return "openweather"

  if (tripRegion === "domestic" && process.env.AMAP_API_KEY) return "amap"
  if (tripRegion === "outbound" && process.env.OPENWEATHER_API_KEY) return "openweather"

  // Fallback: try whatever key is available
  if (process.env.AMAP_API_KEY) return "amap"
  if (process.env.OPENWEATHER_API_KEY) return "openweather"
  return "mock"
}
