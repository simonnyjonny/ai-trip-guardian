import { NextResponse } from 'next/server'
import { getTrip, startAnalysis, hashInput } from '@/lib/db/queries'
import { userError } from '@/lib/errors'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/analysis/start'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) return userError('trip_not_found', 404)

    if (!trip.raw_input || trip.raw_input.trim().length < 10) {
      return userError('input_too_short')
    }

    const inputHash = hashInput(trip.raw_input)

    // Already completed with same input — skip
    if (trip.status === 'completed' && trip.last_analyzed_input_hash === inputHash) {
      return NextResponse.json({ stage: 'completed', status: 'completed', skipped: true })
    }

    // Currently in progress — don't restart
    if (trip.analysis_stage === 'parsing' || trip.analysis_stage === 'generating_report') {
      return NextResponse.json({ stage: trip.analysis_stage, status: trip.status, alreadyRunning: true })
    }

    await startAnalysis(tripId, inputHash)

    return NextResponse.json({ stage: 'queued', status: 'analyzing' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '启动分析失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
