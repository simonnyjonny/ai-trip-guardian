import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, getRiskReport } from '@/lib/db/queries'
import { userError } from '@/lib/errors'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analysis/status'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    const items = await getItineraryItems(tripId)
    const report = await getRiskReport(tripId)

    return NextResponse.json({
      tripId,
      status: trip.status,
      stage: (trip as Record<string, unknown>).analysis_stage || 'not_started',
      error: (trip as Record<string, unknown>).analysis_error || null,
      startedAt: (trip as Record<string, unknown>).analysis_started_at || null,
      completedAt: (trip as Record<string, unknown>).analysis_completed_at || null,
      attemptCount: (trip as Record<string, unknown>).analysis_attempt_count || 0,
      hasItineraryItems: items.length > 0,
      hasRiskReport: !!report,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取状态失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
