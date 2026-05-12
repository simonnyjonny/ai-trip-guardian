import OpenAI from 'openai'
import { parseAiJson } from './json'

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o'
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

function createClient() {
  if (AI_PROVIDER === 'deepseek') {
    return new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: 'https://api.deepseek.com',
    })
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

const ai = createClient()
const MODEL = AI_PROVIDER === 'deepseek' ? DEEPSEEK_MODEL : OPENAI_MODEL

interface AIRequestOptions {
  systemPrompt: string
  userPrompt: string
  responseSchema?: Record<string, unknown>
  temperature?: number
}

export async function aiRequest<T>({
  systemPrompt,
  userPrompt,
  responseSchema,
  temperature = 0.3,
}: AIRequestOptions): Promise<T> {
  // DeepSeek uses json_object; OpenAI uses json_schema when schema provided
  const isOpenAI = AI_PROVIDER !== 'deepseek'

  // Make sure JSON instruction is clear for json_object mode
  const fullSystemPrompt = isOpenAI
    ? systemPrompt
    : systemPrompt + '\n\nYou MUST return a valid JSON object. No markdown, no explanations outside the JSON.'

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: fullSystemPrompt },
    { role: 'user', content: userPrompt },
  ]

  const params: Record<string, unknown> = {
    model: MODEL,
    messages,
    temperature,
    response_format: isOpenAI && responseSchema
      ? {
          type: 'json_schema',
          json_schema: {
            name: 'response',
            strict: true,
            schema: responseSchema,
          },
        }
      : { type: 'json_object' },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await ai.chat.completions.create(params as any)
  const content = response.choices[0]?.message?.content

  if (!content) {
    throw new Error('AI returned empty response')
  }

  return parseAiJson<T>(content)
}
