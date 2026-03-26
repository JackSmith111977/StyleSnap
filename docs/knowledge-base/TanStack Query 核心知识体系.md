# TanStack Query vs SWR 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目服务端状态管理技术选型

---

## 目录

1. [概述](#1-概述)
2. [TanStack Query 核心知识体系](#2-tanstack-query-核心知识体系)
3. [SWR 核心知识体系](#3-swr-核心知识体系)
4. [详细对比分析](#4-详细对比分析)
5. [StyleSnap 选型建议](#5-stylesnap-选型建议)

---

## 1. 概述

### 1.1 为什么需要服务端状态管理？

在 React 应用中，数据分为两类：

| 类型 | 说明 | 特点 | 管理方案 |
|------|------|------|----------|
| **客户端状态** | UI 状态、用户交互 | 同步、无需缓存、客户端独有 | Zustand、Redux |
| **服务端状态** | API 数据、数据库内容 | 异步、需要缓存、可能过期 | TanStack Query、SWR |

**常见误区**：用管理客户端状态的方式管理服务端数据
```typescript
// ❌ 错误做法：用 useState 管理 API 数据
const [data, setData] = useState(null)
useEffect(() => {
  fetch('/api/data').then(res => res.json()).then(setData)
}, [])
// 问题：没有缓存、没有重试、没有去重、没有 stale 处理

// ✅ 正确做法：使用 TanStack Query 或 SWR
const { data } = useQuery({ queryKey: ['data'], queryFn: fetcher })
```

### 1.2 两大主流方案对比概览

| 特性 | TanStack Query | SWR |
|------|---------------|-----|
| **开发团队** | TanStack（原 React Query 团队） | Vercel（Next.js 同一团队） |
| **体积** | ~13KB (gzip) | ~4KB (gzip) |
| **核心理念** | 强大的异步状态管理 | 轻量级数据获取 |
| **缓存策略** | 智能缓存 + 过期时间 | stale-while-revalidate |
| **框架支持** | React、Vue、Solid、Svelte、Angular | React 为主 |
| **学习曲线** | 中等 | 低 |
| **适用场景** | 复杂数据管理、企业级应用 | 轻量应用、Next.js 项目 |

---

## 2. TanStack Query 核心知识体系

### 2.1 核心概念

#### Query（查询）

Query 是 TanStack Query 的基本单位，代表一个异步数据请求。

```typescript
// Query 的唯一标识：queryKey
const queryKey = ['todos', { status: 'pending' }]

// Query 的执行函数：queryFn
const queryFn = async () => {
  const res = await fetch('/api/todos')
  return res.json()
}
```

#### QueryClient

`QueryClient` 是查询的总控制器，管理所有查询实例。

```typescript
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 分钟内数据不 stale
      gcTime: 1000 * 60 * 60,    // 1 小时后清除未使用缓存
      retry: 3,                   // 失败重试 3 次
      refetchOnWindowFocus: true, // 窗口聚焦时重新验证
    },
  },
})
```

#### QueryCache

`QueryCache` 存储所有查询的缓存数据。

```typescript
// 每个 QueryClient 都有一个默认的 QueryCache
const queryClient = new QueryClient({
  queryCache: new QueryCache(),
})
```

### 2.2 核心 Hooks

#### useQuery - 基础查询

```typescript
import { useQuery } from '@tanstack/react-query'

function Todos() {
  const {
    data,           // 查询返回的数据
    isLoading,      // 首次加载状态
    isError,        // 是否出错
    error,          // 错误对象
    isSuccess,      // 是否成功
    isFetching,     // 是否正在获取（包括背景刷新）
    isStale,        // 数据是否过期
    refetch,        // 手动重新获取
  } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const res = await fetch('/api/todos')
      return res.json()
    },
    // 可选配置
    staleTime: 1000 * 60 * 5,  // 5 分钟
    gcTime: 1000 * 60 * 60,    // 1 小时（v5  renamed from cacheTime）
    retry: 3,
  })

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <ul>
      {data.map(todo => <li key={todo.id}>{todo.title}</li>)}
    </ul>
  )
}
```

**参数说明**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `queryKey` | `string[]` | 必填 | 查询唯一标识 |
| `queryFn` | `Function` | 必填 | 返回 Promise 的函数 |
| `staleTime` | `number` | `0` | 数据保持 fresh 的时间 |
| `gcTime` | `number` | `300000` | 未使用缓存的清除时间（v5 改名为 gcTime） |
| `retry` | `number | Function` | `3` | 失败重试次数 |
| `refetchOnWindowFocus` | `boolean` | `true` | 窗口聚焦时重新获取 |
| `enabled` | `boolean` | `true` | 是否启用查询 |

#### useMutation - 数据修改

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'

function AddTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (newTodo: string) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        body: JSON.stringify({ title: newTodo }),
      })
      return res.json()
    },
    // 成功回调
    onSuccess: (data) => {
      // 方式 1：使查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: ['todos'] })

      // 方式 2：手动更新缓存
      // queryClient.setQueryData(['todos'], (old) => [...old, data])
    },
  })

  return (
    <button onClick={() => mutation.mutate('New Todo')}>
      {mutation.isPending ? 'Adding...' : 'Add Todo'}
    </button>
  )
}
```

**方法说明**：

| 方法 | 说明 |
|------|------|
| `mutate(variables, options)` | 执行突变 |
| `mutateAsync(variables)` | 返回 Promise 的突变 |

**状态属性**：

| 属性 | 说明 |
|------|------|
| `isPending` | 是否正在进行（v5 renamed from isLoading） |
| `isSuccess` | 是否成功 |
| `isError` | 是否出错 |
| `data` | 返回数据 |
| `error` | 错误对象 |

#### useInfiniteQuery - 无限加载

```typescript
import { useInfiniteQuery } from '@tanstack/react-query'

