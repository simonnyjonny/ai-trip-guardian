function requiredPublicEnv(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`[env] Missing public env: ${key}`)
  return val
}

function requiredServerEnv(key: string): string {
  // Only check at runtime in server context
  if (typeof window !== 'undefined') return '' // client-side skip
  const val = process.env[key]
  if (!val) {
    console.error(`[env] Missing required server env: ${key}`)
    throw new Error('服务暂时未配置完成，请稍后再试。')
  }
  return val
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  AI_PROVIDER: process.env.AI_PROVIDER ?? 'deepseek',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY ?? '',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ADMIN_SECRET: process.env.ADMIN_SECRET ?? '',
  MAX_INPUT_LENGTH: 12000,
  MIN_INPUT_LENGTH: 10,
  MAX_ANALYSIS_ATTEMPTS: 3,
}

export function validateEnv(): { ok: boolean; missing: string[] } {
  const missing: string[] = []
  if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  if (env.AI_PROVIDER === 'deepseek' && !env.DEEPSEEK_API_KEY) missing.push('DEEPSEEK_API_KEY')
  if (env.AI_PROVIDER === 'openai' && !env.OPENAI_API_KEY) missing.push('OPENAI_API_KEY')
  if (missing.length > 0) {
    console.error('[env] Missing config:', missing.join(', '))
  }
  return { ok: missing.length === 0, missing }
}
