'use server'

import * as Sentry from '@sentry/nextjs'

/**
 * 捕获 Server Action 中的错误
 */
export function captureActionError(error: unknown, context: {
  action: string
  userId?: string
  [key: string]: unknown
}) {
  // 开发环境只输出到控制台
  if (process.env.NODE_ENV === 'development') {
    console.error('[Action Error]', context.action, error)
    return
  }

  Sentry.captureException(error, {
    tags: {
      action: context.action,
      source: 'server_action',
    },
    extra: {
      ...context,
      timestamp: new Date().toISOString(),
    },
  })
}

/**
 * 设置 Sentry 用户上下文
 */
export function setSentryUser(user: {
  id: string
  email?: string
  username?: string
}) {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  Sentry.setUser(user)
}

/**
 * 清除 Sentry 用户上下文
 */
export function clearSentryUser() {
  if (process.env.NODE_ENV === 'development') {
    return
  }

  Sentry.setUser(null)
}
