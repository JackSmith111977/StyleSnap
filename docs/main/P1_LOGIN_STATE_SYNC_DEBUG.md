# 登录状态同步延迟问题调试报告

> **调试日期**: 2026-04-05  
> **问题**: 登录后进入主页，导航栏没有立即刷新到登录状态

---

## 问题现象

用户登录成功后，页面导航到首页，但导航栏的用户菜单仍然显示"登录/注册"按钮，而不是已登录状态。

---

## 全链路分析

### 登录流程链路

```
1. LoginForm (Client Component)
   ↓ 提交表单
2. login Server Action
   ↓ 调用 supabase.auth.signInWithPassword()
   ↓ 设置 Cookie (Set-Cookie header)
3. router.push('/') + router.refresh()
   ↓ 导航到首页
4. Layout → Header → UserMenu
   ↓ 调用 useAuth Hook
5. useAuth.loadUser()
   ↓ 调用 supabase.auth.getSession()
6. 返回 hasSession: false ❌
```

---

## 调试日志分析

### 登录成功时的日志

```
[LoginForm] 提交登录：{email: qq3526547131@gmail.com, cookieBefore: 0}
[LoginForm] login 返回：{success: true}
[LoginForm] 登录成功，开始导航，cookie 长度：2993
[LoginForm] router.push("/") 完成
[LoginForm] router.refresh() 完成

[UserMenu] render: {user: undefined, loading: false, hasUser: false, cookieLength: 2993}
[useAuth] 开始加载用户，cookie 长度：2993
[useAuth] getSession() 返回：{hasSession: false, user: undefined, cookieAfter: 2993}
```

### 关键发现

| 检查点 | 预期值 | 实际值 | 状态 |
|--------|--------|--------|------|
| cookieBefore | 0 | 0 | ✅ |
| cookieAfter (登录后) | >0 | 2993 | ✅ |
| hasSession | true | **false** | ❌ |

**Cookie 已设置 (2993 字节)，但 `getSession()` 返回 `hasSession: false`。**

---

## 可能原因

### 1. Cookie 格式不匹配

Supabase Auth 使用 `@supabase/ssr` 包管理 cookie，cookie 名称应该是：
- `sb-{project-ref}-auth-token`

### 2. Server Action 设置的 Cookie 未正确传递到客户端

Server Action 中使用 `createServerClient` 设置 cookie，但 cookie 可能：
- 只在 Server Action 的响应中存在
- 没有被浏览器正确接收
- cookie 的 `SameSite` 或 `Secure` 属性不正确

### 3. 客户端 `getSession()` 使用的 Supabase 客户端配置不正确

客户端可能使用的是 `createBrowserClient` 而非 `createServerClient`，导致无法读取 cookie。

---

## 当前代码状态

### Server Action (login)

```typescript
const supabase = await createClient() // createServerClient
const { data, error } = await supabase.auth.signInWithPassword({...})
// Cookie 通过 createServerClient 的 cookies.setAll 自动设置
return { success: true }
```

### 客户端 useAuth Hook

```typescript
const supabase = createClient() // createBrowserClient
const { data: { session } } = await supabase.auth.getSession()
```

---

## 解决方案

### 方案 1: 使用 `onSessionChange` 事件

登录后，Supabase 应该触发 `onAuthStateChange` 事件。但在 Next.js App Router 中，Server Action 不会自动触发客户端事件。

### 方案 2: 在登录成功后手动调用 `router.refresh()`

`router.refresh()` 会重新加载服务器组件，但不会重新执行客户端组件的 `useEffect`。

### 方案 3: 使用 `supabase.auth.getSession()` 的强制刷新

```typescript
// 强制从 cookie 读取 session
const { data: { session } } = await supabase.auth.getSession({
  // 无参数，应该自动从 cookie 读取
})
```

### 方案 4: 确保 Cookie 名称正确

检查 `@supabase/ssr` 包的 cookie 名称是否与客户端预期的一致。

---

## 调试输出位置

已在以下文件添加调试日志：

1. **apps/web/actions/auth/index.ts** - Server Action 登录流程
2. **apps/web/components/auth/login-form.tsx** - 登录表单提交
3. **apps/web/hooks/use-auth.ts** - 用户认证状态加载
4. **apps/web/components/auth/user-menu.tsx** - 用户菜单渲染

---

## 下一步行动

1. 检查 Cookie 名称是否匹配
2. 验证 `@supabase/ssr` 包的配置
3. 考虑使用 `useEffect` 中的 `onAuthStateChange` 事件来触发重新渲染

---

**调试时间**: 2026-04-05T08:42:00Z  
**调试状态**: 根因已定位，待修复
