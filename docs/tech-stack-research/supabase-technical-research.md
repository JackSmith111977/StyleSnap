# Supabase 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目数据库、认证、存储服务技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [Supabase 核心架构](#2-supabase-核心架构)
3. [Next.js 16 集成方案](#3-nextjs-16-集成方案)
4. [认证系统详解](#4-认证系统详解)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Supabase Storage](#6-supabase-storage)
7. [StyleSnap 项目应用建议](#7-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 Supabase 是什么？

**定位**：开源 Firebase 替代方案，提供完整的后端即服务（BaaS）

**核心服务**：

| 服务 | 说明 |
|------|------|
| **Database** | 基于 PostgreSQL，支持实时订阅 |
| **Authentication** | 内置用户系统，支持邮箱/密码 + OAuth |
| **Storage** | 文件存储，支持图片/视频/文档 |
| **Edge Functions** | 无服务器函数（Deno 运行时） |
| **Realtime** | 基于 Postgres 复制的实时订阅 |

### 1.2 为什么选择 Supabase？

| 优势 | 说明 |
|------|------|
| **PostgreSQL 原生** | 完整 SQL 支持，RLS 行级安全 |
| **开源** | 无厂商锁定，可自托管 |
| **免费额度充足** | 500MB 数据库，1GB 存储，5 万月活用户 |
| **Next.js 友好** | 官方 `@supabase/ssr` 包支持 App Router |
| **类型生成** | 自动生成 TypeScript 类型 |

### 1.3 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Supabase** | 开源、PostgreSQL、RLS 内置 | 国内访问速度一般 | 个人项目、开源项目 ⭐ |
| **Firebase** | 生态成熟、文档丰富 | 闭源、NoSQL 限制 | 已有 Firebase 生态项目 |
| **Vercel Postgres** | 部署同平台、低延迟 | 功能单一、无内置认证 | 仅需数据库的项目 |
| **Neon + Auth.js** | 分离架构、灵活性高 | 配置复杂 | 需要完全定制的项目 |

---

## 2. Supabase 核心架构

### 2.1 项目组成

```
StyleSnap Supabase 项目
├── Database (PostgreSQL)
│   ├── 表 (Tables)
│   ├── 视图 (Views)
│   ├── 函数 (Functions)
│   └── RLS 策略 (Policies)
├── Authentication
│   ├── 用户管理 (Users)
│   ├── 邮箱验证 (Email Verification)
│   └── OAuth 提供商 (Providers)
├── Storage
│   ├── 风格预览图 (style-previews)
│   ├── 用户头像 (user-avatars)
│   └── 代码片段 (code-snippets)
└── Edge Functions (可选)
    └── 自定义业务逻辑
```

### 2.2 数据库 Schema 设计

```sql
-- 风格表
CREATE TABLE styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  preview_image_url TEXT,
  code_snippet TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, style_id)
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_styles_category ON styles(category);
CREATE INDEX idx_styles_tags ON styles USING GIN(tags);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_comments_style_id ON comments(style_id);
```

### 2.3 客户端类型生成

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 关联项目
supabase link --project-ref your-project-ref

# 生成 TypeScript 类型
supabase gen types typescript --linked > src/types/supabase.ts
```

---

## 3. Next.js 16 集成方案

### 3.1 安装依赖

```bash
# 服务端集成包（Next.js 16 推荐）
npm install @supabase/ssr @supabase/supabase-js

# 或使用 pnpm
pnpm add @supabase/ssr @supabase/supabase-js
```

### 3.2 环境变量配置

```bash
# .env.local
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJxxx.xxx.xxx"
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJxxx.xxx.xxx"
```

### 3.3 客户端创建

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### 3.4 服务端客户端（Route Handlers）

```typescript
// src/lib/supabase/route-handler.ts
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

### 3.5 中间件集成

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 刷新用户会话
  const { data: { session } } = await supabase.auth.getSession()

  // 受保护的路由
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
}
```

### 3.6 React Hook 封装

```typescript
// src/hooks/use-supabase.ts
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { env } from '@/env'

type SupabaseContext = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
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
        setLoading(false)
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

  return (
    <Context.Provider value={{ user, loading, signOut }}>
      {children}
    </Context.Provider>
  )
}

export function useSupabase() {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used within SupabaseProvider')
  }
  return context
}
```

---

## 4. 认证系统详解

### 4.1 邮箱/密码认证

#### 4.1.1 用户注册

```typescript
// src/actions/auth/register.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(8, '密码至少 8 个字符'),
  confirmPassword: z.string(),
})

export async function registerAction(formData: FormData) {
  const result = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email, password } = result.data

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // 检查是否需要邮箱验证
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      message: '该邮箱已被注册，请登录',
      requiresVerification: true
    }
  }

  return {
    message: '注册成功，请检查邮箱验证链接',
    requiresVerification: true
  }
}
```

#### 4.1.2 用户登录

```typescript
// src/actions/auth/login.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(1, '请输入密码'),
})

