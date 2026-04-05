# 密码重置功能修复报告

> **修复日期**: 2026-04-05  
> **相关 Issue**: Epic 1 - Story 1.3  
> **修复状态**: ✅ 已完成

---

## 问题描述

密码重置功能在测试中发现以下问题：

1. **邮件发送失败**: 点击"发送重置邮件"按钮后提示失败
2. **回调路由 404**: 点击邮件中的重置链接后返回 404 页面
3. **验证失败**: 无法正确解析和验证邮件链接中的 token

---

## 根因分析

### 问题 1: 邮件发送频率限制

**现象**: 连续发送密码重置邮件时报错"发送失败"

**根因**: Supabase 默认限制密码重置邮件发送频率（2 封邮件/小时）

**解决方案**: 等待频率限制窗口过去后重试

### 问题 2: 回调路由不存在

**现象**: 点击邮件链接后 404

**根因**: 项目缺少处理 Supabase 密码重置回调的路由

**解决方案**: 创建 `/auth/reset-password` 路由处理回调

### 问题 3: 验证方法错误

**现象**: 验证 token 时报错 `AuthApiError: Only an email address or phone number should be provided on verify`

**根因**: 使用了错误的 API 方法 `verifyOtp`。Supabase 密码重置使用 PKCE flow，应该使用 `exchangeCodeForSession` 方法

**解决方案**: 改用 `supabase.auth.exchangeCodeForSession(code)`

---

## 修复方案

### 1. 创建密码重置回调路由

**文件**: `apps/web/app/auth/reset-password/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AuthResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      // Supabase PKCE flow 使用 code 参数
      const code = searchParams.get('code')

      if (!code) {
        router.push(`/reset-password?error=${encodeURIComponent('重置链接无效')}`)
        return
      }

      try {
        // 调用 Server Action 验证 code
        const { verifyRecoveryToken } = await import('@/actions/auth')
        const result = await verifyRecoveryToken(code)

        if (result.error) {
          router.push(`/reset-password?error=${encodeURIComponent('重置链接已过期')}`)
        } else if (result.success) {
          router.push('/update-password')
        }
      } catch (error) {
        router.push(`/reset-password?error=${encodeURIComponent('重置链接无效')}`)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">正在验证重置链接...</h1>
        <p className="text-gray-600">请稍候</p>
      </div>
    </div>
  )
}
```

### 2. 添加 Server Action 验证 PKCE code

**文件**: `apps/web/actions/auth/index.ts`

```typescript
/**
 * 验证密码重置 token（Client Component 专用）
 * 使用 PKCE flow 的 code 交换 session
 */
export async function verifyRecoveryToken(
  code: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabase = await createClient()

    // PKCE flow: 使用 code 交换 session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: '验证失败，用户不存在' }
    }

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'auth/verifyRecoveryToken',
    })
    return { error: '验证失败' }
  }
}
```

---

## API 参考

### `resetPasswordForEmail`

**用途**: 发送密码重置邮件到用户邮箱

**方法签名**:
```typescript
async function resetPasswordForEmail(
  email: string,
  options?: {
    redirectTo?: string
    captchaToken?: string
  }
): Promise<{ error: AuthError | null }>
```

**参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户的邮箱地址 |
| options.redirectTo | string | 否 | 验证成功后重定向的 URL |
| options.captchaToken | string | 否 | reCAPTCHA token（如启用） |

**使用示例**:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
})
```

**注意事项**:
1. **频率限制**: Supabase 默认限制为 2 封邮件/小时
2. **Redirect URL 配置**: 必须在 Supabase Dashboard → Authentication → URL Configuration 中添加允许的跳转地址
3. **Redirect 格式**: 必须包含协议（http/https），如 `http://localhost:3000/auth/reset-password`

---

### `exchangeCodeForSession`

**用途**: PKCE flow 中使用 authorization code 交换 session

**方法签名**:
```typescript
async function exchangeCodeForSession(
  code: string
): Promise<
  { data: { session: Session; user: User }; error: null } |
  { data: null; error: AuthError }
>
```

**参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 从 URL 参数中获取的 PKCE code |

**使用示例**:
```typescript
const { data, error } = await supabase.auth.exchangeCodeForSession(code)
```

**返回数据**:
- `data.session`: 用户会话（包含 access_token、refresh_token 等）
- `data.user`: 用户对象（包含 id、email、email_confirmed_at 等）
- `error`: 错误信息（如有）

