---
stepsCompleted: [1]
inputDocuments:
  - _bmad/bmm/2-plan-workflows/artifacts/PRD.md
  - _bmad/bmm/3-solutioning/artifacts/TECH_STACK.md
  - _bmad/bmm/4-implementation/artifacts/BACKEND_STRUCTURE.md
  - _bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md
  - _bmad/bmm/2-plan-workflows/artifacts/APP_FLOW.md
  - _bmad/bmm/2-plan-workflows/artifacts/IMPLEMENTATION_PLAN.md
  - _bmad/bmm/3-solutioning/artifacts/database-schema.md
  - _bmad/bmm/3-solutioning/epics.md v1.2
workflowType: 'architecture'
project_name: StyleSnap
user_name: Kei
date: '2026-04-02'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## 1. 项目概述

### 1.1 产品名称
**StyleSnap** - 前端开发者的网页设计风格参考平台

### 1.2 产品定位
帮助开发者快速选择、理解和应用网页开发的视觉风格

### 1.3 目标用户
- 前端开发者（主要）
- 需要为项目确定视觉风格的个人开发者或小团队

### 1.4 技术愿景
生产级质量的开源项目，采用最新技术栈确保性能和可维护性

---

## 2. 技术栈决策

### 2.1 核心框架

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Next.js | 16.x | 全栈框架 | App Router、Server Actions、内置缓存优化 |
| React | 19.2.x | UI 库 | 最新稳定版、Server Components 支持 |
| TypeScript | 5.7+ | 类型系统 | 严格模式、类型安全 |

### 2.2 数据库与认证

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Supabase | 2.x | BaaS 平台 | PostgreSQL、Auth、Storage、Realtime 一体化 |
| @supabase/ssr | latest | 服务端集成 | Next.js SSR 优化 |
| @supabase/supabase-js | 2.x | 客户端 | 直接调用，不使用 ORM |

### 2.3 UI 与样式

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Tailwind CSS | 4.x | 原子化 CSS | 快速开发、与 CSS Modules 混合使用 |
| Shadcn UI | latest | 组件生成器 | 完全可控、Next.js 友好 |
| Radix UI | latest | 无障碍原语 | 可访问性支持 |
| Lucide React | latest | 图标库 | 2000+ SVG 图标 |

### 2.4 状态管理

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Zustand | 5.x | 客户端全局状态 | 轻量、简洁 API |
| TanStack Query | 5.x | 服务端状态管理 | 缓存、同步、乐观更新 |

### 2.5 表单与验证

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| React Hook Form | 8.x | 表单库 | 性能优、简洁 |
| Zod | 3.x | Schema 验证 | 类型推断、客户端 + 服务端双重验证 |

### 2.6 邮件服务

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Resend | latest | 邮件发送 | 开发体验佳、React Email 集成 |
| @react-email/components | latest | 邮件模板 | React 组件编写邮件 |

### 2.7 测试工具

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Vitest | 3.x | 单元测试 | 快速、Vite 集成 |
| Playwright | latest | E2E 测试 | 跨浏览器、可靠 |

### 2.8 监控与日志

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| Sentry | latest | 错误追踪 | 全栈监控、性能分析 |

### 2.9 包管理与构建

| 技术 | 版本 | 用途 | 决策理由 |
|------|------|------|----------|
| pnpm | 9.x | 包管理器 | 快速、节省磁盘 |
| Turborepo | 2.x | Monorepo 工具 | 构建编排 |

---

## 3. 架构分层

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │  Components │  │    Hooks    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│              ┌───────────▼───────────┐                 │
│              │   TanStack Query      │                 │
│              │   (Client State)      │                 │
│              └───────────┬───────────┘                 │
└───────────────────────────┼─────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │Server Actions │
                    │  (API Layer)  │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│ Supabase DB   │  │ Supabase Auth │  │ Supabase      │
│ (PostgreSQL)  │  │               │  │ Storage       │
└───────────────┘  └───────────────┘  └───────────────┘
        │
