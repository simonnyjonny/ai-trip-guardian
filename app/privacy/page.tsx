import type { Metadata } from 'next'

export const metadata: Metadata = { title: '隐私与数据保护 — Trip Guardian' }

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12 md:py-20">
      <h1 className="font-serif text-3xl font-medium mb-8">隐私与数据保护</h1>

      <div className="space-y-8 text-[15px] leading-relaxed text-[#1d1d1f]">
        <section>
          <h2 className="text-lg font-semibold mb-2">我们收集什么数据</h2>
          <p className="text-[#86868b]">
            你粘贴的行程文本、目的地、出行日期、同行类型、旅行节奏、语言能力和特殊需求。
            这些数据仅用于生成你的专属风险分析报告。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">我们如何使用你的数据</h2>
          <ul className="space-y-2 text-[#86868b] list-disc pl-5">
            <li>AI 解析行程文本为结构化时间线</li>
            <li>AI 分析时间冲突、路线、体力、预约和语言风险</li>
            <li>生成 AI 推荐调整版行程和多语言沟通话术</li>
            <li>收集匿名反馈用于改进产品</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">我们不会做什么</h2>
          <ul className="space-y-2 text-[#86868b] list-disc pl-5">
            <li>自动预订、取消、改签、付款或联系任何商家</li>
            <li>将你的行程数据用于广告或推荐</li>
            <li>在分享页展示你的原始行程文本</li>
            <li>将原始行程文本写入 AI 调用日志</li>
            <li>保留护照号、信用卡号、订单号等敏感信息</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">分享功能</h2>
          <p className="text-[#86868b]">
            你可以生成报告的只读分享链接。分享页展示风险评分、维度分析、Top 风险和优化行程，
            但<strong>不会展示原始行程文本、订单号或 AI 调用日志</strong>。分享链接 30 天后自动失效。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">删除数据</h2>
          <p className="text-[#86868b]">
            你可以在报告页底部点击「删除本次行程数据」。删除后该行程及关联的所有数据
            （包括时间线、风险报告、反馈、分享链接、AI 日志）将被永久删除且无法恢复。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">重要声明</h2>
          <p className="text-[#86868b]">
            AI Trip Guardian 提供的是风险分析和行程调整建议。
            AI 建议不构成法律、医疗、签证或安全保证。
            涉及航班、酒店、景点营业时间等事项，请以官方信息为准。
            遇到紧急情况，请联系当地紧急服务、酒店工作人员、保险公司或官方机构。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">联系我们</h2>
          <p className="text-[#86868b]">
            如有隐私相关问题，请联系 GitHub 仓库：
            github.com/simonnyjonny/ai-trip-guardian
          </p>
        </section>
      </div>
    </div>
  )
}
