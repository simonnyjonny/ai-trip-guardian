# AI Trip Guardian — 部署前检查清单

每次 push 到 main 之前必须确认以下全部通过。

## Build

- [ ] `npm run build` 通过（不是 `npm run dev`）

## 类型安全

- [ ] `grep -R "as Record<string, unknown>" app/ lib/` 仅允许 `as unknown as Record` 双转换
- [ ] `grep -R "as Record<string, string>" app/ lib/` 返回 0
- [ ] `grep -R "as { id: string }" app/ lib/` 返回 0
- [ ] `grep -R " as any" app/ lib/` 仅 `lib/ai/client.ts` 允许

## 数据库同步

- [ ] 新 migration 已在 Supabase SQL Editor 执行
- [ ] 新字段已加入 `types/trip.ts` 或 `types/report.ts`
- [ ] 新字段已加入 Zod schema
- [ ] jsonb 字段有 typed default object

## Provider 一致性

- [ ] 所有 provider 返回相同 interface
- [ ] Mock/fallback provider 字段不缺失

## 安全

- [ ] `SUPABASE_SERVICE_ROLE_KEY` 仅 server-side 使用
- [ ] `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` 未出现在 client bundle
- [ ] `/share/[token]` 不返回 raw_input
- [ ] `/admin` 不展示 raw_input / API key
- [ ] agent_runs.input 已脱敏

## 页面

- [ ] 新增 jsonb 模块有 typed default object
- [ ] 数组渲染前有 `Array.isArray` 检查
- [ ] `/privacy` 页面存在
- [ ] 删除 trip 可用

## Vercel

- [ ] 所有环境变量已配置
- [ ] `NEXT_PUBLIC_APP_URL` 为正确的生产 URL
- [ ] `ADMIN_SECRET` 已设置

## 功能

- [ ] 东京样例线上跑通
- [ ] 分享页不泄露 raw_input
- [ ] waitlist 可提交
- [ ] beta feedback 可提交
- [ ] delete trip 可用
