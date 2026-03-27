# StyleSnap - Agent 参考手册

> 版本：1.0
> 创建日期：2026-03-25
> 用途：为大模型 Agent 提供开发所需的 API 规范、最佳实践、技术约束

---

## 目录

1. [项目核心文档](#1-项目核心文档)
2. [技术栈参考](#2-技术栈参考)
3. [代码规范](#3-代码规范)
4. [最佳实践](#4-最佳实践)

---

## 1. 项目核心文档

| 文档 | 路径 | 用途 |
|------|------|------|
| PRD | `main/PRD.md` | 产品需求定义 |
| APP_FLOW | `main/APP_FLOW.md` | 应用流程与路由结构 |
| FRONTEND_GUIDELINES | `main/FRONTEND_GUIDELINES.md` | 前端设计规范 |
| BACKEND_STRUCTURE | `main/BACKEND_STRUCTURE.md` | 后端架构规范 |
| TECH_STACK | `main/TECH_STACK.md` | 技术栈版本清单 |
| IMPLEMENTATION_PLAN | `main/IMPLEMENTATION_PLAN.md` | 实现计划 |
| database-schema | `main/database-schema.md` | 数据库结构设计 |

---

## 2. 技术栈参考

### 2.1 Next.js 16

**核心概念**：
- App Router 架构（文件系统路由）
- Server Components（默认）vs Client Components（`'use client'`）
- Server Actions（服务端 mutations）
- 部分预渲染（PPR）

**API 速查**：

```typescript
// Server Component（默认）
async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client Component
'use client'
export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// Server Action
async function submitForm(formData: FormData) {
  'use server'
  // 数据库操作
}

// 缓存函数
import { unstable_cache } from 'next/cache'
const getCachedData = unstable_cache(
  async () => fetchData(),
  ['data-key'],
  { tags: ['data'] }
)
```

**路由约定**：
- `layout.tsx` - 布局组件
- `page.tsx` - 页面组件
- `loading.tsx` - 加载状态
- `error.tsx` - 错误边界
- `not-found.tsx` - 404 页面
- `route.ts` - API 端点

---

### 2.2 Zustand

**API 速查**：

```typescript
import { create } from 'zustand'

// 基础 Store
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// TypeScript Store
interface StoreState {
  count: number
  increment: () => void
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// 带持久化
import { persist } from 'zustand/middleware'
const useStore = create(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'storage-key' }
  )
)

// 组件中使用
const { count, increment } = useStore()
```

**最佳实践**：
- 只存储全局状态（主题、用户偏好）
- 服务端数据用 TanStack Query
- 使用选择器避免不必要重渲染

---

### 2.3 Supabase

**核心服务**：
- PostgreSQL 数据库
- 用户认证（邮箱/密码、OAuth）
- 文件存储
- Realtime 订阅

**API 速查**：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// 数据查询
const { data, error } = await supabase
  .from('styles')
  .select('*')
  .eq('status', 'published')

// 用户认证
const { data, error } = await supabase.auth.signUp({
  email,
  password,
})

// 文件上传
const { data, error } = await supabase.storage
  .from('images')
  .upload('file.png', file)
```

**RLS 策略**：
- 所有表必须启用 RLS
- 定义 SELECT/INSERT/UPDATE/DELETE 策略
- 使用 `auth.uid()` 验证用户

---

### 2.4 Tailwind CSS 4.x

**新特性**：
- 原生 CSS 变量支持
- 改进的 P3 色域
- 更小的打包体积

**使用示例**：
```tsx
<div className="flex items-center gap-4 bg-primary text-foreground">
```

---

### 2.5 Shadcn UI + Radix UI

**安装方式**：
```bash
pnpm dlx shadcn@latest add button
```

**核心组件**：
- 基础：Button, Input, Label
- 导航：Tabs, ScrollArea
- 覆盖层：Dialog, Sheet, Toast
- 数据：Table, Card

---

## 3. 代码规范

### 3.1 TypeScript

- 使用 strict 模式
- 函数参数和返回值必须有类型
- 避免使用 `any`，使用 `unknown` 替代

### 3.2 目录结构

```
apps/web/
├── app/              # Next.js 路由
├── components/       # React 组件
│   ├── ui/          # 基础 UI 组件
│   └── modules/     # 功能模块组件
├── lib/             # 工具函数
├── hooks/           # 自定义 Hooks
└── stores/          # Zustand stores
```

### 3.3 Server Actions 规范

```typescript
// 必须是 async 函数
// 必须有 'use server' 指令
// 必须有输入验证

async function createUser(formData: FormData) {
  'use server'

  const email = formData.get('email') as string
  // 验证逻辑
  if (!email) throw new Error('Email is required')

  // 数据库操作
}
```

---

## 4. 最佳实践

### 4.1 数据获取

- 服务端数据使用 Server Components + Supabase
- 客户端数据使用 TanStack Query
- 使用 `unstable_cache` 缓存耗时操作

### 4.2 错误处理

- Server Actions 使用 `try/catch` 返回错误对象
- 客户端使用 error boundary
- 记录日志到 Sentry（生产环境）

### 4.3 表单处理

- 使用 `react-hook-form` + `zod` 验证
- 表单提交使用 Server Actions
- 显示 loading 状态和提交反馈

---

## 附录：文档索引

### Research 文档（决策参考）
- `research/01-style-classification.md` - 风格分类体系
- `research/02-hypergryph-ui-analysis.md` - 鹰角 UI 风格分析
- `research/03-email-service-selection.md` - 邮件服务选型
- `research/04-component-library-selection.md` - 组件库选型
- `research/05-monorepo-structure.md` - Monorepo 架构

### Knowledge Base 文档（学习参考）
- `knowledge-base/guides/*` - 开发指南
- `knowledge-base/tech-stack/*` - 技术栈详细调研

### Guide 文档（操作指南）
- `guide/agent-browser-debug-tools.md` - AI Agent 浏览器调试工具指南（MCP）

### Reference 文档（API 速查）
- `reference/nextjs-api-reference.md` - Next.js API 引用
- `reference/supabase-reference.md` - Supabase API 引用
- `reference/tanstack-query-reference.md` - TanStack Query 引用
- `reference/t3-env-reference.md` - T3 Env 引用
- `reference/react-hook-form-zod-reference.md` - React Hook Form + Zod 引用
- `reference/sentry-api-reference.md` - Sentry API 引用

---

## 修订历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-03-25 | 初始版本，文档重构后创建 |