export async function loginAction(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const { email, password } = result.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

#### 4.1.3 邮箱验证回调

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/route-handler'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 验证失败，返回登录页
  return NextResponse.redirect(`${origin}/login?error=验证失败`)
}
```

### 4.2 OAuth 认证（GitHub/Google）

#### 4.2.1 配置 OAuth 提供商

在 Supabase Dashboard 中配置：

1. **GitHub OAuth**：
   - Settings → Authentication → Providers → GitHub
   - 填入 Client ID 和 Client Secret
   - Redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`

2. **Google OAuth**：
   - Settings → Authentication → Providers → Google
   - 填入 Client ID 和 Client Secret
   - 启用 "Authorization code grant"

#### 4.2.2 OAuth 登录实现

```typescript
// src/actions/auth/oauth.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { redirect } from 'next/navigation'

export async function signInWithGitHub() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      scopes: 'read:user user:email',
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // 重定向到 OAuth 授权页
  redirect(data.url)
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  redirect(data.url)
}
```

### 4.3 密码重置

```typescript
// src/actions/auth/reset-password.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const resetSchema = z.object({
  email: z.string().email('无效的邮箱'),
})

export async function resetPasswordAction(formData: FormData) {
  const result = resetSchema.safeParse({
    email: formData.get('email'),
  })

  if (!result.success) {
    return { error: result.error.errors[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(
    result.data.email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    }
  )

  if (error) {
    return { error: error.message }
  }

  return { message: '密码重置链接已发送到邮箱' }
}
```

### 4.4 受保护的路由

```typescript
// src/components/auth/protected-route.tsx
'use client'

import { useSupabase } from '@/hooks/use-supabase'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>加载中...</div>
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
```

---

## 5. Row Level Security (RLS)

### 5.1 什么是 RLS？

**定义**：PostgreSQL 行级安全策略，限制用户可以访问或修改的数据行

**为什么需要**：即使客户端使用 anon key，RLS 也能确保用户只能访问授权数据

### 5.2 RLS 策略设计

#### 5.2.1 启用 RLS

```sql
-- 为表启用 RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
```

#### 5.2.2 公共读取策略

```sql
-- 任何人都可以读取发布的风格
CREATE POLICY "公开读取风格"
  ON styles
  FOR SELECT
  USING (true);
```

#### 5.2.3 认证用户插入

```sql
-- 只有认证用户可以插入新风格
CREATE POLICY "认证用户插入风格"
  ON styles
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

#### 5.2.4 仅作者可更新/删除

```sql
-- 只有作者可以更新自己的风格
CREATE POLICY "作者更新风格"
  ON styles
  FOR UPDATE
  USING (auth.uid() = author_id);

-- 只有作者可以删除自己的风格
CREATE POLICY "作者删除风格"
  ON styles
  FOR DELETE
  USING (auth.uid() = author_id);
```

#### 5.2.5 收藏表策略

```sql
-- 任何人都可以读取收藏
CREATE POLICY "公开读取收藏"
  ON favorites
  FOR SELECT
  USING (true);

-- 只有用户可以管理自己的收藏
CREATE POLICY "用户插入自己的收藏"
  ON favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户删除自己的收藏"
  ON favorites
  FOR DELETE
  USING (auth.uid() = user_id);
```

#### 5.2.6 评论表策略

```sql
-- 任何人都可以读取评论
CREATE POLICY "公开读取评论"
  ON comments
  FOR SELECT
  USING (true);

-- 认证用户可以插入评论
CREATE POLICY "认证用户插入评论"
  ON comments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 只有作者可以删除自己的评论
CREATE POLICY "作者删除评论"
  ON comments
  FOR DELETE
  USING (auth.uid() = author_id);
```

### 5.3 RLS 测试

```sql
-- 测试 RLS 策略
-- 1. 以匿名角色测试
SET LOCAL ROLE anon;

-- 2. 以认证角色测试
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" TO '{"sub": "user-uuid"}';

-- 3. 执行查询验证策略
SELECT * FROM styles;
```

### 5.4 常见陷阱

| 问题 | 解决方案 |
|------|----------|
| **忘记启用 RLS** | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` |
| **auth.uid() 返回 null** | 检查客户端是否正确传递认证 token |
| **服务角色绕过 RLS** | 服务端使用 `SERVICE_ROLE_KEY` 时会绕过 RLS，需谨慎使用 |
| **策略过于宽松** | 始终遵循最小权限原则 |

---

## 6. Supabase Storage

### 6.1 Storage 架构

```
Supabase Storage
├── 存储桶 (Buckets)
│   ├── style-previews (风格预览图)
│   ├── user-avatars (用户头像)
│   └── code-snippets (代码片段)
└── 文件夹结构
    └── {user_id}/
        └── {style_id}/
            └── preview.png
```

### 6.2 创建存储桶

```sql
-- 创建存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('style-previews', 'style-previews', true),
  ('user-avatars', 'user-avatars', true),
  ('code-snippets', 'code-snippets', false);
```

### 6.3 Storage RLS 策略

