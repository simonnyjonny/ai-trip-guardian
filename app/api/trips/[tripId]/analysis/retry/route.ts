import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, setAnalysisStage } from '@/lib/db/queries'
import { userError } from '@/lib/errors'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analysis/retry'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    const stage = (trip as Record<string, unknown>).analysis_stage as string
    if (stage !== 'failed') {
      return NextResponse.json({ error: '当前状态无需重试' }, { status: 400 })
    }

    const items = await getItineraryItems(tripId)

    // Determine next step
    const nextStep = items.length === 0 ? 'parse' : 'report'

    // Clear error state
    await setAnalysisStage(tripId, 'queued')

    return NextResponse.json({
      retry: true,
      nextStep,
      message: '已准备重试。请从 ' + nextStep + ' 步骤开始。',
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '重试失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
