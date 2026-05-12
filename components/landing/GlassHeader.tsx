'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function GlassHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-nav border-b border-black/[0.08] shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="font-sans text-lg font-bold tracking-tight text-[#1d1d1f] select-none">
          Trip Guardian
        </Link>
        <Link
          href="/trips/new"
          className={`text-sm font-medium transition-colors ${
            scrolled ? 'text-[#0071e3]' : 'text-[#1d1d1f]'
          }`}
        >
          开始检测
        </Link>
      </div>
    </header>
  )
}
