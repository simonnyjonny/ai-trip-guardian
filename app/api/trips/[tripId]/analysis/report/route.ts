import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, setAnalysisStage, saveRiskReport } from '@/lib/db/queries'
import { generateRiskReport } from '@/lib/ai/risk-report'
import { userError } from '@/lib/errors'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { trackEvent } from '@/lib/analytics'

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
      },
      parsedTrip: parsed,
    })

    const report = await saveRiskReport(tripId, reportResult, reportResult)
    await setAnalysisStage(tripId, 'completed')

    return NextResponse.json({ stage: 'completed', status: 'completed', report })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '分析失败'
    await setAnalysisStage(tripId, 'failed', message).catch(() => {})
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
