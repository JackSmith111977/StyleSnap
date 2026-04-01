# 登录导航栏状态同步问题 - 长期方案可行性分析报告

> 日期：2026-04-01
> 状态：分析完成

---

## 问题回顾

登录成功后跳转到 `/dashboard`，页面内容正确显示用户信息，但导航栏仍显示"登录/注册"按钮，刷新后恢复。

**根本原因**：
- Server Component (Dashboard) 从 Cookie 读取 session → ✅ 正确
- Client Component (UserMenu/useAuth) 从 localStorage 读取 → ❌ null

---

## 项目现状扫描

### 已配置文件

| 文件 | 状态 | 说明 |
|------|------|------|
| `apps/web/proxy.ts` | ✅ 已配置 | 使用 `@supabase/ssr` 的 `createServerClient` |
| `apps/web/hooks/use-auth.ts` | ✅ 已配置 | 使用 `createBrowserClient` + `onAuthStateChange` |
| `apps/web/actions/auth/index.ts` | ✅ 已配置 | Server Action 登录 |
| `apps/web/lib/supabase/server.ts` | ✅ 已配置 | 服务器端客户端 |
| `apps/web/lib/supabase/client.ts` | ✅ 已配置 | 浏览器客户端 |

### Proxy.ts 分析

```typescript
// apps/web/proxy.ts 第 34 行
await supabase.auth.getSession()  // ✅ 已调用 getSession() 刷新 session
```

**优点**：
- Proxy 已正确配置，使用 `createServerClient`
- 调用了 `getSession()` 刷新/验证 session
- Cookie 设置逻辑完整 (`setAll`)
- matcher 配置正确，排除静态资源

**现状**：Proxy 配置已经是推荐方案，理论上应该工作正常。

### use-auth.ts 分析

```typescript
// apps/web/hooks/use-auth.ts 第 21-46 行
const loadUser = useCallback(async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  setUser(user ?? null)
  // ...
}, [])

useEffect(() => {
  void loadUser()
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
  return () => subscription.unsubscribe()
}, [loadUser])
```

**问题点**：
1. **使用 `getUser()` 而不是 `getSession()`**：
   - `getUser()` 验证 token 并返回用户信息，但**不会从 cookie 同步 session 到 localStorage**
   - `getSession()` 会检查 cookie 中的 session，并在需要时刷新

2. **`onAuthStateChange` 监听器**：
   - 监听器会响应认证状态变化
   - 但如果 localStorage 初始为空，监听器不会自动从 cookie 同步

### login-form.tsx 分析

```typescript
// apps/web/components/auth/login-form.tsx 第 30-34 行
if (result.success) {
  router.push('/dashboard')
  router.refresh()  // ✅ 已调用 router.refresh()
}
```

**现状**：登录成功后已调用 `router.refresh()`，这会触发服务器重新渲染。

---

## 长期方案可行性分析

### 方案 A：修改 useAuth Hook 使用 `getSession()`

**修改内容**：
```typescript
// hooks/use-auth.ts
const loadUser = useCallback(async () => {
  const supabase = createClient()
  
  // 修改：使用 getSession() 而不是 getUser()
  const { data: { session } } = await supabase.auth.getSession()
  setUser(session?.user ?? null)
  
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    setAdminRole(profile?.role ?? 'user')
  }
  // ...
}, [])
```

**可行性**：⭐⭐⭐⭐⭐
- 改动最小
- 直接解决问题根源
- 符合 Supabase 官方推荐

**影响范围**：
- 仅修改 `hooks/use-auth.ts` 一个文件
- 所有使用 `useAuth()` 的组件受益

---

### 方案 B：添加 AuthProvider 包装器

**修改内容**：
```typescript
// components/auth-provider.tsx (新增)
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // 显式从 cookie 同步 session
    supabase.auth.getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          router.refresh()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return <>{children}</>
}
```

**可行性**：⭐⭐⭐⭐
- 集中管理认证状态
- 需要修改根 layout
- 可能与现有 `useAuth` Hook 重复

**影响范围**：
- 新增 `components/auth-provider.tsx`
- 修改 `app/layout.tsx`

---

### 方案 C：Proxy 中强制刷新 Cookie

**现状**：`proxy.ts` 第 34 行已调用 `getSession()`

**问题**：调用 `getSession()` 后，session 应该已经被刷新到 cookie，但 Client Component 仍然读取不到。

**可能原因**：
1. `proxy.ts` 中的 `setAll` 逻辑可能没有正确设置 cookie 到响应
2. `getUser()` 不会触发 localStorage 同步，只有 `signInWithPassword` 在浏览器端执行时才会

**修改建议**：
```typescript
// proxy.ts 第 34 行后添加
// 确保 cookie 被正确设置到响应
const { data: { session } } = await supabase.auth.getSession()
if (session) {
  // 强制刷新 cookie
  await supabase.auth.refreshSession()
}
```

**可行性**：⭐⭐⭐
- 每次请求都刷新 token，可能影响性能
- 不是官方推荐方案

---

## 推荐方案

### 短期修复（最小改动）

**修改 `hooks/use-auth.ts`**，使用 `getSession()` 代替 `getUser()`：

```typescript
const loadUser = useCallback(async () => {
  const supabase = createClient()
  
  // 关键修改：使用 getSession() 从 cookie 同步
  const { data: { session } } = await supabase.auth.getSession()
  setUser(session?.user ?? null)

  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    setAdminRole(profile?.role ?? 'user')
  } else {
    setAdminRole('user')
  }
  
  setLoading(false)
}, [])
```

**为什么有效**：
- `getSession()` 会检查 cookie 中的 session token
- 如果 token 有效，返回 session 对象
- Client Component 现在能从 cookie 读取用户，而不是依赖 localStorage

---

### 长期方案（架构优化）

保持现有 Proxy 配置 + 修改 useAuth Hook：

1. **Proxy 配置**：已经是推荐方案，无需修改
2. **useAuth Hook**：修改为使用 `getSession()`
3. **登录表单**：已有 `router.refresh()`，无需修改

---

## 验证步骤

修改后验证：

1. **步骤 1**：清除浏览器所有数据
2. **步骤 2**：重新登录
3. **步骤 3**：检查导航栏是否显示用户菜单
4. **步骤 4**：检查控制台是否有错误
5. **步骤 5**：刷新页面，确认状态保持

---

## 总结

| 方案 | 改动文件 | 可行性 | 推荐度 |
|------|---------|--------|--------|
| **修改 useAuth Hook** | `hooks/use-auth.ts` | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AuthProvider | 新增 + layout | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Proxy 强制刷新 | `proxy.ts` | ⭐⭐⭐ | ⭐⭐ |

**推荐方案**：修改 `hooks/use-auth.ts` 使用 `getSession()`

**原因**：
1. 改动最小，仅一个文件
2. 符合 Supabase 官方推荐
3. 与现有 Proxy 配置完美配合
4. 不影响其他组件

---

## 禁止修改代码说明

根据用户要求，本报告仅提供分析和方案，**禁止更改代码**。
如需实施推荐方案，请用户确认后执行。
