import type { RiskReportSchema } from "./schemas"
import type { Trip } from "@/types/trip"
import type { ItineraryItem } from "@/types/trip"

export function generateFallbackRiskReport(params: {
  trip: Trip
  items: ItineraryItem[]
  weatherSummary?: unknown
  transferPlans?: unknown
}): RiskReportSchema {
  const days = [...new Set(params.items.map(i => i.day_index))].sort((a, b) => a - b)
  const totalItems = params.items.length

  const isRushed = params.trip.pace === "packed"
  const hasElderly = params.trip.traveler_type === "with_parents"
  const hasKids = params.trip.traveler_type === "with_children"

  const score = isRushed ? 65 : hasElderly || hasKids ? 55 : 45
  const level = score <= 30 ? "low" as const : score <= 60 ? "medium" as const : score <= 80 ? "medium_high" as const : "high" as const

  return {
    overall_score: score,
    overall_level: level,
    summary: `AI 没能完整生成高级报告，以下为基于行程结构（${days.length} 天 ${totalItems} 个活动）生成的基础风险分析。建议重新提交更清晰的行程文本以获得更详细的分析。`,
    dimension_scores: {
      time_conflict: isRushed ? 70 : 45,
      route_efficiency: 50,
      physical_load: hasElderly || hasKids ? 65 : 45,
      booking_risk: 50,
      language_risk: 50,
      contingency_readiness: 50,
    },
    top_risks: [
      { title: "基础风险分析", level: level as "low" | "medium" | "medium_high" | "high", reason: "由于行程解析不完整，本报告仅提供基础风险分析。建议检查每日活动数量、跨区移动和体力负担。", suggestion: "重新提交包含时间、地点和交通方式的详细行程以获得完整分析。" },
    ],
    daily_analysis: days.map(d => ({
      day_index: d,
      risk_level: (isRushed ? "medium_high" : "medium") as const,
      estimated_walking_intensity: "medium" as const,
      issues: ["基础分析模式，未生成详细问题"],
      suggestions: ["确认活动时间", "预留交通缓冲", "关注天气变化"],
    })),
    recommendations: [
      { title: "提供更详细的行程", details: "包含具体时间、地点名称和交通方式可以获得更精准的风险分析。" },
    ],
    optimized_itinerary: days.map(d => ({
      day_index: d,
      theme: `Day ${d} 行程`,
      risk_reduction_summary: "基础模式，未生成优化建议",
      items: params.items.filter(i => i.day_index === d).map(i => ({
        time: i.start_time || null,
        title: i.title,
        location_name: i.location_name || null,
        category: i.category,
        reason: "原始行程保留",
      })),
      changes_made: ["基础分析模式，未生成调整建议"],
    })),
    contingency_plans: [
      { scenario: "天气变化", plan: "查看当地天气预报，准备替代室内活动。" },
      { scenario: "交通延误", plan: "预留额外出发时间，提前查看交通状况。" },
    ],
    communication_scripts: [
      { scenario: "酒店入住", chinese: "您好，我有预约，这是确认信息。", english: "Hello, I have a reservation." },
    ],
    packing_recommendations: {
      clothing: ["轻便衣物", "薄外套"],
      footwear: ["舒适步行鞋"],
      rainGear: ["折叠伞"],
      sunProtection: ["防晒霜", "遮阳帽"],
      healthAndComfort: ["常用药品", "水杯"],
      childOrElderlyNotes: hasElderly || hasKids ? ["额外休息时间", "适合体力的活动安排"] : [],
      destinationSpecificNotes: [],
    },
  }
}
