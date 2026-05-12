import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { trackEvent } from '@/lib/analytics'
import { v4 as uuidv4 } from 'uuid'

const VALID_RATINGS = ['very_useful', 'somewhat_useful', 'not_accurate', 'not_trustworthy']

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/trips/[tripId]/beta-feedback'>,
) {
  try {
    const { tripId } = await ctx.params
    const body = await request.json()

    if (!body.rating || !VALID_RATINGS.includes(body.rating)) {
      return NextResponse.json({ error: '请选择一个评价选项' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('beta_feedback').insert({
      id: uuidv4(),
      trip_id: tripId,
      rating: body.rating,
      comment: body.comment || null,
      email: body.email || null,
      created_at: new Date().toISOString(),
    })

    if (error) throw new Error(error.message)

    trackEvent({ tripId, eventName: 'feedback_submitted', properties: { rating: body.rating } })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '提交失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
