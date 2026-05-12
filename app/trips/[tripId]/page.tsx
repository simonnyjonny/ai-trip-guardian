'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Trip, ItineraryItem, RiskLevel } from '@/types/trip'

const categoryIcons: Record<string, string> = {
  flight: '✈️', hotel: '🏨', activity: '📍', restaurant: '🍽️',
  transport: '🚇', shopping: '🛍️', rest: '😴', other: '',
}

const riskDot: Record<string, string> = {
  low: 'bg-[#34c759]', medium: 'bg-[#ff9500]',
  medium_high: 'bg-[#ff6d00]', high: 'bg-[#ff3b30]',
}

const cardAnim = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.4, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter()
  const [tripId, setTripId] = useState('')
  const [loading, setLoading] = useState(true)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [items, setItems] = useState<ItineraryItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(async ({ tripId: id }) => {
      setTripId(id)
      try {
        const res = await fetch(`/api/trips/${id}`)
        if (!res.ok) throw new Error('加载失败')
        const data = await res.json()
        setTrip(data.trip)
        setItems(data.items || [])
      } catch (err: unknown) { setError(err instanceof Error ? err.message : '加载失败') }
      finally { setLoading(false) }
    })
  }, [params])

  if (loading) return (
    <div className="flex justify-center py-32">
      <svg className="animate-spin h-6 w-6 text-[#0071e3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )

  if (error || !trip) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center text-[#c62828] font-sans">
      {error || '行程不存在'}
    </div>
  )

  const days = new Map<number, ItineraryItem[]>()
  items.forEach((item) => {
    const list = days.get(item.day_index) || []
    list.push(item)
    days.set(item.day_index, list)
  })

  const statusMap: Record<string, string> = { draft: '草稿', analyzing: '分析中', completed: '已完成', failed: '失败' }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <h1 className="font-serif text-[clamp(1.75rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.03em] mb-1">
            {trip.title || '行程详情'}
          </h1>
          <p className="text-[#86868b] font-sans">{trip.destination} · {trip.start_date} – {trip.end_date}</p>
        </div>
        <span className="badge bg-[#e8e8ed] text-[#86868b] font-sans">{statusMap[trip.status] || trip.status}</span>
      </motion.div>

      {trip.status === 'completed' && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => router.push(`/trips/${tripId}/report`)}
          className="btn-primary mb-8 font-sans"
        >
          查看风险报告 →
        </motion.button>
      )}

      {trip.status === 'draft' && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          onClick={() => router.push(`/trips/${tripId}/analyzing`)}
          className="btn-primary mb-8 font-sans"
        >
          开始分析
        </motion.button>
      )}

      <div className="space-y-6">
        {Array.from(days.entries())
          .sort(([a], [b]) => a - b)
          .map(([dayIndex, dayItems], di) => (
            <motion.div
              key={dayIndex}
              custom={di}
              variants={cardAnim}
              initial="hidden"
              animate="visible"
              className="card p-5 md:p-6"
            >
              <h2 className="font-serif text-xl font-medium mb-4 pb-3 border-b border-[#f0f0f5]">
                第 {dayIndex} 天
              </h2>
              <div className="space-y-2">
                {dayItems.map((item) => (
                  <div key={item.id} className="flex gap-3 group/item hover:bg-[#fafafa] rounded-lg p-2 -mx-2 transition-colors">
                    <div className="w-14 text-xs text-[#86868b] shrink-0 pt-0.5 text-right tabular-nums font-sans">
                      {item.start_time || '—'}
                    </div>
                    <div className="w-1.5 shrink-0 flex flex-col items-center pt-1.5">
                      <div className={`w-2 h-2 rounded-full ${riskDot[item.risk_level] || 'bg-[#e8e8ed]'}`} />
                      <div className="w-px flex-1 bg-[#e8e8ed] mt-1 group-last/item:opacity-0" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px]">{categoryIcons[item.category] || ''}</span>
                        <span className="font-medium text-[15px] font-sans">{item.title}</span>
                      </div>
                      <div className="flex gap-2 text-xs text-[#86868b] mt-1 font-sans">
                        {item.location_name && <span>{item.location_name}</span>}
                        <span className="bg-[#f5f5f7] px-1.5 rounded">{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        {days.size === 0 && (
          <p className="text-center text-[#86868b] py-10 font-sans">分析完成后将显示结构化行程。</p>
        )}
      </div>
    </div>
  )
}
