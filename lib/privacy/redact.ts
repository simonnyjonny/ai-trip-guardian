/**
 * Privacy redaction for agent_runs.input and logs.
 * Never stores full raw user input, PII, or booking references.
 */

export function redactSensitiveText(input: string): string {
  let result = input

  // Email
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')

  // Chinese mobile phone (11 digits starting with 1)
  result = result.replace(/1[3-9]\d{9}/g, '[REDACTED_PHONE]')

  // International phone patterns
  result = result.replace(/\+\d{1,3}[\s-]?\d{6,14}/g, '[REDACTED_PHONE]')

  // Passport numbers (alphanumeric, 6-12 chars, common patterns)
  result = result.replace(/\b[EG]\d{7,8}\b/g, '[REDACTED_ID]')
  result = result.replace(/\b\d{6,9}[A-Z]{1,2}\b/g, '[REDACTED_ID]')

  // Credit card patterns (13-19 digits, possibly with spaces/dashes)
  result = result.replace(/\b(?:\d[ -]*?){13,19}\b/g, (match) => {
    const digits = match.replace(/[\s-]/g, '')
    return digits.length >= 13 && digits.length <= 19 ? '[REDACTED_CARD]' : match
  })

  // Booking references (common format: 6 alphanumeric uppercase)
  result = result.replace(/\b[A-Z0-9]{6}\b/g, '[REDACTED_BOOKING_REF]')

  return result
}

export function sanitizedAgentInput(input: {
  destination: string
  travelerType: string
  pace: string
  languageLevel: string
  specialNeeds: string[]
  rawInput: string
}): Record<string, unknown> {
  return {
    destination: input.destination,
    travelerType: input.travelerType,
    pace: input.pace,
    languageLevel: input.languageLevel,
    specialNeeds: input.specialNeeds,
    rawInputPreview: input.rawInput.slice(0, 1000),
    rawInputLength: input.rawInput.length,
  }
}
