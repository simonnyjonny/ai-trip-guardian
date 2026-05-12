/**
 * Product analytics — fire-and-forget, never blocks the main flow.
 * Does NOT store raw_input, full AI output, or PII.
 */

import { supabaseAdmin } from '@/lib/db/supabase'

interface TrackParams {
  tripId?: string
  eventName: string
  properties?: Record<string, unknown>
  request?: Request
}

function hashIP(ip: string): string {
  let h = 0
  for (let i = 0; i < ip.length; i++) {
    h = ((h << 5) - h) + ip.charCodeAt(i)
    h |= 0
  }
  return h.toString(36)
}

export async function trackEvent({ tripId, eventName, properties, request }: TrackParams): Promise<void> {
  try {
    const safeProps: Record<string, unknown> = { ...(properties || {}) }
    // Strip any potentially sensitive keys
    for (const k of ['rawInput', 'raw_input', 'text', 'content', 'email', 'phone']) {
      delete safeProps[k]
    }

    await supabaseAdmin.from('product_events').insert({
      id: crypto.randomUUID(),
      trip_id: tripId || null,
      event_name: eventName,
      event_properties: safeProps,
      ip_hash: request ? hashIP(request.headers.get('x-forwarded-for') || '') : null,
      user_agent: request?.headers.get('user-agent')?.slice(0, 200) || null,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // Never block the main flow
    console.error('[analytics] Failed to track', eventName, err instanceof Error ? err.message : String(err))
  }
}
