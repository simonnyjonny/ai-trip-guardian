import type { RiskLevel } from "@/types/trip";

export const riskLevelText: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  medium_high: "中高风险",
  high: "高风险",
};

export function getRiskScoreLabel(score: number) {
  if (score <= 30) return "整体较稳";
  if (score <= 60) return "有一些需要注意的问题";
  if (score <= 80) return "存在明显风险，建议调整";
  return "风险较高，强烈建议重排";
}

export function getRiskBadgeVariant(level: RiskLevel) {
  if (level === "low") return "secondary";
  if (level === "medium") return "outline";
  if (level === "medium_high") return "default";
  return "destructive";
}
