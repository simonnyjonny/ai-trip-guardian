/**
 * Unified server logger with automatic redaction.
 */

const REDACT_PATTERNS = [
  [/sk-[a-zA-Z0-9]{20,}/g, '[REDACTED_KEY]'],
  [/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, '[REDACTED_JWT]'],
]

function redact(msg: string): string {
  let r = msg
  for (const [p, replacement] of REDACT_PATTERNS) {
    r = r.replace(p, replacement as string)
  }
  return r
}

function fmtMeta(meta?: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return ''
  const safe = { ...meta }
  for (const k of ['rawInput', 'raw_input', 'apiKey', 'key', 'token', 'password']) {
    delete safe[k]
  }
  return ' ' + JSON.stringify(safe)
}

export const logger = {
  info(msg: string, meta?: Record<string, unknown>) {
    console.log(`[INFO] ${redact(msg)}${fmtMeta(meta)}`)
  },
  warn(msg: string, meta?: Record<string, unknown>) {
    console.warn(`[WARN] ${redact(msg)}${fmtMeta(meta)}`)
  },
  error(msg: string, meta?: Record<string, unknown>) {
    console.error(`[ERROR] ${redact(msg)}${fmtMeta(meta)}`)
  },
}