**注意事项**:
1. **Code 一次性**: PKCE code 只能使用一次，使用后失效
2. **时效性**: code 通常有效期为 5-10 分钟
3. **自动存储**: 成功后 session 会自动存储到 localStorage 和 cookie

---

### PKCE Flow 完整流程

```
┌─────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐     ┌─────────┐
│  用户   │     │ 前端应用 │     │ 邮件链接   │     │ Supabase │     │  后端   │
└────┬────┘     └────┬─────┘     └─────┬──────┘     └────┬─────┘     └────┬────┘
     │               │                 │                 │               │
     │  1. 请求重置  │                 │                 │               │
     │──────────────>│                 │                 │               │
     │               │ 2. 发送邮件     │                 │               │
     │               │────────────────>│                 │               │
     │               │                 │                 │               │
     │  3. 点击链接  │                 │                 │               │
     │────────────────────────────────>│                 │               │
     │               │                 │ 4. 重定向 (code)│               │
     │               │<────────────────│                 │               │
     │               │                 │                 │               │
     │               │ 5. exchangeCodeForSession(code)   │               │
     │               │─────────────────────────────────>│               │
     │               │                 │                 │               │
     │               │ 6. 返回 session │                 │               │
     │               │<─────────────────────────────────│               │
     │               │                 │                 │               │
     │               │ 7. 重定向到密码更新页面           │               │
     │               │──────────────>│                 │               │
     │               │                 │                 │               │
     │               │ 8. 更新密码    │                 │               │
     │               │─────────────────────────────────>│               │
     │               │                 │                 │               │
```

---

## 测试验证

### 测试环境
- **浏览器**: Chrome + Playwright MCP
- **开发服务器**: Next.js dev (http://localhost:3000)
- **测试邮箱**: qq3526547131@gmail.com

### 测试步骤

1. ✅ 访问 `/reset-password` 页面
2. ✅ 输入邮箱并发送重置邮件
3. ✅ 点击邮件链接
4. ✅ 验证 code 交换成功
5. ✅ 重定向到 `/update-password`
6. ✅ 输入新密码并确认
7. ✅ 密码更新成功
8. ✅ 登出后使用新密码成功登录

### 测试结果

| 步骤 | 预期结果 | 实际结果 | 状态 |
|------|----------|----------|------|
| 发送邮件 | 邮件成功发送 | ✅ | 通过 |
| 点击链接 | 正确跳转 | ✅ | 通过 |
| Code 验证 | 验证成功 | ✅ | 通过 |
| 密码更新 | 更新成功 | ✅ | 通过 |
| 新密码登录 | 登录成功 | ✅ | 通过 |

---

## Supabase Dashboard 配置

### Redirect URLs 配置

在 Supabase Dashboard → Authentication → URL Configuration 中配置以下 Redirect URLs：

```
http://localhost:3000/auth/reset-password*
http://localhost:3000/auth/callback*
https://your-production-domain.com/auth/reset-password*
```

**注意**: 
- 使用通配符 `*` 以支持查询参数
- 生产环境需要添加实际的域名

### Email Templates 配置

密码重置邮件模板变量：

| 变量 | 说明 |
|------|------|
| `{{ .ConfirmationURL }}` | 密码重置链接（包含 PKCE code） |
| `{{ .Email }}` | 用户邮箱 |
| `{{ .Token }}` | 原始 token（PKCE flow 中不直接使用） |

---

## 相关文件

| 文件 | 说明 |
|------|------|
| `apps/web/actions/auth/index.ts` | Server Actions（`resetPassword`, `verifyRecoveryToken`, `updatePassword`） |
| `apps/web/app/auth/reset-password/page.tsx` | 密码重置回调处理组件 |
| `apps/web/app/reset-password/page.tsx` | 密码重置请求页面 |
| `apps/web/app/update-password/page.tsx` | 密码更新页面 |

---

## 经验总结

1. **PKCE flow 理解**: Supabase 密码重置使用 PKCE flow，邮件链接包含 `token` 参数，服务端重定向后转为 `code` 参数
2. **正确的 API 选择**: `exchangeCodeForSession` 替代 `verifyOtp` 用于 PKCE code 验证
3. **Redirect URL 配置**: 必须在 Supabase Dashboard 中预先配置允许的跳转地址
4. **调试日志**: 在关键节点添加日志有助于排查问题

---

**报告生成时间**: 2026-04-05  
**修复完成时间**: 2026-04-05T08:10:00Z
