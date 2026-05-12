# 🛡️ AI Trip Guardian

> 出国自由行，别等出问题才发现行程有坑。

AI Trip Guardian 是一个旅行风险体检工具。上传你的行程，AI 帮你提前发现时间冲突、路线不合理、人群不适配、语言障碍和异常预案缺失等问题。

## MVP 功能

- ✅ 粘贴行程文本，自动解析为结构化行程
- ✅ AI 全面风险分析（12 个评估维度）
- ✅ 每日风险等级 + 步行强度评估
- ✅ 最重要的 5 个风险排名
- ✅ 修改建议 + 异常预案
- ✅ 多语言沟通话术（中/英/当地语言）
- ✅ Mobile-first 响应式设计
- ✅ 匿名使用，无需注册

## 技术栈

| 类型 | 技术 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS 4 |
| Database | Supabase / PostgreSQL |
| AI | OpenAI GPT-4o |
| Validation | Zod |
| Deployment | Vercel |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
OPENAI_API_KEY=sk-your-key
OPENAI_MODEL=gpt-4o
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 初始化数据库

在 Supabase SQL Editor 中运行 `supabase/migrations/001_initial_schema.sql`

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

## 项目结构

```
app/
  page.tsx                          # Landing page
  layout.tsx                        # Root layout
  trips/
    new/page.tsx                    # Create trip form
    [tripId]/
      page.tsx                      # Trip detail (timeline)
      analyzing/page.tsx            # Live analysis progress
      report/page.tsx               # Risk report
  api/trips/
    route.ts                        # POST - create trip
    [tripId]/
      route.ts                      # GET - trip detail
      upload/route.ts               # POST - file upload
      analyze/route.ts              # POST - trigger AI analysis
      report/route.ts               # GET - risk report

lib/
  ai/
    client.ts                       # OpenAI client wrapper
    parse-trip.ts                   # parseTripInput function
    risk-report.ts                  # generateRiskReport function
    schemas.ts                      # Zod schemas + types
  db/
    supabase.ts                     # Supabase client
    queries.ts                      # Database CRUD operations

types/
  trip.ts                           # Shared TypeScript types

supabase/migrations/
  001_initial_schema.sql            # Database schema + RLS
```

## API 路由

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/trips` | 创建行程 |
| GET | `/api/trips/[tripId]` | 获取行程和结构化数据 |
| POST | `/api/trips/[tripId]/upload` | 上传文件（PDF/图片） |
| POST | `/api/trips/[tripId]/analyze` | AI 解析行程 + 生成风险报告 |
| GET | `/api/trips/[tripId]/report` | 获取风险报告 |

## 用户流程

1. 打开首页 → 点击"免费检测我的行程风险"
2. 填写目的地、日期、出行信息
3. 粘贴行程文本（如东京7日游计划）
4. 点击"开始分析"
5. 实时查看分析进度
6. 查看完整风险报告

## 风险评分维度

1. 抵达当天行程过满
2. 离境当天安排过满
3. 每日活动数量过多
4. 跨区移动过多
5. 带父母/老人步行强度
6. 亲子旅行休息时间
7. 餐厅/景点预约时间紧
8. 酒店入住空档不合理
9. 语言能力弱 + 复杂沟通
10. 缺少异常预案
11. 晚间活动过多
12. 没有缓冲时间

## 部署模式

### Vercel (海外 Beta)
```bash
vercel
```
配置所有环境变量后部署。生产 URL: https://ai-trip-guardian.vercel.app

### 中国访问
Vercel `.vercel.app` 域名在中国大陆可能不稳定。
- 短期: 绑定自定义域名
- 中期: 中国镜像站 (EdgeOne Pages / 阿里云 ESA)
- 长期: ICP 备案 + 国内服务器
详见 [DEPLOYMENT_CHINA.md](DEPLOYMENT_CHINA.md)

### Docker / 自部署
```bash
docker build -t ai-trip-guardian .
docker run -p 3000:3000 --env-file .env.local ai-trip-guardian
```

### 健康检查
`GET /api/health` — 用于确认服务正常，不泄露任何密钥。

### Provider 策略
国内优先高德天气/地图/DeepSeek AI，出境优先 OpenWeather/Google Maps。
详见 [PROVIDER_STRATEGY.md](PROVIDER_STRATEGY.md)

## 当前 Sprint 状态
- ✅ Sprint 0-4: MVP + stability + beta launch + Vercel deploy
- ✅ Sprint 5: Product validation & trust
- ✅ Sprint 6: Weather Guardian (amap/openweather/mock)
- ✅ Sprint 6.5: China access & deployment readiness
- ⏳ Sprint 7: Airport/Station Transfer Guardian (planned)

## License

MIT
