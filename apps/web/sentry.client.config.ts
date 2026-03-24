// @ts-check

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // 性能监控 - 开发环境 100% 采样，生产环境 10%
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
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // 开发环境不发送错误到 Sentry
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry Error]', event.message, event.exception?.values?.[0]?.value)
      return null
    }
    return event
  },

  // 过滤敏感数据
  beforeSendTransaction(event) {
    if (process.env.NODE_ENV === 'development') {
      return null
    }
    // 移除 PII 数据
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
