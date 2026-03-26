# Sentry 错误监控配置指南

> 任务 1.7 文档
> 创建日期：2026-03-24

---

## 1. 安装依赖

```bash
pnpm add @sentry/nextjs
```

---

## 2. 配置 Sentry

### 2.1 创建 Sentry 项目

1. 访问 https://sentry.io 创建账号
2. 创建新项目，选择 **Next.js** 框架
3. 记录 **DSN** 密钥

### 2.2 环境变量配置

在 `.env.local` 中添加：

```env
# Sentry 错误监控
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

在 `.env.example` 中添加：

```env
# Sentry (错误监控)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### 2.3 创建 `sentry.client.config.ts`

```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 性能监控配置
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 错误采样率
  sampleRate: 1.0,

  // 集成配置
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay 配置
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  //  beforeSend - 过滤敏感数据
  beforeSend(event, hint) {
    // 开发环境不发送错误
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### 2.4 创建 `sentry.server.config.ts`

```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 性能监控配置
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Server Actions 错误捕获
  integrations: [
    Sentry.nodeProfilingIntegration(),
  ],

  // beforeSend - 过滤敏感数据
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    return event
  },
})
```

### 2.5 创建 `sentry.edge.config.ts`

```ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
})
```

---

## 3. 配置 `next.config.ts`

```ts
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 你的其他配置
  cacheComponents: true,
}

export default withSentryConfig(nextConfig, {
  // Sentry 配置
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // 生产环境才上传 Source Maps
  silent: !process.env.CI,

  // 开发环境禁用
  disableLogger: process.env.NODE_ENV === 'development',

  // 自动创建发布
  widenClientFileUpload: true,

  // 隧道路由（绕过广告拦截器）
  tunnelRoute: '/monitoring',

  // 禁用 Server Actions 的自动包装（避免冲突）
  autoInstrumentServerFunctions: false,
})
```

---

## 4. Server Actions 错误捕获

### 4.1 创建错误捕获包装器

```ts
// apps/web/lib/sentry-capture.ts
'use server'

import * as Sentry from '@sentry/nextjs'

export function captureActionError(error: unknown, context: {
  action: string
  userId?: string
  [key: string]: unknown
}) {
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

### 4.2 在 Server Actions 中使用

```ts
// apps/web/actions/auth/index.ts
'use server'

import { captureActionError } from '@/lib/sentry-capture'

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

## 5. 客户端组件错误捕获

### 5.1 使用 Error Boundary

```tsx
// apps/web/components/error-boundary.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      extra: {
        componentStack: errorInfo.componentStack,
      },
    })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>出错了</div>
    }
    return this.props.children
  }
}
```

### 5.2 在 Layout 中使用

```tsx
// apps/web/app/layout.tsx
import { ErrorBoundary } from '@/components/error-boundary'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <ErrorBoundary fallback={<div>加载失败，请刷新页面</div>}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

---

## 6. 性能监控

### 6.1 页面性能指标

```tsx
// apps/web/components/performance-tracker.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export function PerformanceTracker() {
  useReportWebVitals((metric) => {
    Sentry.metrics.distribution(
      `web-vitals.${metric.name}`,
      metric.value,
      {
        unit: 'millisecond',
        tags: {
          path: window.location.pathname,
        },
      }
    )
  })

  return null
}
```

---

## 7. 部署配置

### 7.1 Vercel 环境变量

在 Vercel 项目设置中添加：

```
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

### 7.2 Source Maps 上传

Sentry 会自动在构建时上传 Source Maps，无需额外配置。

---

## 8. 测试

### 8.1 测试错误捕获

创建测试按钮：

```tsx
// apps/web/components/test-error.tsx
'use client'

export function TestError() {
  const throwError = () => {
    throw new Error('测试错误')
  }

  return <button onClick={throwError}>测试错误捕获</button>
}
```

---

## 9. 最佳实践

### 9.1 敏感数据过滤

```ts
beforeSend(event, hint) {
  // 移除 PII 数据
  if (event.request) {
    delete event.request.cookies
    delete event.request.headers
  }

  // 过滤错误消息中的敏感信息
  if (event.exception?.values?.[0]?.value) {
    const message = event.exception.values[0].value
    if (message.includes('password') || message.includes('token')) {
      return null
    }
  }

  return event
}
```

### 9.2 用户上下文

```ts
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username,
})
```

### 9.3 采样率配置

| 环境 | tracesSampleRate | sampleRate |
|------|-----------------|------------|
| 开发 | 1.0 | 1.0 |
| 预览 | 0.5 | 1.0 |
| 生产 | 0.1 | 1.0 |

---

## 10. 监控仪表板

### 10.1 关键指标

- **错误率** - 目标 < 1%
- **Apdex 分数** - 目标 > 0.9
- **LCP** - 目标 < 2.5s
- **CLS** - 目标 < 0.1

### 10.2 告警配置

- 错误率 > 5% 持续 5 分钟
- 5xx 错误 > 10 次/分钟
- LCP > 4s 持续 10 分钟

---

## 参考资料

- [Sentry Next.js 官方文档](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry 性能监控指南](https://docs.sentry.io/platforms/javascript/performance/)
- [Sentry 指标 API](https://docs.sentry.io/platforms/javascript/metrics/)
