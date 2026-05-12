'use client'

import { useEffect, useState } from 'react'

interface AdminData {
  totalTrips: number; completedTrips: number; failedTrips: number; todayTrips: number
  avgAnalysisDurationMs: number; feedbackCount: number; waitlistCount: number
  recentEvents: Array<{ event_name: string; created_at: string }>
  recentFeedback: Array<{ rating: string; comment: string; created_at: string }>
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Try URL param on mount
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('secret')
    if (s) { setSecret(s); fetchData(s) }
  }, [])

  const fetchData = async (s: string) => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(s)}`)
      if (!res.ok) throw new Error(res.status === 403 ? '密钥错误' : '加载失败')
      const d = await res.json()
      setData(d); setAuthed(true)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : '加载失败') }
    finally { setLoading(false) }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-5 py-32 text-center">
        <h1 className="font-serif text-3xl font-medium mb-6">Admin</h1>
        <input type="password" placeholder="输入密钥" value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData(secret)}
          className="input-apple mb-3" />
        <button onClick={() => fetchData(secret)} disabled={loading}
          className="btn-primary w-full">{loading ? '加载中…' : '进入'}</button>
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif text-3xl font-medium mb-8">Beta 运营面板</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[['总行程', data.totalTrips], ['已完成', data.completedTrips], ['失败', data.failedTrips], ['今日', data.todayTrips],
          ['反馈', data.feedbackCount], ['Waitlist', data.waitlistCount], ['平均耗时', `${data.avgAnalysisDurationMs || 0}ms`], ['', ''],
        ].map(([label, value]) => (
          <div key={label || Math.random()} className="card p-4 text-center">
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs text-[#86868b] mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-3">最近事件</h2>
          <div className="space-y-1 text-sm">
            {(data.recentEvents || []).map((e, i) => (
              <div key={i} className="flex justify-between text-[#86868b]">
                <span>{e.event_name}</span>
                <span>{new Date(e.created_at).toLocaleString('zh')}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-3">最近反馈</h2>
          <div className="space-y-2 text-sm">
            {(data.recentFeedback || []).map((f, i) => (
              <div key={i} className="card p-3">
                <span className="text-xs text-[#86868b]">{f.rating} · {new Date(f.created_at).toLocaleString('zh')}</span>
                {f.comment && <p className="mt-1">{f.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
