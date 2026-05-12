import { NextResponse } from 'next/server'
import { getShareByToken, getTrip, getRiskReport } from '@/lib/db/queries'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/share/[token]'>,
) {
  try {
    const { token } = await ctx.params
    const share = await getShareByToken(token)
    if (!share) {
      return NextResponse.json({ error: '分享链接不存在或已失效' }, { status: 404 })
    }

    const [trip, report] = await Promise.all([
      getTrip(share.trip_id),
      getRiskReport(share.trip_id),
    ])

    if (!trip || !report) {
      return NextResponse.json({ error: '报告数据不完整' }, { status: 404 })
    }

    // Only expose safe fields (no raw_input, no agent_runs)
    return NextResponse.json({
      trip: {
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
      },
      report: {
        overall_score: report.overall_score,
        overall_level: report.overall_level,
        summary: report.summary,
        dimension_scores: report.dimension_scores ?? {},
        top_risks: report.top_risks,
        optimized_itinerary: report.optimized_itinerary ?? [],
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取分享失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