┌───────▼───────┐
│ RLS Policies  │
│ (Row Level    │
│  Security)    │
└───────────────┘
```

### 3.2 项目目录结构

```
apps/web/
├── app/                        # Next.js App Router
│   ├── (public)/               # 公开页面
│   │   ├── page.tsx            # 首页
│   │   ├── styles/
│   │   │   ├── page.tsx        # 风格列表
│   │   │   └── [id]/
│   │   │       └── page.tsx    # 风格详情
│   │   ├── categories/
│   │   │   └── page.tsx        # 分类浏览
│   │   └── search/
│   │       └── page.tsx        # 搜索结果
│   ├── (auth)/                 # 认证页面
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── auth/callback/
│   │       └── route.ts        # Auth 回调
│   ├── (protected)/            # 受保护页面
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── favorites/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── admin/                  # 管理后台
│   │   ├── layout.tsx          # 后台布局（认证保护）
│   │   ├── page.tsx            # 后台首页
│   │   ├── styles/
│   │   ├── users/
│   │   └── comments/
│   └── api/                    # API Routes（仅 Webhook）
│       └── webhooks/
│           └── resend/
│
├── actions/                    # Server Actions
│   ├── auth/
│   │   ├── login.ts
│   │   ├── register.ts
│   │   ├── logout.ts
│   │   └── reset-password.ts
│   ├── styles/
│   │   ├── get-styles.ts
│   │   ├── get-style.ts
│   │   ├── create-style.ts
│   │   ├── update-style.ts
│   │   └── delete-style.ts
│   ├── comments/
│   │   ├── create-comment.ts
│   │   ├── delete-comment.ts
│   │   └── get-comments.ts
│   ├── favorites/
│   │   ├── toggle-favorite.ts
│   │   └── get-favorites.ts
│   └── likes/
│       └── toggle-like.ts
│
├── components/
│   ├── ui/                     # Shadcn UI 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   ├── forms/                  # 表单组件
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ...
│   ├── styles/                 # 风格相关组件
│   │   ├── StyleCard.tsx
│   │   ├── StyleGrid.tsx
│   │   ├── StylePreview.tsx
│   │   └── CodeBlock.tsx
│   ├── social/                 # 社交功能组件
│   │   ├── FavoriteButton.tsx
│   │   ├── LikeButton.tsx
│   │   └── CommentList.tsx
│   └── admin/                  # 管理后台组件
│
├── hooks/
│   ├── use-auth.ts             # 认证状态 Hook
│   ├── use-styles.ts           # 风格数据 Hook
│   ├── use-favorites.ts        # 收藏状态 Hook
│   └── use-theme.ts            # 主题切换 Hook
│
├── stores/                     # Zustand Stores
│   ├── theme-store.ts          # 主题状态
│   └── user-store.ts           # 用户状态
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 浏览器客户端
│   │   ├── server.ts           # 服务端客户端
│   │   └── middleware.ts       # 中间件客户端
│   ├── schemas/                # Zod Schemas
│   │   ├── auth.ts
│   │   ├── styles.ts
│   │   └── comments.ts
│   ├── types/
│   │   └── supabase.ts         # 生成的类型
│   ├── email/
│   │   └── resend.ts           # Resend 客户端
│   └── utils/
│       └── cn.ts               # 类名合并工具
│
├── emails/                     # React Email 模板
│   ├── VerificationEmail.tsx
│   └── PasswordResetEmail.tsx
│
├── styles/                     # 全局样式
│   ├── globals.css
│   └── themes.css
│
└── config/
    ├── site.ts                 # 站点配置
    └── navigation.ts           # 导航配置
