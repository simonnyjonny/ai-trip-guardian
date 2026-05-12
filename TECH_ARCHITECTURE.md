# AI Trip Guardian — 技术架构

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 · framer-motion |
| AI | DeepSeek v4 (主) / OpenAI (备) · OpenAI SDK 统一接口 |
| 校验 | Zod (API 输入 → AI 输出 → DB 存储) |
| 数据库 | Supabase PostgreSQL (11 表) |
| 部署 | Vercel (GitHub 自动部署) |

## 数据流

```
用户粘贴行程 → POST /api/trips → trips (draft)
→ /analyzing → POST /analysis/start → queued
→ POST /analysis/parse → DeepSeek → itinerary_items → parsed
→ POST /analysis/report → DeepSeek → risk_reports → completed
→ /report 展示
```

## API 端点 (16 个)

### 行程管理
- `POST /api/trips` — 创建 trip
- `GET /api/trips/[tripId]` — 获取 trip + items
- `DELETE /api/trips/[tripId]` — CASCADE 删除

### 分阶段分析
- `POST /analysis/start` — 幂等启动
- `POST /analysis/parse` — AI 解析行程
- `POST /analysis/report` — AI 生成报告
- `GET /analysis/status` — 查询进度
- `POST /analysis/retry` — 失败重试

### 报告与分享
- `GET /api/trips/[tripId]/report` — 获取报告
- `POST /api/trips/[tripId]/share` — 30 天分享链接
- `GET /api/share/[token]` — 只读分享

### 反馈与收集
- `POST /api/trips/[tripId]/feedback` — 风险反馈
- `POST /api/trips/[tripId]/beta-feedback` — Beta 满意度
- `POST /api/waitlist` — 邮箱收集

### 管理
- `GET /api/admin/stats` — 运营面板

## 数据库 (11 张表)

trips · trip_documents · itinerary_items · risk_reports · agent_runs
risk_feedback · report_shares · product_events · beta_feedback
waitlist_signups · users

## AI 引擎

- Provider: DeepSeek (deepseek-chat) / OpenAI (gpt-4.1-mini)
- parseTripInput: temperature 0.1, retry 1 次
- generateRiskReport: temperature 0.3, retry 1 次
- agent_runs 记录: provider, model, duration_ms, 脱敏 input

## 成本保护

- raw_input 10–12,000 字符限制
- 每 trip 最多 3 次分析
- 相同 input hash 复用已有结果
- IP 级 rate limit (内存)

## 安全

- SUPABASE_SERVICE_ROLE_KEY 仅在 server 端
- agent_runs.input 脱敏 (redact.ts)
- 分享页不暴露 raw_input
- 删除 CASCADE 清除全部关联数据

## 部署架构

```
海外 Beta: Vercel (vercel.app)
中国站:   EdgeOne Pages / 阿里云 ESA / Docker 自部署
数据库:   Supabase PostgreSQL (新加坡/日本节点)
AI:       DeepSeek v4 (国内可用)
天气:     高德 (国内) / OpenWeather (出境)
```

详见 [DEPLOYMENT_CHINA.md](DEPLOYMENT_CHINA.md) 和 [PROVIDER_STRATEGY.md](PROVIDER_STRATEGY.md)

## 健康检查

`GET /api/health` — 返回 `{ok, app, region, timestamp, providers}`，不泄露密钥。

## Docker

`output: "standalone"` — 支持 Vercel + Docker 双部署模式。
