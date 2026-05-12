import { NextResponse } from 'next/server'
import { getTrip, updateTripStatus, saveItineraryItems, saveRiskReport } from '@/lib/db/queries'
import { parseTripInput } from '@/lib/ai/parse-trip'
import { generateRiskReport } from '@/lib/ai/risk-report'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analyze'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    if (!trip.raw_input || trip.raw_input.trim().length < 10) {
      return NextResponse.json(
        { error: '行程文本过短，请提供更详细的行程描述（至少包含几天的主要活动）。' },
        { status: 400 },
      )
    }

    await updateTripStatus(tripId, 'analyzing')

    // Step 1: Parse trip input
    const parsed = await parseTripInput({
      tripId,
      rawInput: trip.raw_input,
      destination: trip.destination,
      startDate: trip.start_date || undefined,
      endDate: trip.end_date || undefined,
      travelerType: trip.traveler_type,
      pace: trip.pace,
      languageLevel: trip.language_level,
      specialNeeds: (trip.special_needs || []) as string[],
    })

    // Step 2: Save itinerary items
    const items = await saveItineraryItems(tripId, parsed.itinerary_items.map((item) => ({
      day_index: item.day_index,
      start_time: item.start_time,
      end_time: item.end_time,
      title: item.title,
      location_name: item.location_name,
      address: item.address,
      category: item.category,
      notes: item.notes,
    })))

    // Step 3: Generate risk report
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

    // Step 4: Save risk report
    const report = await saveRiskReport(tripId, reportResult, reportResult)

    // Step 5: Update status
    await updateTripStatus(tripId, 'completed')

    return NextResponse.json({
      trip: { ...trip, status: 'completed' },
      items,
      report,
    })
  } catch (error: unknown) {
    const { tripId } = await ctx.params
    const message = error instanceof Error ? error.message : '分析失败'
    console.error(`Analysis failed for trip ${tripId}:`, message)
    await updateTripStatus(tripId, 'failed').catch(() => {})
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
