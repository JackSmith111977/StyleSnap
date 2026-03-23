# Supabase 技术调研报告

> 版本：1.0
> 创建日期：2026-03-23
> 用途：大模型上下文学习/团队技术参考
> 来源：Supabase 官方文档、GitHub、技术社区

---

## 1. 概述

### 1.1 产品定义

Supabase 是一个开源的 Firebase 替代品，也是一个开源的后端即服务 (Backend-as-a-Service, BaaS) 平台。其以开源关系型数据库 PostgreSQL 为核心，提供数据库、认证、存储、实时订阅及无服务器函数等集成服务。

### 1.2 发展历程

| 时间 | 事件 |
|------|------|
| 2025 年 4 月 | D 轮融资 2 亿美元，估值 20 亿美元 |
| 2025 年 10 月 | 正式推出（4 年测试期结束） |
| 2025 年 10 月 | 新一轮融资 1 亿美元，估值 50 亿美元（独角兽） |
| 2025 年 | 开发者数量从 100 万激增至 400 万 |
| 2025 年 | Stack Overflow 调查：使用率从 3.8% 增至 5.4% |
| 2025 年 12 月 | 向量数据库市场被列为领导者之一 |

### 1.3 市场定位

- **目标用户**：全栈开发者、前端开发者、独立开发者、中小企业
- **竞争对手**：Firebase、AWS Amplify、Appwrite
- **差异化优势**：
  - 完整 PostgreSQL（非修改版）
  - 开源、无供应商锁定
  - SQL 优先、关系型数据模型
  - 自动生成 API（PostgREST）

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      客户端应用                              │
│         (Web / Mobile / Desktop / Server)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Kong API Gateway                           │
│             (请求路由、限流、认证、日志)                      │
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
              │  │  auth.users     │  │
              │  └─────────────────┘  │
              └───────────────────────┘
```

### 2.2 核心组件

| 组件 | 技术 | 功能 |
|------|------|------|
| **Database** | PostgreSQL 15+ | 关系型数据库、50+ 扩展 |
| **PostgREST** | Haskell | 自动生成 RESTful API |
| **Realtime** | Elixir | WebSocket 实时订阅 |
| **GoTrue** | Go | JWT 认证服务 |
| **Storage** | Rust | 对象存储（兼容 S3） |
| **Edge Functions** | Deno (TypeScript) | 无服务器边缘函数 |
| **Kong** | Lua/Nginx | API 网关 |

### 2.3 核心扩展

| 扩展 | 用途 |
|------|------|
| `pgcrypto` | 加密函数（gen_random_uuid 等） |
| `pgvector` | 向量相似度搜索（AI/Embedding） |
| `PostGIS` | 地理空间数据 |
| `uuid-ossp` | UUID 生成 |
| `pgaudit` | 审计日志 |
| `wal2json` | WAL 日志 JSON 输出（Realtime 使用） |

---

## 3. 核心模块详解

### 3.1 Database（数据库）

#### 核心特性

- 完整 PostgreSQL 15+，未修改
- 支持所有 PG 特性：触发器、存储过程、视图、物化视图等
- 50+ 预装扩展
- 自动生成 RESTful API（PostgREST）
- 实时订阅支持（Realtime）

#### API 使用示例

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://project.supabase.co',
  'anon-key'
)

// SELECT
const { data } = await supabase
  .from('posts')
  .select('id, title, author:profiles(username)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10)

// INSERT
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...', author_id: userId })
  .select()
  .single()

// UPDATE
const { data } = await supabase
  .from('posts')
  .update({ views: views + 1 })
  .eq('id', postId)
  .select()
  .single()

// DELETE
await supabase
  .from('posts')
  .delete()
  .eq('id', postId)

// UPSERT
await supabase
  .from('styles')
  .upsert({ id: existingId, title: 'Updated', updated_at: new Date() })

// RPC（调用存储过程）
const { data } = await supabase
  .rpc('get_related_posts', { post_id: postId, limit: 5 })
```

#### 高级查询