```sql
-- 公开读取预览图
CREATE POLICY "公开读取预览图"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'style-previews');

-- 认证用户上传预览图
CREATE POLICY "认证用户上传预览图"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'style-previews' AND
    auth.role() = 'authenticated'
  );

-- 只有作者可以删除自己的文件
CREATE POLICY "作者删除预览图"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'style-previews' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 6.4 文件上传

```typescript
// src/actions/storage/upload-preview.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { revalidatePath } from 'next/cache'

export async function uploadPreviewAction(formData: FormData) {
  const supabase = await createClient()

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '未登录' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: '请选择文件' }
  }

  // 生成唯一文件名
  const fileExt = file.name.split('.').pop()
  const fileName = `${crypto.randomUUID()}.${fileExt}`
  const path = `${user.id}/${fileName}`

  // 上传文件
  const { data, error } = await supabase.storage
    .from('style-previews')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { error: error.message }
  }

  // 获取公开访问 URL
  const { data: { publicUrl } } = supabase.storage
    .from('style-previews')
    .getPublicUrl(path)

  revalidatePath('/dashboard')
  return { url: publicUrl }
}
```

### 6.5 图片预览

```typescript
// src/components/style/style-preview.tsx
import Image from 'next/image'

interface StylePreviewProps {
  imageUrl: string
  alt: string
}

export function StylePreview({ imageUrl, alt }: StylePreviewProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
```

### 6.6 文件删除

```typescript
// src/actions/storage/delete-file.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'

export async function deleteFileAction(bucket: string, path: string) {
  const supabase = await createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
```

---

## 7. StyleSnap 项目应用建议

### 7.1 推荐配置清单

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| **免费计划** | ✅ 足够 | 500MB 数据库，1GB 存储，5 万月活 |
| **区域选择** | ap-northeast-1 (东京) | 亚洲访问速度最优 |
| **邮箱验证** | ✅ 启用 | 防止垃圾注册 |
| **OAuth 提供商** | GitHub + Google | 开发者常用 |
| **RLS 策略** | 最小权限原则 | 默认拒绝，按需授权 |

### 7.2 数据库初始化脚本

```sql
-- 1. 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建风格表
CREATE TABLE IF NOT EXISTS styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  preview_image_url TEXT,
  code_snippet TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, style_id)
);

-- 4. 创建评论表
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_styles_category ON styles(category);
CREATE INDEX IF NOT EXISTS idx_styles_tags ON styles USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_style_id ON comments(style_id);

-- 6. 启用 RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 7. 创建 RLS 策略（见 5.2 节）
```

### 7.3 项目目录结构

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts           # 浏览器客户端
│       ├── route-handler.ts    # Route Handler 客户端
│       └── server.ts           # Server Component 客户端
├── hooks/
│   ├── use-supabase.ts         # Supabase Hook
│   └── use-user.ts             # 用户状态 Hook
├── actions/
│   └── auth/
│       ├── login.ts            # 登录 Action
│       ├── register.ts         # 注册 Action
│       ├── oauth.ts            # OAuth Action
│       └── reset-password.ts   # 密码重置 Action
├── components/
│   └── auth/
│       ├── login-form.tsx      # 登录表单
│       ├── register-form.tsx   # 注册表单
│       ├── oauth-buttons.tsx   # OAuth 按钮
│       └── protected-route.tsx # 受保护路由
└── app/
    └── auth/
        └── callback/
            └── route.ts        # 认证回调
```

### 7.4 安全最佳实践

| 实践 | 说明 |
|------|------|
| **永远不要在前端使用 `SERVICE_ROLE_KEY`** | 仅服务端可以使用，会绕过 RLS |
| **始终启用 RLS** | 即使表只有公开数据 |
| **使用 `auth.uid()` 验证所有权** | 不要信任客户端传递的用户 ID |
| **定期轮换密钥** | Supabase Dashboard 可重新生成 |
| **监控数据库用量** | 免费计划接近限制时升级 |

### 7.5 性能优化建议

| 优化项 | 方案 |
|--------|------|
| **连接池** | 使用 Supabase 内置连接池，无需额外配置 |
| **索引优化** | 为常用查询字段创建索引 |
| **图片优化** | 使用 `?width=xxx` 参数获取缩略图 |
| **实时订阅** | 仅在需要时开启，及时取消订阅 |
| **缓存策略** | 使用 `revalidatePath` 和 `revalidateTag` |

---

## 附录：常见问题 FAQ

### Q1: 如何处理邮箱验证？

**A**: 在 Supabase Dashboard → Authentication → Email Templates 中自定义邮件模板。默认会发送包含验证链接的邮件。

### Q2: OAuth 回调地址是什么？

**A**: `https://[project-ref].supabase.co/auth/v1/callback`，同时在项目中配置 `NEXT_PUBLIC_SITE_URL/auth/callback`

### Q3: 如何在本地开发测试 RLS？

**A**: 使用 `supabase start` 启动本地实例，使用 SQL Editor 测试策略。

### Q4: Storage 上传失败怎么办？

**A**: 检查：1) 存储桶是否存在 2) RLS 策略是否正确 3) 文件大小是否超限

### Q5: 如何备份数据？

**A**: Supabase 自动每日备份，可在 Dashboard 下载。也可使用 `pg_dump` 手动备份。

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
