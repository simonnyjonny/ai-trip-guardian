'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Select from '@/components/ui/Select'
import DateInput from '@/components/ui/DateInput'

const TRAVELER_TYPES = [
  { value: 'solo', label: '独自旅行' },
  { value: 'couple', label: '情侣 / 夫妻' },
  { value: 'friends', label: '朋友结伴' },
  { value: 'with_children', label: '亲子家庭' },
  { value: 'with_parents', label: '带父母出行' },
  { value: 'family', label: '家庭出行' },
  { value: 'business', label: '商务旅行' },
  { value: 'other', label: '其他' },
]

const PACES = [
  { value: 'relaxed', label: '轻松 — 每天 2–3 个活动' },
  { value: 'normal', label: '普通 — 每天 4–5 个活动' },
  { value: 'packed', label: '紧凑 — 尽量多安排' },
]

const LANGUAGES = [
  { value: 'strong', label: '较强 — 英语流利' },
  { value: 'medium', label: '一般 — 基本沟通' },
  { value: 'weak', label: '较弱 — 需要话术辅助' },
]

const SPECIAL_NEEDS = [
  '有老人', '有小孩', '孩子午休', '轮椅需求',
  '食物过敏', '素食', '清真', '少走路',
  '拍照优先', '购物优先',
]

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

