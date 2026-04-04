# T3 Env - Agent 参考

> 用途：环境变量类型安全与验证
> 来源：`knowledge-base/tech-stack/t3-env-technical-research.md`

---

## 快速参考

### 安装
```bash
pnpm add @t3-oss/env-nextjs zod
```

### 基础配置
```typescript
// lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
    RESEND_API_KEY: z.string(),
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```

### 使用方式
```typescript
import { env } from '@/lib/env'

// 服务端
const dbUrl = env.DATABASE_URL

// 客户端
const appUrl = env.NEXT_PUBLIC_APP_URL

// ❌ 错误：客户端访问 server 变量会抛出错误
```

---

## 最佳实践

1. **命名约定**：客户端变量必须以 `NEXT_PUBLIC_` 开头
2. **类型验证**：使用 Zod schema 定义变量格式（如 `z.string().url()`）
3. **集中管理**：所有环境变量在 `lib/env.ts` 中统一配置
4. **构建时验证**：启动时自动检查缺失或无效的环境变量

---

## 错误示例

```typescript
// ❌ 错误：客户端组件访问服务端变量
'use client'
import { env } from '@/lib/env'
console.log(env.DATABASE_URL) // 运行时报错

// ✅ 正确：仅访问客户端变量
console.log(env.NEXT_PUBLIC_SUPABASE_URL)
```
