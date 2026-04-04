# Next.js 16 API 快速参考

> 最后更新：2026-04-04 | 基于 Next.js 16.2.1 官方文档

---

## 目录

1. [路由和导航](#1-路由和导航)
2. [Metadata API](#2-metadata-api)
3. [数据获取与缓存](#3-数据获取与缓存)
4. [Server Actions](#4-server-actions)
5. [Cache Components](#5-cache-components)
6. [Proxy (原 Middleware)](#6-proxy-原-middleware)
7. [Viewport API](#7-viewport-api)
8. [动态路由](#8-动态路由)
9. [类型辅助](#9-类型辅助)

---

## 1. 路由和导航

### 1.1 `useRouter` Hook (Client Component)

```typescript
'use client'
import { useRouter } from 'next/navigation'

function Page() {
  const router = useRouter()
  
  router.push('/dashboard')      // 导航
  router.replace('/login')       // 替换历史记录
  router.back()                  // 后退
  router.forward()               // 前进
  router.refresh()               // 刷新
  router.prefetch('/about')      // 预加载
}
```

### 1.2 `redirect` 函数 (Server/Client)

```typescript
import { redirect } from 'next/navigation'

// Server Component
async function ProtectedPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return <h1>受保护的页面</h1>
}

// Server Action
'use server'
export async function updatePost() {
  await db.posts.update(...)
  redirect(`/posts/${postId}`)
}
```

### 1.3 `notFound` 函数

```typescript
import { notFound } from 'next/navigation'

async function PostPage({ params }) {
  const { id } = await params
  const post = await getPost(id)
  if (!post) notFound()
  return <h1>{post.title}</h1>
}

// app/not-found.tsx 自定义 404 页面
```

### 1.4 `usePathname` Hook

```typescript
'use client'
import { usePathname } from 'next/navigation'

function Navbar() {
  const pathname = usePathname()
  return <nav>当前：{pathname}</nav>
}
```

### 1.5 `useParams` Hook

```typescript
'use client'
import { useParams } from 'next/navigation'

function Page() {
  const params = useParams()
  // /blog/[slug] -> { slug: 'hello-world' }
  return <h1>{params.slug}</h1>
}
```

### 1.6 `useSearchParams` Hook

```typescript
'use client'
import { useSearchParams } from 'next/navigation'

function Page() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')
  return <p>搜索：{q}</p>
}
```

---

## 2. Metadata API

### 2.1 静态 Metadata 对象

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StyleSnap - 发现网页设计风格',
  description: '前端开发者的视觉风格灵感库',
  keywords: ['design', 'style', 'frontend', 'css'],
  authors: [{ name: 'Kei', url: 'https://github.com/kei' }],
  creator: 'Kei',
  publisher: 'StyleSnap',
  robots: { index: true, follow: true },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
```

### 2.2 动态 `generateMetadata` 函数

```typescript
import type { Metadata, ResolvingMetadata } from 'next'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)
  
  return {
    title: post?.title ?? '文章不存在',
    description: post?.excerpt,
    openGraph: {
      images: post?.ogImage ? [post.ogImage] : [],
    },
  }
}
```

### 2.3 Open Graph 和 Twitter Cards

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://stylesnap.app'),
  title: 'StyleSnap',
  description: '发现网页设计风格',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'StyleSnap',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.png'],
  },
}
```

### 2.4 结构化数据 (JSON-LD)

```typescript
export default async function Page({ params }) {
  const post = await getPost(params.id)
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    title: post.title,
    author: post.author,
    datePublished: post.createdAt,
  }
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 页面内容 */}
    </>
  )
}
```

---

## 3. 数据获取与缓存

### 3.1 `fetch` 缓存选项

```typescript
// 静态生成 (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // 1 小时 revalidate
})

// 动态获取
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// 强制缓存
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
})
```

### 3.2 标签缓存

```typescript
// 数据获取时打标签
const posts = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
})

// Server Action 中 revalidate
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost() {
  await db.posts.create({...})
  revalidateTag('posts')
}
```

### 3.3 `revalidatePath` 和 `revalidateTag`

```typescript
'use server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function updatePost() {
  await db.posts.update(...)
  
  revalidatePath('/posts')           // 按路径
  revalidatePath('/posts/[id]', 'page')
  revalidateTag('posts')             // 按标签
}
```

### 3.4 `unstable_cache` (高级缓存)

```typescript
import { unstable_cache } from 'next/cache'

const getPopularPosts = unstable_cache(
  async () => db.posts.findMany({...}),
  ['popular-posts'],
  { revalidate: 3600, tags: ['posts'] }
)
```

### 3.5 缓存模式对比

| 模式 | 配置 | 适用场景 |
|------|------|----------|
| **静态生成** | `next: { revalidate: N }` | 博客、产品页 |
| **动态获取** | `cache: 'no-store'` | 仪表盘、实时数据 |
| **标签缓存** | `next: { tags: [...] }` | 手动控制失效 |
| **路径 revalidate** | `revalidatePath` | 表单提交后刷新 |

---

## 4. Server Actions

### 4.1 基础用法

```typescript
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  await db.posts.create({ title })
  revalidatePath('/blog')
  redirect('/blog')
}
```

### 4.2 表单中使用

```typescript
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

### 4.3 表单状态 Hook

```typescript
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

### 4.4 返回状态模式

```typescript
'use server'

interface State {
  error?: string
  success?: boolean
}

export async function createPost(
  prevState: State, 
  formData: FormData
): Promise<State> {
  try {
    await db.posts.create({ title: formData.get('title') })
    revalidatePath('/blog')
    return { success: true }
  } catch {
    return { error: '创建失败' }
  }
}
```

### 4.5 优化更新 (Optimistic Update)

```typescript
'use client'
import { useOptimistic } from 'react'

function LikeButton({ postId, initialLikes }) {
  const [optimisticLikes, addOptimisticLike] = useOptimistic(
    initialLikes,
    (state) => state + 1
  )
  
  return (
    <button onClick={async () => {
      addOptimisticLike()
      await addLike(postId)
    }}>
      {optimisticLikes} 点赞
    </button>
  )
}
```

### 4.6 输入验证

```typescript
'use server'
import { z } from 'zod'

const Schema = z.object({
  title: z.string().min(1).max(100),
})

export async function createPost(formData: FormData) {
  const result = Schema.safeParse({ title: formData.get('title') })
  
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }
  
  await db.posts.create(result.data)
  revalidatePath('/blog')
  return { success: true }
}
```

---

## 5. Cache Components

### 5.1 启用方式

```typescript
// next.config.ts
const nextConfig = {
  cacheComponents: true,
}
```

### 5.2 `use cache` 指令

```typescript
// 文件级别
'use cache'
export default async function Page() { ... }

// 组件级别
export async function MyComponent() {
  'use cache'
  return <div>...</div>
}

// 函数级别
export async function getData() {
  'use cache'
  return fetch('/api/data')
}
```

### 5.3 缓存生命周期

```typescript
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours')
  return fetch('/api/data')
}
```

| 配置名 | stale | revalidate | expire | 适用场景 |
|--------|-------|------------|--------|----------|
| `default` | 5 分钟 | 15 分钟 | 永不过期 | 通用 |
| `seconds` | 0 | 1 秒 | 1 分钟 | 实时 |
| `minutes` | 1 分钟 | 5 分钟 | 1 小时 | 频繁更新 |
| `hours` | 5 分钟 | 1 小时 | 24 小时 | 每小时 |
| `days` | 1 小时 | 1 天 | 30 天 | 每日 |
| `weeks` | 1 天 | 7 天 | 90 天 | 每周 |
| `max` | 5 分钟 | 背景 | 永不过期 | 静态 |

### 5.4 缓存失效 API

| API | 用途 | 示例 |
|-----|------|------|
| `revalidateTag(tag, profile)` | 背景 revalidate | `revalidateTag('products', 'max')` |
| `updateTag(tag)` | Server Actions 专用 | `updateTag('products')` |
| `refresh()` | 刷新未缓存 | `refresh()` |
| `cacheTag(tag)` | 标记缓存 | `cacheTag('products')` |

---

## 6. Proxy (原 Middleware)

### 6.1 基础用法

```typescript
// proxy.ts (项目根目录或 src)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

### 6.2 Matcher 配置

```typescript
export const config = {
  matcher: [
    '/about/:path*',
    '/dashboard/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 6.3 认证检查

```typescript
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

### 6.4 修改请求头

```typescript
export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-Custom-Header', 'value')
  return response
}
```

### 6.5 Middleware vs Proxy

| 特性 | Middleware (≤15) | Proxy (16+) |
|------|-----------------|-------------|
| 文件名 | `middleware.ts` | `proxy.ts` |
| 运行时 | Edge | Node.js |
| Cookie 读写 | 受限 | 完整支持 |

---

## 7. Viewport API

### 7.1 静态 Viewport

```typescript
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
}
```

### 7.2 动态 Viewport

```typescript
import type { Viewport } from 'next'

export function generateViewport({ params }): Viewport {
  return {
    themeColor: '...',
  }
}
```

### 7.3 支持的字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `themeColor` | `string` | 浏览器主题色 |
| `colorScheme` | `'light'\|'dark'` | 颜色方案 |
| `width` | `string` | 视口宽度 |
| `initialScale` | `number` | 初始缩放 |
| `maximumScale` | `number` | 最大缩放 |
| `userScalable` | `boolean` | 用户缩放 |

### 7.4 多主题色示例

```typescript
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}
```

---

## 8. 动态路由

### 8.1 `generateStaticParams`

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default async function PostPage({ params }) {
  const { slug } = await params
  // ...
}
```

### 8.2 配置选项

```typescript
export const dynamicParams = false  // 未预生成返回 404
// export const dynamicParams = true // 动态生成并缓存
```

### 8.3 多层动态路由

```typescript
// app/shop/[category]/[product]/page.tsx
export async function generateStaticParams() {
  return [
    { category: 'clothing', product: 't-shirt' },
    { category: 'electronics', product: 'phone' },
  ]
}
```

### 8.4 Catch-all 路由

```typescript
// app/shop/[...slug]/page.tsx - 匹配 /shop/a/b/c
// app/shop/[[...slug]]/page.tsx - 可选，也匹配 /shop
```

---

## 9. 类型辅助

### 9.1 PageProps

```typescript
import type { PageProps } from 'next'

export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>{slug}</h1>
}
```

### 9.2 LayoutProps

```typescript
import type { LayoutProps } from 'next'

export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}</section>
}
```

### 9.3 Viewport 类型

```typescript
import type { Viewport } from 'next'

export const viewport: Viewport = { themeColor: 'black' }
export function generateViewport(): Viewport {
  return { themeColor: 'black' }
}
```

---

## 附录：Codemods

```bash
# 升级 Next.js 16
npx @next/codemod@canary upgrade latest

# Metadata 转 Viewport Export
npx @next/codemod@canary metadata-to-viewport-export .

# Middleware 转 Proxy
npx @next/codemod@canary rename-middleware-to-proxy .
```

---

## 参考资料

- [Next.js 16 官方文档](https://nextjs.org/docs/app)
- [Routing API](https://nextjs.org/docs/app/api-reference/functions/redirect)
- [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Server Actions](https://nextjs.org/docs/app/api-reference/functions/server-actions)
- [Cache Components](https://nextjs.org/docs/app/getting-started/caching)
- [Proxy Guide](https://nextjs.org/docs/app/getting-started/proxy)
