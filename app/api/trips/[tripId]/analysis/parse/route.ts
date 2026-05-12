import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, setAnalysisStage, saveItineraryItems, hashInput } from '@/lib/db/queries'
import { parseTripInput } from '@/lib/ai/parse-trip'
import { userError } from '@/lib/errors'
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { trackEvent } from '@/lib/analytics'
import { env } from '@/lib/env'

export const maxDuration = 60

export async function POST(
  request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analysis/parse'>,
) {
  const { tripId } = await ctx.params

  try {
    // Rate limit
    const ip = getClientIP(request)
    const rl = checkRateLimit(ip, 'analysis:parse', RATE_LIMITS['analysis:parse'])
    if (!rl.allowed) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试。', code: 'RATE_LIMITED' }, { status: 429 })
    }

    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    if ((trip.raw_input || '').length > env.MAX_INPUT_LENGTH) {
      return NextResponse.json({ error: '行程内容过长，请先精简到航班、酒店、每日安排和重要预约。' }, { status: 400 })
    }

    const attempts = trip.analysis_attempt_count || 0
    if (attempts >= env.MAX_ANALYSIS_ATTEMPTS) {
      return NextResponse.json({ error: '本次行程已达到重新分析次数上限，请创建新的行程。' }, { status: 400 })
    }

    if (trip.last_analyzed_input_hash === hashInput(trip.raw_input || '')) {
      const existing = await getItineraryItems(tripId)
      if (existing.length > 0) {
        return NextResponse.json({ stage: 'parsed', items: existing, reused: true })
      }
    }

    await setAnalysisStage(tripId, 'parsing')

    const parsed = await parseTripInput({
      tripId,
      rawInput: trip.raw_input || '',
      destination: trip.destination,
      startDate: trip.start_date || undefined,
      endDate: trip.end_date || undefined,
      travelerType: trip.traveler_type,
      pace: trip.pace,
      languageLevel: trip.language_level,
      specialNeeds: (trip.special_needs || []) as string[],
    })

    const items = await saveItineraryItems(tripId, parsed.itinerary_items.map((item) => ({
      day_index: item.day_index, start_time: item.start_time, end_time: item.end_time,
      title: item.title, location_name: item.location_name, address: item.address,
      category: item.category, notes: item.notes,
    })))

    await setAnalysisStage(tripId, 'parsed')

    return NextResponse.json({ stage: 'parsed', items })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '分析失败'
    await setAnalysisStage(tripId, 'failed', message).catch(() => {})
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
