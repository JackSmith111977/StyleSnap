# T3 Env 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目环境变量类型安全管理

---

## 目录

1. [概述](#1-概述)
2. [核心概念](#2-核心概念)
3. [安装与配置](#3-安装与配置)
4. [核心 API 详解](#4-核心-api-详解)
5. [最佳实践](#5-最佳实践)
6. [StyleSnap 配置建议](#6-stylesnap-配置建议)

---

## 1. 概述

### 1.1 什么是 T3 Env？

`@t3-oss/env-nextjs` 是来自 create-t3-app 团队的环境变量验证工具，提供：

| 特性 | 说明 |
|------|------|
| **类型安全** | 基于 Zod/Valibot schema 自动生成 TypeScript 类型 |
| **运行时验证** | 构建/启动时检查缺失或无效的环境变量 |
| **服务端/客户端隔离** | 强制区分，防止敏感信息泄露到客户端 |
| **框架预设** | 针对 Next.js、Nuxt 等框架的预设配置 |

### 1.2 为什么需要环境变量验证？

**问题场景**：

```bash
# ❌ 常见问题
- 生产环境忘记配置 DATABASE_URL，运行时才报错
- 客户端意外访问了服务端变量（安全风险）
- 环境变量格式错误（如 URL 缺少协议）导致运行时失败
- .env.example 与实际使用不一致
```

**T3 Env 解决方案**：

```typescript
// ✅ 构建时即发现错误
❌ error: Invalid environment variables:
   - DATABASE_URL: Invalid url
   - SUPABASE_KEY: Required
```

### 1.3 与其他方案对比

| 方案 | 类型安全 | 运行时验证 | 客户端隔离 | 转换功能 |
|------|---------|-----------|-----------|---------|
| **T3 Env** | ✅ 自动推断 | ✅ 构建/启动时 | ✅ 强制隔离 | ✅ 支持 |
| **.env.d.ts** | ✅ 手动定义 | ❌ 无 | ❌ 无保护 | ❌ 手动 |
| **Vercel 默认** | ❌ 无 | ❌ 运行时 | ⚠️ 前缀约定 | ❌ 无 |

---

## 2. 核心概念

### 2.1 三种环境变量类型

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  // 1. Server 变量：仅服务端可用，客户端访问会抛出错误
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string(),
  },

  // 2. Client 变量：必须以 NEXT_PUBLIC_ 开头，否则抛出错误
  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  },

  // 3. Shared 变量：服务端和客户端都可访问（谨慎使用）
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },

  // 指定运行时环境变量（用于验证）
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
})
```

### 2.2 验证器（Validators）

T3 Env 支持多种验证库：

| 验证库 | 安装命令 | 特点 |
|--------|---------|------|
| **Zod**（推荐） | `npm install zod` | 生态最成熟，文档完善 |
| **Valibot** | `npm install valibot` | 体积更小，Tree-shaking 友好 |
| **ArkType** | `npm install arktype` | 语法简洁，性能好 |

### 2.3 核心验证规则

```typescript
import { z } from 'zod'

const schemas = {
  // 基础类型
  string: z.string(),
  number: z.number(),
  boolean: z.boolean(),

  // 字符串验证
  url: z.string().url(),
  email: z.string().email(),
  minLength: z.string().min(10),
  maxLength: z.string().max(100),
  regex: z.string().regex(/^ABC-\d{4}$/),

  // 枚举
  enum: z.enum(['development', 'production']),

  // 转换
  transformBoolean: z.string().transform((val) => val === 'true'),
  transformNumber: z.string().transform((val) => parseInt(val, 10)),

  // 默认值
  default: z.string().default('https://example.com'),

  // 可选
  optional: z.string().optional(),
}
```

---

## 3. 安装与配置

### 3.1 安装依赖

```bash
# 安装 Next.js 专用包 + Zod
npm install @t3-oss/env-nextjs zod

# 或 pnpm
pnpm add @t3-oss/env-nextjs zod

# 或 bun
bun add @t3-oss/env-nextjs zod
```

### 3.2 基础配置

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 可选：自定义错误处理
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:', error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  },
})
```

### 3.3 TypeScript 集成

```typescript
// src/env.d.ts (可选，类型扩展)
import type { Env } from './env'

declare global {
  namespace NodeJS {
    type ProcessEnv = Env
  }
}

export {}
```

### 3.4 .env.example 模板

```bash
# .env.example

# Server-side variables (never exposed to client)
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Client-side variables (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 4. 核心 API 详解

### 4.1 createEnv 完整选项

```typescript
import { createEnv } from '@t3-oss/env-nextjs'

const env = createEnv({
  // 1. 服务端变量定义
  server: {
    DATABASE_URL: z.string().url(),
  },

  // 2. 客户端变量定义
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },

  // 3. 共享变量定义
  shared: {
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },

  // 4. 运行时环境变量映射
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  // 5. 可选：Next.js 13.4.4+ 简化写法
  experimental__runtimeEnv: {
    // 仅指定客户端变量（服务端自动从 process.env 读取）
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // 6. 可选：自定义错误处理
  onValidationError: (error) => {
    console.error('Validation failed:', error)
    throw error
  },

  // 7. 可选：忽略某些变量（不验证）
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',

  // 8. 可选：使用预设
  extends: [presets.zod()],
})
```

### 4.2 Presets（预设）

T3 Env 提供预设简化配置：

```typescript
// src/env.ts
import { createEnv, presets } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  // 使用 Zod 预设（自动配置常用规则）
  extends: [presets.zod()],

  server: {
    DATABASE_URL: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
})
```

### 4.3 环境变量转换

```typescript
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // 布尔值转换： "true" → boolean
    FEATURE_FLAG: z
      .string()
      .transform((val) => val === 'true')
      .default('false'),

    // 数字转换： "3000" → number
    PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .default('3000'),

    // 数组转换： "a,b,c" → string[]
    ALLOWED_HOSTS: z
      .string()
      .transform((val) => val.split(','))
      .default('localhost'),
  },

  runtimeEnv: {
    FEATURE_FLAG: process.env.FEATURE_FLAG,
    PORT: process.env.PORT,
    ALLOWED_HOSTS: process.env.ALLOWED_HOSTS,
  },
})
```

### 4.4 Edge Runtime 支持

```typescript
// src/env.edge.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// Edge Runtime 需要特殊配置
export const env = createEnv({
  server: {
    // Edge Runtime 可用的变量
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  // Edge Runtime 不支持 Node.js 的 process.env
  runtimeEnv: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // 跳过某些 Next.js 特定检查
  isServer: typeof window === 'undefined',
})
```

---

## 5. 最佳实践

### 5.1 文件组织结构

```
src/
├── env.ts              # 环境变量定义与验证
├── env.d.ts            # TypeScript 类型扩展（可选）
└── lib/
    └── supabase/
        └── client.ts   # 使用 env 配置 Supabase 客户端

.env                    # 本地环境变量（.gitignore）
.env.example            # 环境变量模板（提交到 Git）
.env.production         # 生产环境（部署平台注入，不提交）
```

### 5.2 环境变量分类原则

| 类别 | 前缀 | 示例 | 安全级别 |
|------|------|------|---------|
| **服务端** | 无 | `DATABASE_URL` | 🔴 绝不可暴露 |
| **客户端** | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SITE_URL` | 🟢 可公开 |
| **共享** | 无 | `NODE_ENV` | 🟡 谨慎使用 |

### 5.3 错误处理策略

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },

  client: {
    NEXT_PUBLIC_SITE_URL: z.string().url(),
  },

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },

  // 开发环境跳过验证（便于快速启动）
  skipValidation: process.env.NODE_ENV === 'development' && process.env.SKIP_VALIDATION === 'true',

  // 自定义错误输出
  onValidationError: (error) => {
    const formatted = error.flatten().fieldErrors

    // 开发环境：详细错误
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Environment variable validation failed:')
      Object.entries(formatted).forEach(([key, messages]) => {
        console.error(`  ${key}: ${messages?.join(', ')}`)
      })
    }

    // 生产环境：简洁错误
    throw new Error('Invalid environment configuration')
  },
})
```

### 5.4 测试环境配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 设置测试环境变量
    env: {
      NODE_ENV: 'test',
      SKIP_ENV_VALIDATION: 'true', // 跳过验证加速测试
    },
  },
})
```

