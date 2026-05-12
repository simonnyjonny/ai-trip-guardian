/**
 * Simple in-memory IP rate limiter.
 * For production, migrate to Upstash Redis or Supabase-backed store.
 */

const store = new Map<string, { count: number; resetAt: number }>()

// Cleanup every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k)
  }
}, 300_000)

export function checkRateLimit(
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number = 3_600_000,
): { allowed: boolean; remaining: number } {
  const key = `${ip}:${endpoint}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

export function getClientIP(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
}

export const RATE_LIMITS: Record<string, number> = {
  'trips:create': 20,
  'analysis:start': 20,
  'analysis:parse': 10,
  'analysis:report': 10,
  'share:create': 30,
  'feedback:submit': 100,
}
