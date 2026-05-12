import type { Metadata } from 'next'
import GlassHeader from '@/components/landing/GlassHeader'
import './globals.css'

export const metadata: Metadata = {
  title: 'Trip Guardian — AI 行程风险体检',
  description: '上传你的旅行计划，AI 帮你提前发现时间冲突、路线过远、体力负担和语言风险。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased font-sans">
        <GlassHeader />
        <main>{children}</main>
        <footer className="border-t border-black/[0.04]">
          <div className="max-w-6xl mx-auto px-5 py-10 text-center text-sm text-[#86868b] space-y-2">
            <p>Trip Guardian — 你的旅行计划，值得被 AI 审视一次。</p>
            <p>
              <a href="/privacy" className="underline underline-offset-4 hover:text-[#0071e3] transition-colors">隐私与数据保护</a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