function InfiniteTodos() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['todos'],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(`/api/todos?page=${pageParam}`)
      return res.json()
    },
    initialPageParam: 0, // v5 新增
    getNextPageParam: (lastPage, allPages) => {
      // 返回下一页的参数
      return lastPage.hasMore ? lastPage.nextPage : undefined
    },
  })

  return (
    <div>
      {data.pages.map((page, i) => (
        <div key={i}>
          {page.todos.map(todo => <Todo key={todo.id} todo={todo} />)}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetching}>
          {isFetching ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
```

#### useQueryClient - 访问 QueryClient

```typescript
import { useQueryClient } from '@tanstack/react-query'

function Component() {
  const queryClient = useQueryClient()

  // 获取缓存数据
  const cachedData = queryClient.getQueryData(['todos'])

  // 设置缓存数据
  queryClient.setQueryData(['todos'], newData)

  // 使查询失效
  queryClient.invalidateQueries({ queryKey: ['todos'] })

  // 取消查询
  queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

### 2.3 缓存机制

#### 缓存结构

```
QueryCache
├── Query(key: ['todos'])
│   ├── state: { data, error, status, ... }
│   ├── observers: [Observer1, Observer2, ...]
│   └── promise: Promise
├── Query(key: ['todos', { id: 1 }])
└── Query(key: ['todos', { id: 2 }])
```

#### stale-while-revalidate 策略

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 分钟内是 fresh
      gcTime: 1000 * 60 * 60,    // 1 小时后清除
    },
  },
})

// 时间线：
// T0:    首次获取数据，状态 fresh
// T5min: 数据变为 stale，但仍然显示
// T5min+: 组件挂载时触发后台刷新
// T60min: 缓存被清除，下次访问重新获取
```

#### 缓存更新策略

```typescript
// 1. 使查询失效（触发背景刷新）
queryClient.invalidateQueries({ queryKey: ['todos'] })

// 2. 直接设置数据
queryClient.setQueryData(['todos'], (oldData) => [...oldData, newTodo])

// 3. 取消查询
queryClient.cancelQueries({ queryKey: ['todos'] })

// 4. 重新获取
queryClient.refetchQueries({ queryKey: ['todos'] })
```

### 2.4 乐观更新（Optimistic Updates）

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,

  // 1. 取消正在进行的查询
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })

    // 2. 保存旧数据用于回滚
    const previousTodos = queryClient.getQueryData(['todos'])

    // 3. 乐观更新数据
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])

    // 4. 返回上下文
    return { previousTodos }
  },

  // 5. 错误回滚
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },

  // 6. 总是重新获取
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### 2.5 Next.js 集成

#### App Router 集成

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 分钟
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// app/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export default function Page() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: () => fetch('/api/todos').then(res => res.json()),
  })

  return <div>{/* ... */}</div>
}
```

#### Server Components 集成

```typescript
// 服务端组件中 prefetch
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'

async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['todos'],
    queryFn: getTodos,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TodosClient />
    </HydrationBoundary>
  )
}
```

---

## 3. SWR 核心知识体系

### 3.1 核心概念

#### Stale-While-Revalidate 策略

源自 HTTP RFC 5861，核心思想：
1. **Stale（陈旧）**：先返回缓存数据
2. **Revalidate（再验证）**：后台获取最新数据
3. **Update（更新）**：用新数据更新 UI

```typescript
import useSWR from 'swr'

function Profile() {
  // 1. 首次：返回缓存（如有）+ 发送请求
  // 2. 请求完成：更新 UI
  // 3. 下次访问：立即返回缓存 + 后台刷新
  const { data, error, isLoading } = useSWR('/api/user', fetcher)

  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  return <div>Hello {data.name}!</div>
}
```

### 3.2 核心 API

#### useSWR - 基础 Hook

```typescript
import useSWR from 'swr'

function Component() {
  const {
    data,           // 数据
    error,          // 错误
    isLoading,      // 首次加载
    isValidating,   // 是否正在验证
    mutate,         // 手动变更数据
  } = useSWR('/api/user', fetcher, options)
}
```

**参数说明**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `key` | `string` | 必填 | 唯一标识 |
| `fetcher` | `Function` | 必填 | 返回 Promise 的函数 |
| `options` | `Object` | 可选 | 配置选项 |

**常用配置**：

```typescript
useSWR('/api/data', fetcher, {
  // 重新验证行为
  revalidateOnFocus: true,         // 窗口聚焦时重新验证
  revalidateOnReconnect: true,     // 网络恢复时重新验证
  revalidateOnMount: true,         // 挂载时重新验证
  revalidateIfStale: true,         // 数据 stale 时重新验证

  // 轮询
  refreshInterval: 0,              // 轮询间隔（0 禁用）
  dedupingInterval: 2000,          // 去重间隔（2 秒内不重复请求）

  // 重试
  shouldRetryOnError: true,        // 失败是否重试
  errorRetryInterval: 3000,        // 重试间隔
  errorRetryCount: 3,              // 重试次数

  // 缓存
  keepPreviousData: false,         // 保留上次数据
  fallbackData: undefined,         // 回退数据
})
```

#### SWRConfig - 全局配置

```typescript
import useSWR, { SWRConfig } from 'swr'

// 应用级别配置
function App() {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(res => res.json()),
        revalidateOnFocus: false,
        refreshInterval: 10000,
        dedupingInterval: 2000,
      }}
    >
      <Profile />
    </SWRConfig>
  )
}

// 组件继承配置
function Profile() {
  // 继承全局 fetcher，只需传 key
  const { data } = useSWR('/api/user')
}
```

### 3.3 数据变更

#### mutate - 全局变更

```typescript
import useSWR, { mutate } from 'swr'

// 方式 1：设置数据
await mutate('/api/user', { name: 'New Name' })

// 方式 2：异步更新
await mutate(
  '/api/user',
  async () => {
    const res = await fetch('/api/user', { method: 'PUT' })
    return res.json()
  }
)

// 方式 3：乐观更新
await mutate(
  '/api/todos',
  async (currentTodos) => {
    // 1. 立即更新 UI
    const newTodos = [...currentTodos, newTodo]

    // 2. 后台发送请求
    await fetch('/api/todos', {
      method: 'POST',
      body: JSON.stringify(newTodo),
    })

    // 3. 返回最终数据
    return newTodos
  },
  {
    revalidate: false, // 不重新验证
  }
)
```

#### useSWRMutation - 独立突变

```typescript
import useSWRMutation from 'swr/mutation'

function AddTodo() {
  const { trigger, isMutating } = useSWRMutation(
    '/api/todos',
    async (url, { arg }: { arg: string }) => {
      const res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ title: arg }),
      })
      return res.json()
    }
  )

  return (
    <button onClick={() => trigger('New Todo')} disabled={isMutating}>
      {isMutating ? 'Adding...' : 'Add'}
    </button>
  )
}
```

### 3.4 缓存管理

```typescript
import { mutate, unstable_serialize } from 'swr'

// 设置缓存
mutate('/api/user', { name: 'New Name' })

// 获取缓存
const cached = await mutate('/api/user')

// 清除缓存
mutate('/api/user', null)

// 清除所有缓存
mutate(() => true)

// 使用 key 序列化（用于复杂 key）
const key = ['/api/todos', { status: 'pending' }]
mutate(unstable_serialize(key), newData)
```

### 3.5 无限加载

```typescript
import useSWRInfinite from 'swr/infinite'

function InfiniteTodos() {
  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(
    (index) => `/api/todos?page=${index}`,
    fetcher
  )

  return (
    <div>
      {data?.map(page => page.todos.map(todo => <Todo key={todo.id} todo={todo} />))}
      <button onClick={() => setSize(size + 1)} disabled={isLoading}>
        Load More
      </button>
    </div>
  )
}
```

### 3.6 条件请求

```typescript
// 动态 key：返回 null 时不请求
const { data } = useSWR(
  user ? `/api/user/${user.id}` : null,
  fetcher
)

// 函数 key
const { data } = useSWR(
  () => user && `/api/user/${user.id}`,
  fetcher
)
```

### 3.7 Next.js 集成

#### App Router 集成

```typescript
// app/providers.tsx
'use client'

import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(res => res.json()),
        dedupingInterval: 2000,
      }}
    >
      {children}
    </SWRConfig>
  )
}

// app/page.tsx
'use client'

import useSWR from 'swr'

export default function Page() {
  const { data } = useSWR('/api/todos')
  return <div>{/* ... */}</div>
}
```

#### 服务端预获取

```typescript
// 使用 fallbackData
async function Page() {
  const todos = await getTodos()

  return (
    <SWRConfig value={{ fallback: { '/api/todos': todos } }}>
      <TodosClient />
    </SWRConfig>
  )
}

function TodosClient() {
  const { data } = useSWR('/api/todos')
  // 首次渲染即有数据
}
```

---

## 4. 详细对比分析

### 4.1 特性对比表

| 特性 | TanStack Query | SWR |
|------|---------------|-----|
| **包体积** | ~13KB (gzip) | ~4KB (gzip) |
| **核心 Hook** | `useQuery`, `useMutation`, `useInfiniteQuery` | `useSWR`, `useSWRMutation`, `useSWRInfinite` |
| **缓存键** | 数组 `['todos', { id: 1 }]` | 字符串/任意可序列化值 |
| **配置方式** | `QueryClient` 全局配置 + `useQuery` 局部配置 | `SWRConfig` 全局配置 + 局部配置 |
| **类型支持** | 完整 TypeScript 支持 | 完整 TypeScript 支持 |
| **框架支持** | React, Vue, Solid, Svelte, Angular | React, Vue (swrv) |
| **DevTools** | ✅ 专用 DevTools | ❌ 无官方 DevTools |

### 4.2 缓存策略对比

| 行为 | TanStack Query | SWR |
|------|---------------|-----|
| **默认 stale 时间** | `0`（立即 stale） | 无限制（永不过期） |
| **缓存清除时间** | 5 分钟（gcTime） | 无限制 |
| **窗口聚焦刷新** | ✅ 默认开启 | ✅ 默认开启 |
| **网络恢复刷新** | ✅ 默认开启 | ✅ 默认开启 |
| **自动重试** | ✅ 默认 3 次 | ✅ 默认开启 |
| **请求去重** | ✅ | ✅ |

### 4.3 API 设计对比

#### 查询数据

```typescript
// TanStack Query - 对象参数
useQuery({
  queryKey: ['todos'],
  queryFn: fetcher,
  staleTime: 5000,
})

// SWR - 分离参数
useSWR('/api/todos', fetcher, {
  dedupingInterval: 2000,
})
```

#### 修改数据

```typescript
// TanStack Query - useMutation
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
})
mutation.mutate(todo)

// SWR - mutate
await mutate('/api/todos', createTodo, {
  revalidate: true,
})

// SWR - useSWRMutation
const { trigger } = useSWRMutation('/api/todos', createTodo)
await trigger(todo)
```

### 4.4 开发体验对比

| 维度 | TanStack Query | SWR |
|------|---------------|-----|
| **上手难度** | 中等（概念较多） | 低（API 简洁） |
| **文档质量** | ⭐⭐⭐⭐⭐ 完善 | ⭐⭐⭐⭐ 良好 |
| **社区生态** | ⭐⭐⭐⭐⭐ 庞大 | ⭐⭐⭐⭐ 活跃 |
| **DevTools** | ✅ 强大的调试工具 | ❌ 需手动调试 |
| **最佳实践** | 明确推荐模式 | 灵活自由 |

### 4.5 性能对比

| 场景 | TanStack Query | SWR |
|------|---------------|-----|
| **首次渲染** | 相当 | 相当 |
| **缓存命中** | 相当 | 稍快（体积小） |
| **大量查询** | 更优（缓存管理精细） | 良好 |
| **内存占用** | 中等 | 低 |

---

## 5. StyleSnap 选型建议

### 5.1 项目需求分析

根据 StyleSnap 的 PRD 和 APP_FLOW，以下功能需要服务端状态管理：

| 功能 | 需求 | 优先级 |
|------|------|--------|
| 风格列表获取 | 分页/无限加载、筛选、排序 | P0 |
| 风格详情获取 | 静态数据缓存 | P0 |
| 收藏功能 | 乐观更新、背景同步 | P0 |
| 点赞功能 | 乐观更新 | P0 |
| 评论列表 | 实时更新、分页 | P1 |
| 评论提交 | 提交后刷新 | P1 |
| 用户提交 | 表单提交、状态跟踪 | P2 |

### 5.2 推荐方案

#### 首选：TanStack Query

**理由**：
1. ✅ **乐观更新成熟**：收藏/点赞需要立即反馈，TanStack Query 的 `onMutate` + `onError` 回滚机制完善
2. ✅ **DevTools 支持**：调试缓存状态、查询历史更方便
3. ✅ **缓存控制精细**：`staleTime`、`gcTime` 可针对不同数据类型配置
4. ✅ **无限加载**：`useInfiniteQuery` API 设计更直观
5. ✅ **Next.js 16 集成**：支持 Server Components 预获取

**配置建议**：
```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,      // 1 分钟
        gcTime: 5 * 60 * 1000,     // 5 分钟
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**使用示例**：
```typescript
// 风格列表（分页）
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['styles', filters],
  queryFn: ({ pageParam }) => fetchStyles({ ...filters, page: pageParam }),
  initialPageParam: 0,
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 30 * 1000,  // 30 秒
})

