# Supabase 错误修复手册

> 用途：快速定位和解决 Supabase 相关问题  
> 最后更新：2026-04-04  
> 基于历史修复报告：FIX-2026-001、P0_LIKE_COUNT_FIX_REPORT、P1_AUTH_SYNC_ANALYSIS 等

---

## 目录

1. [认证问题](#1-认证问题)
2. [RLS 策略问题](#2-rls 策略问题)
3. [数据库查询问题](#3-数据库查询问题)
4. [计数问题](#4-计数问题)
5. [Server Action 问题](#5-server-action-问题)

---

## 1. 认证问题

### 1.1 问题：登录后 Cookie 已设置但 localStorage 为空

**症状**:
- 用户成功登录后，Server Action 返回成功
- Cookie 中已设置 `auth-token`
- 但浏览器 localStorage 中 `sb-xxx-auth-token` 为空
- 刷新页面后用户状态丢失

**根因**:
- Server Action 不会自动同步 session 到浏览器 localStorage
- `useAuth` Hook 依赖 localStorage 中的 token

**解决方案**:

```typescript
// hooks/useAuth.ts
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    // 从 cookie 获取 session（而不是依赖 localStorage）
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

**验证步骤**:
1. 登录后检查 `document.cookie` 包含 `auth-token`
2. 刷新页面后用户状态保持
3. 控制台无认证相关错误

**参考文档**: `docs/main/P1_AUTH_SYNC_ANALYSIS.md`

---

### 1.2 问题：Middleware 重定向导致认证失败

**症状**:
- 用户访问受保护页面时被重定向到登录页
- 但用户已登录且 Cookie 存在
- Proxy/Proxy 中认证检查逻辑正确

**根因**:
- `setAll` 方法只设置了 response cookies，未设置 request cookies
- 导致后续请求无法携带认证 token

**解决方案**:

```typescript
// proxy.ts
export async function proxy(request: NextRequest) {
  const supabase = createServerClient()
  
  try {
    // 刷新 session 并获取用户
    const { data: { user } } = await supabase.auth.getUser()
    
    const response = NextResponse.next()
    
    // 必须同时设置 request 和 response cookies
    const cookiesToSet = await getCookieUpdates()
    cookiesToSet.forEach(({ name, value, options }) => {
      request.cookies.set(name, value)  // ← 关键
      response.cookies.set(name, value, options)
    })
    
    // 添加缓存控制头防止缓存导致认证状态不同步
    response.headers.set('Cache-Control', 'private, no-store')
    
    return response
  } catch {
    // 未认证，重定向到登录页
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

**验证步骤**:
1. 访问受保护页面，正常访问（不被重定向）
2. 检查 Proxy 日志无错误
3. 刷新页面认证状态保持

**参考文档**: 修复报告 FIX-2026-001

---

## 2. RLS 策略问题

### 2.1 问题：嵌套查询返回空数组 `{}`

**症状**:
- 查询无错误，但返回空结果
- 错误日志：`[Query Error] {}`
- 数据库中确实存在相关数据

**根因**:
- 使用 `.select('parent:child(...)')` 嵌套查询
- 两个表都有 RLS 策略
- 子表 RLS 不满足时**静默返回空结果**

**示例**:
```typescript
// ❌ 错误：嵌套查询触发 RLS 冲突
const { data } = await supabase
  .from('favorites')
  .select('style:styles(*)')  // styles 表有 status='published' 限制
  .eq('user_id', userId)
// 返回空数组，即使用户有收藏
```

**解决方案**:

```typescript
// ✅ 正确：两步查询
// 步骤 1: 获取 style_id 列表
const { data: favoritesData } = await supabase
  .from('favorites')
  .select('style_id, created_at')
  .eq('user_id', userId)

// 步骤 2: 查询完整风格信息
const styleIds = favoritesData?.map(f => f.style_id) ?? []
const { data: stylesData } = await supabase
  .from('styles')
  .select('*')
  .in('id', styleIds)
```

**验证步骤**:
1. 查询返回正确的数据
2. 控制台无 `{}` 错误
3. 收藏/点赞等关联功能正常

**参考文档**: `docs/main/FIX-2026-001-favorites-rls-issue.md`

---

### 2.2 问题：RLS 策略未生效导致数据泄露

**症状**:
- 未认证用户可以查看他人数据
- 用户可以修改/删除不属于自己的数据

**根因**:
- RLS 策略未启用
- 策略条件过于宽松

**解决方案**:

```sql
-- 1. 启用 RLS
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;

-- 2. 创建精确的策略
-- 只允许查看已发布的内容
CREATE POLICY "Public styles are viewable by everyone"
  ON styles FOR SELECT
  USING (status = 'published');

-- 只允许作者修改自己的内容
CREATE POLICY "Authors can update their own styles"
  ON styles FOR UPDATE
  USING (auth.uid() = author_id);

-- 只允许作者删除自己的内容
CREATE POLICY "Authors can delete their own styles"
  ON styles FOR DELETE
  USING (auth.uid() = author_id);
```

**验证步骤**:
1. 未认证用户只能看到 `status='published'` 的数据
2. 认证用户无法修改他人数据
3. Supabase Dashboard → Authentication → Policies 确认策略存在

---

## 3. 数据库查询问题

### 3.1 问题：查询超时

**症状**:
- 大表查询时超时
- 错误：`Error: timeout`

**根因**:
- 缺少索引
- 查询未分页
- 关联查询过多

**解决方案**:

```sql
-- 1. 添加索引
CREATE INDEX idx_styles_status ON styles(status);
CREATE INDEX idx_styles_created_at ON styles(created_at DESC);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- 2. 使用分页
const { data } = await supabase
  .from('styles')
  .select('*')
  .range(0, 9)  -- 第一页，每页 10 条
```

---

### 3.2 问题：计数不准确

**症状**:
- 点赞/收藏计数与实际数量不符
- 计数出现负数

**根因**:
- 并发请求导致竞态条件
- 计数未使用原子更新

**解决方案**:

```typescript
// ❌ 错误：非原子更新
const { data: like } = await supabase
  .from('likes')
  .insert({ user_id, style_id })

// 手动更新计数（会与触发器冲突）
await supabase
  .from('styles')
  .update({ like_count: supabase.raw('like_count + 1') })

// ✅ 正确：使用原子 RPC 函数
const { error } = await supabase.rpc('toggle_like', {
  p_user_id: userId,
  p_style_id: styleId,
})
```

```sql
-- 数据库函数（原子操作）
CREATE OR REPLACE FUNCTION toggle_like(p_user_id uuid, p_style_id uuid)
RETURNS TABLE(is_liked boolean, new_count bigint) AS $$
DECLARE
  v_is_liked boolean;
  v_new_count bigint;
BEGIN
  IF EXISTS (SELECT 1 FROM likes WHERE user_id = p_user_id AND style_id = p_style_id) THEN
    -- 取消点赞
    DELETE FROM likes WHERE user_id = p_user_id AND style_id = p_style_id;
    v_is_liked := false;
  ELSE
    -- 添加点赞
    INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);
    v_is_liked := true;
  END IF;
  
  -- 获取最新计数（由触发器自动更新）
  SELECT like_count INTO v_new_count FROM styles WHERE id = p_style_id;
  
  RETURN QUERY SELECT v_is_liked, v_new_count;
END;
$$ LANGUAGE plpgsql;
```

**参考文档**: `docs/main/P0_LIKE_COUNT_FIX_REPORT.md`

---

## 4. 计数问题

### 4.1 问题：计数双重增加/减少

**症状**:
- 每次点赞计数增加 2
- 取消点赞计数减少 2

**根因**:
- 函数中手动 `UPDATE like_count`
- 同时存在触发器自动 `UPDATE like_count`
- 两次更新导致计数翻倍

**解决方案**:

```sql
-- ❌ 错误：函数中包含手动 UPDATE
CREATE FUNCTION toggle_like(...) AS $$
BEGIN
  -- ... 插入/删除 likes 表 ...
  
  -- 错误：手动更新计数（会与触发器冲突）
  UPDATE styles SET like_count = like_count + 1 WHERE id = p_style_id;
  
  RETURN QUERY SELECT ...;
END;
$$ LANGUAGE plpgsql;

-- ✅ 正确：依赖触发器自动更新
CREATE FUNCTION toggle_like(...) AS $$
BEGIN
  -- ... 插入/删除 likes 表 ...
  
  -- 不包含手动 UPDATE，触发器会自动处理
  -- 只返回触发器更新后的值
  RETURN QUERY SELECT ...;
END;
$$ LANGUAGE plpgsql;
```

**触发器示例**:
```sql
-- 点赞触发器
CREATE FUNCTION update_like_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE styles SET like_count = like_count - 1 WHERE id = OLD.style_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_like_added
  AFTER INSERT ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count;

CREATE TRIGGER on_like_removed
  AFTER DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_like_count;
```

---

### 4.2 问题：计数出现负数

**症状**:
- 点赞计数变为 -1, -2 等负数

**根因**:
- 并发删除请求
- 未检查记录是否存在就执行删除

**解决方案**:

```sql
-- 使用原子 RPC 函数（见 3.2）
-- 或使用数据库约束
ALTER TABLE styles ADD CONSTRAINT check_like_count_non_negative 
  CHECK (like_count >= 0);
```

---

## 5. Server Action 问题

### 5.1 问题：Server Action 中无法获取用户

**症状**:
- Server Action 中调用 `getCurrentUser()` 返回 null
- 但用户已登录

**根因**:
- 未正确传递 Cookie
- 客户端未使用正确的 Supabase 客户端

**解决方案**:

```typescript
// ✅ 正确：在 Server Action 中创建客户端
'use server'
import { createClient } from '@/lib/supabase/server'

export async function createStyle(formData: FormData) {
  const supabase = createClient()  // 从 cookie 读取认证
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('未认证')
  
  // ... 业务逻辑
}
```

---

## 附录：常用调试命令

### 检查 RLS 策略

```sql
-- 查看表的 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'styles';

-- 查看 RLS 是否启用
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'styles';
```

### 检查触发器

```sql
-- 查看触发器
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'styles';
```

### 检查索引

```sql
-- 查看索引
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'styles';
```

---

## 相关文档

- [`FIX-2026-001-favorites-rls-issue.md`](./FIX-2026-001-favorites-rls-issue.md) - RLS 嵌套查询问题
- [`P0_LIKE_COUNT_FIX_REPORT.md`](./P0_LIKE_COUNT_FIX_REPORT.md) - 计数双重增加修复
- [`P1_AUTH_SYNC_ANALYSIS.md`](./P1_AUTH_SYNC_ANALYSIS.md) - 认证状态同步分析
- [`P2_COUNT_NEGATIVE_FIX_REPORT.md`](./P2_COUNT_NEGATIVE_FIX_REPORT.md) - 计数负数修复
