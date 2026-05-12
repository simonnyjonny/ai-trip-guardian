import { aiRequest } from './client'
import { riskReportSchema, type RiskReportSchema, type ParsedTripInputSchema } from './schemas'
import { riskReportSystemPrompt } from './prompts'
import { logAgentRun } from '@/lib/db/queries'
import { sanitizedAgentInput } from '@/lib/privacy/redact'

interface GenerateRiskReportParams {
  tripId: string
  tripProfile: {
    destination: string
    startDate?: string
    endDate?: string
    travelerType: string
    pace: string
    languageLevel: string
    specialNeeds: string[]
  }
  parsedTrip: ParsedTripInputSchema
  weatherSummary?: {
    forecastSource: string
    forecastReliability: string
    daily: Array<{ date: string; minTempC?: number; maxTempC?: number; condition: string; precipitationProbability?: number; windSpeedKph?: number; humidity?: number }>
    summary: string
    limitations: string[]
  }
}

const PROVIDER = process.env.AI_PROVIDER || 'openai'
const MODEL = PROVIDER === 'deepseek' ? (process.env.DEEPSEEK_MODEL || 'deepseek-chat') : (process.env.OPENAI_MODEL || 'gpt-4o')

const travelerLabels: Record<string, string> = {
  solo: '独自旅行', couple: '情侣/夫妻', friends: '朋友结伴', family: '家庭出行',
  with_children: '亲子（带孩子）', with_parents: '带父母', business: '商务出行', other: '其他',
}

export async function generateRiskReport(input: GenerateRiskReportParams): Promise<RiskReportSchema> {
  const startTime = Date.now()
  const { tripProfile, parsedTrip } = input
  const sanitized = sanitizedAgentInput({
    destination: tripProfile.destination,
    travelerType: tripProfile.travelerType,
    pace: tripProfile.pace,
    languageLevel: tripProfile.languageLevel,
    specialNeeds: tripProfile.specialNeeds,
    rawInput: '',
  })

  const itineraryText = parsedTrip.itinerary_items
    .map((item) => {
      const time = item.start_time ? (item.end_time ? `${item.start_time}-${item.end_time}` : item.start_time) : '时间待定'
      return `Day ${item.day_index} | ${time} | ${item.title} | ${item.location_name || ''} | ${item.category} | ${item.notes || ''}`
    }).join('\n')

  const userPrompt = `
Destination: ${tripProfile.destination}
Dates: ${tripProfile.startDate || 'unknown'} to ${tripProfile.endDate || 'unknown'}
Traveler type: ${travelerLabels[tripProfile.travelerType] || tripProfile.travelerType}
Pace: ${tripProfile.pace}
Language level: ${tripProfile.languageLevel}
Special needs: ${tripProfile.specialNeeds.join(', ') || 'none'}

Structured Itinerary:
${itineraryText}

Trip title: ${parsedTrip.trip_title}
Missing info: ${parsedTrip.missing_info.join('; ') || 'none'}

${input.weatherSummary ? `Weather Forecast:
Source: ${input.weatherSummary.forecastSource}
Reliability: ${input.weatherSummary.forecastReliability}
Summary: ${input.weatherSummary.summary}
Daily:
${input.weatherSummary.daily.map(d => `  ${d.date}: ${d.condition}, ${d.minTempC ?? '?'}-${d.maxTempC ?? '?'}°C, rain: ${d.precipitationProbability ?? '?'}%`).join('\n')}
Limitations: ${input.weatherSummary.limitations.join('; ')}
` : ''}

Please analyze this trip and generate a comprehensive risk report.

If weather data is provided:
- Incorporate it into daily_analysis (weather risks for outdoor activities)
- Include weather-related top_risks if relevant
- Add weather contingency plans
- Generate packing_recommendations with: clothing, footwear, rainGear, sunProtection, healthAndComfort, childOrElderlyNotes, destinationSpecificNotes
- Do not overstate weather certainty. Note forecastReliability.`

  try {
    const result = await aiRequest<RiskReportSchema>({
      systemPrompt: riskReportSystemPrompt,
      userPrompt,
      temperature: 0.3,
    })

    const parsed = riskReportSchema.safeParse(result)
    if (parsed.success) {
      await logAgentRun({
        tripId: input.tripId,
        agentType: 'generateRiskReport',
        input: sanitized,
        output: result,
        status: 'completed',
        durationMs: Date.now() - startTime,
        model: MODEL,
        provider: PROVIDER,
      })
      return parsed.data
    }

    console.warn('First risk report attempt failed, retrying...')
    const retryResult = await aiRequest<RiskReportSchema>({
      systemPrompt: riskReportSystemPrompt + '\n\nYour previous output had a format error. Return valid JSON only.',
      userPrompt,
      temperature: 0,
    })

    const retryParsed = riskReportSchema.safeParse(retryResult)
    if (retryParsed.success) {
      await logAgentRun({
        tripId: input.tripId,
        agentType: 'generateRiskReport',
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
      agentType: 'generateRiskReport',
      input: sanitized,
      output: retryResult,
      status: 'failed',
      errorMessage: retryParsed.error.message,
      durationMs: Date.now() - startTime,
      model: MODEL,
      provider: PROVIDER,
    })
    throw new Error('AI 返回格式不稳定，请重新分析。')
  } catch (error: unknown) {
    if (error instanceof Error && (error.message.includes('AI 返回') || error.message.includes('无法生成'))) throw error
    await logAgentRun({
      tripId: input.tripId,
      agentType: 'generateRiskReport',
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