```typescript
// 模糊搜索
const { data } = await supabase
  .from('posts')
  .select()
  .ilike('title', '%search%')

// 全文搜索
const { data } = await supabase
  .from('posts')
  .select()
  .textSearch('content', 'keyword', {
    config: 'english',
    type: 'plainto_tsquery'
  })

// 范围查询
const { data } = await supabase
  .from('events')
  .select()
  .gte('start_time', '2024-01-01')
  .lt('end_time', '2024-12-31')

// IN 查询
const { data } = await supabase
  .from('posts')
  .select()
  .in('category_id', ['id1', 'id2', 'id3'])

// OR 查询
const { data } = await supabase
  .from('posts')
  .select()
  .or('status.eq.published,author_id.eq.' + userId)

// 聚合
const { data } = await supabase
  .from('posts')
  .select('category_id, count')

// 去重计数
const { data } = await supabase
  .from('posts')
  .select('id', { count: 'exact', distinct: true })
```

---

### 3.2 Auth（认证）

#### 核心特性

- 基于 GoTrue 服务
- JWT 令牌（有效期 1 小时，可配置）
- Refresh Token 机制
- 支持多种登录方式
- 内置 RLS 集成（auth.uid()、auth.role()）

#### 支持的登录方式

| 方式 | 说明 |
|------|------|
| **邮箱 + 密码** | 传统认证，支持邮箱验证 |
| **密码less** | 魔术链接、一次性密码（OTP） |
| **OAuth** | Google, GitHub, Discord, GitLab, Bitbucket, Azure, Apple 等 |
| **手机短信** | Twilio 集成 |
| **SSO** | SAML、OIDC（企业版） |

#### 认证流程

```
注册流程：
用户提交注册 → GoTrue 创建 auth.users → 发送验证邮件 → 用户点击链接 → 账户激活

登录流程：
用户提交凭证 → GoTrue 验证 → 返回 JWT + Refresh Token → 客户端存储 → 请求时携带 JWT

令牌刷新：
JWT 过期 → 使用 Refresh Token 请求新令牌 → 验证成功 → 返回新 JWT
```

#### API 使用示例

```typescript
// 注册
const { user, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      username: 'john',
      full_name: 'John Doe'
    },
    emailRedirectTo: 'https://app.com/auth/callback'
  }
})

// 登录（邮箱密码）
const { user, session } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// 登出
await supabase.auth.signOut()

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()

// 刷新会话
const { data: { session } } = await supabase.auth.refreshSession()

// 监听认证状态变化
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
  // 事件类型：
  // - INITIAL_SESSION
  // - SIGNED_IN
  // - SIGNED_OUT
  // - TOKEN_REFRESHED
  // - USER_UPDATED
  // - PASSWORD_RECOVERY
})

// 密码重置
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'https://app.com/reset-password'
})

// 更新用户信息
await supabase.auth.updateUser({
  email: 'new@example.com',
  password: 'newpassword',
  data: { full_name: 'New Name' }
})

// OAuth 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://app.com/auth/callback',
    scopes: 'read:user user:email',
    queryParams: { prompt: 'consent' }
  }
})
```

#### Next.js SSR 集成

```typescript
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

// Server Component 中使用
async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Welcome {user.email}</div>
}
```

---

### 3.3 Storage（存储）

#### 核心特性

- 兼容 S3 的对象存储
- 存储桶（Bucket）概念
- 与数据库 RLS 集成
- 文件转换（缩放、裁剪、格式化）
- CDN 分发

#### 存储桶类型

| 类型 | 说明 |
|------|------|
| **Public** | 公开访问，无需认证 |
| **Private** | 需要认证和权限 |

#### API 使用示例

```typescript
// 上传文件
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`user-${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/png'
  })

// 上传大文件（分片）
const { data, error } = await supabase.storage
  .from('videos')
  .uploadToMultipart(
    'large-video.mp4',
    file,
    {
      chunkSize: 10 * 1024 * 1024 // 10MB
    }
  )

