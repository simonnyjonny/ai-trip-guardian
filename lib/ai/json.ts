export class AiJsonParseError extends Error {
  code = "AI_JSON_PARSE_ERROR"
  constructor(message: string, public readonly preview: string) { super(message) }
}

export function extractJsonCandidate(text: string): string {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed

  // Try fenced code block
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) return fenced[1].trim()

  // Find first { ... last }
  const firstObj = trimmed.indexOf("{")
  const lastObj = trimmed.lastIndexOf("}")
  if (firstObj >= 0 && lastObj > firstObj) return trimmed.slice(firstObj, lastObj + 1)

  throw new AiJsonParseError("AI response did not contain JSON.", trimmed.slice(0, 300))
}

export function parseAiJson<T>(text: string): T {
  const candidate = extractJsonCandidate(text)
  try {
    return JSON.parse(candidate) as T
  } catch (error) {
    throw new AiJsonParseError(error instanceof Error ? error.message : "Invalid AI JSON.", candidate.slice(0, 300))
  }
}
