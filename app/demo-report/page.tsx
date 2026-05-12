'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { riskLevelText } from '@/lib/risk-ui'
import type { RiskLevel } from '@/types/trip'

const riskChip: Record<RiskLevel, string> = { low: 'bg-[#e8f5e9] text-[#2e7d32]', medium: 'bg-[#fff8e1] text-[#f9a825]', medium_high: 'bg-[#fff3e0] text-[#ef6c00]', high: 'bg-[#ffebee] text-[#c62828]' }

const dimLabels: Record<string, string> = { time_conflict: '时间冲突', route_efficiency: '路线合理性', physical_load: '体力负担', booking_risk: '预约与营业风险', language_risk: '语言沟通', contingency_readiness: '应急准备' }

const dims = { time_conflict: 82, route_efficiency: 74, physical_load: 88, booking_risk: 58, language_risk: 72, contingency_readiness: 66 }
const topRisks = [
  { title: 'Day 1 抵达后安排过满', level: 'high' as RiskLevel, reason: '长途飞行后马上安排浅草、秋叶原和东京塔，对 5 岁孩子体力压力较高。', suggestion: '第一天只保留酒店寄存、浅草午餐和新宿附近晚餐。' },
  { title: '亲子行程缺休息时间', level: 'high' as RiskLevel, reason: '多天未安排午休，迪士尼全天无休息对儿童体力挑战较大。', suggestion: '每日中午安排至少 1 小时休息时间，迪士尼安排在园区休息区午休。' },
  { title: '跨区移动频繁', level: 'medium_high' as RiskLevel, reason: 'Day 2 明治神宫→原宿→涩谷→银座，跨 4 个区域。', suggestion: '将同日活动集中在相邻区域，减少交通换乘。' },
]
const optDays = [
  { day_index: 1, theme: '低强度抵达日', risk_reduction_summary: '减少跨区移动，保留轻量活动和休息时间。', items: [
    { time: '05:00', title: '抵达东京羽田机场', category: 'flight' },
    { time: '09:00', title: '酒店寄存行李', category: 'hotel' },
    { time: '11:00', title: '浅草轻量游览和午餐', category: 'activity' },
    { time: '15:30', title: '返回酒店 check-in 和休息', category: 'rest' },
  ], changes_made: ['删除秋叶原', '东京塔改到 Day 4', '增加酒店休息时间'] },
]

