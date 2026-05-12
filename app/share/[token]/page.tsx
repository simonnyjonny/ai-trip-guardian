'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { riskLevelText } from '@/lib/risk-ui'
import type { RiskLevel } from '@/types/trip'

const riskChip: Record<RiskLevel, string> = {
  low: 'bg-[#e8f5e9] text-[#2e7d32]',
  medium: 'bg-[#fff8e1] text-[#f9a825]',
  medium_high: 'bg-[#fff3e0] text-[#ef6c00]',
  high: 'bg-[#ffebee] text-[#c62828]',
}

const dimLabels: Record<string, string> = {
  time_conflict: '时间冲突',
  route_efficiency: '路线合理性',
  physical_load: '体力负担',
  booking_risk: '预约与营业风险',
  language_risk: '语言沟通',
  contingency_readiness: '应急准备',
}

export default function SharePage() {
  const params = useParams()
  const token = params?.token as string
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ trip: { destination: string; start_date: string; end_date: string }; report: Record<string, unknown> } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return
    fetch(`/api/share/${token}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) throw new Error(d.error); setData(d) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return (
    <div className="flex justify-center py-32">
      <svg className="animate-spin h-6 w-6 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  if (error || !data) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <h1 className="font-serif text-3xl font-medium mb-4">报告不可用</h1>
      <p className="text-[#86868b]">{error || '该分享链接已失效或不存在。'}</p>
    </div>
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r: any = data.report
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t: any = data.trip
  const dims: Record<string, number> = r.dimension_scores || {}
  const opt: Array<Record<string, unknown>> = r.optimized_itinerary || []

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <p className="text-sm text-[#86868b] mb-1">{t.destination} · {t.start_date} – {t.end_date}</p>
        <h1 className="font-serif text-3xl font-medium">共享报告</h1>
      </motion.div>

      {/* Score */}
      <div className="card p-6 mb-6 text-center">
        <div className="text-4xl font-bold text-[#ff6d00]">{r.overall_score as number}</div>
        <div className="text-sm text-[#86868b] mt-1">{riskLevelText[r.overall_level as RiskLevel]}</div>
        <p className="text-sm text-[#86868b] mt-3">{r.summary as string}</p>
      </div>

      {/* Dimensions */}
      <h2 className="font-serif text-xl font-medium mb-4">维度评分</h2>
      <div className="space-y-3 mb-8">
        {Object.entries(dims).map(([key, score]) => (
          <div key={key} className="card p-4">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">{dimLabels[key] || key}</span>
              <span className={score <= 30 ? 'text-[#34c759]' : score <= 60 ? 'text-[#ff9500]' : score <= 80 ? 'text-[#ff6d00]' : 'text-[#ff3b30]'}>{score}</span>
            </div>
            <div className="h-1.5 bg-[#e8e8ed] rounded-full">
              <div className="h-1.5 rounded-full transition-all" style={{ width: `${score}%`, background: score <= 30 ? '#34c759' : score <= 60 ? '#ff9500' : score <= 80 ? '#ff6d00' : '#ff3b30' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Top risks */}
      <h2 className="font-serif text-xl font-medium mb-4">重要风险</h2>
      <div className="space-y-3 mb-8">
        {(r.top_risks as unknown as Array<{title:string;level:string;suggestion:string}>)?.map((risk, i) => (
          <div key={i} className="card p-4">
            <span className={`badge text-[11px] mb-2 ${riskChip[risk.level as RiskLevel]}`}>{riskLevelText[risk.level as RiskLevel]}</span>
            <h3 className="font-semibold text-[15px] mt-1 mb-1">{risk.title}</h3>
            <p className="text-sm text-[#86868b]">{risk.suggestion}</p>
          </div>
        ))}
      </div>

      {/* Optimized itinerary */}
      {opt.length > 0 && (
        <>
          <h2 className="font-serif text-xl font-medium mb-4">AI 推荐调整版行程</h2>
          <div className="space-y-4 mb-8">
            {opt.map((day: any, i: number) => (
              <div key={i} className="card p-5">
                <h3 className="font-semibold mb-1">Day {day.day_index} · {day.theme}</h3>
                <p className="text-sm text-[#86868b] mb-3">{day.risk_reduction_summary}</p>
                <div className="space-y-2">
                  {(day.items as Array<any>)?.map((item: any, j: number) => (
                    <div key={j} className="flex gap-3 text-sm">
                      <span className="text-[#86868b] w-12 shrink-0">{item.time || '--:--'}</span>
                      <span className="font-medium">{item.title}</span>
                      {item.reason && <span className="text-[#86868b] text-xs">· {item.reason}</span>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#f0f0f5]">
                  <p className="text-xs text-[#86868b]">
                    本日调整：{(day.changes_made as any[])?.join('；')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-[#86868b]/60 text-center mt-10">
        由 AI Trip Guardian 生成。本报告不构成法律、医疗或安全保证。
      </p>
    </div>
  )
}
