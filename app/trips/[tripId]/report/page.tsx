'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Trip } from '@/types/trip'
import type { RiskReport as RiskReportType } from '@/types/report'
import { riskLevelText } from '@/lib/risk-ui'
import type { RiskLevel } from '@/types/trip'

/* ── 辅助 ── */

const riskChip: Record<RiskLevel, string> = {
  low: 'bg-[#e8f5e9] text-[#2e7d32]',
  medium: 'bg-[#fff8e1] text-[#f9a825]',
  medium_high: 'bg-[#fff3e0] text-[#ef6c00]',
  high: 'bg-[#ffebee] text-[#c62828]',
}

const dimLabels: Record<string, string> = {
  time_conflict: '时间冲突', route_efficiency: '路线合理性',
  physical_load: '体力负担', booking_risk: '预约与营业风险',
  language_risk: '语言沟通', contingency_readiness: '应急准备',
}

const cardAnim = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, delay: 0.05 * i, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

function ScoreRing({ score }: { score: number }) {
  const color = score <= 30 ? '#34c759' : score <= 60 ? '#ff9500' : score <= 80 ? '#ff6d00' : '#ff3b30'
  const label = score <= 30 ? '低风险' : score <= 60 ? '中风险' : score <= 80 ? '中高风险' : '高风险'
  const circ = 2 * Math.PI * 52
  const off = circ - (score / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle cx="80" cy="80" r="52" fill="none" stroke="#e8e8ed" strokeWidth="12" />
        <motion.circle cx="80" cy="80" r="52" fill="none" stroke={color} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.3 }} />
      </svg>
      <div className="absolute translate-y-[-160px] w-[160px] h-[160px] flex flex-col items-center justify-center">
        <motion.span className="text-[3.5rem] font-bold tracking-tight leading-none font-sans"
          style={{ color }} initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] as const }}>
          {score}
        </motion.span>
        <span className="text-sm font-semibold text-[#86868b] mt-1 font-sans">{label}</span>
      </div>
    </div>
  )
}

function FeedbackButtons({ tripId, reportId, riskKey, onFeedback }: {
  tripId: string; reportId: string; riskKey: string; onFeedback: () => void
}) {
  const [sent, setSent] = useState('')

  const send = async (type: string) => {
    if (sent) return
    try {
      await fetch(`/api/trips/${tripId}/feedback`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskReportId: reportId, riskKey, feedbackType: type }),
      })
      setSent(type)
      onFeedback()
    } catch { /* ignore */ }
  }

  if (sent) return <span className="text-xs text-[#34c759] font-medium">已记录</span>

  return (
    <div className="flex gap-1.5 mt-3">
      {[
        ['useful', '有用'], ['inaccurate', '不准确'], ['adopted', '已采纳'], ['not_relevant', '不相关'],
      ].map(([type, label]) => (
        <button key={type} onClick={() => send(type)}
          className="px-2.5 py-1 text-[11px] rounded-full border border-[#e8e8ed] text-[#86868b] hover:border-[#0071e3] hover:text-[#0071e3] transition-colors font-sans">
          {label}
        </button>
      ))}
    </div>
  )
}

