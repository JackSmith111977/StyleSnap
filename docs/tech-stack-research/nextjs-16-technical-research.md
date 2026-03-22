# Next.js 16 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：Next.js 官方文档 (nextjs.org/docs/app)
> 用途：StyleSnap 项目架构设计、技术选型、开发指南

---

## 目录

1. [概述](#1-概述)
2. [核心架构](#2-核心架构)
3. [新增特性 (Next.js 16)](#3-新增特性-nextjs-16)
4. [路由系统](#4-路由系统)
5. [数据获取](#5-数据获取)
6. [缓存系统](#6-缓存系统)
7. [Server Actions](#7-server-actions)
8. [TypeScript 配置](#8-typescript-配置)
9. [项目结构](#9-项目结构)
10. [StyleSnap 项目配置建议](#10-stylesnap-项目配置建议)

---

## 1. 概述

### 1.1 Next.js 是什么

Next.js 是一个 React 全栈框架，用于构建高质量 Web 应用。它提供：
- **服务端渲染 (SSR)** 和 **静态站点生成 (SSG)**
- **React Server Components** 支持
- **文件系统路由** (App Router)
- **内置优化** (图片、字体、脚本)
- **API Routes** (后端接口)
- **中间件** (请求拦截)

### 1.2 版本信息

| 项目 | 详情 |
|------|------|
| 当前版本 | Next.js 16 (最新稳定版) |
| 发布时间 | 2025 年 10 月 |
| 默认捆绑器 | Turbopack (稳定版) |
| React 版本 | React 19.2 (Canary 版本) |
| Node.js 要求 | 20.9+ |
| TypeScript 要求 | 5.1+ |

### 1.3 核心概念术语表

| 术语 | 说明 |
|------|------|
| **App Router** | Next.js 13+ 引入的新路由系统，基于 React Server Components |
| **Server Components** | 在服务端渲染的 React 组件，不发送 JavaScript 到客户端 |
| **Client Components** | 在客户端交互的 React 组件，使用 `'use client'` 指令 |
| **Streaming** | 流式传输，将页面分块从服务器发送到客户端 |
| **Suspense** | React 组件，用于包裹异步内容，显示 fallback UI |
| **PPR (Partial Prerendering)** | 部分预渲染，静态页面中选择性启用动态渲染 |
| **Cache Components** | Next.js 16 新缓存模型，使用 `use cache` 指令 |
| **Server Actions** | 在服务端执行的函数，可直接调用数据库 |

---

## 2. 核心架构

### 2.1 渲染模型

Next.js 16 支持三种渲染模式：

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 渲染模型                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  静态渲染 (Static)                                          │
│  ├── 构建时生成 HTML                                        │
│  ├── 适用于：博客文章、产品页面、文档                       │
│  └── 使用 `use cache` 指令缓存                              │
│                                                             │
│  动态渲染 (Dynamic)                                         │
│  ├── 请求时生成 HTML                                        │
│  ├── 适用于：用户仪表板、实时数据、表单                     │
│  └── 使用 `<Suspense>` 流式传输                             │
│                                                             │
│  混合渲染 (PPR - Partial Prerendering)                      │
│  ├── 静态外壳 + 动态内容                                    │
│  ├── 适用于：大部分现代 Web 应用                            │
│  └── 使用 `use cache` + `<Suspense>` 组合                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 组件类型对比

| 特性 | Server Components | Client Components |
|------|------------------|-------------------|
| **执行位置** | 服务端 | 客户端浏览器 |
| **指令** | 默认（无指令） | `'use client'` |
| **数据获取** | 直接访问数据库/API | 通过 fetch/SWR/React Query |
| **依赖包大小** | 不打包到客户端 | 打包到客户端 |
| **交互性** | 无（不能使用 useState/useEffect） | 完全交互 |
| **访问浏览器 API** | ❌ | ✅ |
| **适用场景** | 数据获取、SEO 内容、静态 UI | 表单、动画、状态管理 |

### 2.3 推荐架构模式

```tsx
// 推荐：Server Component 作为数据获取层
async function Page() {
  const data = await getData() // 服务端数据获取
  return <ClientComponent data={data} /> // 客户端交互
}

// Client Component 专注交互
'use client'
export function ClientComponent({ data }) {
  const [state, setState] = useState(data)
  return <form>...</form>
}
```

---

## 3. 新增特性 (Next.js 16)

### 3.1 Cache Components (核心特性)

**是什么**：Next.js 16 最重要的缓存模型变革，使用 `use cache` 指令显式控制缓存。

**核心变化**：
- 之前版本：隐式缓存（难以预测）
- Next.js 16：默认动态，显式缓存（更符合直觉）

**启用方式**：
```ts filename="next.config.ts"
const nextConfig = {
  cacheComponents: true, // 启用 Cache Components
}
```

**`use cache` 指令用法**：
```tsx
// 文件级别 - 整个文件缓存
'use cache'
export default async function Page() { ... }

// 组件级别 - 单个组件缓存
export async function MyComponent() {
  'use cache'
  return <div>...</div>
}

// 函数级别 - 函数输出缓存
export async function getData() {
  'use cache'
  return fetch('/api/data')
}
```

**缓存生命周期配置**：
```tsx
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours') // 使用内置配置文件
  return fetch('/api/data')
}
```

**内置缓存配置文件**：

| 配置名 | stale | revalidate | expire | 适用场景 |
|--------|-------|------------|--------|----------|
| `default` | 5 分钟 | 15 分钟 | 永不过期 | 通用内容 |
| `seconds` | 0 | 1 秒 | 1 分钟 | 实时数据 |
| `minutes` | 1 分钟 | 5 分钟 | 1 小时 | 频繁更新内容 |
| `hours` | 5 分钟 | 1 小时 | 24 小时 | 每小时更新 |
| `days` | 1 小时 | 1 天 | 30 天 | 每日更新 |
| `weeks` | 1 天 | 7 天 | 90 天 | 每周更新 |
| `max` | 5 分钟 | 背景 revalidate | 永不过期 | 静态内容（推荐） |

**自定义缓存配置**：
```ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    profiles: {
      'product': {
        expire: 86400, // 24 小时过期
        revalidate: 3600, // 1 小时背景更新
        stale: 300, // 5 分钟 stale
      },
    },
  },
}
```

### 3.2 Turbopack (默认捆绑器)

**是什么**：Next.js 16 的默认 JavaScript 捆绑器，替代 Webpack。

**性能提升**：
- 开发模式 Fast Refresh: **5-10 倍更快**
- 生产构建：**2-5 倍更快**
- 文件系统缓存（Beta）：超大项目启动速度提升显著

**启用方式**（已默认启用，无需配置）：
```bash
# 使用 Turbopack
next dev
next build

# 回退到 Webpack
next dev --webpack
next build --webpack
```

**文件系统缓存配置**：
```ts filename="next.config.ts"
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true, // 开发模式文件系统缓存
  },
}
```

### 3.3 React Compiler 支持 (稳定版)

**是什么**：自动记忆化组件，减少不必要的重渲染。

**启用方式**：
```bash
npm install babel-plugin-react-compiler@latest
```

```ts filename="next.config.ts"
const nextConfig = {
  reactCompiler: true,
}
```

**注意**：编译时间会增加，建议生产环境使用。

### 3.4 增强路由系统

**布局去重 (Layout Deduplication)**：
-  prefetch 多个共享同一布局的 URL 时，布局只下载一次
- 示例：50 个产品链接共享布局 → 从 50 次下载减为 1 次

**增量 Prefetch**：
- 仅 prefetch 缓存中没有的部分
- 离开视口时取消请求
- 数据失效时自动重新 prefetch

**效果**：总传输大小大幅降低，.prefetch 请求数量可能增加。

### 3.5 新缓存 API

| API | 用途 | 使用场景 |
|-----|------|----------|
| `revalidateTag(tag, profile)` | 背景 revalidate | 静态内容更新 |
| `updateTag(tag)` | Server Actions 专用 | 读写一致语义 |
| `refresh()` | Server Actions 专用 | 刷新未缓存数据 |
| `cacheTag(tag)` | 标记缓存 | 配合 `use cache` 使用 |

**示例对比**：

```tsx
// revalidateTag - 背景 revalidate（用户看到旧数据）
import { revalidateTag } from 'next/cache'
revalidateTag('products', 'max') // 用户看到缓存，后台更新

// updateTag - 立即刷新（用户看到新数据）
'use server'
import { updateTag } from 'next/cache'
export async function updateProduct() {
  await db.update(...)
  updateTag('products') // 用户立即看到更新
}

// refresh - 仅刷新未缓存数据
'use server'
import { refresh } from 'next/cache'
export async function markNotificationRead() {
  await db.update(...)
  refresh() // 刷新通知计数等动态数据
}
```

### 3.6 `proxy.ts` (原 `middleware.ts`)

**变化**：`middleware.ts` → `proxy.ts`，明确网络边界。

```ts filename="proxy.ts"
export default function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}
```

**Edge Runtime**：`proxy.ts` 运行在 Node.js 运行时，`middleware.ts` 用于 Edge 场景（已弃用）。

### 3.7 React 19.2 特性

| 特性 | 说明 | 用途 |
|------|------|------|
| **View Transitions** | 过渡动画 | 页面切换动画 |
| **`useEffectEvent`** | 提取非响应式逻辑 | Effects 中可复用函数 |
| **`<Activity>`** | 后台活动 | 隐藏 UI 但保持状态 |
| **`use` API** | 读取 Promise | Client Component 流式数据 |

---

## 4. 路由系统

### 4.1 文件系统路由

Next.js 使用文件系统定义路由：

```
app/
├── page.tsx              # /
├── layout.tsx            # 根布局
├── blog/
│   ├── page.tsx          # /blog
│   ├── layout.tsx        # /blog 布局
│   └── [slug]/
│       └── page.tsx      # /blog/:slug
├── docs/
│   └── [[...slug]]/
│       └── page.tsx      # /docs/* (可选捕获)
└── (marketing)/          # 路由组（不影响 URL）
    └── page.tsx          # /
```

### 4.2 特殊文件约定

| 文件名 | 用途 | 说明 |
|--------|------|------|
| `page.tsx` | 页面 | 路由对应的 UI |
| `layout.tsx` | 布局 | 共享 UI，导航时保持状态 |
| `loading.tsx` | 加载状态 | 自动包裹 `<Suspense>` |
| `error.tsx` | 错误处理 | Error Boundary |
| `not-found.tsx` | 404 页面 | 未找到资源 |
| `route.ts` | API 路由 | REST API 端点 |
| `template.tsx` | 模板布局 | 导航时重新挂载 |
| `default.tsx` | 并行路由默认值 | 未指定槽位时显示 |
| `@slot` | 平行路由 | 命名槽位 |
| `intercept.tsx` | 拦截路由 | 拦截导航显示模态框 |

### 4.3 动态路由

**参数获取**（Next.js 16 必须 `await`）：
```tsx
// 动态路由 [slug]
export default async function Page({
  params, // Promise<{ slug: string }>
  searchParams, // Promise<{ [key: string]: string | string[] }>
}) {
  const { slug } = await params
  const filters = (await searchParams).filters

  return <div>{slug}</div>
}
```

**静态参数生成**（SSG）：
```tsx
export async function generateStaticParams() {
  return [
    { slug: 'first-post' },
    { slug: 'second-post' },
  ]
}

export default function Page({ params }) { ... }
```

### 4.4 路由辅助类型

Next.js 16 提供类型安全的 Route Props Helpers：

```tsx
// Page 组件类型
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>{slug}</h1>
}

// Layout 组件类型
export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}</section>
}
```

### 4.5 链接与导航

```tsx
import Link from 'next/link'

// 基本用法
<Link href="/blog">博客</Link>

// 动态链接
<Link href={`/blog/${post.slug}`}>{post.title}</Link>

// Prefetch 控制
<Link href="/blog" prefetch={false}>不预取</Link>

// scroll 控制
<Link href="/#section" scroll={false}>不滚动到顶部</Link>
```

**导航优化**：
- 布局去重：共享布局只下载一次
- 增量 prefetch：仅预取缺失部分
- `<Activity>` 组件：导航时保持状态（Next.js 16 默认启用）

---

## 5. 数据获取

### 5.1 Server Components 数据获取

**使用 fetch API**：
```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/blog')
  const posts = await data.json()
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

**使用数据库/ORM**：
```tsx
import { db, posts } from '@/lib/db'

export default async function Page() {
  const allPosts = await db.select().from(posts)
  return <ul>{allPosts.map(p => <li key={p.id}>{p.title}</li>)}</ul>
}
```

### 5.2 Client Components 数据获取

**使用 `use` API（流式传输）**：
```tsx
// Server Component
export default function Page() {
  const posts = getPosts() // 不 await
  return <Suspense fallback={<div>Loading...</div>}><Posts posts={posts} /></Suspense>
}

// Client Component
'use client'
import { use } from 'react'

export function Posts({ posts }: { posts: Promise<Post[]> }) {
  const allPosts = use(posts) // 读取 Promise
  return <ul>{allPosts.map(p => <li>{p.title}</li>)}</ul>
}
```

**使用 SWR**：
```tsx
'use client'
import useSWR from 'swr'

export default function BlogPage() {
  const { data, isLoading } = useSWR('/api/blog', fetcher)
  if (isLoading) return <div>Loading...</div>
  return <ul>{data.map(p => <li>{p.title}</li>)}</ul>
}
```

### 5.3 数据获取模式

**并行获取**（推荐）：
```tsx
export default async function Page({ params }) {
  const { username } = await params

  // 并行发起请求
  const artistData = getArtist(username)
  const albumsData = getAlbums(username)

  // 等待所有请求完成
  const [artist, albums] = await Promise.all([artistData, albumsData])

  return <div>{artist.name} - {albums.length}</div>
}
```

**串行获取**（有依赖关系时）：
```tsx
export default async function Page({ params }) {
  const { username } = await params
  const artist = await getArtist(username) // 先获取艺术家
  const albums = await getAlbums(artist.id) // 再用 ID 获取专辑
  return <div>{artist.name}</div>
}
```

### 5.4 流式传输 (Streaming)

**使用 `loading.tsx`**：
```tsx
// app/blog/loading.tsx
export default function Loading() {
  return <div>加载中...</div>
}
```

**使用 `<Suspense>`**（推荐）：
```tsx
import { Suspense } from 'react'

export default function BlogPage() {
  return (
    <div>
      <header><h1>博客</h1></header>
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList />
      </Suspense>
    </div>
  )
}
```

---

## 6. 缓存系统

### 6.1 缓存层次

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js 16 缓存层次                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  构建时缓存 (Build-time Cache)                          │
│  ├── `use cache` 在构建时执行                           │
│  ├── 输出静态 HTML                                     │
│  └── 适用于：博客、文档、产品页面                      │
│                                                         │
│  请求时缓存 (Request-time Cache)                        │
│  ├── `use cache` 在请求时执行                           │
│  ├── 内存 LRU 缓存                                     │
│  └── 适用于：用户数据、仪表板                          │
│                                                         │
│  远程缓存 (Remote Cache)                                │
│  ├── `'use cache: remote'`                             │
│  ├── Redis/KV 数据库                                   │
│  └── 适用于：高并发、分布式部署                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 `use cache` 约束

**不能直接访问的 API**：
- `cookies()`
- `headers()`
- `searchParams`

**正确做法**：
```tsx
// ❌ 错误
async function CachedComponent() {
  'use cache'
  const cookies = await cookies() // 报错
}

// ✅ 正确
async function Parent() {
  const cookieValue = (await cookies()).get('name')?.value
  return <CachedComponent cookieValue={cookieValue} />
}

async function CachedComponent({ cookieValue }: { cookieValue: string }) {
  'use cache'
  return <div>{cookieValue}</div>
}
```

### 6.3 缓存失效

**标签式失效**：
```tsx
// 获取数据时标记标签
import { cacheTag } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheTag('products')
  return fetch('/api/products')
}

// Server Action 中失效
'use server'
import { updateTag } from 'next/cache'

export async function updateProduct() {
  await db.update(...)
  updateTag('products') // 失效所有 'products' 标签缓存
}
```

### 6.4 调试缓存

**详细日志**：
```bash
NEXT_PRIVATE_DEBUG_CACHE=1 npm run dev
```

**输出示例**：
```
Cache HIT: getProducts (key: abc123)
Cache MISS: getUser (key: def456) - fetching...
```

---

## 7. Server Actions

### 7.1 基础用法

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.posts.create({ title })
  revalidatePath('/blog')
}
```

### 7.2 表单中使用

```tsx
import { createPost } from './actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">创建</button>
    </form>
  )
}
```

### 7.3 使用表单状态 Hook

```tsx
'use client'
import { useFormStatus, useFormState } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? '提交中...' : '提交'}</button>
}

function Form() {
  const [state, dispatch] = useFormState(createPost, null)
  return (
    <form action={dispatch}>
      {state?.error && <p>{state.error}</p>}
      <input name="title" />
      <SubmitButton />
    </form>
  )
}
```

### 7.4 渐进式增强

```tsx
// 支持无 JavaScript 环境
async function createPost(prevState: unknown, formData: FormData) {
  try {
    await db.posts.create({ title: formData.get('title') })
    return { success: true }
  } catch {
    return { error: '创建失败' }
  }
}
```

---

## 8. TypeScript 配置

### 8.1 推荐 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/lib/*": ["src/lib/*"]
    }
  },
  "include": ["src", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 8.2 Next.js 16 类型生成

运行以下命令生成路由类型：
```bash
next typegen
```

或使用开发/构建命令自动生成：
```bash
next dev
next build
```

---

## 9. 项目结构

### 9.1 推荐目录结构

```
stylesnap/
├── app/                          # App Router 目录
│   ├── (marketing)/              # 路由组
│   │   ├── page.tsx              # 首页
│   │   └── layout.tsx            # 营销布局
│   ├── (dashboard)/              # 路由组
│   │   ├── user/
│   │   │   ├── profile/
│   │   │   └── favorites/
│   │   └── layout.tsx            # 用户布局
│   ├── admin/                    # 管理后台
│   │   └── page.tsx
│   ├── api/                      # API Routes
│   │   └── styles/
│   │       └── route.ts
│   ├── styles/
│   │   ├── [id]/
│   │   │   └── page.tsx          # 风格详情
│   │   └── page.tsx              # 风格列表
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── callback/
│   ├── layout.tsx                # 根布局
│   ├── error.tsx                 # 错误处理
│   ├── not-found.tsx             # 404 页面
│   ├── loading.tsx               # 全局加载
│   └── proxy.ts                  # 中间件（原 middleware）
│
├── components/                   # 组件
│   ├── ui/                       # UI 组件
│   ├── layout/                   # 布局组件
│   └── features/                 # 功能组件
│
├── lib/                          # 工具库
│   ├── db/                       # 数据库
│   ├── auth/                     # 认证
│   ├── utils/                    # 工具函数
│   └── hooks/                    # React Hooks
│
├── public/                       # 静态资源
│   ├── images/
│   └── fonts/
│
├── styles/                       # 全局样式
│   └── globals.css
│
├── next.config.ts                # Next.js 配置
├── package.json
├── tsconfig.json
└── tailwind.config.ts            # Tailwind 配置（如使用）
```

### 9.2 组件层级关系

```
Root Layout (app/layout.tsx)
├── Marketing Layout (app/(marketing)/layout.tsx)
│   ├── Home Page (app/(marketing)/page.tsx)
│   └── Styles Page (app/(marketing)/styles/page.tsx)
└── User Layout (app/(dashboard)/layout.tsx)
    ├── Profile Page (app/(dashboard)/user/profile/page.tsx)
    └── Favorites Page (app/(dashboard)/user/favorites/page.tsx)
```

---

## 10. StyleSnap 项目配置建议

### 10.1 推荐 `next.config.ts`

```ts filename="next.config.ts"
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 启用 Cache Components (Next.js 16 核心特性)
  cacheComponents: true,

  // Turbopack 配置
  turbopack: {
    // 开发模式文件系统缓存
    experimental: {
      turbopackFileSystemCacheForDev: true,
    },
  },

  // 缓存生命周期配置
  cacheLife: {
    profiles: {
      'styles': {
        expire: 86400,      // 24 小时过期
        revalidate: 3600,   // 1 小时背景更新
        stale: 300,         // 5 分钟 stale
      },
      'user': {
        expire: 3600,       // 1 小时过期
        revalidate: 60,     // 1 分钟背景更新
        stale: 60,          // 1 分钟 stale
      },
    },
  },

  // 图片配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    minimumCacheTTL: 14400, // 4 小时
    qualities: [75],
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
```

### 10.2 技术选型总结

| 领域 | 选择 | 理由 |
|------|------|------|
| **框架版本** | Next.js 16 | 最新稳定版，Cache Components 特性 |
| **捆绑器** | Turbopack | 默认，构建速度快 2-5 倍 |
| **渲染模式** | 混合 (PPR) | 静态外壳 + 动态内容 |
| **样式方案** | Tailwind CSS + Shadcn UI | 开发体验最佳 |
| **状态管理** | Zustand + React Query | 客户端 + 服务端状态分离 |
| **表单处理** | Server Actions + React Hook Form | 渐进式增强 |
| **TypeScript** | strict + noUncheckedIndexedAccess | 类型安全 |

### 10.3 关键开发规范

1. **数据获取**：优先在 Server Components 获取，Client Components 使用 `use` API 流式接收
2. **缓存策略**：使用 `use cache` 显式缓存，配合 `cacheTag` 标签失效
3. **表单提交**：使用 Server Actions，配合 `useFormStatus` 显示加载状态
4. **路由类型**：使用 `PageProps<'/path'>` 获取类型安全的 params
5. **错误处理**：每个路由段配置 `error.tsx`，根目录配置全局 `error.tsx`

---

## 附录 A：升级检查清单

从旧版本升级到 Next.js 16 需要注意：

### Breaking Changes

- [ ] Node.js 升级到 20.9+
- [ ] TypeScript 升级到 5.1+
- [ ] `middleware.ts` 重命名为 `proxy.ts`
- [ ] `params` 和 `searchParams` 改为异步（需要 `await`）
- [ ] `cookies()`、`headers()`、`draftMode()` 改为异步
- [ ] `revalidateTag()` 需要第二个参数（cacheLife 配置）
- [ ] 移除 AMP 支持
- [ ] 移除 `next lint` 命令

### 推荐配置

- [ ] 启用 `cacheComponents: true`
- [ ] 配置 Turbopack 文件系统缓存
- [ ] 配置缓存生命周期配置文件
- [ ] 安装 React Compiler（可选）
- [ ] 运行 codemod 自动迁移

```bash
npx @next/codemod@canary upgrade latest
```

---

## 附录 B：参考资料

- [Next.js 16 官方博客](https://nextjs.org/blog/next-16)
- [Next.js 官方文档](https://nextjs.org/docs/app)
- [React 19.2 博客](https://react.dev/blog/2025/10/01/react-19-2)
- [Turbopack 文档](https://turbo.build/pack)
- [Cache Components 指南](https://nextjs.org/docs/app/getting-started/caching)

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本（基于 Next.js 16 官方文档） |
