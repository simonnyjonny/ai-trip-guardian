import { aiRequest } from './client'
import { parsedTripInputSchema, type ParsedTripInputSchema } from './schemas'
import { parseTripSystemPrompt } from './prompts'
import { logAgentRun } from '@/lib/db/queries'
import { sanitizedAgentInput } from '@/lib/privacy/redact'

interface ParseTripInputParams {
  tripId: string
  rawInput: string
  destination: string
  startDate?: string
  endDate?: string
  travelerType: string
  pace: string
  languageLevel: string
  specialNeeds: string[]
}

const PROVIDER = process.env.AI_PROVIDER || 'openai'
const MODEL = PROVIDER === 'deepseek' ? (process.env.DEEPSEEK_MODEL || 'deepseek-chat') : (process.env.OPENAI_MODEL || 'gpt-4o')

export async function parseTripInput(input: ParseTripInputParams): Promise<ParsedTripInputSchema> {
  const startTime = Date.now()
  const sanitized = sanitizedAgentInput(input)

  const userPrompt = `
Destination: ${input.destination}
Travel dates: ${input.startDate || 'unknown'} to ${input.endDate || 'unknown'}
Traveler type: ${input.travelerType}
Pace: ${input.pace}
Language level: ${input.languageLevel}
Special needs: ${input.specialNeeds.join(', ') || 'none'}

Here is the user's itinerary text to parse:

${input.rawInput}`

  try {
    const result = await aiRequest<ParsedTripInputSchema>({
      systemPrompt: parseTripSystemPrompt,
      userPrompt,
      temperature: 0.1,
    })

    const parsed = parsedTripInputSchema.safeParse(result)
    if (parsed.success) {
      await logAgentRun({
        tripId: input.tripId,
        agentType: 'parseTripInput',
        input: sanitized,
        output: result,
        status: 'completed',
        durationMs: Date.now() - startTime,
        model: MODEL,
        provider: PROVIDER,
      })
      return parsed.data
    }

    console.warn('First parse attempt failed, retrying...')
    const retryResult = await aiRequest<ParsedTripInputSchema>({
      systemPrompt: parseTripSystemPrompt + '\n\nYour previous output had a format error. Return valid JSON only.',
      userPrompt,
      temperature: 0,
    })

    const retryParsed = parsedTripInputSchema.safeParse(retryResult)
    if (retryParsed.success) {
      await logAgentRun({
        tripId: input.tripId,
        agentType: 'parseTripInput',
        input: sanitized,
        output: retryResult,
        status: 'completed',
        durationMs: Date.now() - startTime,
        model: MODEL,
        provider: PROVIDER,
      })
      return retryParsed.data
    }

    await logAgentRun({
      tripId: input.tripId,
      agentType: 'parseTripInput',
      input: sanitized,
      output: retryResult,
      status: 'failed',
      errorMessage: retryParsed.error.message,
      durationMs: Date.now() - startTime,
      model: MODEL,
      provider: PROVIDER,
    })
    throw new Error(`无法解析行程数据，请检查输入格式是否完整。建议：确保每天有明确的"Day N"标注和至少一个活动。`)
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('无法解析行程数据')) throw error
    await logAgentRun({
      tripId: input.tripId,
      agentType: 'parseTripInput',
      input: sanitized,
      output: {},
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
      model: MODEL,
      provider: PROVIDER,
    })
    throw new Error('分析失败，请稍后重试。')
  }
}
