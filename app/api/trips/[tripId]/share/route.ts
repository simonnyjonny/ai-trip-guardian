import { NextResponse } from 'next/server'
import { getRiskReport, createShare } from '@/lib/db/queries'

export async function POST(
  _request: Request,
  ctx: RouteContext<'/api/trips/[tripId]/share'>,
) {
  try {
    const { tripId } = await ctx.params
    const report = await getRiskReport(tripId)
    if (!report) {
      return NextResponse.json({ error: '报告不存在，请先完成分析' }, { status: 404 })
    }

    const share = await createShare(tripId, (report as { id: string }).id)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    return NextResponse.json({
      shareToken: share.share_token,
      shareUrl: `${appUrl}/share/${share.share_token}`,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '创建分享失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
