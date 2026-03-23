# StyleSnap - 后端结构文档

> 版本：1.0
> 创建日期：2026-03-21
> 架构模式：Server Actions + Supabase 原生集成
> 用途：统一 StyleSnap 项目后端架构与开发规范

---

## 目录

1. [架构概述](#1-架构概述)
2. [数据库设计](#2-数据库设计)
3. [Server Actions 规范](#3-server-actions-规范)
4. [认证系统](#4-认证系统)
5. [数据验证](#5-数据验证)
6. [文件上传](#6-文件上传)
7. [缓存策略](#7-缓存策略)
8. [错误处理](#8-错误处理)
9. [权限管理](#9-权限管理)
10. [邮件服务](#10-邮件服务)
11. [管理后台](#11-管理后台)
12. [监控与日志](#12-监控与日志)

---

## 1. 架构概述

### 1.1 技术选型

| 组件 | 技术 | 说明 |
|------|------|------|
| **API 架构** | Server Actions | Next.js 16 推荐，类型安全 |
| **数据库** | Supabase PostgreSQL | 托管 Postgres，含 Auth/Storage |
| **ORM** | 无 ORM | 直接调用 `@supabase/supabase-js` |
| **认证** | Supabase Auth | 邮箱/密码 + GitHub/Google OAuth |
| **缓存** | Next.js Cache + TanStack Query | 混合缓存策略 |
| **验证** | Zod | 客户端 + 服务端双重验证 |
| **日志** | Sentry | 错误追踪 + 性能监控 |

### 1.2 架构分层

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

### 1.3 项目目录结构

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # 公开页面
│   │   ├── page.tsx            # 首页
│   │   ├── styles/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # 风格详情
│   │   └── search/
│   │       └── page.tsx        # 搜索页
│   ├── (auth)/                 # 认证页面
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (protected)/            # 受保护页面
│   │   ├── dashboard/
│   │   ├── favorites/
│   │   └── settings/
│   ├── admin/                  # 管理后台
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
│   │   └── delete-comment.ts
│   └── favorites/
│       ├── toggle-favorite.ts
│       └── get-favorites.ts
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
│   └── types/
│       └── supabase.ts         # 生成的类型
│
├── components/
│   ├── ui/                     # Shadcn UI 组件
│   ├── forms/                  # 表单组件
│   ├── styles/                 # 风格相关组件
│   └── admin/                  # 管理后台组件
│
├── hooks/
│   ├── use-styles.ts           # 风格数据 Hook
│   ├── use-auth.ts             # 认证状态 Hook
│   └── use-favorites.ts        # 收藏状态 Hook
│
└── stores/                     # Zustand Stores
    ├── theme-store.ts
    └── user-store.ts
```

---

## 2. 数据库设计

### 2.1 ER 图

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

### 2.2 核心表结构

#### 2.2.1 profiles（用户资料表）

```sql
-- 用户资料扩展表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_profiles_username ON profiles(username);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 公开读取
CREATE POLICY "公开读取 profiles"
  ON profiles FOR SELECT
  USING (true);

-- 认证用户插入自己的资料
CREATE POLICY "用户插入自己的 profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 仅用户自己更新
CREATE POLICY "用户更新自己的 profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### 2.2.2 categories（分类表）

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_categories_slug ON categories(slug);

-- RLS：公开读取
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "公开读取 categories"
  ON categories FOR SELECT
  USING (true);

-- 仅管理员可写（应用层控制）
```

#### 2.2.3 styles（风格表）

```sql
CREATE TABLE styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES auth.users(id),

  -- 标签使用 PostgreSQL 数组
  tags TEXT[] DEFAULT '{}',

  -- 预览图
  preview_url TEXT,

  -- 代码片段
  code_snippet TEXT,
  code_language TEXT DEFAULT 'tsx',

  -- 状态：draft | pending | published | rejected
  status TEXT DEFAULT 'published',

  -- 计数缓存
  favorites_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_styles_category ON styles(category_id);
CREATE INDEX idx_styles_author ON styles(author_id);
CREATE INDEX idx_styles_tags ON styles USING GIN(tags);
CREATE INDEX idx_styles_status ON styles(status);
CREATE INDEX idx_styles_created_at ON styles(created_at DESC);

-- RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;

-- 公开读取已发布的风格
CREATE POLICY "公开读取已发布 styles"
  ON styles FOR SELECT
  USING (status = 'published');

-- 认证用户插入风格
CREATE POLICY "认证用户插入 styles"
  ON styles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 仅作者更新自己的风格
CREATE POLICY "作者更新 styles"
  ON styles FOR UPDATE
  USING (auth.uid() = author_id);

-- 仅作者删除自己的风格
CREATE POLICY "作者删除 styles"
  ON styles FOR DELETE
  USING (auth.uid() = author_id);
```

#### 2.2.4 comments（评论表）

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 嵌套层级（便于查询）
  path TEXT[],  -- 如：{root_id, child_id, grandchild_id}
  depth INTEGER DEFAULT 0
);

-- 索引
CREATE INDEX idx_comments_style ON comments(style_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_path ON comments USING GIN(path);

-- RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 公开读取
CREATE POLICY "公开读取 comments"
  ON comments FOR SELECT
  USING (true);

-- 认证用户插入评论
CREATE POLICY "认证用户插入 comments"
  ON comments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 仅作者删除自己的评论
CREATE POLICY "作者删除 comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);
```

#### 2.2.5 favorites（收藏表）

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, style_id)
);

-- 索引
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_style ON favorites(style_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 用户读取自己的收藏
CREATE POLICY "用户读取自己的 favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- 用户管理自己的收藏
CREATE POLICY "用户插入自己的 favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户删除自己的 favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

#### 2.2.6 likes（点赞表）

```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, style_id)
);

-- 索引
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_style ON likes(style_id);

-- RLS 类似 favorites
```

### 2.3 数据库初始化脚本

```sql
-- 1. 启用扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建基础表（按顺序）
-- 先创建 categories（无外键依赖）
-- 再创建 profiles, styles, comments, favorites, likes

-- 3. 创建触发器（自动更新 updated_at）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用于各表
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_styles_updated_at
  BEFORE UPDATE ON styles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. 创建 Auth 触发器（新用户自动创建 profile）
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 3. Server Actions 规范

### 3.1 基础结构

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

export interface GetStylesResult {
  styles: Style[]
  total: number
  hasMore: boolean
}

export async function getStyles(
  options: GetStylesOptions
): Promise<GetStylesResult> {
  const supabase = await createClient()

  const {
    page = 1,
    limit = 12,
    category,
    tags,
    search,
  } = options

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

### 3.2 创建操作

```typescript
// src/actions/styles/create-style.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createStyleSchema, type CreateStyleInput } from '@/lib/schemas/styles'

export async function createStyle(
  input: CreateStyleInput
): Promise<{ error?: string; data?: { id: string } }> {
  try {
    // 1. Zod 验证
    const result = createStyleSchema.safeParse(input)
    if (!result.success) {
      return { error: result.error.errors[0].message }
    }

    // 2. 获取当前用户
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 3. 创建风格
    const { data, error } = await supabase
      .from('styles')
      .insert({
        ...result.data,
        author_id: user.id,
        status: 'published', // 或 'pending' 待审核
      })
      .select('id')
      .single()

    if (error) {
      console.error('创建风格失败:', error)
      return { error: '创建失败' }
    }

    // 4. 缓存失效
    revalidatePath('/')
    revalidatePath('/styles')

    return { data: { id: data.id } }
  } catch (error) {
    console.error('意外错误:', error)
    return { error: '服务器错误' }
  }
}
```

### 3.3 通用返回格式

```typescript
// 统一错误返回格式
interface ActionResponse<T> {
  error?: string
  data?: T
  fieldErrors?: Record<string, string[]>
}

// 使用示例
export async function someAction(): Promise<ActionResponse<SomeType>> {
  // 验证失败
  return { error: '验证失败' }

  // 字段错误
  return {
    error: '验证失败',
    fieldErrors: { email: ['邮箱格式错误'] }
  }

  // 成功
  return { data: { id: 'xxx' } }
}
```

---

## 4. 认证系统

### 4.1 Supabase 客户端封装

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中设置 Cookie 会抛出错误，可忽略
          }
        },
      },
    }
  )
}
```

### 4.2 认证 Hook

```typescript
// src/hooks/use-auth.ts
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { env } from '@/env'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 获取初始会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 监听认证变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const supabase = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    await supabase.auth.signOut()
  }

  const refresh = async () => {
    const supabase = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 4.3 Server Actions

```typescript
// src/actions/auth/login.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'

export async function login(
  input: LoginInput
): Promise<{ error?: string }> {
  // 1. Zod 验证
  const result = loginSchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  // 2. 登录
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    return { error: '邮箱或密码错误' }
  }

  // 3. 缓存失效 + 跳转
  revalidatePath('/')
  redirect('/dashboard')
}

// src/actions/auth/register.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth'

export async function register(
  input: RegisterInput
): Promise<{ error?: string; requiresVerification?: boolean }> {
  const result = registerSchema.safeParse(input)
  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        username: result.data.username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // 检查是否需要邮箱验证
  const requiresVerification = !data.user ||
    (data.user.identities && data.user.identities.length === 0)

  return { requiresVerification: true }
}
```

---

## 5. 数据验证

### 5.1 Schema 定义

```typescript
// src/lib/schemas/auth.ts
import { z } from 'zod'

// 邮箱 schema（可复用）
export const emailSchema = z.string().email('无效的邮箱格式')

// 密码 schema（可复用）
export const passwordSchema = z
  .string()
  .min(8, '密码至少 8 个字符')
  .regex(/[A-Z]/, '必须包含大写字母')
  .regex(/[a-z]/, '必须包含小写字母')
  .regex(/[0-9]/, '必须包含数字')

// 登录 schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码必填'),
})

// 注册 schema
export const registerSchema = z.object({
  email: emailSchema,
  username: z.string().min(2, '用户名至少 2 个字符'),
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(v => v === true, '必须同意条款'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
```

```typescript
// src/lib/schemas/styles.ts
import { z } from 'zod'

export const createStyleSchema = z.object({
  name: z.string().min(2, '风格名称至少 2 个字符'),
  description: z.string().max(1000, '描述最多 1000 个字符'),
  categoryId: z.string().uuid('请选择分类'),
  tags: z.array(z.string()).min(1, '至少选择一个标签'),
  codeSnippet: z.string().min(10, '代码片段至少 10 个字符'),
  codeLanguage: z.string().default('tsx'),
})

export type CreateStyleInput = z.infer<typeof createStyleSchema>
```

### 5.2 客户端验证

```typescript
// src/components/forms/login-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
import { login } from '@/actions/auth/login'

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginInput) => {
    const result = await login(values)
    if (result?.error) {
      form.setError('root', { message: result.error })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* 表单字段 */}
      </form>
    </Form>
  )
}
```

---

## 6. 文件上传

### 6.1 签名 URL 上传流程

```typescript
// src/actions/storage/get-upload-url.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function getUploadUrl(
  filename: string,
  contentType: string
): Promise<{ error?: string; uploadUrl?: string; publicUrl?: string }> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 生成唯一文件名
    const ext = filename.split('.').pop()
    const path = `${user.id}/${uuidv4()}.${ext}`

    // 获取签名 URL
    const { data, error } = await supabase.storage
      .from('style-previews')
      .createSignedUploadUrl(path)

    if (error) {
      return { error: '上传 URL 生成失败' }
    }

    // 获取公开访问 URL
    const { data: { publicUrl } } = supabase.storage
      .from('style-previews')
      .getPublicUrl(path)

    return {
      uploadUrl: data.url,
      publicUrl,
    }
  } catch (error) {
    console.error('获取上传 URL 失败:', error)
    return { error: '服务器错误' }
  }
}
```

### 6.2 客户端上传组件

```typescript
// src/components/upload/image-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { getUploadUrl } from '@/actions/storage/get-upload-url'

interface ImageUploadProps {
  onUpload: (url: string) => void
  accept?: string
}

export function ImageUpload({ onUpload, accept = 'image/*' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError(undefined)

    try {
      // 1. 获取签名 URL
      const result = await getUploadUrl(file.name, file.type)
      if (result.error) {
        throw new Error(result.error)
      }

      // 2. 上传到 Storage
      const uploadResponse = await fetch(result.uploadUrl!, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('上传失败')
      }

      // 3. 回调公开 URL
      onUpload(result.publicUrl!)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        disabled={uploading}
      />
      {uploading && <span>上传中...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}
```

### 6.3 Storage RLS 策略

```sql
-- 风格预览图存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('style-previews', 'style-previews', true);

-- 公开读取
CREATE POLICY "公开读取预览图"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'style-previews');

-- 认证用户上传
CREATE POLICY "认证用户上传预览图"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'style-previews' AND
    auth.role() = 'authenticated'
  );

-- 仅作者删除自己的文件
CREATE POLICY "作者删除预览图"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'style-previews' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 7. 缓存策略

### 7.1 Next.js 缓存（SSG + ISR）

```typescript
// src/app/page.tsx
import { getStyles } from '@/actions/styles/get-styles'
import { unstable_cache } from 'next/cache'

// 缓存的首页数据获取
const getCachedStyles = unstable_cache(
  async () => getStyles({ page: 1, limit: 12 }),
  ['home-styles'],
  { revalidate: 3600 } // 1 小时
)

export default async function HomePage() {
  const { styles } = await getCachedStyles()

  return (
    <StyleGrid styles={styles} />
  )
}
```

### 7.2 TanStack Query 集成

```typescript
// src/hooks/use-styles.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStyles } from '@/actions/styles/get-styles'

export function useStyles(options: GetStylesOptions) {
  return useQuery({
    queryKey: ['styles', options],
    queryFn: () => getStyles(options),
    staleTime: 5 * 60 * 1000, // 5 分钟
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      // 失效相关查询
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })
}
```

---

## 8. 错误处理

### 8.1 统一返回格式

```typescript
// src/lib/action-response.ts
export interface ActionResponse<T> {
  error?: string
  data?: T
  fieldErrors?: Record<string, string[]>
}

export function success<T>(data: T): ActionResponse<T> {
  return { data }
}

export function actionError(message: string): ActionResponse<never> {
  return { error: message }
}

export function validationError(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResponse<never> {
  return { error: message, fieldErrors }
}
```

### 8.2 Server Actions 错误处理

```typescript
'use server'

import { ActionResponse, success, actionError } from '@/lib/action-response'

export async function someAction(): Promise<ActionResponse<SomeType>> {
  try {
    // 业务逻辑
    const result = await doSomething()
    return success(result)
  } catch (error) {
    console.error('Action 错误:', error)

    if (error instanceof ZodError) {
      return validationError('验证失败', flattenError(error))
    }

    return actionError('操作失败，请稍后重试')
  }
}
```

---

## 9. 权限管理

### 9.1 RLS + 应用层双重检查

```typescript
// src/actions/styles/delete-style.ts
'use server'

export async function deleteStyle(
  styleId: string
): Promise<ActionResponse<void>> {
  const supabase = await createClient()

  // 1. 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return actionError('未登录')
  }

  // 2. 获取风格（应用层检查所有权）
  const { data: style } = await supabase
    .from('styles')
    .select('author_id')
    .eq('id', styleId)
    .single()

  if (!style) {
    return actionError('风格不存在')
  }

  if (style.author_id !== user.id) {
    return actionError('无权限删除')
  }

  // 3. 执行删除（RLS 也会检查）
  const { error } = await supabase
    .from('styles')
    .delete()
    .eq('id', styleId)

  if (error) {
    return actionError('删除失败')
  }

  revalidatePath('/')
  return success(undefined)
}
```

### 9.2 管理员检查

```typescript
// src/lib/admin.ts
export async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  // 检查 admin 元数据
  return user.user_metadata?.role === 'admin'
}

// 使用
export async function adminAction(): Promise<ActionResponse<void>> {
  const isAdmin = await checkAdmin()
  if (!isAdmin) {
    return actionError('需要管理员权限')
  }
  // ...
}
```

---

## 10. 邮件服务

### 10.1 Server Action 直接调用

```typescript
// src/actions/auth/send-verification.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { VerifyEmailTemplate } from '@/emails/templates/verify-email'
import { render } from '@react-email/components'
import { env } from '@/env'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendVerificationAction(): Promise<ActionResponse<void>> {
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    return actionError('未登录或无邮箱')
  }

  // 生成验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  // 发送验证邮件
  const { error } = await resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.dev>',
    to: user.email,
    subject: '验证你的 StyleSnap 账号',
    react: VerifyEmailTemplate({
      username: user.user_metadata.username || user.email.split('@')[0],
      verifyUrl: `${env.NEXT_PUBLIC_SITE_URL}/auth/verify?code=${code}`,
      code,
    }),
  })

  if (error) {
    console.error('发送验证邮件失败:', error)
    return actionError('发送失败')
  }

  return success(undefined)
}
```

---

## 11. 管理后台

### 11.1 目录结构

```
src/app/admin/
├── layout.tsx              # 后台布局（带侧边栏）
├── page.tsx                # 后台首页（仪表板）
├── styles/
│   ├── page.tsx            # 风格列表
│   ├── new/
│   │   └── page.tsx        # 新建风格
│   └── [id]/
│       └── edit/
│           └── page.tsx    # 编辑风格
├── users/
│   └── page.tsx            # 用户列表
└── comments/
    └── page.tsx            # 评论管理
```

### 11.2 管理员认证

```typescript
// src/app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 检查管理员权限
  if (!user || user.user_metadata?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

---

## 12. API 端点合约

### 12.1 Server Actions 接口清单

#### 认证相关

| Action | 输入 | 输出 | 错误码 |
|--------|------|------|--------|
| `login` | `{ email, password }` | `{ error? }` | `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED` |
| `register` | `{ email, password, username, confirmPassword, agreeToTerms }` | `{ error?, requiresVerification? }` | `EMAIL_EXISTS`, `WEAK_PASSWORD`, `USERNAME_TAKEN` |
| `logout` | `void` | `{ error? }` | `NOT_AUTHENTICATED` |
| `resetPassword` | `{ email }` | `{ error? }` | `EMAIL_NOT_FOUND` |
| `updatePassword` | `{ password, confirmPassword }` | `{ error? }` | `WEAK_PASSWORD`, `NOT_AUTHENTICATED` |
| `sendVerification` | `void` | `{ error? }` | `NOT_AUTHENTICATED`, `ALREADY_VERIFIED` |

#### 风格相关

| Action | 输入 | 输出 | 错误码 |
|--------|------|------|--------|
| `getStyles` | `{ page, limit, category, tags, search }` | `{ styles, total, hasMore }` | `INVALID_PAGE`, `INVALID_CATEGORY` |
| `getStyle` | `{ id }` | `{ style, author, comments }` | `NOT_FOUND`, `UNPUBLISHED` |
| `createStyle` | `{ name, description, categoryId, tags, codeSnippet }` | `{ error?, data: { id } }` | `NOT_AUTHENTICATED`, `VALIDATION_ERROR` |
| `updateStyle` | `{ id, name, description, categoryId, tags, codeSnippet }` | `{ error?, data: { id } }` | `NOT_FOUND`, `NOT_OWNER`, `VALIDATION_ERROR` |
| `deleteStyle` | `{ id }` | `{ error? }` | `NOT_FOUND`, `NOT_OWNER` |

#### 评论相关

| Action | 输入 | 输出 | 错误码 |
|--------|------|------|--------|
| `getComments` | `{ styleId, page, limit }` | `{ comments, total }` | `INVALID_STYLE` |
| `createComment` | `{ styleId, content, parentId? }` | `{ error?, data: { id } }` | `NOT_AUTHENTICATED`, `EMPTY_CONTENT` |
| `deleteComment` | `{ id }` | `{ error? }` | `NOT_FOUND`, `NOT_OWNER`, `NOT_ADMIN` |

#### 收藏相关

| Action | 输入 | 输出 | 错误码 |
|--------|------|------|--------|
| `getFavorites` | `{ page, limit }` | `{ styles, total }` | `NOT_AUTHENTICATED` |
| `toggleFavorite` | `{ styleId }` | `{ error?, data: { isFavorite } }` | `NOT_AUTHENTICATED`, `STYLE_NOT_FOUND` |

#### 点赞相关

| Action | 输入 | 输出 | 错误码 |
|--------|------|------|--------|
| `toggleLike` | `{ styleId }` | `{ error?, data: { isLiked } }` | `NOT_AUTHENTICATED`, `STYLE_NOT_FOUND` |

### 12.2 统一错误响应格式

```typescript
// 标准错误码枚举
export enum ErrorCode {
  // 认证错误
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',

  // 权限错误
  NOT_OWNER = 'NOT_OWNER',
  NOT_ADMIN = 'NOT_ADMIN',

  // 资源错误
  NOT_FOUND = 'NOT_FOUND',
  UNPUBLISHED = 'UNPUBLISHED',

  // 验证错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  // 冲突错误
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USERNAME_TAKEN = 'USERNAME_TAKEN',
  ALREADY_VERIFIED = 'ALREADY_VERIFIED',

  // 系统错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// 错误响应结构
export interface ActionError {
  code: ErrorCode
  message: string
  fieldErrors?: Record<string, string[]>
}

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError }
```

---

## 13. 边缘情况处理

### 13.1 并发与竞态条件

#### 收藏/点赞并发问题

```typescript
// 问题：用户快速点击收藏按钮可能导致重复插入或删除
// 解决：使用数据库函数原子性切换

export async function toggleFavorite(
  styleId: string
): Promise<ActionResponse<{ isFavorite: boolean }>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: { code: ErrorCode.NOT_AUTHENTICATED, message: '未登录' } }
  }

  // 检查风格是否存在
  const { data: style } = await supabase
    .from('styles')
    .select('id')
    .eq('id', styleId)
    .single()

  if (!style) {
    return { success: false, error: { code: ErrorCode.NOT_FOUND, message: '风格不存在' } }
  }

  // 使用 RPC 函数原子性切换
  const { data, error } = await supabase.rpc('toggle_favorite', {
    p_user_id: user.id,
    p_style_id: styleId,
  })

  if (error) {
    console.error('切换收藏失败:', error)
    return { success: false, error: { code: ErrorCode.INTERNAL_ERROR, message: '操作失败' } }
  }

  return { success: true, data: { isFavorite: data } }
}
```

```sql
-- 数据库函数：原子性切换收藏状态
CREATE OR REPLACE FUNCTION toggle_favorite(p_user_id UUID, p_style_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_favorite BOOLEAN;
BEGIN
  -- 尝试删除（如果已存在）
  DELETE FROM favorites
  WHERE user_id = p_user_id AND style_id = p_style_id;

  -- 检查是否删除成功
  IF NOT FOUND THEN
    -- 删除失败说明不存在，执行插入
    INSERT INTO favorites (user_id, style_id)
    VALUES (p_user_id, p_style_id);
    v_is_favorite := TRUE;

    -- 更新计数
    UPDATE styles
    SET favorites_count = favorites_count + 1
    WHERE id = p_style_id;
  ELSE
    -- 删除成功，更新计数
    UPDATE styles
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = p_style_id;
    v_is_favorite := FALSE;
  END IF;

  RETURN v_is_favorite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 13.2 空状态处理

#### 列表为空

```typescript
// 空状态统一返回
export async function getStyles(
  options: GetStylesOptions
): Promise<ActionResponse<GetStylesResult>> {
  // ... 查询逻辑

  if (!styles || styles.length === 0) {
    return {
      success: true,
      data: {
        styles: [],
        total: 0,
        hasMore: false,
      },
    }
  }

  return { success: true, data: { styles, total, hasMore } }
}
```

#### 用户未登录

```typescript
// 需要登录的功能，未登录时返回引导信息
export async function getFavorites(): Promise<ActionResponse<FavoritesResult>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: {
        code: ErrorCode.NOT_AUTHENTICATED,
        message: '请先登录',
      },
    }
  }

  // ... 正常逻辑
}
```

### 13.3 分页边界

#### 页码校验

```typescript
export async function getStyles(
  options: GetStylesOptions
): Promise<ActionResponse<GetStylesResult>> {
  const { page = 1, limit = 12 } = options

  // 页码校验
  if (page < 1) {
    return {
      success: false,
      error: { code: ErrorCode.INVALID_PAGE, message: '页码必须大于 0' },
    }
  }

  // ... 查询逻辑

  // 精确计算是否有更多
  const hasMore = count !== null && (page * limit) < count

  return {
    success: true,
    data: { styles, total: count || 0, hasMore },
  }
}
```

#### 无限滚动边界

```typescript
// 无限滚动使用 cursor 而非 page
export async function getStylesInfinite({
  cursor,
  limit = 12,
}: {
  cursor?: string
  limit?: number
}): Promise<ActionResponse<{ styles: Style[]; nextCursor?: string }>> {
  const supabase = await createClient()

  let query = supabase
    .from('styles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit + 1) // 多取一个判断是否有更多

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: { code: ErrorCode.INTERNAL_ERROR, message: '查询失败' } }
  }

  const hasMore = data.length > limit
  const styles = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? data[limit].created_at : undefined

  return {
    success: true,
    data: { styles, nextCursor },
  }
}
```

### 13.4 网络异常

#### 请求超时

```typescript
// TanStack Query 超时配置
export function useStyles(options: GetStylesOptions) {
  return useQuery({
    queryKey: ['styles', options],
    queryFn: async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 秒超时

      try {
        const result = await getStyles(options)
        clearTimeout(timeoutId)
        return result
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接')
        }
        throw error
      }
    },
    retry: (failureCount, error) => {
      // 超时不重试，其他错误重试 2 次
      return error.message !== '请求超时，请检查网络连接' && failureCount < 2
    },
  })
}
```

#### 离线状态检测

```typescript
// 检测离线状态
export function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return online
}

// 使用
export function StyleCard({ style }: { style: Style }) {
  const online = useOnlineStatus()

  const handleFavorite = () => {
    if (!online) {
      toast.error('当前离线，无法收藏')
      return
    }
    // 执行收藏
  }
}
```

### 13.5 数据一致性

#### 缓存失效策略

```typescript
// 统一缓存管理
export const CacheKeys = {
  styles: {
    list: 'styles:list',
    detail: (id: string) => `styles:detail:${id}`,
    comments: (id: string) => `styles:comments:${id}`,
  },
  user: {
    profile: (id: string) => `user:profile:${id}`,
    favorites: (id: string) => `user:favorites:${id}`,
  },
}

// 失效函数
export function invalidateStyleCache(
  queryClient: QueryClient,
  styleId?: string
) {
  // 失效风格列表
  queryClient.invalidateQueries({ queryKey: [CacheKeys.styles.list] })

  // 失效特定风格详情
  if (styleId) {
    queryClient.invalidateQueries({ queryKey: [CacheKeys.styles.detail(styleId)] })
    queryClient.invalidateQueries({ queryKey: [CacheKeys.styles.comments(styleId)] })
  }
}
```

#### 计数同步触发器

```sql
-- 使用触发器保持计数同步
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 新增收藏/点赞/评论，重新计算计数
    IF TG_TABLE_NAME = 'favorites' THEN
      UPDATE styles
      SET favorites_count = (SELECT COUNT(*) FROM favorites WHERE style_id = NEW.style_id)
      WHERE id = NEW.style_id;
    END IF;
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE styles
      SET likes_count = (SELECT COUNT(*) FROM likes WHERE style_id = NEW.style_id)
      WHERE id = NEW.style_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 删除收藏/点赞/评论，重新计算计数
    IF TG_TABLE_NAME = 'favorites' THEN
      UPDATE styles
      SET favorites_count = GREATEST(favorites_count - 1, 0)
      WHERE id = OLD.style_id;
    END IF;
    IF TG_TABLE_NAME = 'likes' THEN
      UPDATE styles
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = OLD.style_id;
    END IF;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER sync_favorites_count
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_style_counts();

CREATE TRIGGER sync_likes_count
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_style_counts();
```

### 13.6 安全边界

#### 输入长度限制

```typescript
// Schema 中明确限制
export const createCommentSchema = z.object({
  styleId: z.string().uuid(),
  content: z
    .string()
    .min(1, '内容不能为空')
    .max(1000, '评论内容最多 1000 个字符'),
  parentId: z.string().uuid().optional(),
})
```

#### 标签数量限制

```typescript
export const createStyleSchema = z.object({
  // ...
  tags: z
    .array(z.string())
    .min(1, '至少选择一个标签')
    .max(10, '最多选择 10 个标签'),
})
```

#### SQL 注入防护

```typescript
// 永远使用参数化查询，Supabase 客户端会处理转义
// 正确示范：
const { data } = await supabase
  .from('styles')
  .select('*')
  .ilike('name', `%${userInput}%`)
```

### 13.7 错误恢复与降级

#### 实时连接失败降级为轮询

```typescript
// 如果实时连接失败，降级为轮询
export function useComments(styleId: string) {
  const [useRealtime, setUseRealtime] = useState(true)

  const { data, error, refetch } = useQuery({
    queryKey: ['comments', styleId],
    queryFn: () => getComments(styleId),
    retry: 3,
  })

  // 实时订阅
  useEffect(() => {
    if (!useRealtime || error) {
      // 降级为每 30 秒轮询
      const interval = setInterval(() => refetch(), 30000)
      return () => clearInterval(interval)
    }

    const supabase = createClient()
    const channel = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `style_id=eq.${styleId}` },
        () => refetch()
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          setUseRealtime(false)
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [styleId, useRealtime, error, refetch])

  return { data, error, isLoading: !data }
}
```

---

## 14. 监控与日志

### 14.1 Sentry 集成

```typescript
// src/lib/sentry.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% 采样
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

### 14.2 Server Actions 错误捕获

```typescript
// 在 Server Actions 中使用
'use server'

import { captureException } from '@sentry/nextjs'

export async function someAction() {
  try {
    // 业务逻辑
  } catch (error) {
    captureException(error)
    return actionError('操作失败')
  }
}
```

### 14.3 性能监控

```typescript
// src/app/page.tsx
import { startSpan } from '@sentry/nextjs'

export default async function HomePage() {
  return startSpan({ name: 'HomePage Render' }, async () => {
    const styles = await getStyles()
    return <StyleGrid styles={styles} />
  })
}
```

### 14.4 关键指标追踪

```typescript
// 追踪关键业务指标
export async function trackStyleView(styleId: string) {
  Sentry.startSpan({
    name: 'Style View Tracking',
    op: 'tracking.style.view',
    data: { styleId },
  }, () => {
    // 追踪逻辑
  })
}
```

---

## 参考文档

- [docs/guides/supabase-guide.md](./guides/supabase-guide.md) - Supabase 使用指南
- [docs/research/supabase-technical-research.md](./research/supabase-technical-research.md) - Supabase 技术调研
- [docs/database-schema.md](./database-schema.md) - StyleSnap 数据库 Schema 设计

---

## 附录：开发检查清单

### 开发新功能时

- [ ] 定义数据库 Schema（如有新表）
- [ ] 创建 RLS 策略
- [ ] 编写 Zod Schema
- [ ] 实现 Server Actions
- [ ] 添加错误处理
- [ ] 编写客户端 Hook（如需要）
- [ ] 添加 Sentry 错误捕获

### 提交前

- [ ] 运行 `pnpm lint`
- [ ] 运行 `pnpm typecheck`
- [ ] 运行 `pnpm test`
- [ ] 检查 RLS 策略是否正确
- [ ] 检查缓存失效是否正确

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
| 1.1 | 2026-03-22 | StyleSnap Team | 补充 API 端点合约（12 章）、边缘情况处理（13 章）、完善监控与日志（14 章） |
| 1.2 | 2026-03-23 | StyleSnap Team | 添加 Supabase 参考文档链接 |
