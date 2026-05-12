import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db/supabase'
import { env } from '@/lib/env'

export async function GET(request: Request) {
  try {
    // Simple secret check
    const url = new URL(request.url)
    const secret = url.searchParams.get('secret')
    if (!secret || secret !== env.ADMIN_SECRET || !env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date().toISOString().slice(0, 10)

    const [
      { count: totalTrips },
      { count: completedTrips },
      { count: failedTrips },
      { count: todayTrips },
      avgDuration,
      { count: feedbackCount },
      { count: waitlistCount },
      events,
      betaList,
    ] = await Promise.all([
      supabaseAdmin.from('trips').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'completed').then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'failed').then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('trips').select('*', { count: 'exact', head: true }).gte('created_at', today).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('agent_runs').select('duration_ms').eq('status', 'completed').limit(50).then(({ data }) => {
        if (!data || data.length === 0) return 0
        const durations = data.map((d: { duration_ms: number }) => d.duration_ms).filter(Boolean)
        return Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
      }),
      supabaseAdmin.from('beta_feedback').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('waitlist_signups').select('*', { count: 'exact', head: true }).then(r => ({ count: r.count || 0 })),
      supabaseAdmin.from('product_events').select('event_name, created_at').order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('beta_feedback').select('rating, comment, created_at').order('created_at', { ascending: false }).limit(20),
    ])

    return NextResponse.json({
      totalTrips, completedTrips, failedTrips, todayTrips,
      avgAnalysisDurationMs: avgDuration,
      feedbackCount, waitlistCount,
      recentEvents: events?.data || [],
      recentFeedback: betaList?.data || [],
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '获取数据失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
