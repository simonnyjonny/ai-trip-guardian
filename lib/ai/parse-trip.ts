import { aiRequest } from './client'
import { parsedTripInputSchema, type ParsedTripInputSchema } from './schemas'
import { parseTripSystemPrompt } from './prompts'
import { logAgentRun } from '@/lib/db/queries'
import { sanitizedAgentInput } from '@/lib/privacy/redact'
import { fallbackParse } from '@/lib/itinerary/fallback-parser'

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

const REPAIR_PROMPT = `Your previous output failed JSON schema validation.
Return ONLY valid JSON matching the exact schema below.
Do NOT add markdown, explanations, or code fences.
Use null for missing fields. Use [] for empty arrays.
Preserve as much information as possible.`

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

  // Attempt 1: Normal parse
  try {
    const result = await aiRequest<ParsedTripInputSchema>({
      systemPrompt: parseTripSystemPrompt,
      userPrompt,
      temperature: 0.1,
    })

    const parsed = parsedTripInputSchema.safeParse(result)
    if (parsed.success) {
      await logAgentRun({ tripId: input.tripId, agentType: 'parseTripInput', input: sanitized, output: result, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return parsed.data
    }

    // Attempt 2: Retry with strict instructions
    console.warn('[parse] First attempt failed, retrying...')
    const retryResult = await aiRequest<ParsedTripInputSchema>({
      systemPrompt: parseTripSystemPrompt + '\n\nYour previous output had a format error. Return valid JSON only. No markdown.',
      userPrompt,
      temperature: 0,
    })

    const retryParsed = parsedTripInputSchema.safeParse(retryResult)
    if (retryParsed.success) {
      await logAgentRun({ tripId: input.tripId, agentType: 'parseTripInput', input: sanitized, output: retryResult, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return retryParsed.data
    }

    // Attempt 3: Repair prompt
    console.warn('[parse] Retry failed, attempting repair...')
    const repairResult = await aiRequest<ParsedTripInputSchema>({
      systemPrompt: REPAIR_PROMPT + '\n\n' + parseTripSystemPrompt,
      userPrompt: `Fix this JSON to match the schema. Previous output had errors: ${retryParsed.error.message.slice(0, 300)}\n\nOriginal text: ${input.rawInput.slice(0, 2000)}`,
      temperature: 0,
    })

    const repairParsed = parsedTripInputSchema.safeParse(repairResult)
    if (repairParsed.success) {
      await logAgentRun({ tripId: input.tripId, agentType: 'parseTripInput', input: sanitized, output: repairResult, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return repairParsed.data
    }

    // Fallback: Rule-based parser
    console.warn('[parse] All AI attempts failed, using fallback parser...')
    const fallbackItems = fallbackParse(input.rawInput)
    if (fallbackItems.length > 0) {
      const fallbackResult: ParsedTripInputSchema = {
        trip_title: `${input.destination} 行程`,
        destination: input.destination,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        itinerary_items: fallbackItems,
        missing_info: ['AI 未能完整解析，使用规则解析器生成基础行程。建议重新提交更清晰的行程文本。'],
      }
      await logAgentRun({ tripId: input.tripId, agentType: 'parseTripInput', input: sanitized, output: fallbackResult, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return fallbackResult
    }

    throw new Error('无法解析行程数据，请检查输入格式是否完整。建议：确保每天有明确的"Day N"标注和至少一个活动。')
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('无法解析行程数据')) throw error
    await logAgentRun({ tripId: input.tripId, agentType: 'parseTripInput', input: sanitized, output: {}, status: 'failed', errorMessage: error instanceof Error ? error.message : 'Unknown error', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
    throw new Error('分析失败，请稍后重试。')
  }
}
