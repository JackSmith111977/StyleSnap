# 登录 Cookie 丢失问题修复

> 日期：2026-04-01
> 状态：已修复

---

## 问题描述

登录成功后，Server Action 已正确设置 session cookie，但浏览器端 `useAuth` hook 无法读取到 session，导致导航栏状态不同步。

### 症状

1. 登录成功后跳转到 `/dashboard`
2. Dashboard 页面内容正确显示用户信息（Server Component 从 cookie 读取）
3. 导航栏仍显示"登录/注册"按钮（Client Component 读取不到 session）
4. 控制台日志显示 `cookie 长度：29`（只有 `__next_hmr_refresh_hash__`，没有 Supabase cookie）

---

## 根本原因分析

### 问题链路

```
Server Action (login) 
  → createClient().auth.signInWithPassword() 
  → cookieStore.set() 设置 cookie
  → 返回 { success: true }
  → 前端 router.push('/dashboard')  ← 问题在这里！
```

### 核心问题

**`router.push()` 是客户端导航，不会携带服务器设置的 cookie 到浏览器。**

当 Server Action 执行时：
1. `createClient()` 使用 `cookieStore.set()` 设置 cookie
2. 这些 cookie 被设置到服务器响应的 `Set-Cookie` 头中
3. 但 `router.push()` 是客户端 SPA 导航，不发起完整的 HTTP 请求
4. 因此浏览器不会接收服务器设置的 cookie

### 调试日志

```log
[useAuth] useEffect 执行，开始加载用户
[useAuth] 开始加载用户，cookie 长度：29  ← 只有 HMR cookie，没有 Supabase cookie
[useAuth] getSession() 返回：{hasSession: false, user: undefined}
[UserMenu] render: {user: undefined, loading: false, hasUser: false}
```

---

## 解决方案

### 方案 A：使用 `window.location.href` 进行硬导航（已采用）

**修改文件**：`apps/web/components/auth/login-form.tsx`

**修改前**：
```typescript
if (result.success) {
  router.push('/dashboard')
  router.refresh()
}
```

**修改后**：
```typescript
if (result.success) {
  window.location.href = '/dashboard'
}
```

**原理**：
- `window.location.href` 触发完整的页面跳转
- 浏览器发起新的 HTTP 请求
- 服务器响应的 `Set-Cookie` 头被浏览器接收并保存
- Proxy 在新请求中读取 cookie 并刷新 session

**优点**：
- 改动最小，只修改一行代码
- 确保 cookie 正确传递到浏览器
- 与现有 Proxy 配置完美配合

**缺点**：
- 硬导航会有页面闪烁（可接受）

---

### 方案 B：在 Server Action 中直接设置 cookie 到响应头

此方案更复杂，需要修改 Server Action 返回 `NextResponse`，不推荐。

---

### 方案 C：客户端手动设置 session

在 Server Action 返回 session 后，使用 `createBrowserClient().auth.setSession()` 手动设置。

此方案需要修改多个文件，且可能引入安全风险，不推荐。

---

## 验证步骤

1. 清除浏览器所有数据
2. 访问 `/login` 页面
3. 输入测试账号：`3526547131@qq.com` / `test1234`
4. 点击登录
5. 检查控制台日志：
   - `[useAuth] getSession() 返回：{hasSession: true, user: "3526547131@qq.com"}` ✅
6. 检查导航栏显示用户菜单图标 ✅
7. 检查 localStorage 和 cookie

---

## 相关文件

| 文件 | 修改内容 |
|------|---------|
| `apps/web/components/auth/login-form.tsx` | 使用 `window.location.href` 代替 `router.push()` |
| `apps/web/hooks/use-auth.ts` | 添加调试日志，使用 `getSession()` 代替 `getUser()` |
| `apps/web/components/auth/user-menu.tsx` | 添加调试日志 |

---

## 经验总结

### Next.js Server Action + Cookie 注意事项

1. **Server Action 设置的 cookie 通过响应头传递**
   - `cookieStore.set()` 会设置 `Set-Cookie` 响应头
   - 浏览器只在完整 HTTP 请求后接收 cookie

2. **客户端导航不会携带服务器 cookie**
   - `router.push()` / `router.replace()` 是 SPA 导航
   - 不会触发完整的 HTTP 请求/响应循环
   - 服务器设置的 cookie 无法传递到浏览器

3. **解决方案选择**
   - 需要传递 cookie 时，使用 `window.location.href` 硬导航
   - 或在 Proxy/中间件中统一处理认证状态

### Supabase SSR 最佳实践

1. **Client Component 读取 session**
   - 使用 `getSession()` 而不是 `getUser()`
   - `getSession()` 从 cookie 读取，`getUser()` 验证 token

2. **认证状态同步**
   - Proxy 负责刷新 session（每请求）
   - Client Component 通过 `getSession()` 同步状态
   - 避免依赖 localStorage

---

## 参考文档

- [Supabase SSR 文档](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js 导航文档](https://nextjs.org/docs/app/api-reference/functions/redirect)
- 项目文档：`docs/main/P1_AUTH_SYNC_ANALYSIS.md`
