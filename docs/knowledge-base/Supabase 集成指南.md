# Supabase 完全指南

> 版本：1.0
> 创建日期：2026-03-23
> 基于：Supabase 官方文档及行业最佳实践

---

## 目录

1. [Supabase 概述](#1-supabase-概述)
2. [核心架构](#2-核心架构)
3. [核心模块详解](#3-核心模块详解)
4. [使用方法](#4-使用方法)
5. [RLS 行级安全](#5-rls-行级安全)
6. [最佳实践](#6-最佳实践)
7. [常见问题](#7-常见问题)

---

## 1. Supabase 概述

### 1.1 什么是 Supabase

**Supabase** = **开源的 Firebase 替代品** + **PostgreSQL 为核心的 BaaS 平台**

| 特性 | 说明 |
|------|------|
| **定位** | Backend-as-a-Service (BaaS) |
| **核心** | PostgreSQL 15+ |
| **性质** | 开源 + 托管服务 |
| **估值** | 50 亿美元 (2025) |
| **开发者** | 400 万+ (2025) |

### 1.2 为什么选择 Supabase

| 优势 | 说明 |
|------|------|
| **完整 PostgreSQL** | 非修改版，支持所有 PG 特性 |
| **自动生成 API** | PostgREST 将数据库直接变为 RESTful API |
| **实时订阅** | 监听数据库变更，WebSocket 推送 |
| **内置认证** | GoTrue 处理 JWT 认证 |
| **对象存储** | 兼容 S3 的 Storage |
| **边缘函数** | Deno 运行时无服务器函数 |

### 1.3 技术栈组成

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase 技术栈                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  核心层：PostgreSQL 15+                                      │
│  ├─ 50+ 扩展 (pgvector, PostGIS, pgcrypto)                  │
│  └─ 完整 SQL 支持                                             │
│                                                              │
│  API 层：                                                   │
│  ├─ PostgREST → 自动 REST API                               │
│  ├─ Realtime → WebSocket 实时订阅                           │
│  └─ GraphQL (可选)                                          │
│                                                              │
│  服务层：                                                   │
│  ├─ GoTrue → 认证 (JWT)                                     │
│  ├─ Storage → 对象存储 (兼容 S3)                            │
│  ├─ Edge Functions → 无服务器函数 (Deno)                    │
│  └─ Kong → API 网关                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端应用                              │
│         (Web / Mobile / Desktop / Server)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Kong API Gateway                       │
│                   (请求路由、限流、认证)                     │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ PostgREST │   │ Realtime  │   │  Storage  │
    │  REST API │   │ WebSocket │   │    S3     │
    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
              ┌───────────────────────┐
              │   PostgreSQL 15+      │
              │  ┌─────────────────┐  │
              │  │  RLS 策略       │  │
              │  │  Triggers       │  │
              │  │  Extensions     │  │
              │  └─────────────────┘  │
              └───────────────────────┘
```

### 2.2 数据流

```
用户操作 → SDK → API Gateway → 服务层 → PostgreSQL → RLS 检查 → 返回结果
                                                      ↓
                                              触发器 → 实时推送
```

### 2.3 部署模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **托管云** | Supabase.com 托管 | 快速启动、小团队 |
| **自托管** | Docker/K8s 自行部署 | 数据合规、大型企业 |
| **混合** | 开发用云、生产自托管 | 平衡成本和管控 |

---

## 3. 核心模块详解

### 3.1 Database (数据库)

**核心特性**：
- 完整 PostgreSQL 15+
- 50+ 预装扩展
- 自动生成 RESTful API
- 实时订阅支持

**常用扩展**：
| 扩展 | 用途 |
|------|------|
| `pgcrypto` | 加密函数（gen_random_uuid） |
| `pgvector` | 向量相似度搜索（AI 应用） |
| `PostGIS` | 地理空间数据 |
| `uuid-ossp` | UUID 生成 |

**使用示例**：
```ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, anonKey)

// 查询
const { data } = await supabase
  .from('posts')
  .select('id, title, author:profiles(username)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)

// 插入
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...' })
  .select()

// 更新
await supabase
  .from('posts')
  .update({ views: views + 1 })
  .eq('id', postId)

// 删除
await supabase
  .from('posts')
  .delete()
  .eq('id', postId)
```

---

### 3.2 Auth (认证)

**支持的登录方式**：
- 邮箱 + 密码
- 密码less（魔术链接）
- OAuth（Google, GitHub, Discord 等）
- 手机短信
- SSO（企业版）

**核心概念**：
| 概念 | 说明 |
|------|------|
| `auth.users` | 系统表，存储用户凭证 |
| `profiles` | 自定义用户资料表 |
| `JWT` | JSON Web Token，有效期 1 小时 |
| `Refresh Token` | 刷新访问令牌 |

**使用示例**：
```ts
// 注册
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: { username: 'john' },
    emailRedirectTo: 'https://app.com/confirm'
  }
})

// 登录
const { user, session } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// OAuth 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://app.com/auth/callback'
  }
})

// 登出
await supabase.auth.signOut()

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

---

### 3.3 Storage (存储)

**核心特性**：
- 兼容 S3 的对象存储
- 与数据库 RLS 集成
- 文件转换（缩放、裁剪）
- CDN 分发

**使用示例**：
```ts
// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`user-${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: false
  })