```

---

## 4. 数据库设计

### 4.1 ER 图

```
┌─────────────────┐     ┌─────────────────┐
│   auth.users    │     │   categories    │
│─────────────────│     │─────────────────│
│ id (PK)         │     │ id (PK)         │
│ email           │     │ name            │
│ raw_user_meta   │     │ slug            │
│ created_at      │     │ description     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         │              ┌────────▼────────┐
         │              │     styles      │
         │              │─────────────────│
         │              │ id (PK)         │
         │              │ name            │
         │              │ description     │
         │              │ category_id (FK)│
         │              │ author_id (FK)  │
         │              │ tags TEXT[]     │
         │              │ preview_url     │
         │              │ code_snippet    │
         │              │ status          │
         │              │ created_at      │
         │              └────────┬────────┘
         │                       │
    ┌────┴────┐         ┌────────┴────────┐
    │         │         │                 │
┌───▼───┐ ┌───▼────┐ ┌──▼────┐   ┌──────▼──────┐
│favorites│ │comments│ │likes  │   │style_images│
│───────│ │────────│ │───────│   │─────────────│
│id     │ │id      │ │id     │   │id           │
│user_id│ │user_id │ │user_id│   │style_id (FK)│
│style_ │ │style_id│ │style_ │   │image_url    │
│  id   │ │content │ │  id   │   │type         │
└───────┘ └────────┘ └───────┘   └─────────────┘

┌─────────────────┐
│    profiles     │
│─────────────────│
│ id (PK, FK)     │
│ username        │
│ avatar_url      │
│ bio             │
│ created_at      │
└─────────────────┘
```

### 4.2 核心表结构

已存在于 `docs/main/database-schema.md` 和 `BACKEND_STRUCTURE.md`，此处记录关键决策：

**决策点：**
1. **使用 PostgreSQL 数组存储标签** - 简化查询，避免额外的 tag 表关联
2. **计数缓存在 styles 表** - favorites_count, likes_count, views_count 避免实时 COUNT 查询
3. **软删除支持** - comments 表使用 deleted_at 字段支持软删除
4. **RLS 策略** - 所有表启用行级安全，数据库层面保证数据安全

### 4.3 数据库迁移

| 迁移文件 | 说明 | 状态 |
|----------|------|------|
| 0001_initial_schema.sql | 初始表结构 | ✅ 已应用 |
| 0002_create_storage_buckets.sql | Storage 存储桶 | ✅ 已应用 |
| 0003_auth_triggers.sql | Auth 触发器 | ✅ 已应用 |
| 0004_profiles_insert_policy.sql | Profiles RLS | ✅ 已应用 |
| 0005_fix_rls_recursion.sql | RLS 递归修复 | ✅ 已应用 |
| 0006_fix_search_path.sql | search_path 修复 | ✅ 已应用 |
| 0007_add_categories.sql | 剩余分类 | ✅ 已应用 |
| 0008_seed_styles.sql | 初始风格数据 | ✅ 已应用 |
| 0009_atomic_updates.sql | 原子更新 RPC | ✅ 已应用 |
| 0010_rls_policies_fix.sql | RLS 策略修复 | ✅ 已应用 |

---

## 5. Server Actions 规范

### 5.1 基础结构

```typescript
// src/actions/styles/get-styles.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface GetStylesOptions {
  page?: number
  limit?: number
  category?: string
  tags?: string[]
  search?: string
}

export async function getStyles(
  options: GetStylesOptions
): Promise<GetStylesResult> {
  const supabase = await createClient()
  
  // 构建查询
  let query = supabase
    .from('styles')
    .select(`
      *,
      categories (name, slug),
      profiles (username, avatar_url)
    `, { count: 'exact' })
    .eq('status', 'published')

  // 筛选条件
  if (category) {
    query = query.eq('category_id', category)
  }

  if (tags && tags.length > 0) {
    query = query.contains('tags', tags)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // 分页
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to).order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) {
    console.error('获取风格列表失败:', error)
    throw new Error('获取风格列表失败')
  }

  return {
    styles: data || [],
    total: count || 0,
    hasMore: (count || 0) > from + data.length,
  }
}
```

### 5.2 统一返回格式

```typescript
interface ActionResponse<T> {
  error?: string
  data?: T
  fieldErrors?: Record<string, string[]>
}