export default function DemoReport() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-10 md:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <p className="text-sm text-[#86868b] mb-1">东京 · 2026-07-12 – 2026-07-17</p>
        <h1 className="font-serif text-3xl font-medium">示例报告</h1>
        <p className="text-sm text-[#86868b] mt-2">亲子家庭 · 6 天 · 日语较弱 · 需要午休</p>
      </motion.div>

      <div className="card p-6 mb-8 text-center">
        <div className="text-5xl font-bold text-[#ff6d00]">78</div>
        <div className="text-sm text-[#86868b] mt-1">中高风险</div>
        <p className="text-sm text-[#86868b] mt-3 max-w-md mx-auto">本次行程整体风险中高，主要问题是抵达日安排过满、亲子休息不足、跨区移动偏多。</p>
      </div>

      <h2 className="font-serif text-xl font-medium mb-4">风险维度</h2>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {Object.entries(dims).map(([k, v]) => (
          <div key={k} className="card p-4"><div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{dimLabels[k]}</span><span className={v <= 30 ? 'text-[#34c759]' : v <= 60 ? 'text-[#ff9500]' : v <= 80 ? 'text-[#ff6d00]' : 'text-[#ff3b30]'}>{v}</span></div><div className="h-1.5 bg-[#e8e8ed] rounded-full"><div className="h-1.5 rounded-full" style={{ width: `${v}%`, background: v <= 30 ? '#34c759' : v <= 60 ? '#ff9500' : v <= 80 ? '#ff6d00' : '#ff3b30' }} /></div></div>
        ))}</div>

      <h2 className="font-serif text-xl font-medium mb-4">重要风险</h2>
      <div className="space-y-3 mb-8">{topRisks.map((r, i) => (
        <div key={i} className="card p-5"><span className={`badge text-[11px] mb-2 ${riskChip[r.level]}`}>{riskLevelText[r.level]}</span><h3 className="font-semibold mt-1">{r.title}</h3><p className="text-sm text-[#86868b] mt-1">{r.reason}</p><p className="text-sm text-[#0071e3] mt-2">→ {r.suggestion}</p></div>
      ))}</div>

      <h2 className="font-serif text-xl font-medium mb-4">AI 推荐调整</h2>
      {optDays.map((day, i) => (
        <div key={i} className="card p-5 mb-3 border-l-4 border-l-[#0071e3]">
          <span className="badge bg-[#f0f5ff] text-[#0071e3] text-[11px]">Day {day.day_index} · {day.theme}</span>
          <p className="text-sm text-[#86868b] my-2">{day.risk_reduction_summary}</p>
          {day.items.map((it, j) => (
            <div key={j} className="flex gap-2 text-sm mt-1"><span className="w-12 text-[#86868b]">{it.time}</span><span className="text-[11px] bg-[#f5f5f7] px-1 rounded">{it.category}</span><span className="font-medium">{it.title}</span></div>
          ))}
          <p className="text-xs text-[#0071e3] mt-3">调整：{day.changes_made.join('；')}</p>
        </div>
      ))}

      {/* Weather */}
      <h2 className="font-serif text-xl font-medium mb-4 mt-8">机场交通方案</h2>
      <div className="card p-5 mb-4">
        <span className="badge bg-[#e3f2fd] text-[#1565c0] text-[11px] mb-2">抵达 → 酒店</span>
        <h3 className="font-semibold mb-1">从羽田机场到新宿酒店</h3>
        <p className="text-sm text-[#86868b] mb-3">推荐打车，约 30 分钟 ¥200-400。深夜到达或带小孩建议打车，避免公共交通换乘。</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="card p-3 bg-[#f8fff8]"><p className="text-xs font-semibold">打车/网约车</p><p className="text-[11px] text-[#86868b]">⏱ ~30min 💰 ¥40-80</p><p className="text-[10px] text-[#34c759] mt-1">✓ 推荐</p></div>
          <div className="card p-3"><p className="text-xs font-semibold">公共交通</p><p className="text-[11px] text-[#86868b]">⏱ ~50min 💰 ¥3-10</p><p className="text-[10px] text-[#ff9500] mt-1">⚠ 需换乘</p></div>
        </div>
      </div>

      <h2 className="font-serif text-xl font-medium mb-4 mt-8">天气与出行准备</h2>
      <div className="card p-5 mb-3">
        <p className="text-sm text-[#86868b] mb-3">东京 7月：炎热潮湿，最高 30°C，最低 23°C。降雨概率 45%。</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['07-12','07-13','07-14','07-15','07-16','07-17'].map((d, i) => (
            <div key={i} className="card p-2 text-center">
              <p className="text-[10px] text-[#86868b]">{d}</p>
              <p className="font-semibold">{28 + i}°</p>
              <p className="text-[10px]">{['晴','多云','阵雨','多云','晴','阵雨'][i]}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#86868b]/60 italic">当前为模拟天气数据，请以官方天气预报为准。</p>
      </div>
      <h3 className="text-lg font-semibold font-sans mb-2">建议携带</h3>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[{k:'衣物',v:'轻便T恤、薄外套、防晒衣、雨衣'},{k:'鞋子',v:'舒适步行鞋、凉拖鞋'},{k:'雨具',v:'折叠伞、防水背包罩'},{k:'防晒',v:'SPF50+防晒霜、遮阳帽、太阳镜'},{k:'健康',v:'补水水瓶、湿巾、儿童退烧药'},{k:'儿童',v:'午休小毯、零食、便携风扇'}].map(({k,v}) => (
          <div key={k} className="card p-3"><p className="text-xs font-semibold text-[#86868b]">{k}</p><p className="text-sm">{v}</p></div>
        ))}
      </div>

      <div className="text-center py-8 border-t mt-8">
        <p className="text-lg text-[#86868b] mb-4">这是示例报告。你的真实行程将生成专属分析。</p>
        <Link href="/trips/new" className="btn-primary">开始检测我的行程</Link>
      </div>
    </div>
  )
}
