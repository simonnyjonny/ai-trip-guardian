import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "ai-trip-guardian",
    region: process.env.DEPLOYMENT_REGION || "global",
    timestamp: new Date().toISOString(),
    providers: {
      ai: process.env.AI_PROVIDER || "deepseek",
      weather: process.env.WEATHER_PROVIDER || "auto",
      maps: process.env.MAP_PROVIDER || "not_configured",
    },
  })
}
