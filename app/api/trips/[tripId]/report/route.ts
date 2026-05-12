import { NextResponse } from 'next/server'
import { getTrip, getItineraryItems, getRiskReport } from '@/lib/db/queries'

export async function GET(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/report'>,
) {
  try {
    const { tripId } = await ctx.params
    const trip = await getTrip(tripId)
    if (!trip) {
      return NextResponse.json({ error: '行程不存在' }, { status: 404 })
    }

    const [items, report] = await Promise.all([
      getItineraryItems(tripId),
      getRiskReport(tripId),
    ])

    if (!report) {
      return NextResponse.json({ error: '报告不存在，请先完成分析' }, { status: 404 })
    }

    return NextResponse.json({ trip, items, report })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取报告失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