// 收藏功能（乐观更新）
const mutation = useMutation({
  mutationFn: toggleFavorite,
  onMutate: async ({ styleId }) => {
    await queryClient.cancelQueries({ queryKey: ['styles'] })
    const previous = queryClient.getQueryData(['styles'])
    queryClient.setQueryData(['styles', styleId], (old) => ({
      ...old,
      isFavorite: !old.isFavorite,
    }))
    return { previous }
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['styles', variables.styleId], context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['styles'] })
  },
})

// 评论提交
const mutation = useMutation({
  mutationFn: createComment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['comments', styleId] })
  },
})
```

#### 备选：SWR

**适用场景**：
- 项目追求极致轻量
- 团队熟悉 Vercel 生态
- 不需要复杂缓存管理

**配置建议**：
```typescript
// app/providers.tsx
'use client'

import { SWRConfig } from 'swr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then(res => res.json()),
        dedupingInterval: 2000,
        revalidateOnFocus: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}
```

### 5.3 最终推荐

**StyleSnap 项目推荐使用 TanStack Query**

| 考量维度 | TanStack Query | SWR |
|----------|---------------|-----|
| **功能完整性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **乐观更新** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DevTools** | ⭐⭐⭐⭐⭐ | ⭐ |
| **学习曲线** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **包体积** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **社区生态** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**核心理由**：
1. StyleSnap 需要频繁的乐观更新（收藏、点赞）
2. 评论功能需要实时更新
3. DevTools 对调试缓存问题至关重要
4. 包体积差异（9KB）在生产环境中影响不大

---

## 附录 A：安装指南

### TanStack Query

```bash
npm install @tanstack/react-query
# 或
yarn add @tanstack/react-query
# 或
pnpm add @tanstack/react-query
```

### SWR

```bash
npm install swr
# 或
yarn add swr
# 或
pnpm add swr
```

---

## 附录 B：参考资料

- [TanStack Query 官方文档](https://tanstack.com/query/latest/docs/framework/react/overview)
- [SWR 官方文档](https://swr.vercel.app/)
- [TanStack Query GitHub](https://github.com/TanStack/query)
- [SWR GitHub](https://github.com/vercel/swr)
- [React Query vs SWR 对比](https://www.robinwieruch.de/react-query-vs-swr/)

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
