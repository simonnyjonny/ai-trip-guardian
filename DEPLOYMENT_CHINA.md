# AI Trip Guardian — 中国部署方案

## 当前部署

Vercel: https://ai-trip-guardian.vercel.app

Vercel 在中国大陆无服务器节点，`.vercel.app` 子域名可能被阻断或限速。
本品适合中国用户，因此需要中国可访问部署方案。

## 短期方案（立即可用）

绑定自定义域名即可改善访问：
- 购买域名（阿里云万网 / DNSPod）
- DNS 解析到 Vercel（CNAME: cname.vercel-dns.com）
- Vercel Dashboard → Settings → Domains 添加域名

注意：这只改善访问稳定性，不保证速度。Vercel 仍然没有中国 CDN 节点。

## 中期方案（测试阶段）

中国镜像站 + 海外 Beta 双部署：
- 海外继续用 Vercel
- 中国站部署到腾讯云 EdgeOne Pages / 阿里云 ESA / 华为云 CloudFront
- 共享同一个 Supabase 数据库（新加坡/日本节点对中国延迟可接受）
- 或使用 Supabase 中国区域代理

## 长期方案（生产阶段）

ICP 备案后的全栈中国部署：
- 国内服务器（腾讯云 CVM / 阿里云 ECS）
- 国内 CDN
- 国内对象存储
- 国内 AI Provider（DeepSeek 已可用）
- 国内天气 Provider（高德天气 / 和风天气）
- 国内地图 Provider（高德地图）

## Docker 部署

项目已包含 Dockerfile，支持自部署：

```bash
docker build -t ai-trip-guardian .
docker run -p 3000:3000 --env-file .env.local ai-trip-guardian
```

目标服务器：
- 腾讯云 CVM（CentOS / Ubuntu）
- 阿里云 ECS
- 自建服务器

## 自定义域名

1. 购买域名
2. ICP 备案（如部署在国内服务器上）
3. DNS 配置
4. Nginx 反向代理（自建服务器）
5. SSL 证书（Let's Encrypt / 阿里云 SSL）

## 环境变量

```bash
DEPLOYMENT_REGION=global   # global | china
CHINA_APP_URL=             # 中国站 URL（如 www.your-domain.cn）
```

当 DEPLOYMENT_REGION=china 时，默认 provider 策略自动调整。

## 健康检查

部署后访问 `/api/health` 确认服务正常。
