# Supabase API 快速参考

> 最后更新：2026-04-04 | 基于 @supabase/supabase-js 2.x 和 @supabase/ssr 0.x

---

## 目录

1. [客户端初始化](#1-客户端初始化)
2. [数据库操作](#2-数据库操作)
3. [认证 (Auth)](#3-认证-auth)
4. [存储 (Storage)](#4-存储-storage)
5. [RLS 策略](#5-rls 策略)
6. [SSR 集成 (Next.js)](#6-ssr 集成-nextjs)
7. [常见模式](#7-常见模式)

---

## 1. 客户端初始化

### 1.1 浏览器客户端

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 1.2 SSR 客户端 (Next.js)

```typescript
// lib/supabase/server.ts
import { createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
```

### 1.3 Client Component 客户端

```typescript
// lib/supabase/client.ts
'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 2. 数据库操作

### 2.1 查询 (SELECT)

```typescript
// 基础查询
const { data, error } = await supabase
  .from('styles')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })

// 单条记录
const { data, error } = await supabase
  .from('styles')
  .select()
  .eq('id', id)
  .single()

// 计数
const { count, error } = await supabase
  .from('styles')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published')
```

### 2.2 关联查询 (Joins)

```typescript
// 一对一/多对一
const { data } = await supabase
  .from('styles')
  .select(`
    *,
    author:profiles (
      id,
      username,
      avatar_url
    )
  `)

// 一对多
const { data } = await supabase
  .from('categories')
  .select(`
    *,
    styles:styles (
      id,
      title,
      status
    )
  `)

// 多对多 (通过中间表)
const { data } = await supabase
  .from('favorites')
  .select(`
    style_id,
    created_at,
    styles:style_id (
      id,
      title,
      thumbnail_url
    )
  `)
  .eq('user_id', userId)
```

### 2.3 两步查询 (避免 RLS 冲突)

```typescript
// 问题：嵌套查询时两个表都有 RLS 会静默失败
// 解决：先查 ID 列表，再查完整数据

// 步骤 1: 获取 style_id 列表
const { data: favoritesData } = await supabase
  .from('favorites')
  .select('style_id, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// 步骤 2: 查询完整风格信息
const styleIds = favoritesData?.map(f => f.style_id) ?? []
const { data: stylesData } = await supabase
  .from('styles')
  .select(`
    *,
    category:categories (*),
    style_tags:style_tags (*)
  `)
  .in('id', styleIds)
```

### 2.4 插入 (INSERT)

```typescript
// 单条插入
const { data, error } = await supabase
  .from('styles')
  .insert({
    title: 'New Style',
    category_id: 1,
    author_id: userId,
  })
  .select()
  .single()

// 多条插入
const { data, error } = await supabase
  .from('tags')
  .insert([
    { name: 'tag1' },
    { name: 'tag2' },
  ])
  .select()
```

### 2.5 更新 (UPDATE)

```typescript
// 基础更新
const { data, error } = await supabase
  .from('styles')
  .update({ 
    title: 'Updated Title',
    updated_at: new Date().toISOString(),
  })
  .eq('id', styleId)
  .select()
  .single()

// 自增/自减
const { data, error } = await supabase
  .from('styles')
  .update({ 
    like_count: supabase.raw('like_count + 1')
  })
  .eq('id', styleId)
```

### 2.6 删除 (DELETE)

```typescript
const { error } = await supabase
  .from('styles')
  .delete()
  .eq('id', styleId)
```

### 2.7 模糊搜索

```typescript
// 基础 LIKE 查询
const { data } = await supabase
  .from('styles')
  .select('*')
  .ilike('title', `%${searchTerm}%`)

// 全文搜索 (需要配置)
const { data } = await supabase
  .from('styles')
  .select('*')
  .textSearch('description', `'${searchTerm}'`, {
    config: 'zhparser', // 中文分词
    type: 'plainto_tsquery',
  })
```

### 2.8 条件构建器

```typescript
let query = supabase.from('styles').select('*')

// 动态条件
if (status) {
  query = query.eq('status', status)
}

if (categoryId) {
  query = query.eq('category_id', categoryId)
}

if (searchTerm) {
  query = query.ilike('title', `%${searchTerm}%`)
}

// 分页
const page = 1
const pageSize = 10
const { data } = await query
  .range((page - 1) * pageSize, page * pageSize - 1)
```

---

## 3. 认证 (Auth)

### 3.1 注册

```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
    data: {
      username: 'Kei',
    },
  },
})
```

### 3.2 登录

```typescript
// 邮箱密码登录
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// OAuth 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
})

// Magic Link
const { data, error } = await supabase.auth.signInWithOtp({
  email,
})
```

### 3.3 登出

```typescript
const { error } = await supabase.auth.signOut()
```

### 3.4 获取当前用户

```typescript
// Client Component
const { data: { user } } = await supabase.auth.getUser()

// Server Component (从 cookie 读取)
const cookieStore = cookies()
const supabase = createServerClient()
const { data: { user } } = await supabase.auth.getUser()
```

### 3.5 Session 管理

```typescript
// 获取当前 session
const { data: { session } } = await supabase.auth.getSession()

// 刷新 session
const { data: { session } } = await supabase.auth.refreshSession()

// 监听 auth 变化
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('Auth event:', event, session)
    }
  )
  
  return () => subscription.unsubscribe()
}, [])
```

### 3.6 密码重置

```typescript
// 发送重置邮件
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${location.origin}/auth/reset-password`,
})

// 更新密码
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

### 3.7 用户信息更新

```typescript
const { error } = await supabase.auth.updateUser({
  email: 'new@example.com',
  data: {
    username: 'NewName',
    avatar_url: 'https://...',
  },
})
```

---

## 4. 存储 (Storage)

### 4.1 上传文件

```typescript
const file = event.target.files?.[0]

