import type { TripWeatherSummary } from "./types"
import { generateMockWeather } from "./mock-weather"

const WEATHER_PROVIDER = process.env.WEATHER_PROVIDER || "mock"

export async function getTripWeatherForecast(params: {
  destination: string
  startDate?: string
  endDate?: string
}): Promise<TripWeatherSummary> {
  const { destination, startDate, endDate } = params

  // No dates → fallback to seasonal mock
  if (!startDate || !endDate) {
    const mock = generateMockWeather(destination, undefined, undefined)
    return { ...mock, forecastSource: "seasonal" as const, forecastReliability: "low", limitations: ["出行日期未提供，使用目的地季节性气候建议。"] }
  }

  // Check if OpenWeather is configured
  if (WEATHER_PROVIDER === "openweather") {
    try {
      const { fetchOpenWeather } = await import("./openweather")
      return await fetchOpenWeather({ destination, startDate, endDate })
    } catch (err) {
      console.warn("[weather] OpenWeather fetch failed, falling back to mock:", err instanceof Error ? err.message : String(err))
      return { ...generateMockWeather(destination, startDate, endDate), limitations: ["实时天气数据暂不可用，当前为季节性模拟数据。"] }
    }
  }

  // Default: mock weather
  return generateMockWeather(destination, startDate, endDate)
}
