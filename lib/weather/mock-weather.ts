import type { TripWeatherSummary } from "./types"

const SEASONAL_PROFILES: Record<string, Record<string, { condition: string; minT: number; maxT: number; precip: number; humidity: number }>> = {
  tokyo: {
    "01": { condition: "晴冷", minT: 0, maxT: 9, precip: 15, humidity: 50 },
    "04": { condition: "温暖", minT: 10, maxT: 20, precip: 35, humidity: 60 },
    "07": { condition: "炎热潮湿", minT: 23, maxT: 32, precip: 45, humidity: 75 },
    "10": { condition: "凉爽舒适", minT: 14, maxT: 22, precip: 40, humidity: 65 },
  },
  paris: {
    "01": { condition: "寒冷", minT: 1, maxT: 7, precip: 30, humidity: 80 },
    "05": { condition: "温和", minT: 8, maxT: 18, precip: 35, humidity: 65 },
    "07": { condition: "温暖", minT: 15, maxT: 25, precip: 30, humidity: 60 },
    "10": { condition: "凉爽", minT: 8, maxT: 16, precip: 40, humidity: 75 },
  },
  "los angeles": {
    "01": { condition: "温和", minT: 9, maxT: 20, precip: 15, humidity: 55 },
    "08": { condition: "炎热干燥", minT: 18, maxT: 30, precip: 5, humidity: 50 },
  },
  default: {
    "01": { condition: "寒冷", minT: -5, maxT: 5, precip: 25, humidity: 70 },
    "04": { condition: "温和", minT: 5, maxT: 18, precip: 30, humidity: 60 },
    "07": { condition: "炎热", minT: 18, maxT: 32, precip: 25, humidity: 65 },
    "10": { condition: "凉爽", minT: 5, maxT: 18, precip: 30, humidity: 70 },
  },
}

function getSeasonalProfile(dest: string, month: string) {
  const lower = dest.toLowerCase()
  const profiles = SEASONAL_PROFILES[lower] || SEASONAL_PROFILES.default
  const season = month < "04" ? "01" : month < "07" ? "04" : month < "10" ? "07" : "10"
  return profiles[season] || SEASONAL_PROFILES.default["01"]
}

export function generateMockWeather(dest: string, startDate?: string, endDate?: string): TripWeatherSummary {
  const start = startDate ? new Date(startDate) : new Date()
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 5 * 86400000)

  const forecastReliability = end.getTime() - Date.now() > 14 * 86400000 ? "low" : "medium"
  const days: Array<{ date: string; minT: number; maxT: number; condition: string; precip: number; humidity: number }> = []

  const d = new Date(start)
  while (d <= end) {
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const profile = getSeasonalProfile(dest, month)
    const variation = Math.round((Math.random() - 0.5) * 4)
    days.push({
      date: d.toISOString().slice(0, 10),
      minT: profile.minT + variation,
      maxT: profile.maxT + variation,
      condition: profile.condition,
      precip: profile.precip + Math.round((Math.random() - 0.5) * 20),
      humidity: profile.humidity,
    })
    d.setDate(d.getDate() + 1)
  }

  return {
    destination: dest,
    provider: "mock",
    forecastSource: "mock",
    forecastReliability,
    daily: days.map((d) => ({
      date: d.date,
      minTempC: d.minT,
      maxTempC: d.maxT,
      condition: d.condition,
      precipitationProbability: d.precip,
      humidity: d.humidity,
    })),
    summary: `${dest}预计${days[0]?.condition}，最高温${days[0]?.maxT}°C，最低温${days[0]?.minT}°C。`,
    limitations: ["当前使用模拟天气数据。请以当地官方天气预报为准。"],
  }
}