const { data, error } = await supabase.storage
  .from('images')
  .upload(`public/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
```

### 4.2 获取公开 URL

```typescript
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('path/to/file.png')

// data.publicUrl = 'https://.../path/to/file.png'
```

### 4.3 获取签名 URL (私有文件)

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .createSignedUrl('path/to/file.png', 60) // 60 秒有效期
```

### 4.4 删除文件

```typescript
const { error } = await supabase.storage
  .from('images')
  .remove(['path/to/file.png'])
```

### 4.5 列出文件

```typescript
const { data, error } = await supabase.storage
  .from('images')
  .list('public/', {
    limit: 10,
    offset: 0,
  })
```

---

## 5. RLS 策略

### 5.1 启用 RLS

```sql
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
```

### 5.2 SELECT 策略

```sql
-- 任何人都可以查看已发布的内容
CREATE POLICY "Public styles are viewable by everyone"
  ON styles FOR SELECT
  USING (status = 'published');

-- 只有认证用户可以查看自己的收藏
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);
```

### 5.3 INSERT 策略

```sql
-- 只有认证用户可以插入
CREATE POLICY "Authenticated users can insert"
  ON styles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 用户只能创建自己的收藏
CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 5.4 UPDATE 策略

```sql
-- 作者只能更新自己的内容
CREATE POLICY "Authors can update their own styles"
  ON styles FOR UPDATE
  USING (auth.uid() = author_id);
```

### 5.5 DELETE 策略

```sql
-- 作者只能删除自己的内容
CREATE POLICY "Authors can delete their own styles"
  ON styles FOR DELETE
  USING (auth.uid() = author_id);
```

### 5.6 RLS 工具函数

```sql
-- 获取当前用户 ID
auth.uid()

-- 获取当前用户邮箱
auth.email()

-- 获取当前用户角色
auth.role()

-- 检查是否是认证用户
auth.role() = 'authenticated'

-- 检查是否是匿名用户
auth.role() = 'anon'
```

### 5.7 RLS 嵌套查询注意事项

**问题**: 当使用 `.select('parent:child(...)')` 嵌套查询时，如果两个表都有 RLS 策略，且子表的 RLS 不满足，会**静默返回空结果**。

**解决**: 使用两步查询替代嵌套查询（见 2.3 节）。

---

## 6. SSR 集成 (Next.js)

### 6.1 Server Component 中的数据获取

```typescript
// app/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  
  const { data: styles } = await supabase
    .from('styles')
    .select('*')
    .eq('status', 'published')
  
  return <div>{/* 渲染 */}</div>
}
```

### 6.2 Server Action 中的数据操作

```typescript
// app/actions.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createStyle(formData: FormData) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('styles')
    .insert({ title: formData.get('title') })
    .select()
    .single()
  
  if (error) throw error
  
  revalidatePath('/styles')
  return data
}
```

### 6.3 Client Component 中的实时数据

```typescript
// components/LikeButton.tsx
'use client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function LikeButton({ styleId }) {
  const supabase = createClient()
  
  const { data: likeCount } = useQuery({
    queryKey: ['likes', styleId],
    queryFn: async () => {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('style_id', styleId)
      return count
    },
  })
  
  return <button>{likeCount} 点赞</button>
}
```

### 6.4 认证状态同步

```typescript
// hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    // 从 cookie 获取 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    
    // 监听 auth 变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])
  
  return { user, isAuthenticated: !!user }
}
```

---

## 7. 常见模式

### 7.1 分页查询

```typescript
async function getPaginatedStyles(page = 1, pageSize = 10) {
  const supabase = createClient()
  
  const { data, count, error } = await supabase
    .from('styles')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)
  
  return {
    data,
    count,
    totalPages: Math.ceil(count / pageSize),
    currentPage: page,
  }
}
```

### 7.2 软删除

```typescript
// Schema: 添加 deleted_at 列
// 查询时过滤
const { data } = await supabase
  .from('styles')
  .select('*')
  .is('deleted_at', null)

// 软删除
await supabase
  .from('styles')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', styleId)
```

### 7.3 乐观更新

```typescript
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

function LikeButton({ styleId, initialCount }) {
  const queryClient = useQueryClient()
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      // 调用 Server Action
      await toggleLike(styleId)
    },
    onMutate: async () => {
      // 取消相关查询
      await queryClient.cancelQueries(['likes', styleId])
      
      // 获取之前的值
      const previous = queryClient.getQueryData(['likes', styleId])
      
      // 乐观更新
      queryClient.setQueryData(['likes', styleId], (old) => old + 1)
      
      return { previous }
    },
    onError: (err, variables, context) => {
      // 错误时回滚
      queryClient.setQueryData(['likes', styleId], context.previous)
    },
  })
  
  return <button onClick={() => likeMutation.mutate()}>点赞</button>
}
```

### 7.4 实时订阅

```typescript
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function RealtimeLikes({ styleId }) {
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `style_id=eq.${styleId}`,
        },
        (payload) => {
          console.log('Like changed:', payload)
          // 更新本地状态
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [styleId])
}
```

---

## 参考资料

- [Supabase JS SDK 文档](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase SSR 文档](https://supabase.com/docs/guides/auth/auth-hard-mode)
- [Supabase RLS 文档](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
