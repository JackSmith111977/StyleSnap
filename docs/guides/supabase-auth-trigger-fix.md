# Supabase Auth 注册触发器错误修复经验

> 记录 "Database error saving new user" 错误的完整诊断和修复流程，供后续参考

---

## 问题现象

用户注册时报错：

```
Error: Database error saving new user
```

前端调用 `supabase.auth.signUp()` 时返回 500 错误，错误代码 `unexpected_failure`。

---

## 错误日志分析

Supabase Auth Logs 显示：

```json
{
  "error": "failed to close prepared statement: ERROR: current transaction is aborted, commands ignored until end of transaction block (SQLSTATE 25P02): ERROR: relation \"profiles\" does not exist (SQLSTATE 42P01)"
}
```

**关键信息**：
- `SQLSTATE 42P01` = `undefined_table`（表不存在）
- `SQLSTATE 25P02` = `in_failed_sql_transaction`（事务已失败）
- 错误发生在 `/signup` 端点，Auth API 尝试保存新用户时

---

## 根本原因

**SECURITY DEFINER 函数没有显式设置 `search_path`**

当触发器函数使用 `SECURITY DEFINER` 时：
1. 函数以定义者（postgres）的权限执行
2. 但 **`search_path` 不会自动继承**，默认可能指向 `pg_catalog` 或其他 schema
3. 导致函数执行时找不到 `public.profiles` 表

---

## 错误诊断流程

### 步骤 1：检查错误日志

访问 Supabase Dashboard → Auth → Logs：
```
https://supabase.com/dashboard/project/{project-ref}/auth/logs
```

查找包含 "Database error saving new user" 的日志条目，提取具体错误信息。

### 步骤 2：检查触发器配置

```sql
-- 检查 auth.users 表上的所有触发器
SELECT
    tgname as trigger_name,
    pg_get_triggerdef(oid) as trigger_definition,
    tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;
```

**预期结果**：应该看到 `create_profile_on_signup` 触发器

### 步骤 3：检查触发器函数

```sql
-- 检查触发器函数定义
SELECT
    proname,
    prosrc,
    prosecdef as is_security_definer,
    provolatile,
    proconfig as function_config
FROM pg_proc
WHERE proname = 'create_profile_on_signup';
```

**关键检查**：
- `is_security_definer` = `true`
- `proconfig` 应该包含 `search_path=public`（如果没有，就是问题所在）

### 步骤 4：检查权限

```sql
-- 检查 supabase_auth_admin 对 profiles 表的权限
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'supabase_auth_admin'
  AND table_name = 'profiles';
```

**预期结果**：应该有 `INSERT`、`SELECT`、`USAGE` 权限

### 步骤 5：检查 RLS 策略

```sql
-- 检查 profiles 表的所有 RLS 策略
SELECT
    policyname,
    cmd as command,
    roles,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**预期结果**：应该有允许 INSERT 的策略

### 步骤 6：手动测试插入

```sql
-- 在事务中测试手动插入
BEGIN;

DO $$
DECLARE
    test_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (test_id, 'test_user', 'https://test.com/test.png', 'user');

    DELETE FROM profiles WHERE id = test_id;
    RAISE NOTICE '插入成功';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '插入失败：%', SQLERRM;
END $$;

ROLLBACK;
```

**预期结果**：应该成功插入

### 步骤 7：禁用触发器测试（隔离问题）

```sql
-- 临时禁用触发器
ALTER TABLE auth.users DISABLE TRIGGER create_profile_on_signup;

-- 测试注册...

-- 测试后重新启用
ALTER TABLE auth.users ENABLE TRIGGER create_profile_on_signup;
```

**判断逻辑**：
- 禁用后注册成功 → 问题在触发器
- 禁用后仍然失败 → 问题在 Supabase Auth 或其他配置

---

## 修复方案

### 完整修复 SQL

```sql
-- 1. 授予完整权限
GRANT ALL ON profiles TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;

-- 2. 重新创建触发器函数（关键：设置 search_path）
DROP FUNCTION IF EXISTS create_profile_on_signup() CASCADE;

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar_url TEXT;
BEGIN
    -- 显式设置搜索路径（SECURITY DEFINER 必需）
    SET LOCAL search_path = public;

    v_username := COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1));
    v_avatar_url := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        'https://avatar.vercel.sh/' || v_username
    );

    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (NEW.id, v_username, v_avatar_url, 'user');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. 授予执行权限
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO postgres;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO anon;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO authenticated;

