'use client'

import { useState } from 'react'
import { canUseSpeechSynthesis, speakText, stopSpeaking, getSpeechLang } from '@/lib/voice/speech'

interface SpeakButtonProps {
  text: string
  lang?: string
  label?: string
}

export default function SpeakButton({ text, lang, label }: SpeakButtonProps) {
  const [playing, setPlaying] = useState(false)
  const [slowMode, setSlowMode] = useState(false)
  const speechLang = lang || getSpeechLang()

  if (!canUseSpeechSynthesis()) return null

  const play = (slow?: boolean) => {
    setPlaying(true)
    setSlowMode(!!slow)
    speakText({ text, lang: speechLang, rate: slow ? 0.65 : 0.9 })
    // Check when speaking ends
    const check = setInterval(() => {
      if (!window.speechSynthesis.speaking) { setPlaying(false); clearInterval(check) }
    }, 200)
  }

  const stop = () => {
    stopSpeaking()
    setPlaying(false)
  }

  return (
    <span className="inline-flex items-center gap-1 ml-2 shrink-0">
      {!playing ? (
        <>
          <button onClick={() => play(false)} title="播放" className="text-[10px] px-1.5 py-0.5 rounded border border-[#e0e0e0] text-[#86868b] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors font-sans">
            🔊
          </button>
          <button onClick={() => play(true)} title="慢速播放" className="text-[10px] px-1.5 py-0.5 rounded border border-[#e0e0e0] text-[#86868b] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors font-sans">
            🐢
          </button>
          <button onClick={() => { navigator.clipboard.writeText(text) }} title="复制" className="text-[10px] px-1.5 py-0.5 rounded border border-[#e0e0e0] text-[#86868b] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors font-sans">
            📋
          </button>
        </>
      ) : (
        <button onClick={stop} className="text-[10px] px-2 py-0.5 rounded bg-[#0071e3] text-white font-sans animate-pulse">
          {slowMode ? '⏹ 慢速播放中' : '⏹ 播放中'}
        </button>
      )}
      {label && <span className="text-[10px] text-[#86868b] font-sans">{label}</span>}
    </span>
  )
}
