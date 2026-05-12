import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, setAnalysisStage, saveItineraryItems, hashInput } from '@/lib/db/queries'
import { parseTripInput } from '@/lib/ai/parse-trip'
import { generateDraftItinerary } from '@/lib/ai/generate-draft-itinerary'
import { convertGeneratedItineraryToItems } from '@/lib/itinerary/convert-generated'
import { supabaseAdmin } from '@/lib/db/supabase'
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

    const isWishMode = ((trip as Record<string, unknown>).input_mode as string) === 'wish'
    let parsedItems: Array<{ day_index: number; start_time: string | null; end_time: string | null; title: string; location_name: string | null; address: string | null; category: string; notes: string | null }> = []

    if (isWishMode) {
      const wishInput = ((trip as Record<string, unknown>).wish_input || {}) as Record<string, unknown>
      const draft = await generateDraftItinerary({
        destination: (wishInput.destination as string) || trip.destination,
        travelers: wishInput.travelers as string || undefined,
        pace: wishInput.pace as string || trip.pace,
        durationDays: wishInput.durationDays as number || undefined,
        travelStyles: (wishInput.travelStyles as string[]) || [],
        mustVisitPlaces: (wishInput.mustVisitPlaces as string[]) || [],
        optionalPlaces: (wishInput.optionalPlaces as string[]) || [],
        thingsToDo: (wishInput.thingsToDo as string[]) || [],
        avoid: (wishInput.avoid as string[]) || [],
        specialNeeds: (wishInput.specialNeeds as string[]) || (trip.special_needs || []) as string[],
        tripRegion: wishInput.tripRegion as string || trip.trip_region,
      })

      // Save generated itinerary
      await supabaseAdmin.from('trips').update({ generated_itinerary: draft }).eq('id', tripId).then(() => {}, () => {})

      parsedItems = convertGeneratedItineraryToItems(draft)
    } else {
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
      parsedItems = parsed.itinerary_items.map((item) => ({
        day_index: item.day_index, start_time: item.start_time, end_time: item.end_time,
        title: item.title, location_name: item.location_name, address: item.address || null,
        category: item.category, notes: item.notes,
      }))
    }

    const items = await saveItineraryItems(tripId, parsedItems)

    await setAnalysisStage(tripId, 'parsed')

    return NextResponse.json({ stage: 'parsed', items })
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error)
    // Never expose raw AI/JSON errors to users
    const userMsg = errMsg.includes('JSON') || errMsg.includes('Unexpected token') || errMsg.includes('not valid')
      ? 'AI 没能完整识别这份行程。请点击重新分析，系统将尝试基础解析。'
      : errMsg.includes('provider') || errMsg.includes('429') || errMsg.includes('500') || errMsg.includes('fetch')
        ? 'AI 服务暂时不可用。请稍后重试。'
        : 'AI 暂时没能完成分析，请稍后重试。'
    console.error('[parse] Failed:', errMsg)
    await setAnalysisStage(tripId, 'failed', userMsg).catch(() => {})
    return NextResponse.json({ error: userMsg }, { status: 500 })
  }
}