// 获取公开 URL
const { data } = supabase.storage
  .from('avatars')
  .getPublicUrl('user-123/avatar.png')
// 返回：https://project.supabase.co/storage/v1/object/public/avatars/...

// 获取签名 URL（临时访问）
const { data } = await supabase.storage
  .from('private-files')
  .createSignedUrl('user-123/document.pdf', 60) // 60 秒有效

// 下载文件
const { data, error } = await supabase.storage
  .from('avatars')
  .download('user-123/avatar.png')
// 返回 Blob

// 复制文件
await supabase.storage
  .from('avatars')
  .copy('user-123/avatar.png', 'user-456/avatar.png')

// 移动文件
await supabase.storage
  .from('avatars')
  .move('user-123/avatar.png', 'user-456/avatar.png')

// 删除文件
await supabase.storage
  .from('avatars')
  .remove(['user-123/avatar.png'])

// 列出文件
const { data } = await supabase.storage
  .from('avatars')
  .list('user-123', {
    limit: 10,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' }
  })

// 创建存储桶
await supabase.storage.createBucket('my-bucket', {
  public: false,
  fileSizeLimit: 10 * 1024 * 1024 // 10MB
})
```

#### 图片转换

```typescript
// 获取转换后的图片 URL
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('photo.jpg', {
    transform: {
      width: 200,
      height: 200,
      resize: 'cover', // cover | contain | fill
      format: 'webp',  // webp | png | jpg
      quality: 80
    }
  })
```

---

### 3.4 Edge Functions（边缘函数）

#### 核心特性

- Deno 运行时
- TypeScript 支持
- 全球边缘部署
- 与 Supabase 服务集成
- 按执行次数和时长计费

#### 部署流程

```bash
# 登录
npx supabase login

# 链接项目
npx supabase link --project-ref xxx

# 部署函数
npx supabase functions deploy my-function
```

#### 函数结构

```
supabase/
└── functions/
    └── my-function/
        ├── index.ts      # 主入口
        └── _config.ts    # 配置（可选）
```

#### 函数示例

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, body } = await req.json()

    // 创建 Supabase 客户端（使用服务角色密钥）
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // 验证用户
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(authHeader.split(' ')[1])

    if (userError) {
      throw new Error('Unauthorized')
    }

    // 发送邮件逻辑（如调用 Resend API）
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`
      },
      body: JSON.stringify({
        from: 'no-reply@example.com',
        to,
        subject,
        html: body
      })
    })

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
```

#### 调用边缘函数

```typescript
// 从客户端调用
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Hello',
    body: '<h1>Hi!</h1>'
  }
})

// 从服务端调用（带认证）
const { data: { session } } = await supabase.auth.getSession()
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { to, subject, body },
  headers: {
    Authorization: `Bearer ${session?.access_token}`
  }
})
```

---

### 3.5 Realtime（实时）

#### 核心特性

- 基于 PostgreSQL 的逻辑复制
- WebSocket 协议
- 支持事件过滤
- 断线重连

#### 工作原理

```
PostgreSQL WAL (Write-Ahead Log)
         ↓
   Realtime 服务（Elixir）
         ↓
    WebSocket 推送
         ↓
      客户端
```

#### API 使用示例

```typescript
// 监听表变更
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: '*',          // INSERT | UPDATE | DELETE
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('Change received!', payload)
      // payload: { eventType, schema, table, new, old, commitTimestamp }
    }
  )
  .subscribe()

// 监听特定事件
const channel = supabase
  .channel('new-messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    },
    handleNewMessage
  )
  .subscribe()

// 带过滤
const channel = supabase
  .channel('user-messages')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'messages',
      filter: 'user_id=eq.123'  // 只监听 user_id=123 的变更
    },
    handleMessage
  )
  .subscribe()

// 监听多个事件
const channel = supabase
  .channel('room-1')
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, handleInsert)
  .on('postgres_changes', { event: 'UPDATE', table: 'messages' }, handleUpdate)
  .on('postgres_changes', { event: 'DELETE', table: 'messages' }, handleDelete)
  .subscribe()

