# P5: 用户删除链路幽灵数据问题修复报告

**创建时间**: 2026-04-05  
**问题**: 从 Supabase Admin UI 删除用户后，profiles 表保留孤立记录（幽灵数据）  
**影响**: 导致相同邮箱无法重新注册，提示"该邮箱已注册"

---

## 问题根因分析

### 1. 现象

1. 用户在 Supabase Admin UI 中删除 `auth.users` 记录
2. `profiles` 表记录未被级联删除（尽管有 `ON DELETE CASCADE`）
3. 重新注册时，`check_email_exists` 查询 `profiles` 表发现旧记录
4. 注册被拒绝，提示"该邮箱已注册"

### 2. 数据库配置检查

**外键约束** (`0001_initial_schema.sql:29`):
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ...
);
```
✅ 配置正确

**触发器** (`0006_fix_auth_trigger_search_path.sql`):
- ✅ `create_profile_on_signup()` - AFTER INSERT 触发器工作正常
- ❌ 不存在 AFTER DELETE 清理触发器

### 3. 根本原因

根据 Supabase 官方文档和搜索结果，问题出在：

1. **Supabase Admin UI 绕过外键约束**
   - Dashboard 删除操作使用特殊权限
   - 可能不触发标准的外键级联行为

2. **Storage 对象阻止删除**
   - 如果用户有头像或预览图在 `storage.objects` 表中
   - `objects_owner_fkey` 约束阻止删除
   - 导致只有 `auth.users` 被删除，但删除操作本身可能不完整

3. **没有 AFTER DELETE 触发器**
   - 只有创建触发器，没有删除清理触发器
   - 依赖纯外键 CASCADE，但 CASCADE 在某些情况下不工作

---

## 修复方案

### 方案 A: 创建 AFTER DELETE 触发器（推荐）

创建一个触发器函数，在 `auth.users` 删除后自动清理 `profiles` 表：

```sql
-- 创建删除清理触发器
CREATE OR REPLACE FUNCTION cleanup_profile_on_user_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- 删除 profiles 表中的对应记录
    DELETE FROM profiles WHERE id = OLD.id;
    
    -- 删除用户在 storage.objects 中的所有对象
    DELETE FROM storage.objects WHERE owner = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 创建触发器
DROP TRIGGER IF EXISTS cleanup_profile_on_user_delete ON auth.users;
CREATE TRIGGER cleanup_profile_on_user_delete
    AFTER DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION cleanup_profile_on_user_delete();
```

**优点**:
- 自动清理，不依赖外键 CASCADE
- 同时处理 storage 对象
- SECURITY DEFINER 绕过 RLS

**缺点**:
- 需要创建新的 migration 文件

---

### 方案 B: 修复外键约束（备选）

如果 AFTER DELETE 触发器仍然不能解决问题，可以：

1. **先删除 storage 对象的外键依赖**
2. **重新创建 profiles 的外键约束**

```sql
-- 1. 检查是否有存储对象阻止删除
SELECT owner, COUNT(*) 
FROM storage.objects 
GROUP BY owner;

-- 2. 如果profiles表有孤立记录，手动清理
DELETE FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
);

-- 3. 重建外键约束（如果需要）
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_pkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_pkey 
PRIMARY KEY (id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED;
```

---

### 方案 C: 应用层删除函数（长期方案）

创建一个 Server Action 来处理用户删除：

```typescript
// apps/web/actions/user/delete.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function deleteUserAccount() {
  const supabase = await createClient()
  
  // 1. 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未登录' }
  
  // 2. 删除存储对象
  await supabase.storage
    .from('user-avatars')
    .remove([`${user.id}/*`])
  
  await supabase.storage
    .from('style-previews')
    .remove([`${user.id}/*`])
  
  // 3. 删除用户（使用 Admin API）
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  
  if (error) return { error: error.message }
  return { success: true }
}
```

---

## 推荐执行步骤

### 立即执行（方案 A）

1. **创建新的 migration 文件**: `0025_add_user_delete_trigger.sql`
2. **运行诊断 SQL**: `P5_DELETE_CHAIN_DIAGNOSIS.sql` 验证当前状态
3. **应用 migration**: `npx supabase db push`
4. **清理现有幽灵数据**: 运行一次性清理脚本

### 验证步骤

1. 创建测试用户
2. 上传头像
3. 在 Admin UI 删除用户
4. 运行诊断查询，确认 profiles 无孤立记录
5. 使用相同邮箱重新注册，验证成功

---

## 一次性清理脚本

清理现有的幽灵 profile 记录：

```sql
-- 删除所有 auth.users 中不存在的 profiles
DELETE FROM profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = p.id
);

-- 验证清理结果
SELECT 
    'Orphaned profiles count' as check_type,
    COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.id IS NULL;
-- 应该返回 0
```

---

## 相关文件

- 诊断 SQL: `docs/main/P5_DELETE_CHAIN_DIAGNOSIS.sql`
- 初始 Schema: `supabase/migrations/0001_initial_schema.sql`
- 创建触发器: `supabase/migrations/0006_fix_auth_trigger_search_path.sql`

---

## 参考链接

- [Supabase CASCADE DELETE 文档](https://supabase.com/docs/guides/database/postgres/cascade-deletes)
- [Supabase 用户管理文档](https://supabase.com/docs/guides/auth/managing-user-data)
- [GitHub Issue: Not possible to delete users from Dashboard](https://github.com/supabase/supabase/issues/11122)