// 使用示例
export async function someAction(): Promise<ActionResponse<SomeType>> {
  try {
    const result = await doSomething()
    return { data: result }
  } catch (error) {
    console.error('Action 错误:', error)
    return { error: '操作失败' }
  }
}
```

### 5.3 缓存失效策略

```typescript
// 使用 revalidateTag 精确控制
export async function toggleFavorite(styleId: string) {
  // ... 业务逻辑
  
  revalidateTag(`style-${styleId}`, 'max')
  revalidatePath('/favorites')
}
```

---

## 6. 认证系统

### 6.1 认证方式

| 方式 | 状态 | 说明 |
|------|------|------|
| 邮箱 + 密码 | ✅ | 需邮箱验证 |
| GitHub OAuth | ⏳ | 后续添加 |
| Google OAuth | ⏳ | 后续添加 |

### 6.2 认证流程

```
注册流程：
1. 用户填写邮箱、密码 → register Action
2. Supabase 创建未验证用户
3. 发送验证邮件（Resend）
4. 用户点击邮件链接
5. 邮箱验证完成，可登录

登录流程：
1. 用户填写邮箱、密码 → login Action
2. Supabase 验证凭据
3. 创建会话（30 天 Cookie）
4. 跳转至首页或之前页面

密码重置流程：
1. 用户输入邮箱 → resetPassword Action
2. 发送重置邮件
3. 用户点击链接
4. 输入新密码 → updatePassword Action
5. 密码更新，旧会话失效
```

### 6.3 认证状态同步

**关键决策：** 使用 `useAuth` Hook 从 Cookie 读取 Session

```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(...)
    
    // 从 Cookie 读取 Session（关键！）
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
    
    return () => subscription.unsubscribe()
  }, [])

  return { user, loading, signOut }
}
```

---

## 7. 前端架构

### 7.1 设计系统

**设计风格定位：** 轻量机能风

**设计关键词：**
```
冷静 · 精准 · 通透 · 秩序
```

**色彩系统：**
- 主色：黑白灰体系（Tailwind Zinc）
- 语义色：成功 (Emerald)、警告 (Amber)、错误 (Red)、信息 (Blue)

**混合样式方案：**
| 场景 | 方案 | 理由 |
|------|------|------|
| 组件样式 | CSS Modules | 作用域隔离 |
| 布局/工具类 | Tailwind CSS | 快速开发 |
| 复杂动画 | CSS Modules | 更好可读性 |

### 7.2 组件分层

```
┌──────────────────────────────────────┐
│           Page Components            │  # 服务端组件为主
│           (app/[route]/)             │
└─────────────────┬────────────────────┘
                  │
┌─────────────────▼────────────────────┐
│         Feature Components           │  # 混合组件
│    (StyleGrid, CommentList, etc)     │
└─────────────────┬────────────────────┘
                  │
