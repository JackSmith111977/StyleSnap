// @ts-check

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

  // 开发环境不发送错误到 Sentry
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry Server Error]', event.message, event.exception?.values?.[0]?.value)
      return null
    }
    // 过滤敏感数据
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
