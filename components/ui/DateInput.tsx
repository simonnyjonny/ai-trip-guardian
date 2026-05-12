'use client'

import { useRef } from 'react'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function DateInput({ value, onChange, placeholder }: DateInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <button
      type="button"
      onClick={() => ref.current?.showPicker?.()}
      className="w-full h-14 rounded-2xl border border-black/[0.08] bg-white/80 px-5 text-base text-left flex items-center shadow-sm hover:border-black/[0.15] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150 font-sans relative"
    >
      <span className={value ? 'text-[#1d1d1f]' : 'text-[#86868b]'}>
        {value || placeholder || '选择日期'}
      </span>
      <svg className="w-4 h-4 text-[#86868b] ml-auto shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      <input
        ref={ref}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </button>
  )
}
