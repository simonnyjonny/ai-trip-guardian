import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, setAnalysisStage, saveRiskReport } from '@/lib/db/queries'
import { generateRiskReport } from '@/lib/ai/risk-report'
import type { Trip } from '@/types/trip'
import type { TransferPlan } from '@/lib/maps/types'
import { getTripWeatherForecast } from '@/lib/weather/client'
import { userError } from '@/lib/errors'
import { trackEvent } from '@/lib/analytics'
import { generateTransferPlans } from '@/lib/transfer/planner'
import { supabaseAdmin } from '@/lib/db/supabase'
import { v4 as uuidv4 } from 'uuid'

export const maxDuration = 60

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analysis/report'>,
) {
  const { tripId } = await ctx.params

  try {
    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    const items = await getItineraryItems(tripId)
    if (items.length === 0) return userError('must_parse_first')

    await setAnalysisStage(tripId, 'generating_report')

    // Fetch weather (non-blocking: failure → fallback to mock)
    let weatherSummary
    try {
      trackEvent({ tripId, eventName: 'weather_fetch_started' })
      weatherSummary = await getTripWeatherForecast({
        destination: trip.destination,
        startDate: trip.start_date || undefined,
        endDate: trip.end_date || undefined,
        tripRegion: trip.trip_region || 'auto',
      })
      trackEvent({ tripId, eventName: 'weather_fetch_completed', properties: { source: weatherSummary.forecastSource, reliability: weatherSummary.forecastReliability } })

      // Save weather snapshot
      await supabaseAdmin.from('trip_weather_snapshots').insert({
        id: uuidv4(),
        trip_id: tripId,
        destination: trip.destination,
        provider: weatherSummary.provider,
        forecast_source: weatherSummary.forecastSource,
        forecast_reliability: weatherSummary.forecastReliability,
        forecast: weatherSummary,
        created_at: new Date().toISOString(),
      }).then(() => {}, (e: Error) => console.error('[weather] Failed to save snapshot:', e.message))
    } catch (err) {
      console.warn('[weather] Fetch failed, using mock:', err instanceof Error ? err.message : String(err))
      trackEvent({ tripId, eventName: 'weather_fetch_failed' })
      const { generateMockWeather } = await import('@/lib/weather/mock-weather')
      weatherSummary = generateMockWeather(trip.destination)
    }

    // Generate transfer plans (non-blocking)
    let transferPlans: TransferPlan[] = []
    try {
      trackEvent({ tripId, eventName: 'transfer_plan_generated' })
      transferPlans = await generateTransferPlans({ trip: trip as Trip, items })
    } catch (err) {
      console.warn('[transfer] Failed:', err instanceof Error ? err.message : String(err))
      trackEvent({ tripId, eventName: 'transfer_plan_failed' })
      transferPlans = []
    }

    const parsed = {
      trip_title: trip.title || trip.destination,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      itinerary_items: items.map((i) => ({
        day_index: i.day_index, start_time: i.start_time, end_time: i.end_time,
        title: i.title, location_name: i.location_name, address: i.address,
        category: i.category, notes: i.notes,
      })),
      missing_info: [] as string[],
    }

    const reportResult = await generateRiskReport({
      tripId,
      tripProfile: {
        destination: trip.destination,
        startDate: trip.start_date || undefined,
        endDate: trip.end_date || undefined,
        travelerType: trip.traveler_type,
        pace: trip.pace,
        languageLevel: trip.language_level,
        specialNeeds: (trip.special_needs || []) as string[],
        tripRegion: trip.trip_region ?? 'auto',
        primaryTransport: trip.primary_transport ?? 'unknown',
      },
      parsedTrip: parsed,
      weatherSummary,
      transferPlans: transferPlans || [],
    })

    // Extract packing recommendations from AI output
    const packingRecs = reportResult.packing_recommendations ?? { clothing: [], footwear: [], rainGear: [], sunProtection: [], healthAndComfort: [], childOrElderlyNotes: [], destinationSpecificNotes: [] }

    // Build weather + packing for DB
    const weatherData = {
      forecastSource: weatherSummary.forecastSource,
      forecastReliability: weatherSummary.forecastReliability,
      daily: weatherSummary.daily,
      summary: weatherSummary.summary,
      limitations: weatherSummary.limitations,
    }

    await saveRiskReport(tripId, reportResult, reportResult, weatherData, packingRecs, transferPlans)
    await setAnalysisStage(tripId, 'completed')

    return NextResponse.json({ stage: 'completed', status: 'completed', weather: weatherData, packing: packingRecs, transferPlans })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    const userMsg = errMsg.includes('JSON') || errMsg.includes('Unexpected token')
      ? 'AI 返回格式异常。请点击重新分析。'
      : errMsg.includes('provider') || errMsg.includes('429') || errMsg.includes('500')
        ? 'AI 服务暂时不可用，请稍后重试。'
        : '报告生成失败，我们已记录问题。请稍后重试。'
    console.error('[report] Failed:', errMsg)
    await setAnalysisStage(tripId, 'failed', userMsg).catch(() => {})
    return NextResponse.json({ error: userMsg }, { status: 500 })
  }
}
