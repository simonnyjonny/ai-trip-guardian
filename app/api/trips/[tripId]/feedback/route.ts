import { NextRequest, NextResponse } from 'next/server'
import { saveFeedback } from '@/lib/db/queries'

const VALID_TYPES = ['useful', 'inaccurate', 'adopted', 'not_relevant']

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/trips/[tripId]/feedback'>,
) {
  try {
    const { tripId } = await ctx.params
    const body = await request.json()

    if (!body.riskReportId) {
      return NextResponse.json({ error: '缺少 riskReportId' }, { status: 400 })
    }
    if (!body.feedbackType || !VALID_TYPES.includes(body.feedbackType)) {
      return NextResponse.json({ error: '无效的 feedbackType，只允许: ' + VALID_TYPES.join(', ') }, { status: 400 })
    }

    await saveFeedback({
      trip_id: tripId,
      risk_report_id: body.riskReportId,
      risk_key: body.riskKey || null,
      feedback_type: body.feedbackType,
      comment: body.comment || null,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '保存反馈失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
