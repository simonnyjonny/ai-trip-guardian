import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email || '').trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: '请输入有效的邮箱地址。' }, { status: 400 })
    }

    // Check for existing — but don't expose existence
    const { data: existing } = await supabaseAdmin
      .from('waitlist_signups').select('id').eq('email', email).maybeSingle()

    if (!existing) {
      await supabaseAdmin.from('waitlist_signups').insert({
        id: uuidv4(),
        email,
        source: body.source || null,
        travel_interest: body.travelInterest || null,
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '提交失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
