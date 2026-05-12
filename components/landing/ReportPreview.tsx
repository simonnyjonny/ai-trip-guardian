'use client'

import { motion } from 'framer-motion'

export default function ReportPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
      className="relative max-w-3xl mx-auto"
    >
      {/* Browser frame */}
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-white/60 bg-white">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#fafafa] border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-[#f0f0f5] rounded-md h-6 w-2/3 mx-auto" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 md:p-8 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-16 bg-[#e8e8ed] rounded mb-2" />
              <div className="h-5 w-40 bg-[#e8e8ed] rounded" />
            </div>
            <div className="w-[72px] h-[72px] rounded-full border-[6px] border-[#ff6d00] flex items-center justify-center">
              <span className="text-lg font-bold text-[#ff6d00]">72</span>
            </div>
          </div>

          {/* Risk bars */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="badge bg-[#ffebee] text-[#c62828] text-[11px]">高风险</span>
              <div className="h-2 flex-1 bg-[#f0f0f5] rounded-full overflow-hidden">
                <div className="h-full w-4/5 bg-[#ff3b30] rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge bg-[#fff3e0] text-[#ef6c00] text-[11px]">中高</span>
              <div className="h-2 flex-1 bg-[#f0f0f5] rounded-full overflow-hidden">
                <div className="h-full w-3/5 bg-[#ff6d00] rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="badge bg-[#fff8e1] text-[#f9a825] text-[11px]">中</span>
              <div className="h-2 flex-1 bg-[#f0f0f5] rounded-full overflow-hidden">
                <div className="h-full w-2/5 bg-[#ff9500] rounded-full" />
              </div>
            </div>
          </div>

          {/* Scripts preview */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#fff5f5] rounded-lg p-2.5">
              <div className="h-1.5 w-6 bg-[#e0e0e0] rounded mb-2" />
              <div className="h-2 w-full bg-[#f0d0d0] rounded mb-1" />
              <div className="h-2 w-3/4 bg-[#f0d0d0] rounded" />
            </div>
            <div className="bg-[#f5f8ff] rounded-lg p-2.5">
              <div className="h-1.5 w-10 bg-[#e0e0e0] rounded mb-2" />
              <div className="h-2 w-full bg-[#d0d8f0] rounded mb-1" />
              <div className="h-2 w-2/3 bg-[#d0d8f0] rounded" />
            </div>
            <div className="bg-[#f5fff7] rounded-lg p-2.5">
              <div className="h-1.5 w-8 bg-[#e0e0e0] rounded mb-2" />
              <div className="h-2 w-full bg-[#d0f0d8] rounded mb-1" />
              <div className="h-2 w-1/2 bg-[#d0f0d8] rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating glow */}
      <div className="absolute -inset-4 bg-gradient-to-b from-[#0071e3]/5 to-transparent rounded-3xl -z-10 blur-2xl" />
    </motion.div>
  )
}