export default function CreateTripPage() {
  const router = useRouter()
  const [rawInput, setRawInput] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [travelerType, setTravelerType] = useState('solo')
  const [pace, setPace] = useState('normal')
  const [languageLevel, setLanguageLevel] = useState('medium')
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleNeed = (need: string) =>
    setSpecialNeeds((prev) => prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/trips', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput, destination, startDate: startDate || undefined, endDate: endDate || undefined, travelerType, pace, languageLevel, specialNeeds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '创建失败')
      router.push(`/trips/${data.trip.id}/analyzing`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '创建失败')
    } finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)]"
      style={{
        background: 'radial-gradient(circle at top left, rgba(0,113,227,0.06), transparent 36%), linear-gradient(180deg, #F5F5F7 0%, #FAFBFC 50%, #FFFFFF 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 lg:px-12 pt-12 md:pt-20 pb-24">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <p className="section-label mb-3">AI 行程风险体检</p>
          <h1 className="hero-title text-[#1d1d1f] mb-4">
            把你的旅行安排
            <br />
            交给 AI 先看一遍。
          </h1>
          <p className="body-lg max-w-lg">
            粘贴航班、酒店、景点和餐厅安排。AI 会检查时间冲突、
            路线过远、体力负担、预约风险和语言沟通问题。
          </p>
        </motion.div>

        {/* ── Main Layout ── */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* ── Left: Form Glass Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-3"
          >
            <div className="rounded-[32px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-6 md:p-8 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* ── 基本信息 ── */}
                <fieldset>
                  <div className="mb-5">
                    <legend className="text-[17px] font-semibold text-[#1d1d1f] font-sans mb-1">基本信息</legend>
                    <p className="text-sm text-[#86868b] font-sans">告诉 AI 这趟旅行的大致背景。</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">目的地</label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="东京、巴黎、大阪京都…"
                        required
                        className="w-full h-14 rounded-2xl border border-black/[0.08] bg-white/80 px-5 text-base placeholder:text-[#86868b] shadow-sm hover:border-black/[0.15] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150 font-sans"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">开始日期</label>
                      <DateInput value={startDate} onChange={setStartDate} placeholder="选择日期" />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">结束日期</label>
                      <DateInput value={endDate} onChange={setEndDate} placeholder="选择日期" />
                    </div>
                  </div>
                </fieldset>

                {/* ── 出行画像 ── */}
                <fieldset>
                  <div className="mb-5">
                    <legend className="text-[17px] font-semibold text-[#1d1d1f] font-sans mb-1">出行画像</legend>
                    <p className="text-sm text-[#86868b] font-sans">不同人群的风险不一样。带孩子、父母或语言不熟练时，AI 会更保守地评估。</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">同行类型</label>
                      <Select options={TRAVELER_TYPES} value={travelerType} onChange={setTravelerType} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">旅行节奏</label>
                      <Select options={PACES} value={pace} onChange={setPace} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#86868b] mb-1.5 font-sans">外语能力</label>
                      <Select options={LANGUAGES} value={languageLevel} onChange={setLanguageLevel} />
                    </div>
                  </div>
                </fieldset>

                {/* ── 特殊需求 ── */}
                <fieldset>
                  <div className="mb-5">
                    <legend className="text-[17px] font-semibold text-[#1d1d1f] font-sans mb-1">特殊需求</legend>
                    <p className="text-sm text-[#86868b] font-sans">可选。帮助 AI 更精确地评估体力、饮食和出行难度。</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SPECIAL_NEEDS.map((need) => (
                      <motion.button
                        key={need}
                        type="button"
                        onClick={() => toggleNeed(need)}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        className={`px-4 py-2.5 rounded-full text-sm font-medium font-sans transition-all duration-200 ${
                          specialNeeds.includes(need)
                            ? 'bg-[#1d1d1f] text-white shadow-md'
                            : 'bg-white/60 text-[#6e6e73] border border-black/[0.06] hover:border-black/[0.15] hover:text-[#1d1d1f]'
                        }`}
                      >
                        {need}
                      </motion.button>
                    ))}
                  </div>
                </fieldset>

                {/* ── 行程文本 ── */}
                <fieldset>
                  <div className="mb-5">
                    <legend className="text-[17px] font-semibold text-[#1d1d1f] font-sans mb-1">粘贴你的行程</legend>
                    <p className="text-sm text-[#86868b] font-sans">可以包含航班、酒店、景点、餐厅预约、交通安排。越完整越准确。</p>
                  </div>
                  <textarea
                    className="w-full min-h-[320px] resize-y rounded-2xl border border-black/[0.08] bg-white/80 px-5 py-4 text-[15px] leading-relaxed placeholder:text-[#86868b] shadow-sm hover:border-black/[0.15] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-150 font-sans"
                    placeholder={`例如：

Day 1
05:00 抵达东京羽田机场
07:00 前往新宿酒店寄存行李
10:00 浅草寺
14:00 秋叶原
20:00 东京塔夜景

Day 2
09:00 明治神宫
11:00 原宿竹下通
15:00 Shibuya Sky
...`}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    required
                  />
                </fieldset>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-[#fff2f0] border border-[#ffc9c4] text-[#c7372a] px-5 py-4 rounded-2xl text-sm font-sans"
                  >
                    {error}
                  </motion.div>
                )}

                {/* ── Submit ── */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-[#0071e3] text-white text-base font-semibold shadow-[0_12px_32px_rgba(0,113,227,0.28)] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(0,113,227,0.34)] active:scale-[0.98] transition-all duration-200 font-sans disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? 'AI 正在检查…' : '开始 AI 风险体检'}
                  </button>
                  <p className="text-center text-xs text-[#86868b] mt-3 font-sans">
                    通常需要 20–40 秒。AI Trip Guardian 第一版只提供风险分析和行程调整建议，
                    不会自动预订、取消、改签、付款或联系任何商家。AI 建议可能不完整，
                    请以航空公司、酒店、景点和当地官方信息为准。
                  </p>
                </div>
              </form>
            </div>
          </motion.div>

          {/* ── Right: Scenic Panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            className="lg:col-span-2 hidden lg:block"
          >
            <div className="sticky top-24 space-y-6">
              {/* Scenic image card */}
              <div className="relative rounded-[36px] overflow-hidden min-h-[400px] shadow-[0_32px_100px_rgba(0,0,0,0.12)]">
                <Image
                  src="/images/scenic-coast.jpg"
                  alt=""
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/8 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white/90 text-lg font-semibold font-sans mb-2 leading-snug">
                    不是多一个行程规划工具，
                    <br />
                    而是在出发前发现隐藏风险。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['时间冲突', '路线过远', '体力负担', '语言沟通', '异常预案'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white/85 text-xs font-medium font-sans border border-white/15">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mini report preview card */}
              <div className="rounded-[28px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_16px_60px_rgba(0,0,0,0.04)] p-6">
                <p className="text-xs font-semibold text-[#86868b] uppercase tracking-[0.08em] mb-4 font-sans">
                  风险报告示例
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold font-sans">东京 · 6 日亲子游</span>
                    <span className="text-lg font-bold text-[#ff6d00] font-sans">72</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="badge bg-[#ffebee] text-[#c62828]">高风险</span>
                      <span className="text-[13px] font-medium font-sans">抵达日疲劳</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-[#ffebee] text-[#c62828]">高风险</span>
                      <span className="text-[13px] font-medium font-sans">跨区移动过多</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-[#fff8e1] text-[#f9a825]">中风险</span>
                      <span className="text-[13px] font-medium font-sans">午休时间不足</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#86868b] pt-2 border-t border-black/[0.04] font-sans">
                    以上为示意。你的行程将生成专属风险报告。
                  </p>
                </div>
              </div>

              {/* Trust note */}
              <p className="text-xs text-[#86868b]/70 text-center px-2 font-sans leading-relaxed">
                AI Trip Guardian 第一版只做风险分析与建议，
                不会自动取消、改签、付款或联系商家。
              </p>
            </div>
          </motion.div>

          {/* Mobile: condensed side info */}
          <div className="lg:hidden space-y-4">
            <div className="rounded-2xl bg-white/50 border border-black/[0.04] p-5">
              <p className="text-sm text-[#86868b] font-sans">
                AI 将检查：时间冲突 · 路线合理性 · 体力负担 · 预约风险 · 语言沟通 · 异常预案
              </p>
            </div>
            <p className="text-xs text-[#86868b]/60 text-center font-sans">
              AI Trip Guardian 第一版只做风险分析与建议，不会自动取消、改签、付款或联系商家。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
