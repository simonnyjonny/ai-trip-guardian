# AI Trip Guardian — 类型安全规范

## 1. 禁止的写法

以下写法**禁止**在 API routes、lib、types 中使用：

```ts
// ❌ 禁止
as Record<string, unknown>
as Record<string, string>
as Record<string, string[]>
as { id: string }
as any
```

唯一例外：
- `as unknown as SpecificType` — 处理外部数据（Supabase jsonb、fetch response）时允许使用双转换
- `lib/ai/client.ts` 中 OpenAI SDK 参数类型兼容

## 2. 新增数据库字段 Checklist

每次新增数据库字段（jsonb 或普通字段），必须同步更新：

1. **Migration SQL**: `supabase/migrations/xxx.sql`
2. **TypeScript 类型**: `types/trip.ts` 或 `types/report.ts`
3. **Zod schema**: `lib/ai/schemas.ts`
4. **Supabase select**: `lib/db/queries.ts` 的查询字段（如不是 `select("*")`）
5. **API route**: 使用新字段时不 cast，直接访问 `trip.new_field`
6. **前端默认值**: jsonb 字段必须提供 typed default object
7. **npm run build**: 通过后再 push

## 3. jsonb 字段处理规范

Supabase jsonb 字段在 TypeScript 端不能直接当 `{}` 或 `unknown` 用。

```ts
// ❌ 禁止
const data = report.some_jsonb || {};
const items = data as Record<string, unknown>;

// ✅ 正确
import type { SpecificType } from "@/types/xxx";

const emptyValue: SpecificType = { /* typed defaults */ };
const value: SpecificType = (report.some_jsonb as unknown as SpecificType) || emptyValue;
```

## 4. Provider 返回值规范

所有 provider（weather、maps、AI）必须返回完全一致的结构：

```ts
// amap-weather.ts → 返回 TripWeatherSummary { provider: "amap", ... }
// openweather.ts → 返回 TripWeatherSummary { provider: "openweather", ... }
// mock-weather.ts → 返回 TripWeatherSummary { provider: "mock", ... }
```

不允许某个 provider 缺字段。

## 5. 页面渲染规范

- 数组渲染前必须 `Array.isArray(arr) && arr.length > 0`
- jsonb 对象必须提供 default 空对象
- 不要直接访问 `.daily.length`，先判断 `Array.isArray`

## 6. 提交前检查

```bash
npm run build    # 必须通过
```

不要只看 `npm run dev`。Vercel 构建的是 production build。
