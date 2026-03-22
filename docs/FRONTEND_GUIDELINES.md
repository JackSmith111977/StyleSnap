# StyleSnap - 前端设计系统指南

> 版本：1.1
> 创建日期：2026-03-21
> 更新：2026-03-21（补充列表视图、主题切换实现、混合样式方案）
> 风格定位：轻量机能风
> 用途：统一 StyleSnap 项目视觉语言与组件规范

---

## 目录

1. [设计原则](#1-设计原则)
2. [色彩系统](#2-色彩系统)
3. [字体系统](#3-字体系统)
4. [间距刻度](#4-间距刻度)
5. [布局规则](#5-布局规则)
6. [组件样式](#6-组件样式)
7. [响应式断点](#7-响应式断点)
8. [交互动效](#8-交互动效)
9. [主题切换实现](#9-主题切换实现)
10. [样式方案规范](#10-样式方案规范)

---

## 1. 设计原则

### 1.1 核心理念

**轻量机能风** —— 在硬核科技感与可用性之间取得平衡

| 原则 | 说明 |
|------|------|
| **克制表达** | 保留机能元素（几何切割、科技感），但不过度使用高饱和色彩 |
| **黑白主体** | 以黑白银灰为基调，强调色仅用于关键交互反馈 |
| **清晰优先** | 信息层级清晰，避免装饰性元素干扰内容 |
| **微动效** | 适度动画反馈，避免过度花哨影响性能 |

### 1.2 设计关键词

```
冷静 · 精准 · 通透 · 秩序
```

---

## 2. 色彩系统

### 2.1 基础色板

基于 Tailwind CSS 4.x Zinc 色系：

| 色阶 | Hex | 用途 |
|------|-----|------|
| **Zinc 50** | `#fafafa` | 最浅背景 |
| **Zinc 100** | `#f4f4f5` | 卡片背景、输入框填充 |
| **Zinc 200** | `#e4e4e7` | 边框、分隔线 |
| **Zinc 300** | `#d4d4d8` | 禁用边框 |
| **Zinc 400** | `#a1a1aa` | 次要文字、图标 |
| **Zinc 500** | `#71717a` | 占位符文字 |
| **Zinc 600** | `#52525b` | 次要正文 |
| **Zinc 700** | `#3f3f46` | 正文文字 |
| **Zinc 800** | `#27272a` | 标题、强调文字 |
| **Zinc 900** | `#18181b` | 主文字、深色背景 |
| **Zinc 950** | `#09090b` | 纯黑背景、页脚 |

### 2.2 深色模式色板

| 色阶 | Hex | 用途 |
|------|-----|------|
| **Zinc 950** | `#09090b` | 深色主背景 |
| **Zinc 900** | `#18181b` | 深色卡片背景 |
| **Zinc 800** | `#27272a` | 深色输入框背景 |
| **Zinc 700** | `#3f3f46` | 深色边框 |
| **Zinc 600** | `#52525b` | 深色分隔线 |
| **Zinc 500** | `#71717a` | 深色次要文字 |
| **Zinc 400** | `#a1a1aa` | 深色正文 |
| **Zinc 300** | `#d4d4d8` | 深色标题 |
| **Zinc 200** | `#e4e4e7` | 深色强调文字 |
| **Zinc 100** | `#f4f4f5` | 深色纯白文字 |

### 2.3 语义色

#### 标准四色系统

| 语义 | 浅色模式 | 深色模式 | 用途 |
|------|----------|----------|------|
| **成功** | `emerald-600` #059669 | `emerald-500` #10b981 | 成功状态、完成提示 |
| **警告** | `amber-500` #f59e0b | `amber-500` #f59e0b | 警告提示、注意提醒 |
| **错误** | `red-600` #dc2626 | `red-500` #ef4444 | 错误状态、删除操作 |
| **信息** | `blue-600` #2563eb | `blue-500` #3b82f6 | 信息提示、链接 |

### 2.4 CSS 变量定义

```css filename="src/app/globals.css"
@layer base {
  :root {
    /* 基础色 */
    --background: 0 0% 100%;        /* Zinc 50 */
    --foreground: 240 10% 10%;      /* Zinc 950 */

    /* 卡片 */
    --card: 0 0% 100%;
    --card-foreground: 240 10% 10%;

    /* 弹出层 */
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 10%;

    /* 主色 - 黑白体系 */
    --primary: 240 10% 10%;
    --primary-foreground: 0 0% 98%;

    /* 次级色 */
    --secondary: 240 5% 96%;
    --secondary-foreground: 240 10% 10%;

    /*  muted */
    --muted: 240 5% 96%;
    --muted-foreground: 240 4% 46%;

    /* 强调 */
    --accent: 240 5% 96%;
    --accent-foreground: 240 10% 10%;

    /* 破坏性操作 */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;

    /* 边框和输入 */
    --border: 240 6% 90%;
    --input: 240 6% 90%;
    --ring: 240 10% 10%;

    /* 语义色 */
    --success: 156 76% 38%;
    --warning: 38 92% 50%;
    --info: 221 83% 53%;

    /* 圆角 */
    --radius: 4px;
  }

  .dark {
    /* 深色模式变量 */
    --background: 240 10% 4%;       /* Zinc 950 */
    --foreground: 0 0% 98%;         /* Zinc 100 */

    --card: 240 10% 6%;             /* Zinc 900 */
    --card-foreground: 0 0% 98%;

    --popover: 240 10% 6%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 0% 98%;
    --primary-foreground: 240 10% 10%;

    --secondary: 240 6% 16%;
    --secondary-foreground: 0 0% 98%;

    --muted: 240 6% 16%;
    --muted-foreground: 240 5% 65%;

    --accent: 240 6% 16%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 63% 55%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 6% 27%;
    --input: 240 6% 27%;
    --ring: 240 5% 84%;

    /* 语义色深色调整 */
    --success: 156 70% 45%;
    --warning: 38 92% 55%;
    --info: 221 80% 60%;
  }
}
```

### 2.5 使用示例

```tsx
// 按钮颜色使用
<Button variant="primary">主要操作</Button>
<Button variant="secondary">次要操作</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">删除</Button>

// 语义色使用
<Alert variant="success">操作成功</Alert>
<Alert variant="warning">请注意</Alert>
<Alert variant="error">发生错误</Alert>
<Alert variant="info">提示信息</Alert>
```

---

## 3. 字体系统

### 3.1 字体栈配置

```css filename="src/app/globals.css"
@layer base {
  /* 正文字体 - 系统字体栈 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans SC", "Source Han Sans CN",
    sans-serif, "Apple Color Emoji", "Segoe UI Emoji";

  /* 代码字体 - 专业等宽字体 */
  --font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code",
    "Source Code Pro", "Consolas", monospace;
}

body {
  font-family: var(--font-sans);
}

code, pre, .font-mono {
  font-family: var(--font-mono);
}
```

### 3.2 字体加载（可选）

```typescript filename="src/lib/fonts.ts"
import { Inter, JetBrains_Mono } from 'next/font/google'

// 正文字体 - Inter（可选，如需要更统一的外观）
export const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

// 代码字体 - JetBrains Mono
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
})
```

### 3.3 字号刻度

| 用途 | 类名 | 字号 | 行高 | 字重 |
|------|------|------|------|------|
| 超大标题 | `text-4xl` | 36px / 2.25rem | 1.2 | 700 |
| 大标题 | `text-3xl` | 30px / 1.875rem | 1.25 | 700 |
| 标题 | `text-2xl` | 24px / 1.5rem | 1.3 | 600 |
| 小标题 | `text-xl` | 20px / 1.25rem | 1.4 | 600 |
| 正文大 | `text-lg` | 18px / 1.125rem | 1.6 | 400 |
| 正文 | `text-base` | 16px / 1rem | 1.6 | 400 |
| 正文小 | `text-sm` | 14px / 0.875rem | 1.5 | 400 |
| 辅助文字 | `text-xs` | 12px / 0.75rem | 1.5 | 400 |

### 3.4 字重规范

| 用途 | 类名 | 字重 |
|------|------|------|
| 常规文字 | `font-normal` | 400 |
| 中等字重 | `font-medium` | 500 |
| 半粗体 | `font-semibold` | 600 |
| 粗体 | `font-bold` | 700 |

---

## 4. 间距刻度

### 4.1 4px 基准系统

所有间距以 4px 为最小单位：

| Token | 值 | 用途 |
|-------|-----|------|
| `space-1` | 4px / 0.25rem | 极小间距 |
| `space-2` | 8px / 0.5rem | 紧密元素间距 |
| `space-3` | 12px / 0.75rem | 相关元素间距 |
| `space-4` | 16px / 1rem | 标准间距 |
| `space-5` | 20px / 1.25rem | 中等间距 |
| `space-6` | 24px / 1.5rem | 大间距 |
| `space-8` | 32px / 2rem | 区块间距 |
| `space-10` | 40px / 2.5rem | 大区块间距 |
| `space-12` | 48px / 3rem | 超大间距 |
| `space-16` | 64px / 4rem | 页面级间距 |

### 4.2 使用示例

```tsx
// 卡片内边距
<Card className="p-4 md:p-6">
  <CardHeader className="space-y-2">
    <CardTitle>标题</CardTitle>
    <CardDescription>描述</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    内容
  </CardContent>
</Card>

// 按钮组间距
<div className="flex items-center gap-3">
  <Button>取消</Button>
  <Button variant="primary">确认</Button>
</div>
```

---

## 5. 布局规则

### 5.1 网格系统

**固定网格布局** —— 风格卡片采用统一尺寸的网格布局

```tsx
// 响应式网格列数
<StyleGrid>
  {/*
    mobile: 1 列
    tablet: 2 列
    desktop: 3 列
    large: 4 列
  */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {styles.map(style => (
      <StyleCard key={style.id} style={style} />
    ))}
  </div>
</StyleGrid>
```

### 5.2 卡片尺寸规范

```tsx
// 标准风格卡片尺寸
const cardSizes = {
  // 移动端全宽
  mobile: '100%',

  // 平板宽度
  tablet: 'calc(50% - 12px)', // 2 列，gap 12px

  // 桌面宽度
  desktop: 'calc(33.333% - 16px)', // 3 列，gap 16px

  // 大桌面
  large: 'calc(25% - 18px)', // 4 列，gap 18px
}

// 卡片固定纵横比
const aspectRatio = '4/3' // 或 '16/9' 根据设计需求
```

### 5.3 容器最大宽度

```css
.container {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 16px;
  padding-right: 16px;
}

@media (min-width: 640px) {
  .container {
    max-width: 608px; /* 640 - 32px padding */
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 704px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1216px;
  }
}
```

### 5.4 视图切换：网格/列表

**支持用户切换列表视图和网格视图**

```tsx
// 视图切换按钮
<ViewToggle
  view="grid" | "list"
  onViewChange={(view) => setView(view)}
/>

// 网格视图（默认）
<div className={cn(
  "grid gap-4 md:gap-6",
  view === "grid" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  view === "list" && "grid-cols-1"
)}>
  {styles.map(style => (
    <StyleCard key={style.id} style={style} view={view} />
  ))}
</div>
```

### 5.5 列表视图样式规范

```tsx
// 列表视图卡片布局
const listViewCardStyles = `
  flex flex-col sm:flex-row gap-4
  p-4
  border border-border rounded-md
  bg-card hover:border-primary/50 transition-colors
`

// 列表视图 - 预览图区域（左侧，固定宽高比）
const listViewPreviewStyles = `
  w-full sm:w-48 aspect-video
  bg-muted rounded-md overflow-hidden
  flex-shrink-0
`

// 列表视图 - 内容区域（右侧，弹性）
const listViewContentStyles = `
  flex-1 space-y-2
`

// 列表视图 - 标题（更大字号）
const listViewTitleStyles = `
  text-lg font-semibold text-foreground
`

// 列表视图 - 描述（更多行数）
const listViewDescriptionStyles = `
  text-sm text-muted-foreground
  line-clamp-3
`
```

### 5.6 移动端超小屏幕适配

**针对 <640px 屏幕的优化**

| 元素 | 适配策略 |
|------|----------|
| 导航栏 | 汉堡菜单，右侧滑出抽屉 |
| 卡片网格 | 单列布局 |
| 卡片内边距 | 缩小至 `p-3` (12px) |
| 字体大小 | 标题 `text-base`，正文 `text-sm` |
| 按钮 | 全宽 `w-full`，方便点击 |
| 图片 | 响应式 `w-full h-auto` |

```tsx
// 移动端优化示例
<div className="
  grid grid-cols-1
  gap-3 sm:gap-4
  [&_.card]:p-3 sm:[&_.card]:p-4
  [&_.title]:text-base sm:[&_.title]:text-lg
">
  {/* 内容 */}
</div>
```

### 5.7 页面布局模板

```tsx
// 标准页面布局
<Layout>
  {/* 顶部固定导航 */}
  <Header className="sticky top-0 z-50" />

  {/* 主内容区 */}
  <main className="flex-1">
    <Container className="py-6 md:py-8">
      {/* 页面标题区 */}
      <PageHeader>
        <h1 className="text-3xl font-bold">页面标题</h1>
        <p className="text-muted-foreground mt-2">页面描述</p>
      </PageHeader>

      {/* 内容区 */}
      <div className="mt-8">
        {/* 内容 */}
      </div>
    </Container>
  </main>

  {/* 页脚 */}
  <Footer />
</Layout>
```

---

## 9. 主题切换实现

### 9.1 技术方案：Zustand

**使用 Zustand 管理全局主题状态，支持持久化和系统主题检测**

```typescript filename="src/stores/theme-store.ts"
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme })
        updateThemeClass(theme)
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)

// 更新 DOM class
function updateThemeClass(theme: Theme) {
  const root = document.documentElement
  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

// 监听系统主题变化
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const state = useThemeStore.getState()
    if (state.theme === 'system') {
      updateThemeClass('system')
      set({ resolvedTheme: mediaQuery.matches ? 'dark' : 'light' })
    }
  })
}

// Hook 导出
export function useTheme() {
  const store = useThemeStore()
  return {
    theme: store.theme,
    setTheme: store.setTheme,
    resolvedTheme: store.resolvedTheme,
  }
}
```

### 9.2 主题提供者组件

```typescript filename="src/components/theme-provider.tsx"
'use client'

import { useEffect } from 'react'
import { useThemeStore } from '@/stores/theme-store'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
  }, [theme])

  return <>{children}</>
}
```

### 9.3 主题切换按钮组件

```typescript filename="src/components/theme-toggle.tsx"
'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/stores/theme-store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          浅色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          深色
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 9.4 服务端组件获取主题

```typescript filename="src/lib/theme-server.ts"
import { headers } from 'next/headers'

// 在服务端组件中检测主题（用于 SSR）
export async function getServerTheme() {
  // 注意：SSR 期间无法访问 window.matchMedia
  // 返回 system 让客户端决定
  return 'system'
}

// 或者从 Cookie 读取（如果客户端已设置）
export async function getThemeFromCookie() {
  const headersList = await headers()
  const cookie = headersList.get('cookie')
  // 解析 localStorage 同步的 Cookie
  // 注意：需要客户端同步逻辑
}
```

### 9.5 防止闪烁策略

**问题**：SSR 渲染浅色，客户端 hydration 后切换深色，产生闪烁

**解决方案**：

```typescript filename="src/app/layout.tsx"
// 在 <html> 标签内联脚本，阻止闪烁
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme-storage') || 'system'
                const isDark = theme === 'dark' ||
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                document.documentElement.classList.toggle('dark', isDark)
              })()
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## 10. 样式方案规范

### 10.1 混合模式：Tailwind CSS + CSS Modules

**项目采用 Tailwind CSS 与 CSS Modules 混合模式**

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 组件样式 | CSS Modules | 作用域隔离，避免冲突 |
| 工具类/布局 | Tailwind CSS | 快速开发，原子化 |
| 复杂动画 | CSS Modules | 更好的可读性 |
| 响应式布局 | Tailwind CSS | 简洁的响应式类名 |
| 主题变量 | Tailwind CSS | 与 CSS 变量集成 |

### 10.2 CSS Modules 使用规范

```typescript filename="src/components/style-card/style-card.module.css"
/* 使用短横线命名 */
.styleCard {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* 嵌套选择器 */
.styleCard:hover .previewImage {
  transform: scale(1.02);
}

/* 使用 CSS 变量 */
.cardContent {
  padding: var(--space-4);
  background-color: var(--card);
  border: 1px solid var(--border);
}

/* 响应式 */
@media (min-width: 768px) {
  .cardContent {
    padding: var(--space-6);
  }
}
```

```typescript filename="src/components/style-card/style-card.tsx"
import styles from './style-card.module.css'

export function StyleCard({ style }) {
  return (
    <div className={styles.styleCard}>
      <div className={styles.previewImage}>
        {/* 预览图 */}
      </div>
      <div className={styles.cardContent}>
        {/* 内容 */}
      </div>
    </div>
  )
}
```

### 10.3 Tailwind CSS 使用规范

```typescript
// ✅ 推荐：简单布局、工具类使用 Tailwind
<div className="flex items-center gap-4 p-4 bg-card border border-border rounded-md">
  <span className="text-sm text-muted-foreground">内容</span>
</div>

// ✅ 推荐：响应式使用 Tailwind
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4 sm:gap-6
">

// ❌ 避免：复杂样式混用导致难以维护
<div className="flex p-4 bg-card border rounded-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out ...">
  {/* 超过 3 行应考虑 CSS Modules */}
</div>
```

### 10.4 混用模式示例

```typescript filename="src/components/style-card/style-card.tsx"
import styles from './style-card.module.css'
import { cn } from '@/lib/cn'

export function StyleCard({ style, view = 'grid' }) {
  return (
    // CSS Modules 处理复杂组件样式
    <article className={cn(styles.styleCard, styles[view])}>
      {/* Tailwind 处理简单布局 */}
      <div className="relative aspect-video overflow-hidden rounded-md">
        <Image
          src={style.previewUrl}
          alt={style.name}
          fill
          className="object-cover transition-transform duration-200 hover:scale-105"
        />
      </div>

      {/* CSS Modules 处理内容区域 */}
      <div className={styles.content}>
        <h3 className={styles.title}>{style.name}</h3>
        <p className={styles.description}>{style.description}</p>

        {/* Tailwind 处理标签 */}
        <div className="flex flex-wrap gap-1.5">
          {style.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
```

### 10.5 样式优先级规则

```
内联样式 > CSS Modules > Tailwind 工具类 > 全局样式
```

**注意**：避免在组件中同时使用 CSS Modules 和 Tailwind 修改同一属性，可能导致覆盖问题。

---

## 6. 组件样式

### 6.1 按钮

```tsx filename="src/components/ui/button.tsx"
// 三级按钮体系
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

// 样式规范
const buttonStyles = {
  // 主按钮 - 实心填充，用于主要操作
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',

  // 次按钮 - 边框样式，用于次要操作
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',

  // 幽灵按钮 - 无边框，用于取消/辅助操作
  ghost: 'hover:bg-accent hover:text-accent-foreground',

  // 破坏按钮 - 红色警告
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',

  // 尺寸
  sizes: {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-8 text-base',
    icon: 'h-10 w-10',
  },

  // 圆角 - 小圆角风格
  borderRadius: 'rounded-md', // 4px

  // 阴影 - 微阴影
  shadow: 'shadow-sm hover:shadow-md transition-shadow',
}
```

### 6.2 卡片

```tsx
// 风格卡片样式规范
const styleCardStyles = {
  // 基础容器
  base: `
    bg-card border border-border
    rounded-md overflow-hidden
    transition-all duration-200
    hover:border-primary/50 hover:shadow-md
  `,

  // 预览图区域
  preview: `
    aspect-video w-full
    bg-muted
    object-cover
  `,

  // 内容区域
  content: `
    p-4 space-y-2
  `,

  // 标题
  title: `
    text-base font-semibold text-foreground
    line-clamp-1
  `,

  // 描述
  description: `
    text-sm text-muted-foreground
    line-clamp-2
  `,

  // 标签区域
  tags: `
    flex flex-wrap gap-1.5
  `,

  // 单个标签
  tag: `
    inline-flex items-center px-2 py-0.5
    rounded text-xs font-medium
    bg-secondary text-secondary-foreground
  `,
}
```

### 6.3 输入框

**边框高亮风格**

```tsx
// 输入框样式
const inputStyles = `
  w-full px-3 py-2
  bg-background
  border border-border
  rounded-md
  text-foreground text-sm
  placeholder:text-muted-foreground
  focus-visible:outline-none
  focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent
  disabled:cursor-not-allowed disabled:opacity-50
  transition-all duration-200
`

// 搜索框特殊样式
const searchStyles = `
  ${inputStyles}
  pl-9  // 左侧图标空间
  [&_svg]:absolute [&_svg]:left-3 [&_svg]:top-1/2 [&_svg]:-translate-y-1/2
`
```

### 6.4 代码块

**独立代码块展示**

```tsx
// 代码块样式
const codeBlockStyles = {
  // 容器
  container: `
    relative rounded-md border border-border
    bg-muted/50 overflow-hidden
  `,

  // 头部（语言标识/复制按钮）
  header: `
    flex items-center justify-between
    px-4 py-2
    border-b border-border
    bg-muted
  `,

  // 语言标签
  language: `
    text-xs font-medium text-muted-foreground
  `,

  // 复制按钮
  copyButton: `
    p-1.5 rounded-md
    hover:bg-background
    transition-colors
  `,

  // 代码内容
  content: `
    p-4
    overflow-x-auto
    text-sm font-mono
    leading-relaxed
  `,

  // 语法高亮（配合 Prism/Highlight.js）
  syntax: {
    keyword: 'text-primary',
    string: 'text-success',
    comment: 'text-muted-foreground italic',
    function: 'text-info',
  },
}
```

### 6.5 空状态（插画风格）

```tsx
// 空状态组件样式
const emptyStateStyles = {
  // 容器
  container: `
    flex flex-col items-center justify-center
    py-12 px-4
    text-center
  `,

  // 插画容器
  illustration: `
    w-48 h-48 mb-6
    [&_svg]:w-full [&_svg]:h-full
  `,

  // 标题
  title: `
    text-lg font-semibold text-foreground
    mb-2
  `,

  // 描述
  description: `
    text-sm text-muted-foreground
    max-w-sm
    mb-6
  `,

  // 操作区
  actions: `
    flex items-center gap-3
  `,
}
```

### 6.6 加载状态（骨架屏）

```tsx
// 骨架屏动画
const skeletonStyles = `
  animate-pulse
  bg-muted
  rounded-md
`

// 卡片骨架屏
const cardSkeleton = `
  <div className="space-y-3">
    {/* 预览图占位 */}
    <div className="aspect-video bg-muted rounded-md animate-pulse" />

    {/* 标题占位 */}
    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />

    {/* 描述占位 */}
    <div className="space-y-2">
      <div className="h-3 w-full bg-muted rounded animate-pulse" />
      <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
    </div>
  </div>
`
```

### 6.7 Toast 通知

**右上角堆叠（桌面） / 顶部居中（移动）**

```tsx
// Toast 位置配置
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
    },
  }}
  // 移动端适配
  mobilePosition="top-center"
  mobileBreakpoint="sm"
/>

// Toast 变体样式
const toastVariants = {
  success: 'border-l-4 border-l-success',
  error: 'border-l-4 border-l-destructive',
  warning: 'border-l-4 border-l-warning',
  info: 'border-l-4 border-l-info',
}
```

### 6.8 导航栏

**顶部固定导航**

```tsx
// 导航栏样式
const headerStyles = {
  // 容器
  base: `
    sticky top-0 z-50
    w-full
    border-b border-border
    bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80
  `,

  // 内容区
  container: `
    h-14 flex items-center
    Container px-4
  `,

  // Logo
  logo: `
    text-xl font-bold text-foreground
    hover:text-foreground/80
    transition-colors
  `,

  // 导航链接
  navLink: `
    text-sm font-medium text-muted-foreground
    hover:text-foreground
    transition-colors
  `,

  // 移动端菜单按钮
  mobileMenuButton: `
    md:hidden
    p-2 -mr-2
    text-muted-foreground
    hover:text-foreground
  `,
}
```

### 6.10 代码复制组件

**用于风格详情页的代码片段展示与复制**

```tsx
// 代码块容器样式
const codeBlockStyles = {
  // 容器
  container: `
    relative rounded-md border border-border
    bg-muted/50 overflow-hidden
  `,

  // 头部（语言标识 + 复制按钮）
  header: `
    flex items-center justify-between
    px-4 py-2
    border-b border-border
    bg-muted
  `,

  // 语言标签
  language: `
    text-xs font-medium text-muted-foreground uppercase
  `,

  // 复制按钮
  copyButton: `
    inline-flex items-center gap-1.5
    px-2 py-1
    rounded-md
    text-xs font-medium
    text-muted-foreground
    hover:text-foreground hover:bg-background
    transition-colors
  `,

  // 复制成功状态
  copySuccess: `
    text-success
  `,

  // 代码内容
  content: `
    p-4
    overflow-x-auto
    text-sm font-mono
    leading-relaxed
    max-h-[500px]
    overflow-y-auto
  `,
}

// 组件示例
export function CodeBlock({ code, language = 'tsx' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={codeBlockStyles.container}>
      <div className={codeBlockStyles.header}>
        <span className={codeBlockStyles.language}>{language}</span>
        <button
          onClick={handleCopy}
          className={cn(
            codeBlockStyles.copyButton,
            copied && codeBlockStyles.copySuccess
          )}
        >
          {copied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已复制
            </>
          ) : (
            <>
              <CopyIcon className="h-3.5 w-3.5" />
              复制
            </>
          )}
        </button>
      </div>
      <pre className={codeBlockStyles.content}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
```

### 6.11 收藏功能 UI

**收藏按钮与状态**

```tsx
// 收藏按钮样式
const favoriteButtonStyles = {
  // 基础状态
  base: `
    inline-flex items-center gap-1.5
    px-3 py-1.5
    rounded-md
    text-sm font-medium
    transition-all duration-150
  `,

  // 未收藏（幽灵按钮）
  inactive: `
    text-muted-foreground
    hover:text-foreground
    hover:bg-secondary
  `,

  // 已收藏（高亮）
  active: `
    text-primary
    bg-primary/10
    hover:bg-primary/20
  `,

  // 禁用状态
  disabled: `
    opacity-50 cursor-not-allowed
  `,

  // 加载中
  loading: `
    animate-pulse
  `,
}

// 收藏组件示例
export function FavoriteButton({ styleId, initialFavorite = false }) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      // 调用 API
      await toggleFavorite(styleId)
      setIsFavorite(!isFavorite)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        favoriteButtonStyles.base,
        loading && favoriteButtonStyles.loading,
        isFavorite ? favoriteButtonStyles.active : favoriteButtonStyles.inactive
      )}
    >
      {isFavorite ? (
        <HeartFilledIcon className="h-4 w-4" />
      ) : (
        <HeartOutlineIcon className="h-4 w-4" />
      )}
      {isFavorite ? '已收藏' : '收藏'}
    </button>
  )
}
```

### 6.12 评论组件样式

```tsx
// 评论区容器
const commentSectionStyles = `
  space-y-4
`

// 单个评论卡片
const commentCardStyles = `
  p-4
  border border-border rounded-md
  bg-card
  space-y-2
`

// 评论头部（用户信息）
const commentHeaderStyles = `
  flex items-center gap-2
`

// 用户头像
const avatarStyles = `
  h-8 w-8 rounded-full bg-muted
`

// 用户名
const usernameStyles = `
  text-sm font-medium text-foreground
`

// 评论时间
const commentDateStyles = `
  text-xs text-muted-foreground
`

// 评论内容
const commentContentStyles = `
  text-sm text-foreground/80
  leading-relaxed
`

// 评论操作区
const commentActionsStyles = `
  flex items-center gap-4
  pt-2 border-t border-border
`

// 回复按钮
const replyButtonStyles = `
  text-xs font-medium text-muted-foreground
  hover:text-foreground
  transition-colors
`

// 评论表单
const commentFormStyles = `
  space-y-3
  p-4
  border border-border rounded-md
  bg-muted/50
`
```

### 6.13 空状态（插画风格）

```tsx
// 空状态组件样式
const emptyStateStyles = {
  // 容器
  container: `
    flex flex-col items-center justify-center
    py-12 px-4
    text-center
  `,

  // 插画容器
  illustration: `
    w-48 h-48 mb-6
    [&_svg]:w-full [&_svg]:h-full
    [&_svg]:text-muted-foreground
  `,

  // 标题
  title: `
    text-lg font-semibold text-foreground
    mb-2
  `,

  // 描述
  description: `
    text-sm text-muted-foreground
    max-w-sm
    mb-6
  `,

  // 操作区
  actions: `
    flex items-center gap-3
  `,
}

// 使用示例
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className={emptyStateStyles.container}>
      <div className={emptyStateStyles.illustration}>
        <Icon />
      </div>
      <h3 className={emptyStateStyles.title}>{title}</h3>
      <p className={emptyStateStyles.description}>{description}</p>
      {action && <div className={emptyStateStyles.actions}>{action}</div>}
    </div>
  )
}
```

```tsx
// 抽屉样式 - 用于筛选/详情
const drawerStyles = {
  // 遮罩
  overlay: `
    fixed inset-0 z-50
    bg-black/50
    backdrop-blur-sm
  `,

  // 抽屉面板
  panel: `
    fixed right-0 top-0 bottom-0
    w-full max-w-sm
    bg-card
    border-l border-border
    shadow-xl
    transform transition-transform duration-300
  `,

  // 头部
  header: `
    flex items-center justify-between
    h-14 px-4
    border-b border-border
  `,

  // 内容区
  content: `
    flex-1 overflow-y-auto
    p-4 space-y-4
  `,

  // 底部
  footer: `
    flex items-center justify-end
    gap-3
    p-4
    border-t border-border
  `,
}
```

---

## 7. 响应式断点

### 7.1 标准五段断点

采用 Tailwind CSS 4.x 默认断点：

| 断点 | 名称 | 最小宽度 | 布局列数 |
|------|------|----------|----------|
| `sm` | Mobile Landscape | 640px | 2 列 |
| `md` | Tablet | 768px | 2 列 |
| `lg` | Desktop | 1024px | 3 列 |
| `xl` | Large Desktop | 1280px | 3-4 列 |
| `2xl` | Extra Large | 1536px | 4 列 |

### 7.2 移动端优先策略

```tsx
// 移动优先的响应式写法
<div className="
  grid
  grid-cols-1      // mobile: 1 列
  sm:grid-cols-2   // ≥640px: 2 列
  lg:grid-cols-3   // ≥1024px: 3 列
  xl:grid-cols-4   // ≥1280px: 4 列
  gap-4 sm:gap-6
">
  {cards}
</div>
```

### 7.3 容器响应式内边距

```tsx
// 容器内边距响应式
<Container className="
  px-4    // mobile: 16px
  sm:px-6 // ≥640px: 24px
  lg:px-8 // ≥1024px: 32px
">
```

### 7.4 隐藏/显示策略

```tsx
// 移动端汉堡菜单，桌面端直接展示
<nav className="
  hidden md:flex    // 桌面显示
  items-center gap-6
">
  {navLinks.map(link => (
    <NavLink key={link.href} href={link.href}>{link.label}</NavLink>
  ))}
</nav>

// 移动端菜单按钮
<Button
  variant="ghost"
  size="icon"
  className="md:hidden"
  onClick={toggleMobileMenu}
>
  <MenuIcon />
</Button>
```

---

## 8. 交互动效

### 8.1 动效原则

**适度动效** —— 服务于功能，不为动而动

| 原则 | 说明 |
|------|------|
| **有意义** | 每个动画都有明确的功能目的 |
| **快速** | 大多数动画 150-300ms 完成 |
| **流畅** | 使用缓动函数，避免线性动画 |
| **克制** | 避免同时多个复杂动画 |

### 8.2 动画时长规范

```css
/* 动画时长 */
--duration-75: 75ms;    /* 微反馈 */
--duration-100: 100ms;  /* 小元素 */
--duration-150: 150ms;  /* 标准交互 */
--duration-200: 200ms;  /* 中等元素 */
--duration-300: 300ms;  /* 大元素/面板 */
--duration-500: 500ms;  /* 页面级过渡 */
```

### 8.3 缓动函数

```css
/* 缓动曲线 */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 推荐默认 */
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
```

### 8.4 标准动画效果

#### 悬浮效果

```css
/* 卡片悬浮 */
.card-hover {
  transition: all 150ms ease-out;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: hsl(var(--primary) / 0.5);
}
```

#### 点击反馈

```css
/* 按钮点击缩放 */
.btn-active {
  transition: transform 75ms ease-out;
}

.btn-active:active {
  transform: scale(0.97);
}
```

#### 加载骨架屏

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--muted-foreground) / 0.1) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 1000px 100%;
}
```

#### 淡入动画

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 200ms ease-out forwards;
}
```

### 8.5 页面过渡

```tsx
// 页面过渡动画（可选）
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 200, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 8.6 无限滚动加载（SEO 优化）

**方案：无限滚动 + URL 同步**

```tsx
// src/components/infinite-scroll-wrapper.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface InfiniteScrollProps {
  items: any[]
  onLoadMore: (page: number) => Promise<any[]>
  hasMore: boolean
  children: (items: any[]) => React.ReactNode
}

export function InfiniteScrollWrapper({
  items: initialItems,
  onLoadMore,
  hasMore: initialHasMore,
  children,
}: InfiniteScrollProps) {
  const [items, setItems] = useState(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)

  const searchParams = useSearchParams()
  const router = useRouter()

  // 从 URL 读取页码
  useEffect(() => {
    const urlPage = parseInt(searchParams.get('page') || '1', 10)
    if (urlPage > 1) {
      setPage(urlPage)
      loadMore(urlPage)
    }
  }, [])

  // 加载更多
  const loadMore = useCallback(async (targetPage: number) => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const newItems = await onLoadMore(targetPage)
      setItems(prev => [...prev, ...newItems])
      setHasMore(newItems.length > 0)

      // 同步 URL（不刷新页面）
      router.push(`?page=${targetPage}`, { scroll: false })
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, onLoadMore, router])

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // 距离底部 200px 时加载
      if (scrollTop + windowHeight >= documentHeight - 200) {
        if (hasMore && !loading) {
          loadMore(page + 1)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, hasMore, loading, loadMore])

  return (
    <>
      {/* 渲染内容 */}
      {children(items)}

      {/* 加载状态 */}
      {loading && (
        <div className="py-8 flex justify-center">
          <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
        </div>
      )}

      {/* 结束提示 */}
      {!hasMore && items.length > 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          已加载全部
        </div>
      )}
    </>
  )
}
```

**SEO 优势**：
- ✅ 每个页码有独立 URL (`?page=2`, `?page=3`)
- ✅ 搜索引擎爬虫可抓取所有分页内容
- ✅ 用户可分享特定页码链接
- ✅ 浏览器前进/后退正常工作

**SSR 支持**：
```typescript
// src/app/page.tsx
export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams?.page || '1', 10)
  const styles = await getStyles({ page })

  return (
    <InfiniteScrollWrapper
      items={styles}
      onLoadMore={loadMoreStyles}
      hasMore={styles.length === PAGE_SIZE}
    >
      {(items) => (
        <StyleGrid>
          {items.map(style => <StyleCard key={style.id} style={style} />)}
        </StyleGrid>
      )}
    </InfiniteScrollWrapper>
  )
}
```

---

## 附录：设计检查清单

### 开发前检查

- [ ] 颜色使用语义化变量，非硬编码 Hex
- [ ] 间距使用 4px 基准刻度
- [ ] 字体大小使用预定义刻度
- [ ] 响应式使用移动优先写法
- [ ] 组件样式遵循本指南规范

### 提交前检查

- [ ] 深色模式测试通过
- [ ] 移动端（sm）布局测试通过
- [ ] 键盘导航可用
- [ ] 动画不影响性能（< 300ms）
- [ ] 颜色对比度符合 WCAG AA

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
