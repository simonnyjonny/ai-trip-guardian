# AI Trip Guardian — Provider 策略

## 设计原则

- 业务代码不直接依赖某一个外部 Provider
- 所有外部服务通过 lib/ 目录抽象
- 失败时 fallback，不阻断主流程
- 基于 DEPLOYMENT_REGION 和 trip_region 自动选择

## 国内旅行 Providers

| 能力 | 优先 Provider | 备选 Provider |
|------|-------------|---------------|
| AI | DeepSeek | 通义千问 / 智谱 GLM |
| 天气 | 高德天气 | 和风天气 / 彩云天气 |
| 地图 | 高德地图 | 腾讯位置服务 / 百度地图 |
| 支付 | 微信支付 / 支付宝 | —（未来） |
| 通知 | 企业微信 | 短信 / 邮件（未来） |

## 出境旅行 Providers

| 能力 | 优先 Provider | 备选 Provider |
|------|-------------|---------------|
| AI | DeepSeek | OpenAI |
| 天气 | OpenWeather | WeatherAPI / Visual Crossing |
| 地图 | Google Maps | —（未来） |
| 打车 | Uber deep link | —（未来） |
| 通知 | Email | WhatsApp（未来） |

## Provider 选择逻辑

```
DEPLOYMENT_REGION=china  → 优先国内 provider
trip_region=domestic     → 优先国内 provider
trip_region=outbound     → 优先出境 provider
trip_region=auto         → 按目的地判断
```

## Weather Provider Fallback 链

```
1. 高德天气（国内，有 key）
2. OpenWeather（出境，有 key）
3. Mock 模拟数据（无 key）
4. Seasonal 季节性建议（无日期）
```

## 当前实现状态

| 模块 | 抽象层 | 已实现 Provider | 已预留 Provider |
|------|--------|----------------|----------------|
| AI | lib/ai/ | DeepSeek, OpenAI | — |
| Weather | lib/weather/ | Amap, OpenWeather, Mock | 和风天气 |
| Maps | lib/maps/default.ts | Mock | Google, Amap |

## Provider 失败不阻断业务

- 天气 API 失败 → fallback mock/seasonal，报告标注"模拟数据"
- 地图 API 失败（未来）→ 不提供路线，报告标注"地图不可用"
- AI API 失败 → retry 1 次，仍失败 → 报告生成失败，用户可重试
