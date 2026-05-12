# AI Trip Guardian — 更新日志

## Sprint 5 (2026-05-12)
- Product Validation & Trust
- 隐私页面 /privacy
- 付费意愿 willingness_to_pay
- 复制调整版行程
- 10 个测试样例库
- PRODUCT_SPEC / TECH_ARCHITECTURE / BETA_TESTING_PLAN 文档

## Sprint 4 (2026-05-12)
- Production Deployment & QA
- Vercel 部署上线
- TypeScript build 修复
- 生产环境 smoke test

## Sprint 3 (2026-05-12)
- Beta Launch Readiness
- product_events 事件埋点
- beta_feedback + waitlist_signups 表
- Admin 运营面板 (/admin)
- Demo 报告页 (/demo-report)
- Rate limiting (IP 级)
- 环境变量校验 (lib/env.ts)
- 统一日志 (lib/logger.ts)
- 输入脱敏 (lib/privacy/redact.ts)

## Sprint 2 (2026-05-12)
- Stability & Production Readiness
- 分阶段分析 (start/parse/report/status/retry)
- 幂等控制 (input hash 复用)
- 分析次数限制 (3 次)
- 删除 trip (CASCADE)
- agent_runs duration_ms/provider/model
- 分享 30 天过期
- 标准化错误处理 (lib/errors.ts)

## Sprint 1 (2026-05-11)
- Product Capability Upgrade
- dimension_scores (6 维度评分)
- optimized_itinerary (AI 推荐调整版行程)
- risk_feedback 反馈表
- report_shares 分享表
- 反馈按钮 + 复制/导出/分享

## Sprint 0 (2026-05-11)
- MVP Foundation
- Next.js + Tailwind + Supabase
- 首页 /trips/new /report 基础页面
- AI parse + risk report 双函数
- 5 个基础 API 端点
- Apple 风格 UI 设计系统