-- 4. 重新创建触发器
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- 5. 确保 RLS 策略允许插入
DROP POLICY IF EXISTS "profiles_insert_on_signup" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_insert" ON profiles;

CREATE POLICY "profiles_insert_on_signup" ON profiles
    FOR INSERT
    WITH CHECK (true);
```

### 关键点说明

| 修复项 | 说明 | 为什么需要 |
|--------|------|-----------|
| `SET search_path = public` | 显式设置函数搜索路径 | SECURITY DEFINER 函数不会继承调用者的 search_path |
| `GRANT ALL ON profiles` | 授予表权限 | 触发器需要 INSERT 权限，SELECT 用于约束检查 |
| `GRANT ALL ON SCHEMA public` | 授予 schema 使用权 | 否则找不到 public schema 中的表 |
| `GRANT EXECUTE` | 授予函数执行权限 | supabase_auth_admin 需要执行触发器函数 |
| RLS INSERT 策略 | 允许插入的策略 | 即使触发器使用 SECURITY DEFINER，RLS 仍会检查 |

---

## 常见错误模式

### 错误模式 1：缺少 search_path

**症状**：`ERROR: relation "profiles" does not exist`

**原因**：SECURITY DEFINER 函数的 search_path 默认为 `pg_catalog`

**修复**：
```sql
CREATE OR REPLACE FUNCTION my_function()
RETURNS TRIGGER AS $$
BEGIN
    SET LOCAL search_path = public;
    -- ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

### 错误模式 2：缺少表权限

**症状**：`ERROR: permission denied for table profiles`

**原因**：supabase_auth_admin 没有 profiles 表的 INSERT 权限

**修复**：
```sql
GRANT INSERT ON profiles TO supabase_auth_admin;
```

### 错误模式 3：RLS 策略阻止插入

**症状**：`ERROR: new row violates row-level security policy`

**原因**：profiles 表启用了 RLS，但没有允许 INSERT 的策略

**修复**：
```sql
CREATE POLICY "profiles_insert_on_signup" ON profiles
    FOR INSERT WITH CHECK (true);
```

### 错误模式 4：外键约束失败

**症状**：`ERROR: insert or update on table "profiles" violates foreign key`

**原因**：插入的 id 在 auth.users 中不存在（通常是时序问题）

**修复**：确保触发器是 `AFTER INSERT` 而不是 `BEFORE INSERT`

---

## 最佳实践

### 1. 创建 Auth 触发器的标准模板

```sql
-- 标准模板：用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- 必需：设置 search_path
    SET LOCAL search_path = public;

    INSERT INTO profiles (id, username, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NOW()
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

### 2. 权限授予清单

每次创建新的 public schema 表供 Auth 触发器使用时，需要授予：

```sql
GRANT ALL ON {table_name} TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION {function_name} TO supabase_auth_admin;
```

### 3. RLS 策略配合

如果表启用了 RLS，确保有允许触发器插入的策略：

```sql
-- 允许任何情况下的 INSERT（触发器使用 SECURITY DEFINER）
CREATE POLICY "{table}_insert_on_signup" ON {table}
    FOR INSERT WITH CHECK (true);
```

### 4. 验证步骤

修复后执行以下验证：

```sql
-- 1. 检查触发器
SELECT tgname FROM pg_trigger WHERE tgname = 'create_profile_on_signup';

-- 2. 检查函数配置
SELECT proconfig FROM pg_proc WHERE proname = 'create_profile_on_signup';
-- 应该返回：{search_path=public}

-- 3. 检查权限
SELECT * FROM information_schema.role_table_grants
WHERE grantee = 'supabase_auth_admin' AND table_name = 'profiles';

-- 4. 检查 RLS 策略
SELECT * FROM pg_policies WHERE tablename = 'profiles' AND cmd = 'INSERT';
```

---

## 相关资源

- [Supabase 文档 - 用户管理](https://supabase.com/docs/guides/auth/auth-user-management)
- [PostgreSQL SECURITY DEFINER](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Supabase Auth Hooks](https://supabase.com/docs/guides/auth/auth-hooks)

---

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0 | 2026-03-24 | StyleSnap Team | 初始版本 |
