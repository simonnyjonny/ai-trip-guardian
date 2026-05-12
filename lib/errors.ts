import { NextResponse } from 'next/server'

const USER_ERRORS: Record<string, string> = {
  analysis_failed: '分析失败，请稍后重试。',
  ai_format_unstable: 'AI 返回格式不稳定，请重新分析。',
  input_too_short: '行程文本过短，请补充航班、酒店或每日安排。',
  trip_not_found: '行程不存在。',
  report_not_found: '报告不存在，请先完成分析。',
  must_parse_first: '请先完成行程解析。',
  share_expired: '分享链接已过期。',
  share_not_found: '分享链接不存在。',
  invalid_feedback: '无效的反馈类型。',
  file_too_large: '文件大小超过限制。',
  unsupported_file: '不支持的文件类型。',
  internal: '服务器内部错误，请稍后重试。',
}

export function jsonError(message: string, status = 400, code?: string) {
  const body: Record<string, unknown> = { error: message }
  if (code) body.code = code
  return NextResponse.json(body, { status })
}

export function userError(code: string, status = 400) {
  const message = USER_ERRORS[code] || USER_ERRORS.internal
  return NextResponse.json({ error: message, code }, { status })
}

export function serverLog(context: string, error: unknown, meta?: Record<string, unknown>) {
  const msg = error instanceof Error ? error.message : String(error)
  // Redact any sensitive data that might have leaked into error messages
  const clean = msg.replace(/(sk-[a-zA-Z0-9]{20,})/g, '[REDACTED_KEY]')
  console.error(`[${context}]`, clean, meta ? JSON.stringify(meta) : '')
}
