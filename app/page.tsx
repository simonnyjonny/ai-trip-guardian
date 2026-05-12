'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import LiveScenicHero from '@/components/landing/LiveScenicHero'
import ReportPreview from '@/components/landing/ReportPreview'
import Reveal from '@/components/motion/Reveal'

const features = [
  ['时间冲突', '抵达当天过满？预约之间是否留够缓冲时间？'],
  ['路线过远', '一天跨太多区域，AI 会提醒你重排顺序。'],
  ['体力负担', '带父母或孩子时，自动评估步行强度和休息。'],
  ['语言沟通', '自动生成酒店、餐厅、航班的多语言沟通话术。'],
  ['异常预案', '雨天、延误、临时关闭 — 提前准备替代方案。'],
  ['行程结构化', '把混乱的自由文本自动整理成清晰时间线。'],
]

const audiences = [
  {
    img: '/images/travel-bag.jpg',
    title: '亲子家庭',
    desc: '确保每天有休息时间，景点对孩子友好，不去不适合儿童的场所。',
  },
  {
    img: '/images/scenic-coast.jpg',
    title: '带父母出行',
    desc: '减少步行强度，提前发现无障碍问题，让父母也能轻松享受旅程。',
  },
  {
    img: '/images/hero-road.jpg',
    title: '第一次出国',
    desc: '行程合理性检查、语言沟通话术、应急预案 — 减少未知焦虑。',
  },
]

export default function LandingPage() {
  return (
    <div>
      {/* ═══ Hero ═══ */}
      <LiveScenicHero />

      {/* ═══ Features ═══ */}
      <section id="features" className="section max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16 md:mb-24">
            <p className="section-label mb-4">Why Trip Guardian</p>
            <h2 className="section-title mb-6">
              不只是规划行程，
              <br />
              而是提前发现风险。
            </h2>
            <p className="body-lg max-w-lg mx-auto">
              大多数旅行问题不是因为没有攻略，而是因为时间、路线、体力和沟通细节没有被认真检查。
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-px">
          {features.map(([title, desc], i) => (
            <Reveal key={title} delay={i * 0.05}>
              <div className="group p-8 md:p-10 hover:bg-white transition-colors duration-300 rounded-2xl">
                <div className="text-2xl font-bold text-[#0071e3]/15 mb-6 font-sans">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <h3 className="text-lg font-semibold font-sans mb-2">{title}</h3>
                <p className="text-[15px] text-[#86868b] leading-relaxed font-sans">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ Scenic break ═══ */}
      <section className="relative h-[60vh] overflow-hidden">
        <Image src="/images/scenic-lake.jpg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-2xl md:text-4xl text-white/90 font-medium tracking-[-0.02em] text-center leading-relaxed"
          >
            在出发之前，
            <br />
            先用 AI 的目光审视一次行程。
          </motion.p>
        </div>
      </section>

      {/* ═══ Audience ═══ */}
      <section className="section max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="section-label mb-4">For</p>
            <h2 className="section-title mb-6">为认真对待旅行的人</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.1}>
              <div className="group rounded-2xl overflow-hidden bg-white">
                <div className="relative h-56 overflow-hidden">
                  <Image src={item.img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold font-sans mb-2">{item.title}</h3>
                  <p className="text-[15px] text-[#86868b] leading-relaxed font-sans">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ Report Preview ═══ */}
      <section className="section max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p className="section-label mb-4">Preview</p>
            <h2 className="section-title mb-6">
              简洁、清晰的风险报告
            </h2>
            <p className="body-lg max-w-md mx-auto">
              AI 分析完成后生成可读性极高的报告，不再是杂乱数据。
            </p>
          </div>
        </Reveal>
        <ReportPreview />
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="relative overflow-hidden bg-black">
        <Image src="/images/hero-road.jpg" alt="" fill className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        <div className="relative z-10 section text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="font-serif text-[clamp(2rem,5vw,4rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white/95 mb-6">
              出发前，
              <br />
              先让 AI 帮你看一眼。
            </h2>
            <p className="text-lg text-white/55 mb-10 max-w-md mx-auto font-sans">
              免费使用，无需注册。行程数据仅用于生成你的专属风险报告。
            </p>
            <Link href="/trips/new" className="inline-flex items-center justify-center gap-2 px-12 py-4 text-lg font-semibold text-white bg-white/15 border border-white/20 rounded-xl backdrop-blur-sm hover:bg-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-sans">
              免费检测我的行程风险
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="section max-w-xl mx-auto text-center">
        <Reveal>
          <p className="font-serif text-2xl font-medium mb-2">想第一时间体验旅行中实时守护？</p>
          <p className="text-[#86868b] text-sm mb-6">留下邮箱，Beta 开放时通知你。</p>
          <WaitlistInline />
        </Reveal>
      </section>
    </div>
  )
}

function WaitlistInline() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  if (sent) return <p className="text-sm text-[#34c759] font-sans">已记录，感谢！</p>
  return (
    <div className="flex gap-2 max-w-sm mx-auto">
      <input type="email" placeholder="your@email.com" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-apple text-sm py-2.5 flex-1" />
      <button onClick={async () => {
        if (!email) return
        await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'landing' }) })
        setSent(true)
      }} className="btn-primary text-sm py-2.5 px-6 font-sans">加入</button>
    </div>
  )
}
