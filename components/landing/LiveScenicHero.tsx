'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(12px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, delay: 0.2 + i * 0.18, ease: [0.16, 1, 0.3, 1] },
  }),
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    const particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; a: number }> = []
    const count = 40

    const resize = () => {
      canvas.width = canvas.offsetWidth * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
      canvas.height = canvas.offsetHeight * (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random() * 0.4 + 0.1,
      })
    }

    function draw() {
      if (!running || !ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.fill()
      }
      requestAnimationFrame(draw)
    }
    draw()

    return () => { running = false; window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

export default function LiveScenicHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState<'loading' | 'playing' | 'fallback'>('loading')

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onPlaying = () => setVideoReady('playing')
    const onError = () => setVideoReady('fallback')
    el.addEventListener('playing', onPlaying)
    el.addEventListener('error', onError)
    const t = setTimeout(() => { if (el.readyState < 3) setVideoReady('fallback') }, 3000)
    return () => {
      el.removeEventListener('playing', onPlaying)
      el.removeEventListener('error', onError)
      clearTimeout(t)
    }
  }, [])

  return (
    <section className="relative min-h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay muted loop playsInline preload="metadata"
        poster="/images/hero-mountain.jpg"
        style={{ display: videoReady === 'fallback' ? 'none' : 'block' }}
      >
        <source src="/videos/hero-travel.webm" type="video/webm" />
        <source src="/videos/hero-travel.mp4" type="video/mp4" />
      </video>

      {/* Animated gradient fallback */}
      {(videoReady === 'fallback' || videoReady === 'loading') && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: 'easeOut' }}
          >
            <Image src="/images/hero-mountain.jpg" alt="" fill className="object-cover" priority />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900/40 to-black/70" />
        </div>
      )}

      {/* Particles */}
      {videoReady === 'fallback' && <ParticleCanvas />}

      {/* Overlay layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/65" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.25)]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-32 text-center text-white">
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/8 text-sm text-white/80 backdrop-blur-sm mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse" />
          第一版开放测试
        </motion.div>

        <motion.h1
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="hero-title text-white/95 mb-8"
        >
          你的旅行计划
          <br />
          值得被 AI 审视一次
        </motion.h1>

        <motion.p
          custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="text-lg md:text-xl text-white/60 max-w-xl mx-auto mb-12 leading-relaxed font-sans"
        >
          上传航班、酒店和行程，AI 提前发现时间冲突、
          路线过远、体力负担和语言沟通风险。
        </motion.p>

        <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/trips/new"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-semibold text-white bg-white/15 border border-white/20 rounded-xl backdrop-blur-sm hover:bg-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-sans">
            免费检测我的行程风险
          </Link>
          <Link href="/demo-report"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 text-base font-medium text-white/70 bg-transparent border border-white/15 rounded-xl hover:bg-white/8 hover:border-white/25 transition-all duration-200 font-sans">
            查看示例报告
          </Link>
        </motion.div>

        <motion.p custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="mt-16 text-sm text-white/30 font-sans">
          适合亲子、带父母、第一次出国自由行
        </motion.p>
      </div>
    </section>
  )
}
