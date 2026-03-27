# Next.js 16 API 快速参考

> 最后更新：2026-03-27 | 基于 Next.js 16.2.1 官方文档

---

## 目录

1. [Viewport API](#1-viewport-api)
2. [Proxy (原 Middleware)](#2-proxy-原-middleware)
3. [Cache Components](#3-cache-components)
4. [Server Actions](#4-server-actions)
5. [类型辅助](#5-类型辅助)

---

## 1. Viewport API

### 1.1 `viewport` 对象（静态）

```typescript
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'black',
}
```

### 1.2 `generateViewport` 函数（动态）

```typescript
import type { Viewport } from 'next'

export function generateViewport({ params }): Viewport {
  return {
    themeColor: '...',
  }
}
```

### 1.3 支持的 Viewport 字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `themeColor` | `string` \| `Array<{ media, color }>` | 浏览器主题色 | `{ media: '(prefers-color-scheme: light)', color: 'cyan' }` |
| `colorScheme` | `'light'` \| `'dark'` \| `'light dark'` | 颜色方案 | `'dark'` |
| `width` | `string` \| `number` | 视口宽度 | `'device-width'` |
| `initialScale` | `number` | 初始缩放 | `1` |
| `maximumScale` | `number` | 最大缩放 | `1` |
| `userScalable` | `boolean` | 是否允许用户缩放 | `false` |
| `interactiveWidget` | `'resizes-visual'` | 交互组件行为 | `'resizes-visual'` |

### 1.4 themeColor 完整示例

```typescript
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}
```

**输出 HTML：**
```html
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#09090b" />
```

### 1.5 注意事项

- `viewport` 和 `generateViewport` **只能在 Server Components 中使用**
- 不能在同一路由段中同时导出两者
- 如果不依赖运行时数据，优先使用静态 `viewport` 对象
- 使用 `metadata-to-viewport-export` codemod 可自动迁移旧代码

```bash
npx @next/codemod@canary metadata-to-viewport-export .
```

---

## 2. Proxy (原 Middleware)

### 2.1 基础用法

```typescript
// proxy.ts (项目根目录或 src 目录)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

### 2.2 Matcher 配置

```typescript
export const config = {
  // 匹配单个路径
  matcher: '/about/:path*',

  // 匹配多个路径
  matcher: ['/about/:path*', '/dashboard/:path*'],

  // 正则表达式
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 2.3 常见用例

**认证检查：**
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')

  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

**修改请求头：**
```typescript
export function proxy(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-Custom-Header', 'value')
  return response
}
```

**A/B 测试：**
```typescript
export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  // 50% 用户看到新版本
  if (Math.random() < 0.5) {
    return NextResponse.rewrite(new URL('/new-version', request.url))
  }

  return response
}
```

### 2.4 Middleware vs Proxy 对比

| 特性 | Middleware (Next.js 15 及之前) | Proxy (Next.js 16+) |
|------|-------------------------------|---------------------|
| 文件名 | `middleware.ts` | `proxy.ts` |
| 运行时 | Edge Runtime | Node.js Runtime |
| 功能 | 相同 | 相同 |
| Cookie 读写 | 受限 | 完整支持 |

### 2.5 注意事项

- Proxy **不能**用于慢速数据获取
- `fetch` 的 `cache`、`next.revalidate`、`next.tags` 选项在 Proxy 中无效
- 每个项目只支持一个 `proxy.ts` 文件
- 简单重定向优先使用 `next.config.ts` 的 `redirects` 配置

---

## 3. Cache Components

### 3.1 启用方式

```typescript
// next.config.ts
const nextConfig = {
  cacheComponents: true,
}
```

### 3.2 `use cache` 指令

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

### 3.3 缓存生命周期

```typescript
import { cacheLife } from 'next/cache'

async function getData() {
  'use cache'
  cacheLife('hours') // 使用内置配置
  return fetch('/api/data')
}
```

**内置配置：**

| 配置名 | stale | revalidate | expire | 适用场景 |
|--------|-------|------------|--------|----------|
| `default` | 5 分钟 | 15 分钟 | 永不过期 | 通用内容 |
| `seconds` | 0 | 1 秒 | 1 分钟 | 实时数据 |
| `minutes` | 1 分钟 | 5 分钟 | 1 小时 | 频繁更新 |
| `hours` | 5 分钟 | 1 小时 | 24 小时 | 每小时更新 |
| `days` | 1 小时 | 1 天 | 30 天 | 每日更新 |
| `weeks` | 1 天 | 7 天 | 90 天 | 每周更新 |
| `max` | 5 分钟 | 背景 revalidate | 永不过期 | 静态内容 |

### 3.4 缓存失效 API

| API | 用途 | 示例 |
|-----|------|------|
| `revalidateTag(tag, profile)` | 背景 revalidate | `revalidateTag('products', 'max')` |
| `updateTag(tag)` | Server Actions 专用，立即刷新 | `updateTag('products')` |
| `refresh()` | Server Actions 专用，刷新未缓存 | `refresh()` |
| `cacheTag(tag)` | 标记缓存 | `cacheTag('products')` |

---

## 4. Server Actions

### 4.1 基础用法

```typescript
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  await db.posts.create({ title })
  revalidatePath('/blog')
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

### 4.3 使用表单状态 Hook

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

---

## 5. 类型辅助

### 5.1 PageProps

```typescript
import type { PageProps } from 'next'

export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  return <h1>{slug}</h1>
}
```

### 5.2 LayoutProps

```typescript
import type { LayoutProps } from 'next'

export default function Layout(props: LayoutProps<'/dashboard'>) {
  return <section>{props.children}</section>
}
```

### 5.3 Viewport 类型

```typescript
import type { Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'black',
}

export function generateViewport(): Viewport {
  return {
    themeColor: 'black',
  }
}
```

---

## 附录：Codemods

### 升级至 Next.js 16

```bash
npx @next/codemod@canary upgrade latest
```

### Metadata 转 Viewport Export

```bash
npx @next/codemod@canary metadata-to-viewport-export .
```

### Middleware 转 Proxy

```bash
npx @next/codemod@canary rename-middleware-to-proxy .
```

---

## 参考资料

- [Next.js 16 官方文档](https://nextjs.org/docs/app)
- [generateViewport API](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
- [Proxy Guide](https://nextjs.org/docs/app/getting-started/proxy)
- [Cache Components](https://nextjs.org/docs/app/getting-started/caching)
