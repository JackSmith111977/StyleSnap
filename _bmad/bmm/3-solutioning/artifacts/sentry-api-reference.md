# Sentry Next.js API 快速参考

> 最后更新：2026-03-27 | 基于 @sentry/nextjs 8.x

---

## 目录

1. [快速安装](#1-快速安装)
2. [配置结构](#2-配置结构)
3. [instrumentation.ts](#3-instrumentationts)
4. [next.config.ts 配置](#4-nextconfigts-配置)
5. [采样率配置](#5-采样率配置)
6. [Server Actions 错误捕获](#6-server-actions-错误捕获)
7. [常用 API](#7-常用-api)

---

## 1. 快速安装

### 1.1 使用 Wizard（推荐）

```bash
npx @sentry/wizard@latest -i nextjs
```

### 1.2 手动安装

```bash
pnpm add @sentry/nextjs
```

---

## 2. 配置结构

```
apps/web/
├── sentry.client.config.ts    # 客户端配置
├── sentry.server.config.ts    # 服务端配置
├── sentry.edge.config.ts      # Edge 运行时配置
├── instrumentation.ts         # 注册配置（Next.js 16 必需）
└── next.config.ts             # Next.js 配置
```

---

## 3. instrumentation.ts

### 3.1 基础配置

```typescript
// instrumentation.ts
import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
```

### 3.2 作用

- 注册服务端和 Edge 运行时配置
- 捕获请求级别错误
- Next.js 16 推荐配置方式

---

## 4. next.config.ts 配置

### 4.1 基础配置

```typescript
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  // 其他配置...
}

export default withSentryConfig(nextConfig, {
  // 必填：Sentry 组织信息
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // 可选配置

  // 静默输出（生产环境才显示）
  silent: !process.env.CI,

  // 上传 Source Maps
  widenClientFileUpload: true,

  // 隧道路由（绕过广告拦截器）
  tunnelRoute: '/monitoring',

  // 禁用 Server Actions 自动包装（如手动处理）
  autoInstrumentServerFunctions: false,
})
```

### 4.2 配置选项说明

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `org` | `string` | 必填 | Sentry 组织名 |
| `project` | `string` | 必填 | Sentry 项目名 |
| `authToken` | `string` | 必填 | Sentry 认证令牌 |
| `silent` | `boolean` | `false` | 静默构建输出 |
| `widenClientFileUpload` | `boolean` | `false` | 上传更宽的客户端文件 |
| `tunnelRoute` | `string` | `undefined` | 隧道路由路径 |
| `autoInstrumentServerFunctions` | `boolean` | `true` | 自动包装 Server Actions |

---

## 5. 采样率配置

### 5.1 客户端配置

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 性能监控采样率
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // Session Replay 采样率
  replaysSessionSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
  replaysOnErrorSampleRate: 1.0,

  // 集成配置
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // 开发环境不发送错误
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### 5.2 服务端配置

```typescript
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 性能监控采样率
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,

  // 集成配置
  integrations: [
    Sentry.nodeProfilingIntegration(),
  ],

  // 开发环境不发送错误
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### 5.3 Edge 运行时配置

```typescript
// sentry.edge.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
})
```

### 5.4 采样率推荐值

| 环境 | tracesSampleRate | replaysSessionSampleRate | 说明 |
|------|-----------------|-------------------------|------|
| 开发 | 1.0 | 1.0 | 完整采样便于调试 |
| 预览 | 0.5 | 0.5 | 中等采样 |
| 生产 | 0.1 | 0.1 | 低采样减少开销 |
| 高流量生产 | 0.01-0.05 | 0.01 | 极低采样 |

---

## 6. Server Actions 错误捕获

### 6.1 创建包装器

```typescript
// apps/web/lib/sentry-capture.ts
'use server'

import * as Sentry from '@sentry/nextjs'

export function captureActionError(
  error: unknown,
  context: {
    action: string
    userId?: string
    [key: string]: unknown
  }
) {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Sentry]', context.action, error)
    return
  }

  Sentry.captureException(error, {
    tags: {
      action: context.action,
    },
    extra: {
      ...context,
      timestamp: new Date().toISOString(),
    },
  })
}
```

### 6.2 在 Server Actions 中使用

```typescript
// apps/web/actions/auth/index.ts
'use server'

import { captureActionError } from '@/lib/sentry-capture'
import { createClient } from '@/lib/supabase/server'

export async function login(email: string, password: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { success: true, user: data.user }
  } catch (error) {
    captureActionError(error, {
      action: 'auth/login',
      email,
    })
    return { error: '登录失败' }
  }
}
```

---

## 7. 常用 API

### 7.1 设置用户上下文

```typescript
Sentry.setUser({
  id: '123',
  email: 'user@example.com',
  username: 'username',
})
```

### 7.2 设置标签

```typescript
Sentry.setTag('user_mode', 'admin')
Sentry.setTag('feature_flag', 'new_checkout')
```

### 7.3 设置上下文

```typescript
Sentry.setContext('application_area', {
  location: 'checkout',
  step: 'payment',
})
```

### 7.4 添加 Breadcrumb

```typescript
Sentry.addBreadcrumb({
  message: '"Add to cart" clicked',
  category: 'ui',
  level: 'info',
})
```

### 7.5 捕获异常

```typescript
// 捕获异常
Sentry.captureException(new Error('Oh no.'))

// 捕获消息
Sentry.captureMessage('Hello, world!', 'info')

// 带上下文的异常
Sentry.captureException(error, {
  tags: { feature: 'checkout' },
  extra: { orderId: '12345' },
})
```

### 7.6 指标 API

```typescript
// 分布指标
Sentry.metrics.distribution('web-vitals.lcp', metric.value, {
  unit: 'millisecond',
  tags: {
    path: window.location.pathname,
  },
})

// 计数指标
Sentry.metrics.increment('button.click', 1, {
  tags: { button: 'submit' },
})
```

### 7.7 性能监控

```typescript
// 手动创建事务
const transaction = Sentry.startTransaction({
  name: 'My Transaction',
  op: 'navigation',
})

try {
  // 业务逻辑
} catch (err) {
  Sentry.captureException(err)
} finally {
  transaction.finish()
}
```

---

## 8. 环境变量

### 8.1 .env.local

```env
# Sentry (错误监控)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

### 8.2 .env.example

```env
# Sentry (错误监控)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

---

## 9. Vercel 部署

### 9.1 添加环境变量

在 Vercel 项目设置中添加：

```
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

### 9.2 Source Maps 上传

`withSentryConfig` 会自动在构建时上传 Source Maps，无需额外配置。

---

## 10. 常见问题

### 10.1 开发环境不发送错误

```typescript
beforeSend(event) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry Dev]', event)
    return null
  }
  return event
}
```

### 10.2 过滤敏感数据

```typescript
beforeSend(event, hint) {
  // 移除 PII 数据
  if (event.request) {
    delete event.request.cookies
    delete event.request.headers
  }

  // 过滤错误消息
  if (event.exception?.values?.[0]?.value) {
    const message = event.exception.values[0].value
    if (message.includes('password') || message.includes('token')) {
      return null
    }
  }

  return event
}
```

### 10.3 autoInstrumentServerFunctions 配置

| 值 | 说明 |
|----|------|
| `true` (默认) | Sentry 自动包装 Server Actions |
| `false` | 手动使用 `captureActionError` 包装 |

**建议**：如果手动处理错误捕获，设置为 `false` 避免重复包装。

---

## 参考资料

- [Sentry Next.js 官方文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Metrics API](https://docs.sentry.io/platforms/javascript/metrics/)
- [Sentry Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)
