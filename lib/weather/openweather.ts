import type { TripWeatherSummary, DailyWeatherForecast } from "./types"

const API_KEY = process.env.OPENWEATHER_API_KEY
const BASE = "https://api.openweathermap.org/data/3.0"

export async function fetchOpenWeather(params: {
  destination: string
  startDate: string
  endDate: string
}): Promise<TripWeatherSummary> {
  if (!API_KEY) throw new Error("OPENWEATHER_API_KEY not configured")

  // Use the free One Call API with geocoding
  // Step 1: Geocode destination
  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(params.destination)}&limit=1&appid=${API_KEY}`
  const geoRes = await fetch(geoUrl)
  if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.status}`)
  const geoData: Array<{ lat: number; lon: number; name: string }> = await geoRes.json()
  if (!geoData.length) throw new Error("Destination not found")

  const { lat, lon } = geoData[0]

  // Step 2: Fetch 16-day forecast (free tier gives up to daily for 16 days)
  const forecastUrl = `${BASE}/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&units=metric&appid=${API_KEY}`
  const fcRes = await fetch(forecastUrl)
  if (!fcRes.ok) throw new Error(`Forecast fetch failed: ${fcRes.status}`)

  const fcData: { daily: Array<{ dt: number; temp: { min: number; max: number }; weather: Array<{ description: string }>; pop?: number; humidity?: number; wind_speed?: number }> } = await fcRes.json()

  const end = new Date(params.endDate)
  const daily: DailyWeatherForecast[] = fcData.daily
    .filter((d) => {
      const date = new Date(d.dt * 1000)
      return date >= new Date(params.startDate) && date <= end
    })
    .map((d) => ({
      date: new Date(d.dt * 1000).toISOString().slice(0, 10),
      minTempC: Math.round(d.temp.min),
      maxTempC: Math.round(d.temp.max),
      condition: d.weather[0]?.description || "unknown",
      precipitationProbability: d.pop ? Math.round(d.pop * 100) : undefined,
      humidity: d.humidity,
      windSpeedKph: d.wind_speed ? Math.round(d.wind_speed * 3.6) : undefined,
    }))

  const reliability = end.getTime() - Date.now() > 10 * 86400000 ? "medium"
    : end.getTime() - Date.now() > 14 * 86400000 ? "low" : "high"

  return {
    destination: params.destination,
    forecastSource: "openweather",
    forecastReliability: reliability,
    daily,
    summary: `${params.destination} 预报：${daily[0]?.condition || "未知"}，最高 ${daily[0]?.maxTempC ?? "?"}°C，最低 ${daily[0]?.minTempC ?? "?"}°C。`,
    limitations: [],
  }
}