function BetaFeedback({ tripId }: { tripId: string }) {
  const [rating, setRating] = useState('')
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)
  const RATINGS = [
    ['very_useful', '非常有用'], ['somewhat_useful', '有一点用'],
    ['not_accurate', '不太准确'], ['not_trustworthy', '我还不敢相信'],
  ]

  const submit = async () => {
    if (!rating) return
    try {
      await fetch(`/api/trips/${tripId}/beta-feedback`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment || undefined }),
      })
      setSent(true)
    } catch { /* ignore */ }
  }

  if (sent) return <div className="pt-8 text-sm text-[#34c759] font-sans">感谢反馈！</div>

  return (
    <div className="pt-8 border-t border-[#f0f0f5]">
      <p className="text-sm font-semibold mb-3 font-sans">这份报告帮到你了吗？</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {RATINGS.map(([val, label]) => (
          <button key={val} onClick={() => setRating(val)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium font-sans transition-colors ${
              rating === val ? 'bg-[#0071e3] text-white' : 'bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]'
            }`}>{label}</button>
        ))}
      </div>
      <input type="text" placeholder="你希望它还帮你检查什么？（选填）" value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="input-apple text-sm mb-2" />
      <button onClick={submit} disabled={!rating} className="text-xs text-[#0071e3] font-medium font-sans disabled:opacity-30">提交反馈</button>
    </div>
  )
}

function WaitlistForm({ source }: { source: string }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  if (sent) return <p className="text-xs text-[#34c759] font-sans">已记录！</p>
  return (
    <div className="flex gap-2">
      <input type="email" placeholder="your@email.com" value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-apple text-xs py-2 flex-1" />
      <button onClick={async () => {
        if (!email) return
        await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source }) })
        setSent(true)
      }} className="text-xs font-medium text-[#0071e3] px-3 font-sans shrink-0">加入</button>
    </div>
  )
}

function DeleteTripButton({ tripId }: { tripId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const doDelete = async () => {
    setDeleting(true)
    try {
      await fetch(`/api/trips/${tripId}`, { method: 'DELETE' })
      router.push('/')
    } catch { setDeleting(false); setConfirming(false) }
  }

  if (confirming) {
    return (
      <div className="pt-6">
        <p className="text-sm text-[#c62828] mb-3 font-sans">删除后无法恢复。确定删除这次行程和风险报告吗？</p>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setConfirming(false)} className="btn-secondary text-xs py-2 px-4 font-sans">取消</button>
          <button onClick={doDelete} disabled={deleting}
            className="px-4 py-2 text-xs font-medium text-white bg-[#ff3b30] rounded-xl hover:bg-[#e0352b] transition-colors font-sans">
            {deleting ? '删除中…' : '确认删除'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <button onClick={() => setConfirming(true)}
        className="text-xs text-[#86868b]/40 hover:text-[#c62828] transition-colors font-sans underline underline-offset-4">
        删除本次行程数据
      </button>
    </div>
  )
}

/* ── 主页面 ── */

export default function ReportPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter()
  const [tripId, setTripId] = useState('')
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [report, setReport] = useState<RiskReportType | null>(null)
  const [reportId, setReportId] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    params.then(async ({ tripId: id }) => {
      setTripId(id)
      try {
        const [tripRes, reportRes] = await Promise.all([
          fetch(`/api/trips/${id}`), fetch(`/api/trips/${id}/report`),
        ])
        if (!tripRes.ok || !reportRes.ok) throw new Error('加载失败')
        const tripData = await tripRes.json()
        const reportData = await reportRes.json()
        setTrip(tripData.trip)
        setReport(reportData.report)
        setReportId((reportData.report as Record<string, string>).id || '')
      } catch (err: unknown) { setError(err instanceof Error ? err.message : '加载失败') }
      finally { setLoading(false) }
    })
  }, [params])

  const generateShare = async () => {
    setShareLoading(true)
    try {
      const res = await fetch(`/api/trips/${tripId}/share`, { method: 'POST' })
      const d = await res.json()
      if (d.shareUrl) { setShareUrl(d.shareUrl); navigator.clipboard.writeText(d.shareUrl).catch(() => {}) }
    } catch { /* ignore */ }
    finally { setShareLoading(false) }
  }

  const copyFullReport = useCallback(() => {
    if (!report) return
    const lines: string[] = [
      'AI Trip Guardian 风险报告', '',
      `目的地：${trip?.destination || ''}`, `日期：${trip?.start_date || ''} – ${trip?.end_date || ''}`,
      `总体风险：${report.overall_score}/100 (${riskLevelText[report.overall_level]})`, '',
      report.summary, '', '【维度评分】',
    ]
    const dims = (report as Record<string, unknown>).dimension_scores as Record<string, number> | undefined
    if (dims) for (const [k, v] of Object.entries(dims)) lines.push(`  ${dimLabels[k] || k}: ${v}/100`)
    lines.push('', '【重要风险】')
    report.top_risks?.forEach((r, i) => lines.push(`${i + 1}. [${riskLevelText[r.level]}] ${r.title}\n   ${r.suggestion}`))
    lines.push('', '【修改建议】')
    report.recommendations?.forEach((r) => lines.push(`- ${r.title}: ${r.details}`))
    lines.push('', '【AI 推荐调整版行程】')
    const opt = (report as Record<string, unknown>).optimized_itinerary as Array<Record<string, unknown>> | undefined
    opt?.forEach((day) => {
      lines.push(`Day ${day.day_index} · ${day.theme}`)
      ;(day.items as Array<Record<string, string>>)?.forEach((it) => lines.push(`  ${it.time || '--:--'}  ${it.title}`))
      lines.push(`  调整：${(day.changes_made as string[])?.join('；')}`)
    })
    lines.push('', '【沟通话术】')
    report.communication_scripts?.forEach((s) => lines.push(`- ${s.scenario}: ${s.chinese}`))
    navigator.clipboard.writeText(lines.join('\n')).then(() => setCopied('report')).catch(() => {})
    setTimeout(() => setCopied(''), 2000)
  }, [report, trip])

  const copyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => setCopied(label)).catch(() => {})
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return (
    <div className="flex justify-center py-32">
      <svg className="animate-spin h-6 w-6 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  if (error || !report) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="text-6xl mb-6">—</div>
      <h1 className="font-serif text-3xl font-medium mb-2">报告加载失败</h1>
      <p className="body-lg mb-8">{error || '未找到报告'}</p>
      <button onClick={() => router.push(`/trips/${tripId}/analyzing`)} className="btn-primary font-sans">重新分析</button>
    </div>
  )

  const dims = (report as Record<string, unknown>).dimension_scores as Record<string, number> | undefined
  const opt = (report as Record<string, unknown>).optimized_itinerary as Array<Record<string, unknown>> | undefined
  const days = report.daily_analysis || []

  return (
    <div className="max-w-4xl mx-auto px-5 py-10 md:py-16">
      {/* ── Header + Actions ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
        <div className="flex items-center gap-2 text-sm text-[#86868b] mb-2 font-sans">
          <span>{trip?.destination}</span><span>·</span><span>{trip?.start_date} – {trip?.end_date}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.03em]">行程风险报告</h1>
          <div className="flex gap-2">
            <button onClick={copyFullReport} className="btn-secondary text-xs py-2 px-4 font-sans">
              {copied === 'report' ? '已复制' : '复制完整报告'}
            </button>
            <button onClick={() => window.print()} className="btn-secondary text-xs py-2 px-4 font-sans">
              打印 / PDF
            </button>
            <button onClick={generateShare} disabled={shareLoading} className="btn-primary text-xs py-2 px-4 font-sans">
              {shareUrl ? '已复制链接' : shareLoading ? '...' : '生成分享链接'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Score Card ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
        className="card p-8 md:p-12 mb-8 text-center">
        <ScoreRing score={report.overall_score} />
        <p className="body-lg max-w-xl mx-auto mt-6">{report.summary}</p>
        <div className="w-full max-w-md mx-auto bg-[#e8e8ed] rounded-full h-1.5 mt-6">
          <motion.div className="h-1.5 rounded-full" initial={{ width: 0 }}
            animate={{ width: `${report.overall_score}%` }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
            style={{ background: report.overall_score <= 30 ? '#34c759' : report.overall_score <= 60 ? '#ff9500' : report.overall_score <= 80 ? '#ff6d00' : '#ff3b30' }} />
        </div>
      </motion.div>

      {/* ── Dimension Scores ── */}
      {dims && Object.keys(dims).length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-medium mb-1 tracking-[-0.02em]">风险维度拆解</h2>
          <p className="text-sm text-[#86868b] mb-6 font-sans">分值越高，该维度风险越大。</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(dims).map(([key, score], i) => (
              <motion.div key={key} custom={i} variants={cardAnim} initial="hidden" animate="visible"
                className="card p-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[15px] font-semibold font-sans">{dimLabels[key] || key}</span>
                  <span className={`text-lg font-bold font-sans ${score <= 30 ? 'text-[#34c759]' : score <= 60 ? 'text-[#ff9500]' : score <= 80 ? 'text-[#ff6d00]' : 'text-[#ff3b30]'}`}>
                    {score}
                  </span>
                </div>
                <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                    style={{ background: score <= 30 ? '#34c759' : score <= 60 ? '#ff9500' : score <= 80 ? '#ff6d00' : '#ff3b30' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Top Risks + Feedback ── */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-medium mb-6 tracking-[-0.02em]">重要风险</h2>
        <div className="space-y-3">
          {report.top_risks?.map((risk, i) => (
            <motion.div key={i} custom={i} variants={cardAnim} initial="hidden" animate="visible"
              className="card p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-start gap-4">
                <span className={`badge shrink-0 mt-0.5 font-sans ${riskChip[risk.level]}`}>{riskLevelText[risk.level]}</span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[17px] font-sans mb-1.5">{risk.title}</h3>
                  <p className="text-[15px] text-[#86868b] mb-2 leading-relaxed font-sans">{risk.reason}</p>
                  <p className="text-[15px] text-[#0071e3] font-medium font-sans">→ {risk.suggestion}</p>
                  <FeedbackButtons tripId={tripId} reportId={reportId} riskKey={`top_risk_${i}`} onFeedback={() => {}} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Optimized Itinerary ★ ── */}
      {opt && opt.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-medium mb-1 tracking-[-0.02em]">AI 推荐调整版行程</h2>
          <p className="text-sm text-[#86868b] mb-6 font-sans">以下不是新的预订，而是基于当前安排生成的低风险重排建议。</p>
          <div className="space-y-4">
            {(opt as Array<Record<string, unknown>>).map((day, i) => (
              <motion.div key={i} custom={i} variants={cardAnim} initial="hidden" animate="visible"
                className="card p-6 border-l-4 border-l-[#0071e3]">
                <div className="flex items-center gap-3 mb-3">
                  <span className="badge bg-[#f0f5ff] text-[#0071e3] font-sans">Day {day.day_index as number}</span>
                  <span className="text-[15px] font-semibold font-sans">{day.theme as string}</span>
                </div>
                <p className="text-sm text-[#86868b] mb-4 font-sans">{day.risk_reduction_summary as string}</p>
                <div className="space-y-2 mb-4">
                  {(day.items as Array<Record<string, string>>)?.map((item, j) => (
                    <div key={j} className="flex gap-3 text-sm items-start group/item hover:bg-[#fafafa] rounded-lg p-1.5 -mx-1.5 transition-colors">
                      <span className="text-[#86868b] w-14 shrink-0 text-right tabular-nums font-sans">{item.time || '--:--'}</span>
                      <span className="text-[11px] bg-[#f5f5f7] px-1.5 py-0.5 rounded font-sans shrink-0 mt-0.5">{item.category || ''}</span>
                      <span className="font-medium font-sans">{item.title}</span>
                      {item.reason && <span className="text-[#86868b] text-[11px] font-sans">· {item.reason}</span>}
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-[#f0f0f5]">
                  <p className="text-xs text-[#0071e3] font-sans">
                    <span className="font-semibold">本日调整：</span>
                    {(day.changes_made as string[])?.join('；')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Daily Analysis ── */}
      <section className="mb-12">
        <h2 className="font-serif text-2xl font-medium mb-6 tracking-[-0.02em]">每日分析</h2>
        <div className="grid gap-3">
          {days.map((day, i) => (
            <motion.div key={day.day_index} custom={i} variants={cardAnim} initial="hidden" animate="visible"
              className="card p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[17px] font-sans">第 {day.day_index} 天</h3>
                <div className="flex items-center gap-2">
                  <span className={`badge font-sans ${riskChip[day.risk_level]}`}>{riskLevelText[day.risk_level]}</span>
                  <span className="text-xs text-[#86868b] font-sans">步行 {day.estimated_walking_intensity === 'high' ? '较多' : day.estimated_walking_intensity === 'medium' ? '适中' : '较少'}</span>
                </div>
              </div>
              {day.issues.length > 0 && (
                <ul className="space-y-1.5 mb-4">{day.issues.map((issue, j) => (
                  <li key={j} className="text-sm text-[#c62828] flex items-start gap-2 font-sans"><span className="shrink-0 mt-0.5 opacity-50">•</span> {issue}</li>))}
                </ul>
              )}
              {day.suggestions.length > 0 && (
                <ul className="space-y-1.5">{day.suggestions.map((s, j) => (
                  <li key={j} className="text-sm text-[#0071e3] flex items-start gap-2 font-sans"><span className="shrink-0 mt-0.5 opacity-50">→</span> {s}</li>))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Recommendations + Adopt ── */}
      {report.recommendations?.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-medium mb-6 tracking-[-0.02em]">修改建议</h2>
          <div className="grid gap-3">
            {report.recommendations.map((rec, i) => (
              <motion.div key={i} custom={i} variants={cardAnim} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="card p-6 bg-[#f8faff] border-[#dce8ff]">
                <h3 className="font-semibold text-[#0058c4] font-sans mb-1">{rec.title}</h3>
                <p className="text-sm text-[#0058c4]/75 leading-relaxed font-sans mb-3">{rec.details}</p>
                <FeedbackButtons tripId={tripId} reportId={reportId} riskKey={`rec_${i}`} onFeedback={() => {}} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Contingency ── */}
      {report.contingency_plans?.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-medium mb-6 tracking-[-0.02em]">应急预案</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {report.contingency_plans.map((plan, i) => (
              <motion.div key={i} custom={i} variants={cardAnim} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="card p-6 bg-[#fffaf5] border-[#ffe6d0]">
                <h3 className="font-semibold text-[#b85c00] font-sans mb-1">{plan.scenario}</h3>
                <p className="text-sm text-[#b85c00]/75 leading-relaxed font-sans">{plan.plan}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Communication Scripts + Copy ── */}
      {report.communication_scripts?.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-medium mb-6 tracking-[-0.02em]">沟通话术</h2>
          <div className="space-y-3">
            {report.communication_scripts.map((script, i) => (
              <motion.div key={i} custom={i} variants={cardAnim} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="card p-6 hover:shadow-md transition-all duration-200">
                <h3 className="text-xs font-semibold text-[#86868b] uppercase tracking-[0.08em] mb-4 font-sans">{script.scenario}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-[#fff5f5] rounded-xl p-4 relative group/sc">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[11px] font-semibold text-[#86868b] font-sans">中文</p>
                      <button onClick={() => copyText(`zh_${i}`, script.chinese)}
                        className="text-[10px] text-[#86868b] hover:text-[#0071e3] opacity-0 group-hover/sc:opacity-100 transition-opacity font-sans">
                        {copied === `zh_${i}` ? '已复制' : '复制'}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed font-sans">{script.chinese}</p>
                  </div>
                  {script.english && (
                    <div className="bg-[#f5f8ff] rounded-xl p-4 relative group/sc">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-semibold text-[#86868b] font-sans">English</p>
                        <button onClick={() => copyText(`en_${i}`, script.english!)}
                          className="text-[10px] text-[#86868b] hover:text-[#0071e3] opacity-0 group-hover/sc:opacity-100 transition-opacity font-sans">
                          {copied === `en_${i}` ? '已复制' : '复制'}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed font-sans">{script.english}</p>
                    </div>
                  )}
                  {script.local_language && (
                    <div className="bg-[#f5fff7] rounded-xl p-4 sm:col-span-2 relative group/sc">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[11px] font-semibold text-[#86868b] font-sans">{script.local_language_name || '当地语言'}</p>
                        <button onClick={() => copyText(`lo_${i}`, script.local_language!)}
                          className="text-[10px] text-[#86868b] hover:text-[#0071e3] opacity-0 group-hover/sc:opacity-100 transition-opacity font-sans">
                          {copied === `lo_${i}` ? '已复制' : '复制'}
                        </button>
                      </div>
                      <p className="text-sm leading-relaxed font-sans">{script.local_language}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA + 隐私声明 ── */}
      <div className="text-center py-10 space-y-3">
        <p className="text-sm text-[#86868b] font-sans">想要旅行中实时守护？</p>
        <button disabled className="btn-secondary opacity-50 cursor-not-allowed font-sans">旅行中实时守护 — 即将上线</button>
        <p className="text-[11px] text-[#86868b]/60 max-w-lg mx-auto leading-relaxed font-sans pt-4">
          AI Trip Guardian 第一版只提供风险分析和行程调整建议，不会自动预订、取消、改签、付款或联系任何商家。
          AI 建议可能不完整，请以航空公司、酒店、景点和当地官方信息为准。
          本报告不构成法律、医疗、签证或安全保证。遇到紧急情况，请联系当地紧急服务、酒店工作人员、保险公司或官方机构。
        </p>

        {/* Beta feedback */}
        <BetaFeedback tripId={tripId} />

        {/* Waitlist */}
        <div className="pt-4">
          <p className="text-xs text-[#86868b] mb-2 font-sans">想在旅行中获得实时提醒？</p>
          <WaitlistForm source="report" />
        </div>

        {/* Delete trip */}
        <DeleteTripButton tripId={tripId} />
      </div>
    </div>
  )
}
