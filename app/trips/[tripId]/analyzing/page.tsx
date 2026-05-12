'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const STAGES = [
  { key: 'queued', label: '正在读取你的行程安排' },
  { key: 'parsing', label: '正在整理为时间线' },
  { key: 'parsed', label: '时间线整理完成' },
  { key: 'generating_report', label: '正在分析时间、路线和体力风险' },
  { key: 'completed', label: '报告已生成' },
]

export default function AnalyzingPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter()
  const started = useRef(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [error, setError] = useState('')
  const [retrying, setRetrying] = useState(false)

  const runAnalysis = useCallback(async (tripId: string) => {
    if (started.current) return
    started.current = true

    try {
      // Step 1: Start
      const startRes = await fetch(`/api/trips/${tripId}/analysis/start`, { method: 'POST' })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || '启动失败')
      if (startData.skipped || startData.stage === 'completed') {
        router.push(`/trips/${tripId}/report`)
        return
      }
      if (startData.alreadyRunning) {
        // Poll status
        pollStatus(tripId)
        return
      }
      setStageIdx(1)

      // Step 2: Parse
      const parseRes = await fetch(`/api/trips/${tripId}/analysis/parse`, { method: 'POST' })
      const parseData = await parseRes.json()
      if (!parseRes.ok) throw new Error(parseData.error || '解析失败')
      setStageIdx(2)

      // Step 3: Report
      setStageIdx(3)
      const reportRes = await fetch(`/api/trips/${tripId}/analysis/report`, { method: 'POST' })
      const reportData = await reportRes.json()
      if (!reportRes.ok) throw new Error(reportData.error || '报告生成失败')

      setStageIdx(4)
      // Short pause so user sees "completed"
      await new Promise((r) => setTimeout(r, 600))
      router.push(`/trips/${tripId}/report`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试。')
    }
  }, [router])

  const pollStatus = useCallback(async (tripId: string) => {
    const check = async () => {
      const res = await fetch(`/api/trips/${tripId}/analysis/status`)
      const data = await res.json()
      if (data.stage === 'completed') {
        router.push(`/trips/${tripId}/report`)
        return
      }
      if (data.stage === 'failed') {
        setError(data.error || '分析失败，请稍后重试。')
        return
      }
      if (data.stage === 'parsed') setStageIdx(2)
      if (data.stage === 'generating_report') setStageIdx(3)
      setTimeout(check, 2000)
    }
    check()
  }, [router])

  const handleRetry = async () => {
    setRetrying(true)
    setError('')
    params.then(({ tripId }) => {
      fetch(`/api/trips/${tripId}/analysis/retry`, { method: 'POST' }).then((r) => r.json()).then((d) => {
        started.current = false
        setStageIdx(0)
        setRetrying(false)
        runAnalysis(tripId)
      }).catch(() => setRetrying(false))
    })
  }

  useEffect(() => {
    params.then(({ tripId }) => runAnalysis(tripId))
  }, [params, runAnalysis])

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-5 py-32 text-center">
        <div className="text-6xl mb-6">—</div>
        <h1 className="font-serif text-3xl font-medium mb-2">分析中断</h1>
        <p className="body-lg mb-8">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.back()} className="btn-secondary font-sans">返回</button>
          <button onClick={handleRetry} disabled={retrying} className="btn-primary font-sans">
            {retrying ? '正在重试…' : '重新分析'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-[#f0f5ff] flex items-center justify-center">
          <svg className="animate-spin h-9 w-9 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-medium mb-2 tracking-[-0.02em]">正在分析你的行程</h1>
        <p className="text-[15px] text-[#86868b] font-sans">AI 正在逐项检查你的旅行安排</p>
      </motion.div>

      <div className="space-y-2 mb-10">
        {STAGES.map((stage, i) => {
          const done = i < stageIdx
          const active = i === stageIdx
          return (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 font-sans ${
                active ? 'bg-[#f0f5ff]' : done ? 'bg-transparent' : ''
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  done
                    ? 'bg-[#34c759] text-white'
                    : active
                    ? 'bg-[#0071e3] text-white'
                    : 'bg-[#e8e8ed]'
                }`}
              >
                {done ? '✓' : ''}
              </div>
              <span
                className={`text-[15px] transition-colors ${
                  active ? 'text-[#0071e3] font-medium' : done ? 'text-[#1d1d1f]' : 'text-[#86868b]'
                }`}
              >
                {stage.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