// 获取公开 URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.png')

// 获取签名 URL（临时访问）
const { data } = await supabase.storage
  .from('avatars')
  .createSignedUrl('user-123/avatar.png', 60) // 60 秒有效

// 删除文件
await supabase.storage
  .from('avatars')
  .remove(['user-123/avatar.png'])
```

---

### 3.4 Edge Functions (边缘函数)

**核心特性**：
- Deno 运行时
- 全球边缘部署
- 与数据库/认证集成
- 按执行计费

**使用示例**：
```ts
// 调用边缘函数
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to: 'user@example.com', subject: 'Hello' }
})

// 边缘函数代码（Deno）
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { to, subject } = await req.json()
  // 发送邮件逻辑
  return new Response(JSON.stringify({ success: true }))
})
```

---

### 3.5 Realtime (实时)

**核心特性**：
- 监听数据库变更
- WebSocket 推送
- 支持过滤和条件

**使用示例**：
```ts
// 监听表变更
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// 监听特定事件
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  filter: 'user_id=eq.123'
}, handleNewMessage)

// 取消订阅
await supabase.removeChannel(subscription)
```

---

## 4. 使用方法

### 4.1 安装 SDK

```bash
npm install @supabase/supabase-js
```

### 4.2 初始化客户端

```ts
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 4.3 Next.js 服务端客户端

```ts
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // Server Component 中忽略
          }
        }
      }
    }
  )
}
```

### 4.4 Server Actions 示例

```ts
// actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: '请检查邮箱验证邮件' }
}
```

---

## 5. RLS 行级安全

### 5.1 什么是 RLS

**RLS (Row-Level Security)** = 数据库层面的访问控制

```
没有 RLS:
用户 → SELECT * FROM table → 返回所有行

启用 RLS:
用户 → SELECT * FROM table → RLS 过滤 → 只返回用户有权访问的行
```

### 5.2 为什么需要 RLS

| 风险 | 说明 |
|------|------|
| **API 直接暴露数据** | Supabase 默认公开 REST API |
| **应用层防护不足** | 代码 bug 可能导致数据泄露 |
| **多租户隔离** | 确保用户只能访问自己的数据 |

### 5.3 RLS 配置步骤

**步骤 1：启用 RLS**
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

**步骤 2：创建策略**
```sql
-- 允许所有人查看
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- 允许用户更新自己的数据
CREATE POLICY "profiles_user_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 管理员完全访问
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### 5.4 常用策略模板

```sql
-- 公开读取
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (true);

-- 仅认证用户读取
CREATE POLICY "auth_read" ON table_name
  FOR SELECT USING (auth.role() = 'authenticated');

-- 仅所有者访问
CREATE POLICY "owner_only" ON table_name
  FOR ALL USING (user_id = auth.uid());