### 5.5 部署平台集成

#### Vercel 部署

```bash
# .vercel/project.json（可选）
{
  "env": {
    "DATABASE_URL": "@database-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-key"
  }
}
```

**Vercel Dashboard 配置**：

1. 进入项目 Settings → Environment Variables
2. 添加变量（区分 Production/Preview/Development）
3. 重新部署使配置生效

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 构建时验证环境变量
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL

ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# 构建会触发 T3 Env 验证
RUN npm run build

CMD ["npm", "start"]
```

---

## 6. StyleSnap 配置建议

### 6.1 必需环境变量清单

基于 PRD 和 APP_FLOW，StyleSnap 需要以下环境变量：

```typescript
// src/env.ts
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

    // 数据库（如使用 Supabase 则与 SUPABASE_URL 相同）
    DATABASE_URL: z.string().url(),

    // 邮件服务（Resend）
    RESEND_API_KEY: z.string().min(1),

    // 认证（可选，如使用 NextAuth）
    # NEXTAUTH_SECRET: z.string().min(1),
    # NEXTAUTH_URL: z.string().url(),

    // Node 环境
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },

  client: {
    // 站点配置
    NEXT_PUBLIC_SITE_URL: z.string().url(),

    // Supabase 客户端
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

    // 功能开关（可选）
    # NEXT_PUBLIC_ENABLE_COMMENTS: z.string().transform((v) => v === 'true').default('true'),
    # NEXT_PUBLIC_ENABLE_SUBMISSIONS: z.string().transform((v) => v === 'true').default('false'),
  },

  runtimeEnv: {
    // Server
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,

    // Client
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 开发环境可跳过验证
  skipValidation: process.env.NODE_ENV === 'development' && process.env.SKIP_VALIDATION === 'true',
})
```

### 6.2 .env.example 模板

```bash
# .env.example