┌─────────────────▼────────────────────┐
│           UI Components              │  # 纯客户端组件
│      (Button, Card, Input, etc)      │
└──────────────────────────────────────┘
```

### 7.3 状态管理策略

| 状态类型 | 管理方案 | 说明 |
|----------|----------|------|
| 服务端状态 | TanStack Query | 缓存、同步、乐观更新 |
| 全局客户端状态 | Zustand | 主题、用户信息 |
| 本地 UI 状态 | useState/useReducer | 表单、弹窗等 |
| URL 状态 | Next.js Router | 分页、筛选参数 |

---

## 8. 缓存策略

### 8.1 Next.js 缓存（服务端）

```typescript
// 使用 unstable_cache
const getCachedStyles = unstable_cache(
  async () => getStyles({ page: 1, limit: 12 }),
  ['home-styles'],
  { revalidate: 3600 } // 1 小时
)
```

### 8.2 TanStack Query（客户端）

```typescript
export function useStyles(options: GetStylesOptions) {
  return useQuery({
    queryKey: ['styles', options],
    queryFn: () => getStyles(options),
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}
```

### 8.3 缓存失效

| 操作 | 失效策略 |
|------|----------|
| 创建风格 | `revalidateTag('styles')` |
| 更新风格 | `revalidateTag('style-[id]')` |
| 点赞/收藏 | `revalidateTag('style-[id]', 'max')` |
| 评论 | `revalidateTag('comments-[id]', 'max')` |

---

## 9. 安全策略

### 9.1 RLS 策略

所有表启用行级安全：

| 表 | SELECT | INSERT | UPDATE | DELETE |
|----|--------|--------|--------|--------|
| profiles | 公开读取 | 仅自己 | 仅自己 | 仅自己 |
| styles | 已发布的公开 | 认证用户 | 仅作者 | 仅作者 |
| comments | 公开读取 | 认证用户 | 仅作者 | 作者或管理员 |
| favorites | 仅自己 | 仅自己 | - | 仅自己 |
| likes | 仅自己 | 仅自己 | - | 仅自己 |

### 9.2 输入验证

所有 Server Action 输入使用 Zod 验证：

```typescript
export const loginSchema = z.object({
  email: z.string().email('无效的邮箱格式'),
  password: z.string().min(1, '密码必填'),
})

export async function login(input: LoginInput) {
  const result = loginSchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }
  // ...
}
```

### 9.3 错误日志脱敏

**决策：** Auth 相关错误日志不包含 PII 信息

```typescript
// ❌ 避免
console.error('登录失败:', email, error)

// ✅ 推荐
console.error('登录失败:', { error: error.message })
```

---

## 10. 性能优化

### 10.1 关键指标目标

| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| FCP | ≤ 1.8s | Lighthouse |
| LCP | ≤ 2.5s | Lighthouse |
| CLS | ≤ 0.1 | Lighthouse |
| TTI | ≤ 3.9s | Lighthouse |
| FPS | 60 | DevTools |

### 10.2 优化策略

| 优化项 | 策略 |
|--------|------|
| 图片 | next/image 自动优化、WebP/AVIF 格式 |
| 字体 | 系统字体栈、可选 Google Fonts 预加载 |
| 代码分割 | Next.js 自动代码分割 |
| CSS | 避免大范围 box-shadow、限制 backdrop-filter 使用 |
| 列表 | >20 项使用虚拟化 (@tanstack/react-virtual) |

---

## 11. 监控与日志

### 11.1 Sentry 集成

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% 采样
})
```

### 11.2 Server Actions 错误捕获

```typescript
'use server'

import { captureException } from '@sentry/nextjs'

export async function someAction() {
  try {
    // 业务逻辑
  } catch (error) {
    captureException(error)
    return { error: '操作失败' }
  }
}
```

---

## 12. 部署策略

### 12.1 Vercel 部署

| 环境 | 分支 | 说明 |
|------|------|------|
| Production | main | 生产环境 |
| Preview | feature/* | PR 预览 |

### 12.2 环境变量

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# Resend
RESEND_API_KEY=xxx

# Sentry
NEXT_PUBLIC_SENTRY_DSN=xxx

# Site
NEXT_PUBLIC_SITE_URL=https://stylesnap.com
```

---

## 13. 架构决策记录 (ADR)

### ADR-001: 选择 Server Actions 而非 REST API

**决策日期：** 2026-03-21

**背景：** 需要选择 API 层实现方式

**决策：** 使用 Next.js Server Actions 作为主要 API 层

**理由：**
- 类型安全（函数调用而非 HTTP）
- 更少的样板代码
- Next.js 16 推荐方案
- 自动处理 CSRF 防护

**影响：**
- 所有数据操作通过 Server Actions
- 仅 Webhook 使用 API Routes

---

### ADR-002: 不使用 ORM，直接调用 Supabase

**决策日期：** 2026-03-21

**背景：** 需要选择数据库访问层

**决策：** 直接使用 `@supabase/supabase-js`，不引入 ORM

**理由：**
- Supabase 已提供类型安全的查询构建器
- 减少依赖和性能开销
- 项目规模不需要 ORM 的抽象

**影响：**
- 查询使用 Supabase 语法
- 需要手动维护类型定义

---

### ADR-003: 混合样式方案 (Tailwind + CSS Modules)

**决策日期：** 2026-03-21

**背景：** 需要选择样式方案

**决策：** Tailwind CSS + CSS Modules 混合使用

**理由：**
- Tailwind 适合布局和工具类
- CSS Modules 适合复杂组件样式
- 两者互补，避免各自缺点

**影响：**
- 需要团队遵循使用规范
- 简单场景优先用 Tailwind

---

### ADR-004: 评论系统扁平化设计

**决策日期：** 2026-04-01

**背景：** 评论嵌套层级过深影响可读性

**决策：** 最多 2 级回复，所有三级回复提升为二级

**理由：**
- 保持讨论线程清晰
- 避免无限嵌套导致的 UI 问题
- 简化数据库查询

**影响：**
- 回复时自动添加"回复 @用户名"前缀
- 数据库 path 字段存储层级信息

---

### ADR-005: 评论回复扁平化存储方案（重构）

**决策日期：** 2026-04-04

**背景：** 
当前评论系统二级回复功能存在设计缺陷：
- 回复二级评论时会创建第三级嵌套，被 Server Action 拒绝
- 前端状态同步逻辑复杂且易出错

**问题根因：**
- 当前采用深度嵌套存储（`parent_id` 递归指向上一条）
- 回复二级评论时，`parent_id` 指向二级评论，导致创建第三级

**决策：** 采用扁平化存储 + 层级展示方案

**架构变更：**

1. **数据库 Schema 变更：**
   ```sql
   ALTER TABLE comments 
   ADD COLUMN reply_to_user_id UUID REFERENCES profiles(id);
   
   CREATE INDEX idx_comments_reply_to_user ON comments(reply_to_user_id);
   ```

2. **`parent_id` 语义变更：**
   - 一级评论：`parent_id = null`
   - 二级回复：`parent_id` 始终指向一级评论 ID
   - 回复关系：通过 `reply_to_user_id` 显式记录

3. **数据结构示例：**
   ```
   一级评论 A (id=A, parent_id=null)
     ├── 二级回复 1 (id=B, parent_id=A, reply_to_user_id=null)
     ├── 二级回复 2 (id=C, parent_id=A, reply_to_user_id=用户 B) ← 回复 B
     └── 二级回复 3 (id=D, parent_id=A, reply_to_user_id=用户 C) ← 回复 C
   ```

**理由：**
- 简化数据库查询（不需要递归检查）
- 前端状态同步更简单（直接添加到 `parent_id` 对应的评论下）
- 回复关系显式化（通过 `reply_to_user_id` 字段）
- UI 显示更灵活（可根据 `reply_to_user_id` 分组）

**影响范围：**

| 层级 | 变更内容 |
|------|----------|
| 数据库 | 添加 `reply_to_user_id` 字段和索引 |
| Server Action | 移除嵌套层级检查，添加 `replyToUserId` 参数 |
| 前端组件 | 修改回复逻辑，扁平化数据分组显示 |
| E2E 测试 | 更新测试用例验证新方案 |

**权衡：**
- 需要数据库迁移
- 需要重构前端和后端代码
- 长期可维护性提升

---

## 14. 下一步

**架构文档已完成，建议下一步：**

### 当前优先任务：评论系统重构

1. **[CE] Create Epics and Stories** - `bmad-create-epics-and-stories` - 更新 Story 5.2 验收标准
2. **[SP] Sprint Planning** - `bmad-sprint-planning` - 为评论重构创建 Sprint 计划
3. **[CS] Create Story** - `bmad-create-story` - 创建具体重构 Story
4. **[DS] Dev Story** - `bmad-dev-story` - 执行重构实施

### 原有计划

1. **[SP] Sprint Planning** - `bmad-sprint-planning` - 为 Epic 1 创建详细 Sprint 计划
2. **[CS] Create Story** - `bmad-create-story` - 开始实现 Epic 1 Story 1.1

---

*文档版本：1.0*
*创建日期：2026-04-02*