-- 基于角色访问
CREATE POLICY "admin_only" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 基于状态访问
CREATE POLICY "published_only" ON styles
  FOR SELECT USING (status = 'published');
```

### 5.5 RLS 最佳实践

| 实践 | 说明 |
|------|------|
| **始终启用 RLS** | 所有表都必须启用 |
| **最小权限原则** | 只授予必要的权限 |
| **使用 auth.uid()** | 不要信任客户端传入的用户 ID |
| **测试策略** | 确保策略按预期工作 |
| **记录策略** | 文档化每个策略的目的 |

---

## 6. 最佳实践

### 6.1 数据库设计

```sql
-- 使用 UUID 作为主键
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- 始终使用时间戳
CREATE TABLE styles (
  ...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 使用外键约束
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE
);

-- 使用枚举类型
CREATE TYPE style_status AS ENUM ('draft', 'published', 'archived');
```

### 6.2 索引优化

```sql
-- 常用查询字段
CREATE INDEX idx_styles_category ON styles(category_id);
CREATE INDEX idx_styles_created ON styles(created_at DESC);

-- 全文搜索
CREATE INDEX idx_styles_title_search ON styles
  USING gin(to_tsvector('simple', title));

-- 部分索引（只索引部分行）
CREATE INDEX idx_styles_published ON styles(id)
  WHERE status = 'published';
```

### 6.3 查询优化

```ts
// ✅ 好：只选择需要的字段
const { data } = await supabase
  .from('posts')
  .select('id, title, status')
  .eq('status', 'published')

// ❌ 差：选择所有字段
const { data } = await supabase
  .from('posts')
  .select('*')

// ✅ 好：使用关联查询
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    author:profiles (
      id,
      username,
      avatar_url
    )
  `)

// ✅ 好：使用范围查询
const { data } = await supabase
  .from('posts')
  .select('id, title')
  .gte('created_at', '2024-01-01')
  .lte('created_at', '2024-12-31')
```

### 6.4 错误处理

```ts
async function fetchStyles() {
  const { data, error } = await supabase
    .from('styles')
    .select('*')
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching styles:', error)
    throw new Error(`Failed to fetch: ${error.message}`)
  }

  return data
}
```

### 6.5 类型安全

```bash
# 生成 TypeScript 类型
npx supabase gen types typescript \
  --project-id your-project-id \
  > types/supabase.ts
```

```ts
// 使用生成的类型
import { Database } from '@/types/supabase'

type Style = Database['public']['tables']['styles']['Row']
type StyleInsert = Database['public']['tables']['styles']['Insert']

async function getStyle(id: string): Promise<Style | null> {
  const { data } = await supabase
    .from('styles')
    .select('*')
    .eq('id', id)
    .single()
  return data
}
```

---

## 7. 常见问题

### 7.1 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| RLS 策略不生效 | 未启用 RLS | `ALTER TABLE ENABLE ROW LEVEL SECURITY` |
| 认证后仍为匿名 | Cookie 未正确设置 | 检查 SSR 配置 |
| 文件上传失败 | 存储桶策略问题 | 检查 Storage RLS |
| 实时订阅不工作 | WebSocket 被阻止 | 检查防火墙/代理 |

### 7.2 安全注意事项

| ⚠️ 注意 | 说明 |
|--------|------|
| **永远不要信任客户端** | 所有验证必须在数据库层（RLS）完成 |
| **Anon Key 是公开的** | 可以放在前端，依赖 RLS 保护 |
| **Service Role Key 保密** | 等同于管理员密码 |
| **测试 RLS 策略** | 使用不同用户测试访问权限 |

---

## 附录

### A. 参考文档

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://postgresql.org/docs)
- [PostgREST 文档](https://postgrest.org)
- [Gotrue 认证](https://supabase.com/docs/guides/auth)

### B. 术语表

| 术语 | 说明 |
|------|------|
| **BaaS** | Backend-as-a-Service |
| **RLS** | Row-Level Security |
| **JWT** | JSON Web Token |
| **PostgREST** | 将 PostgreSQL 转为 REST API |
| **Edge Function** | 边缘计算函数 |

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
