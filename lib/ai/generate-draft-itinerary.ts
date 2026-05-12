import { aiRequest } from './client'
import { generatedItinerarySchema, type GeneratedItineraryDay } from './schemas'
import { logAgentRun } from '@/lib/db/queries'
import { generateFallbackDraftItinerary } from './fallback-draft-itinerary'

const PROVIDER = process.env.AI_PROVIDER || 'openai'
const MODEL = PROVIDER === 'deepseek' ? (process.env.DEEPSEEK_MODEL || 'deepseek-chat') : (process.env.OPENAI_MODEL || 'gpt-4o')

const DRAFT_SYSTEM = `You are a low-risk, low-fatigue travel planner for Chinese-speaking travelers.

CRITICAL RULES:
- Do NOT pack too many attractions into each day.
- Do NOT try to satisfy every wish if it makes the trip exhausting.
- Prefer fewer zones per day. Prefer rest buffers.
- Arrival day MUST be light (1-2 light activities + rest).
- Departure day: no distant activities.
- Theme park / high-intensity days: buffer before and after.
- Elderly travelers: reduce walking and transfers.
- Children: include nap/rest time.
- Relaxed pace: 2-3 main activities per day maximum.
- Normal pace: 3-4 activities.
- Do NOT generate overly packed "bucket list" itineraries.
- Explain WHY each day is arranged this way (risk avoidance reasoning).
- Return ONLY valid JSON, no markdown.

JSON structure per day:
{
  "dayIndex": 1,
  "theme": "string in Chinese",
  "userWishesSatisfied": ["wish fulfilled"],
  "items": [
    {
      "timeOfDay": "morning|late_morning|afternoon|evening|flexible",
      "title": "activity name in Chinese",
      "locationName": "place name or null",
      "category": "flight|train|hotel|activity|restaurant|transport|shopping|rest|other",
      "why": "why this is arranged here (risk reasoning)",
      "estimatedIntensity": "low|medium|high",
      "notes": ["optional safety/comfort notes"]
    }
  ],
  "restBuffers": ["rest arrangements"],
  "riskAvoidanceNotes": ["risks avoided in this day's arrangement"]
}`

export async function generateDraftItinerary(wishInput: {
  destination: string
  travelers?: string
  pace?: string
  durationDays?: number
  travelStyles: string[]
  mustVisitPlaces: string[]
  optionalPlaces: string[]
  thingsToDo: string[]
  avoid: string[]
  specialNeeds: string[]
  tripRegion?: string
}): Promise<GeneratedItineraryDay[]> {
  const startTime = Date.now()

  const userPrompt = `Generate a LOW-RISK, LOW-FATIGUE itinerary.

Destination: ${wishInput.destination}
Travelers: ${wishInput.travelers || 'not specified'}
Pace: ${wishInput.pace || 'relaxed'}
Duration: ${wishInput.durationDays || 7} days
Region: ${wishInput.tripRegion || 'auto'}
Travel styles: ${wishInput.travelStyles.join(', ') || 'not specified'}
Must-visit: ${wishInput.mustVisitPlaces.join(', ') || 'not specified'}
Optional: ${wishInput.optionalPlaces.join(', ') || 'not specified'}
Want to do: ${wishInput.thingsToDo.join(', ') || 'not specified'}
AVOID: ${wishInput.avoid.join(', ') || 'not specified'}
Special needs: ${wishInput.specialNeeds.join(', ') || 'none'}`

  try {
    const result = await aiRequest<GeneratedItineraryDay[]>({
      systemPrompt: DRAFT_SYSTEM,
      userPrompt,
      temperature: 0.4,
    })

    const parsed = generatedItinerarySchema.safeParse(result)
    if (parsed.success) {
      await logAgentRun({ tripId: 'wish-draft', agentType: 'generateDraftItinerary', input: { dest: wishInput.destination }, output: result, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return parsed.data
    }

    // Retry
    console.warn('[draft] First attempt failed, retrying...')
    const retry = await aiRequest<GeneratedItineraryDay[]>({ systemPrompt: DRAFT_SYSTEM + '\nReturn ONLY valid JSON array.', userPrompt, temperature: 0 })
    const retryParsed = generatedItinerarySchema.safeParse(retry)
    if (retryParsed.success) {
      await logAgentRun({ tripId: 'wish-draft', agentType: 'generateDraftItinerary', input: { dest: wishInput.destination }, output: retry, status: 'completed', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
      return retryParsed.data
    }

    throw new Error('Draft validation failed')
  } catch (err) {
    console.warn('[draft] Using fallback itinerary:', err instanceof Error ? err.message : String(err))
    await logAgentRun({ tripId: 'wish-draft', agentType: 'generateDraftItinerary', input: { dest: wishInput.destination }, output: { fallback: true }, status: 'completed', errorMessage: 'Used fallback', durationMs: Date.now() - startTime, model: MODEL, provider: PROVIDER })
    return generateFallbackDraftItinerary(wishInput)
  }
}