// 取消订阅
await supabase.removeChannel(channel)

// 批量取消
await supabase.removeAllChannels()
```

#### 广播和 Presence

```typescript
// 广播消息（客户端之间）
const channel = supabase.channel('room-1')

channel.on('broadcast', { event: 'cursor' }, (payload) => {
  console.log(payload)
})

channel.send({
  type: 'broadcast',
  event: 'cursor',
  payload: { x: 100, y: 200 }
})

// Presence（在线状态）
const channel = supabase.channel('presence-room')

channel.on('presence', { event: 'sync' }, () => {
  const state = channel.presenceState()
  console.log('Online users:', state)
})

channel.track({ user_id: 123, status: 'online' })
```

---

## 4. RLS 行级安全

### 4.1 概念解释

RLS (Row-Level Security) 是 PostgreSQL 的数据库层面安全机制，能够强制规定："当前登录的用户，只能看到和操作表中属于他的那一行数据。"

**比喻**：
- **没有 RLS**：健身房储物柜都敞开，用户有万能钥匙
- **启用 RLS**：每个柜子有指纹锁，只能打开匹配自己指纹的柜子

### 4.2 为什么需要 RLS

Supabase 的数据库通过 PostgREST 暴露公开 REST API。如果没有 RLS：

```
攻击者 → 直接调用 API → SELECT * FROM users → 获取所有用户数据
```

启用 RLS 后：

```
攻击者 → 调用 API → RLS 过滤 → 只返回有权访问的数据
```

### 4.3 配置步骤

```sql
-- 步骤 1：启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 步骤 2：创建策略
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_user_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
```

### 4.4 常用策略模板

```sql
-- 公开读取（所有人都能看）
CREATE POLICY "public_read" ON table_name
  FOR SELECT USING (true);

-- 仅认证用户读取
CREATE POLICY "auth_read" ON table_name
  FOR SELECT USING (auth.role() = 'authenticated');

-- 仅所有者访问（最常用）
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

-- 多条件组合
CREATE POLICY "complex_policy" ON table_name
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    status = 'draft' AND
    created_at > NOW() - INTERVAL '1 day'
  );
