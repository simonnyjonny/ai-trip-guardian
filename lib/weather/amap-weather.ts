import type { TripWeatherSummary, DailyWeatherForecast } from "./types"

const API_KEY = process.env.AMAP_API_KEY

export async function fetchAmapWeather(params: {
  destination: string
  startDate: string
  endDate: string
}): Promise<TripWeatherSummary> {
  if (!API_KEY) throw new Error("AMAP_API_KEY not configured")

  // Step 1: Geocode destination
  const geoUrl = `https://restapi.amap.com/v3/geocode/geo?key=${API_KEY}&address=${encodeURIComponent(params.destination)}`
  const geoRes = await fetch(geoUrl)
  if (!geoRes.ok) throw new Error(`Amap geocoding failed: ${geoRes.status}`)
  const geoData: { geocodes: Array<{ adcode: string; city: string }> } = await geoRes.json()
  if (!geoData.geocodes?.length) throw new Error("Destination not found")

  const adcode = geoData.geocodes[0].adcode

  // Step 2: Fetch weather forecast
  const ext = "all"
  const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${API_KEY}&city=${adcode}&extensions=${ext}`
  const wRes = await fetch(weatherUrl)
  if (!wRes.ok) throw new Error(`Amap weather fetch failed: ${wRes.status}`)

  const wData: {
    forecasts: Array<{
      city: string
      casts: Array<{
        date: string
        dayweather: string
        nightweather: string
        daytemp: string
        nighttemp: string
        daywind: string
        nightwind: string
      }>
    }>
  } = await wRes.json()

  if (!wData.forecasts?.length) throw new Error("No weather data")

  const end = new Date(params.endDate)
  const daily: DailyWeatherForecast[] = wData.forecasts[0].casts
    .filter((d) => new Date(d.date) >= new Date(params.startDate) && new Date(d.date) <= end)
    .map((d) => ({
      date: d.date,
      minTempC: parseInt(d.nighttemp),
      maxTempC: parseInt(d.daytemp),
      condition: d.dayweather,
      windSpeedKph: undefined,
    }))

  const reliability = end.getTime() - Date.now() > 3 * 86400000 ? "medium" : "high"

  return {
    destination: params.destination,
    provider: "amap",
    forecastSource: "amap",
    forecastReliability: reliability,
    daily,
    summary: `${params.destination} 预报：${daily[0]?.condition || "未知"}，最高 ${daily[0]?.maxTempC ?? "?"}°C，最低 ${daily[0]?.minTempC ?? "?"}°C。`,
    limitations: daily.length < 4 ? ["高德天气仅提供未来 4 天预报。"] : [],
  }
}
