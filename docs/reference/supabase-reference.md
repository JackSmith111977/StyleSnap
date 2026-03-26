# Supabase - Agent 参考

> 用途：数据库、认证、存储 API 规范与最佳实践
> 来源：`knowledge-base/tech-stack/supabase-technical-research.md`

---

## 快速参考

### 安装
```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

### 客户端初始化
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## 数据库操作

### 查询
```typescript
// 基础查询
const { data, error } = await supabase
  .from('styles')
  .select('*')
  .eq('status', 'published')
  .order('created_at', { ascending: false })

// 关联查询
const { data } = await supabase
  .from('styles')
  .select(`
    *,
    author:profiles (
      username,
      avatar_url
    )
  `)

// 模糊搜索
const { data } = await supabase
  .from('styles')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
```

### 插入
```typescript
const { data, error } = await supabase
  .from('styles')
  .insert({
    name: 'New Style',
    category: 'minimalist',
    author_id: userId,
  })
  .select()
  .single()
```

### 更新
```typescript
const { data, error } = await supabase
  .from('styles')
  .update({ name: 'Updated Name' })
  .eq('id', styleId)
  .select()
  .single()
```

### 删除
```typescript
const { error } = await supabase
  .from('styles')
  .delete()
  .eq('id', styleId)
```

---

## 认证

### 注册
```typescript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${location.origin}/auth/callback`,
  },
})
```

### 登录
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
```

### OAuth 登录
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${location.origin}/auth/callback`,
  },
})
```

### 登出
```typescript
const { error } = await supabase.auth.signOut()
```

### 获取当前用户
```typescript
const { data: { user } } = await supabase.auth.getUser()
```

---

## Storage

### 上传文件
```typescript
const { data, error } = await supabase.storage
  .from('images')
  .upload(`public/${file.name}`, file, {
    cacheControl: '3600',
    upsert: false,
  })
```

### 获取公开 URL
```typescript
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('path/to/file.png')
```

### 删除文件
```typescript
const { error } = await supabase.storage
  .from('images')
  .remove(['path/to/file.png'])
```

---

## RLS 策略

### 启用 RLS
```sql
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
```

### 策略示例
```sql
-- 任何人都可以查看已发布的内容
CREATE POLICY "Public styles are viewable by everyone"
  ON styles FOR SELECT
  USING (status = 'published');

-- 只有作者可以更新自己的内容
CREATE POLICY "Authors can update their own styles"
  ON styles FOR UPDATE
  USING (auth.uid() = author_id);

-- 只有认证用户可以插入
CREATE POLICY "Authenticated users can insert"
  ON styles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 最佳实践

1. **类型安全**：使用 `supabase gen types` 生成 TypeScript 类型
2. **RLS**：所有表必须启用 RLS 策略
3. **错误处理**：始终检查 `error` 返回值
4. **环境配置**：使用 `NEXT_PUBLIC_` 前缀暴露必要的环境变量
