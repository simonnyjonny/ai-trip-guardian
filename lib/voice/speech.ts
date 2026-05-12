export interface SpeakOptions {
  text: string
  lang?: string
  rate?: number
}

export function canUseSpeechSynthesis(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakText({ text, lang, rate = 0.9 }: SpeakOptions): void {
  if (!canUseSpeechSynthesis()) return
  stopSpeaking()
  const utterance = new SpeechSynthesisUtterance(text)
  if (lang) utterance.lang = lang
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (!canUseSpeechSynthesis()) return
  window.speechSynthesis.cancel()
}

export function getSpeechLang(tripRegion?: string, localLang?: string): string {
  if (localLang === 'Japanese' || localLang === '日语') return 'ja-JP'
  if (localLang === 'Korean' || localLang === '韩语') return 'ko-KR'
  if (localLang === 'French' || localLang === '法语') return 'fr-FR'
  if (localLang === 'Spanish' || localLang === '西班牙语') return 'es-ES'
  if (tripRegion === 'domestic') return 'zh-CN'
  return 'en-US'
}