# ===========================================
# StyleSnap 环境变量配置
# ===========================================
# 复制此文件为 .env 并填入实际值
# 切勿将 .env 提交到 Git
# ===========================================

# -------------------------------------------
# 服务端变量（绝不可暴露给客户端）
# -------------------------------------------

# Supabase 项目配置
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJxxx.xxx.xxx"

# 数据库连接（如直接使用 Supabase，可与 SUPABASE_URL 相同）
DATABASE_URL="postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"

# Resend 邮件服务 API Key
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# NextAuth（如启用认证）
# NEXTAUTH_SECRET="生成 32 字节随机字符串"
# NEXTAUTH_URL="http://localhost:3000"

# Node 环境
NODE_ENV="development"

# -------------------------------------------
# 客户端变量（必须以 NEXT_PUBLIC_ 开头）
# -------------------------------------------

# 站点 URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Supabase 客户端配置
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx.xxx.xxx"

# -------------------------------------------
# 可选：功能开关
# -------------------------------------------

# 启用评论功能
NEXT_PUBLIC_ENABLE_COMMENTS="true"

# 启用用户提交风格
NEXT_PUBLIC_ENABLE_SUBMISSIONS="false"
```

### 6.3 使用示例

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中设置 Cookie 会抛出错误，可忽略
          }
        },
      },
    }
  )
}

// src/lib/email.ts
import { Resend } from 'resend'
import { env } from '@/env'

export const resend = new Resend(env.RESEND_API_KEY)
```

### 6.4 类型使用示例

```typescript
// 导入即获得完整类型推断
import { env } from '@/env'

// ✅ 类型安全访问
const dbUrl: string = env.DATABASE_URL
const siteUrl: string = env.NEXT_PUBLIC_SITE_URL
const nodeEnv: 'development' | 'production' | 'test' = env.NODE_ENV

// ❌ TypeScript 会报错（变量不存在）
const invalid = env.NON_EXISTENT_VAR

// ❌ 类型错误（尝试在服务端组件访问客户端变量会被标记）
```

---

## 附录：常见问题 FAQ

### Q1: 为什么构建时报"Invalid environment variables"？

**A**: T3 Env 在 `next build` 时会验证所有环境变量。确保：

1. 生产环境已正确配置所有变量
2. 检查变量格式（如 URL 是否包含协议）
3. 检查必填变量是否缺失

### Q2: 如何在测试时跳过验证？

**A**: 设置 `SKIP_ENV_VALIDATION=true`：

```bash
# package.json
{
  "scripts": {
    "test": "SKIP_ENV_VALIDATION=true vitest"
  }
}
```

### Q3: 客户端变量忘记加 NEXT_PUBLIC_ 前缀怎么办？

**A**: T3 Env 会抛出错误：

```
Error: Client variables must start with NEXT_PUBLIC_
Found: SITE_URL
```

修改变量名为 `NEXT_PUBLIC_SITE_URL` 即可。

### Q4: 如何添加新的环境变量？

**A**: 四步流程：

1. 在 `src/env.ts` 中添加 schema 定义
2. 在 `runtimeEnv` 中映射到 `process.env`
3. 更新 `.env.example` 模板
4. 在部署平台（Vercel）添加对应变量

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
