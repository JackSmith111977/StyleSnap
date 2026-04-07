# 认证 API 参考

> 认证相关 API 文档 - 登录状态同步链路

---

## 目录

1. [Server Actions](#server-actions)
2. [Client Hooks](#client-hooks)
3. [Components](#components)
4. [Supabase 客户端](#supabase-客户端)
5. [认证流程时序图](#认证流程时序图)

---

## Server Actions

### `login(email, password)`

**文件**: `@/actions/auth/index.ts:30`

**作用**: 用户登录

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |

**返回**: `Promise<LoginResult>`
```typescript
interface LoginResult {
  error?: string
  success?: boolean
}
```

**流程**:
1. 验证输入参数 (loginSchema)
2. 创建 Supabase 服务端客户端
3. 调用 `supabase.auth.signInWithPassword()`
4. 设置 Sentry 用户上下文
5. `revalidatePath('/')` 缓存失效
6. 返回 `{ success: true }`

**关键点**:
- Cookie 由 Supabase SDK 自动设置
- Server Action 不会触发客户端的 `onAuthStateChange` 事件
- 需要客户端手动调用 `getSession()` 同步

---

### `logout()`

**文件**: `@/actions/auth/index.ts:307`

**作用**: 用户登出

**返回**: `Promise<void>`

**流程**:
1. 创建 Supabase 服务端客户端
2. 清除 Sentry 用户上下文
3. 调用 `supabase.auth.signOut()`
4. `revalidatePath('/')` 缓存失效
5. `redirect('/')` 重定向到首页

---

### `register(email, password, username)`

**文件**: `@/actions/auth/index.ts:81`

**作用**: 用户注册

**返回**: `Promise<RegisterResult>`
```typescript
interface RegisterResult {
  error?: string
  success?: boolean
  fieldErrors?: Record<string, string[]>
}
```

---

### `resetPassword(email)`

**文件**: `@/actions/auth/index.ts:329`

**作用**: 发送密码重置邮件

---

### `verifyRecoveryToken(code)`

**文件**: `@/actions/auth/index.ts:361`

**作用**: 验证密码重置 token（PKCE flow）

**参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | PKCE code |

**流程**:
1. 创建 Supabase 服务端客户端
2. 调用 `supabase.auth.exchangeCodeForSession(code)`
3. 返回 `{ success: true }`

---

## Client Hooks

### `useAuth()`

**文件**: `@/hooks/use-auth.ts:20`

**作用**: 获取认证状态

**返回**: `UseAuthReturn`
```typescript
interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}
```

**内部流程**:

1. **初始状态**:
   - `user = null`
   - `loading = true`

2. **useEffect 执行**:
   ```typescript
   useEffect(() => {
     void loadUser()  // 加载用户
     // 注册监听器
     const { subscription } = supabase.auth.onAuthStateChange(...)
     return () => subscription.unsubscribe()
   }, [loadUser])
   ```

3. **loadUser()**:
   ```typescript
   const loadUser = async () => {
     const { data: { session } } = await supabase.auth.getSession()
     setUser(session?.user ?? null)
     // 获取用户角色
     const { data: profile } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', session.user.id)
       .single()
     setAdminRole(profile?.role ?? 'user')
     setLoading(false)
   }
   ```

**关键方法**:

| 方法 | 说明 |
|------|------|
| `getSession()` | 从 cookie 读取 session |
| `onAuthStateChange()` | 监听认证状态变化事件 |

---

## Components

### `LoginForm`

**文件**: `@/components/auth/login-form.tsx`

**作用**: 登录表单

**关键流程**:
```typescript
async function handleSubmit(e) {
  const result = await login(email, password)
  
  if (result.success) {
    // 手动同步 session 到客户端
    await supabase.auth.getSession()
    
    // 导航并刷新
    router.push('/')
    router.refresh()
  }
}
```

---

### `UserMenu`

**文件**: `@/components/auth/user-menu.tsx`

**作用**: 用户菜单（显示登录状态）

**渲染逻辑**:
```typescript
export function UserMenu() {
  const { user, loading } = useAuth()
  
  if (!user) {
    // 显示登录/注册按钮
  }
  
  // 显示用户菜单
}
```

---

## Supabase 客户端

### 创建客户端

**Browser Client**: `@/lib/supabase/client.ts`
```typescript
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

**Server Client**: `@/lib/supabase/server.ts`
```typescript
export async function createClient() {
  return createServerClient(...)
}
```

---

### Cookie 管理

**Cookie 名称**:
- `auth-token` (默认)

**Cookie 设置位置**:
- Server Action 中调用 `supabase.auth.signInWithPassword()` 后自动设置
- 通过 Next.js `cookies()` API 设置

---

## 认证流程时序图

### 登录流程

```
┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐    ┌──────────┐
│  用户   │    │ LoginForm    │    │ login()     │    │  Supabase  │    │  Cookie  │
└────┬────┘    └──────┬───────┘    └──────┬──────┘    └─────┬──────┘    └────┬─────┘
     │                │                    │                  │               │
     │ 1. 提交表单    │                    │                  │               │
     │───────────────>│                    │                  │               │
     │                │                    │                  │               │
     │                │ 2. 调用 login()    │                  │               │
     │                │───────────────────>│                  │               │
     │                │                    │                  │               │
     │                │                    │ 3. signInWithPassword()          │
     │                │                    │─────────────────>│               │
     │                │                    │                  │               │
     │                │                    │ 4. 返回 user/session             │
     │                │                    │<─────────────────│               │
     │                │                    │                  │               │
     │                │                    │                  │ 5. 设置 Cookie│
     │                │                    │                  │<──────────────│
     │                │                    │                  │               │
     │                │ 6. 返回 success    │                  │               │
     │                │<───────────────────│                  │               │
     │                │                    │                  │               │
     │                │ 7. getSession()    │                  │               │
     │                │──────────────────────────────────────────────────────>│
     │                │                    │                  │               │
     │                │ 8. 返回 session    │                  │               │
     │                │<──────────────────────────────────────────────────────│
     │                │                    │                  │               │
     │                │ 9. router.push('/') + router.refresh()│               │
     │                │                    │                  │               │
     │ 10. 导航到首页 │                    │                  │               │
     │<───────────────│                    │                  │               │
     │                │                    │                  │               │
     │                │                    │                  │               │
     │                │              ┌─────┴────────┐        │               │
     │                │              │   UserMenu   │        │               │
     │                │              └──────┬───────┘        │               │
     │                │                     │                │               │
     │                │                     │ 11. 初始渲染    │               │
     │                │                     │ (user=null)     │               │
     │                │                     │ 显示登录按钮    │               │
     │                │                     │                │               │
     │                │                     │ 12. useEffect 执行              │
     │                │                     │─────────────> getSession()     │
     │                │                     │                │               │
     │                │                     │ 13. 返回 session               │
     │                │                     │<───────────────────────────────│
     │                │                     │                │               │
     │                │                     │ 14. setUser(user)              │
     │                │                     │ 触发重新渲染    │               │
     │                │                     │                │               │
     │                │                     │ 15. 重新渲染    │               │
     │                │                     │ 显示用户头像    │               │
     │ 16. 看到登录状态│                    │                │               │
     │<──────────────────────────────────────────────────────────────────────│
```

---

## 调试输出位置

### 已添加的日志点

| 位置 | 日志前缀 | 说明 |
|------|----------|------|
| `login()` | `[login]` | Server Action 登录流程 |
| `LoginForm.handleSubmit()` | `[LoginForm]` | 客户端表单提交 |
| `useAuth.loadUser()` | `[useAuth]` | 用户状态加载 |
| `useAuth.useEffect` | `[useAuth]` | 效果器执行 |
| `useAuth.onAuthStateChange` | `[useAuth]` | 认证状态变化监听 |
| `UserMenu` | `[UserMenu]` | 组件渲染状态 |

---

## 已知问题

### 问题：登录后导航栏状态延迟渲染

**现象**: 登录成功返回首页后，先显示未登录状态，稍后才显示已登录状态

**原因**:
1. `router.refresh()` 触发页面重新加载
2. `UserMenu` 组件挂载时 `user = null`
3. `useEffect` 异步调用 `getSession()` 需要时间
4. 导致短暂的未登录状态闪烁

**时序**:
```
T0: 登录成功
T1: router.refresh() 开始
T2: UserMenu 挂载 (user=null) ← 闪烁开始
T3: useEffect 执行
T4: getSession() 返回
T5: setUser() 触发重渲染 ← 闪烁结束
```

**可能的解决方案**（待讨论）:
1. 在登录成功后通过 URL 参数传递状态
2. 使用 Zustand 等全局状态管理提前设置 user
3. 在 `router.refresh()` 前设置本地状态
4. 使用 React Suspense 显示 loading 状态

---

## 相关文件索引

```
apps/web/
├── actions/auth/index.ts       # Server Actions
├── components/auth/
│   ├── login-form.tsx          # 登录表单
│   └── user-menu.tsx           # 用户菜单
├── hooks/use-auth.ts           # 认证 Hook
└── lib/supabase/
    ├── client.ts               # Browser Client
    └── server.ts               # Server Client
```