```

### 4.5 最佳实践

| 实践 | 说明 |
|------|------|
| **始终启用 RLS** | 所有表都必须启用，包括新表 |
| **最小权限原则** | 只授予必要的权限 |
| **使用 auth.uid()** | 不要信任客户端传入的用户 ID |
| **测试策略** | 使用不同用户测试访问权限 |
| **文档化** | 记录每个策略的目的 |
| **审计日志** | 使用 pgaudit 扩展记录 RLS 决策 |

### 4.6 安全事件案例

2024 年某 SaaS 公司数据泄露事件：
- **原因**：未启用 RLS
- **泄露数据**：用户邮箱、姓名、订阅状态、余额、交易记录
- **未泄露**：信用卡信息（由支付平台处理）
- **后果**：支付平台封禁、资金冻结 90 天

**教训**：「我用了 Supabase 就安全了」是错误认知。Supabase 给了你枪，但子弹要自己上。

---

## 5. 最佳实践

### 5.1 数据库设计

```sql
-- 使用 UUID 主键
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- 时间戳字段
CREATE TABLE styles (
  ...
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 软删除
CREATE TABLE comments (
  ...
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES profiles(id)
);

-- 外键约束
CREATE TABLE favorites (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  UNIQUE(user_id, style_id)
);

-- 枚举类型
CREATE TYPE style_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');
```

### 5.2 索引策略

```sql
-- 外键索引（自动创建？不，需要手动）
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_style ON favorites(style_id);

-- 常用查询字段
CREATE INDEX idx_styles_category ON styles(category_id);
CREATE INDEX idx_styles_created ON styles(created_at DESC);

-- 复合索引（注意列顺序）
CREATE INDEX idx_styles_category_created ON styles(category_id, created_at DESC);

-- 部分索引（只索引部分行）
CREATE INDEX idx_styles_published ON styles(id)
  WHERE status = 'published';

-- 全文搜索索引
CREATE INDEX idx_posts_search ON posts
  USING gin(to_tsvector('english', title || ' ' || content));
```

### 5.3 触发器模式

```sql
-- 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_styles_updated_at
  BEFORE UPDATE ON styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 自动计数
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE styles SET like_count = like_count - 1 WHERE id = OLD.style_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_style_counts
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_style_counts();

-- 自动创建 profile
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

### 5.4 查询优化

```typescript
// ✅ 只选择需要的字段
const { data } = await supabase
  .from('posts')
  .select('id, title, status')

// ✅ 使用关联查询
const { data } = await supabase
  .from('posts')
  .select(`
    id,
    title,
    author:profiles (
      id,
      username,
      avatar_url
    ),
    comments (
      id,
      content,
      user:profiles (username)
    )
  `)

// ✅ 使用范围
const { data } = await supabase
  .from('posts')
  .select('id, title')
  .gte('created_at', '2024-01-01')
  .lte('created_at', '2024-12-31')
  .limit(10)

// ❌ 避免 N+1 查询
// 错误做法：循环查询
for (const post of posts) {
  const { data } = await supabase
    .from('comments')
    .select()
    .eq('post_id', post.id)
}

// 正确做法：批量查询
const { data } = await supabase
  .from('comments')
  .select()
  .in('post_id', posts.map(p => p.id))
```

### 5.5 类型安全

```bash
# 生成 TypeScript 类型
npx supabase gen types typescript \
  --project-id ngebqqkpizzomyxevjer \
  > types/supabase.ts
```

```typescript
// types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      // ... 其他表
    }
  }
}

// 使用类型
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

async function createStyle(style: StyleInsert): Promise<Style> {
  const { data, error } = await supabase
    .from('styles')
    .insert(style)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 6. 常见问题

### 6.1 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| RLS 策略不生效 | 未启用 RLS | `ALTER TABLE ENABLE ROW LEVEL SECURITY` |
| 认证后仍为匿名 | Cookie 未设置 | 检查 SSR 配置、检查域名 |
| 文件上传失败 | 存储桶策略 | 检查 Storage RLS、检查 bucket 权限 |
| 实时订阅不工作 | WebSocket 被阻止 | 检查防火墙、代理设置 |
| 令牌刷新失败 | Refresh Token 过期 | 检查会话有效期设置 |
| 类型生成失败 | 项目 ID 错误 | 检查项目 Ref、检查网络连接 |

### 6.2 安全注意事项

| ⚠️ 注意 | 说明 |
|--------|------|
| **永远不要信任客户端** | 所有验证必须在数据库层（RLS）完成 |
| **Anon Key 是公开的** | 可以放在前端，依赖 RLS 保护 |
| **Service Role Key 保密** | 等同于管理员密码，只能服务端使用 |
| **测试 RLS 策略** | 使用不同用户测试访问权限 |
| **检查数据库直接访问** | 确保没有绕过 RLS 的后门 |

### 6.3 性能优化

| 优化项 | 说明 |
|--------|------|
| **连接池** | 使用 Supavisor（PgBouncer） |
| **缓存** | 客户端缓存 + CDN + 数据库缓存 |
| **索引** | 为常用查询创建索引 |
| **物化视图** | 预计算复杂查询结果 |
| **分页** | 使用 keyset 分页而非 offset |

---

## 7. 参考资源

### 7.1 官方文档

- [Supabase 官方文档](https://supabase.com/docs)
- [JavaScript 客户端文档](https://supabase.com/docs/reference/javascript)
- [PostgreSQL 文档](https://postgresql.org/docs)
- [PostgREST 文档](https://postgrest.org)

### 7.2 社区资源

- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase Reddit](https://reddit.com/r/supabase)

### 7.3 学习路径

1. **入门**：创建项目 → 连接数据库 → 基本 CRUD
2. **进阶**：认证系统 → RLS → 实时订阅
3. **高级**：边缘函数 → 性能优化 → 安全审计

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
