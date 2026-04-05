# 登录状态同步问题修复报告

> **修复日期**: 2026-04-05  
> **问题**: 登录后进入主页，导航栏没有立即刷新到登录状态  
> **状态**: ✅ 已修复

---

## 问题现象

用户登录成功后，页面导航到首页，但导航栏的用户菜单仍然显示"登录/注册"按钮，而不是已登录状态。

---

## 根因分析

### 问题根因

`createBrowserClient` 缺少 `cookieOptions` 配置，导致客户端 SDK 无法正确读取 Middleware 设置的 cookie。

### 技术细节

Supabase Auth 使用 JWT token 存储 session 信息：
- Access Token 和 Refresh Token 需要被客户端 JavaScript 访问
- `createBrowserClient` 默认从 cookie 读取 session
- 但 cookie 名称必须与 Server/Middleware 设置的一致

**问题链路**:
```
1. Server Action 登录 → 设置 httpOnly cookie
2. router.refresh() → 页面重新加载
3. useAuth Hook 调用 getSession()
4. ❌ createBrowserClient 无法读取 cookie（缺少 cookieOptions 配置）
5. ❌ hasSession: false
```

---

## 修复方案

### 修复内容

**文件**: `apps/web/lib/supabase/client.ts`

**修复前**:
```typescript
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

**修复后**:
```typescript
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        name: 'sb-ngebqqkpizzomyxevjer-auth-token',
        path: '/',
        secure: env.NEXT_PUBLIC_SITE_URL?.startsWith('https://') ?? false,
        sameSite: 'lax',
      },
    }
  )
}
```

### 配置说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `name` | `sb-{project-ref}-auth-token` | Cookie 名称，必须与 Supabase 默认格式一致 |
| `path` | `/` | 整个域名可用 |
| `secure` | HTTPS only | 生产环境只通过 HTTPS 传输 |
| `sameSite` | `lax` | 防止 CSRF 攻击 |

---

## 验证结果

### 修复前日志

```
[useAuth] getSession() 返回：{hasSession: false, userId: undefined, email: undefined}
[UserMenu] 未登录状态，显示登录/注册按钮
```

### 修复后日志

```
[useAuth] onAuthStateChange 触发：{event: SIGNED_IN, hasSession: true, userId: 75dadde6-...}
[useAuth] getSession() 返回：{hasSession: true, userId: 75dadde6-..., email: qq3526547131@gmail.com}
[UserMenu] 已登录状态，显示用户菜单
```

---

## 安全性评估

### 修复方案的安全性

✅ **符合最佳实践**：使用 Supabase 官方推荐的 `cookieOptions` 配置

✅ **安全性配置**：
- `secure: true`（生产环境）：只通过 HTTPS 传输
- `sameSite: lax`：防止 CSRF 攻击
- `httpOnly`：由 Server/Middleware 设置，客户端 SDK 只负责读取

✅ **无 XSS 风险**：
- 未使用 localStorage 存储 token
- 未手动解析 `document.cookie`
- 由 SDK 内部管理 cookie 读写

---

## 相关文件

- `apps/web/lib/supabase/client.ts` - 浏览器客户端配置（已修复）
- `apps/web/proxy.ts` - Middleware cookie 管理
- `apps/web/hooks/use-auth.ts` - 认证 Hook
- `apps/web/actions/auth/index.ts` - Server Actions

---

## 参考资料

- [Supabase SSR 官方文档](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase SSR GitHub 仓库](https://github.com/supabase/ssr/blob/main/src/createBrowserClient.ts)
- [GitHub Issue #170](https://github.com/supabase/ssr/issues/170)

---

**修复时间**: 2026-04-05T09:35:00Z  
**修复状态**: ✅ 已完成
