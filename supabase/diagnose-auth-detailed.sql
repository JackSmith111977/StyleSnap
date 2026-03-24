-- Supabase Auth 注册问题详细诊断
-- 在 Supabase Dashboard → SQL Editor 中执行

-- ===========================================
-- 1. 检查触发器
-- ===========================================
SELECT
    tgname as trigger_name,
    pg_get_triggerdef(oid) as trigger_definition,
    tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'create_profile_on_signup';

-- ===========================================
-- 2. 检查触发器函数
-- ===========================================
SELECT
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname = 'create_profile_on_signup';

-- ===========================================
-- 3. 检查 profiles 表 RLS 策略
-- ===========================================
SELECT
    policyname,
    cmd as command,
    roles,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ===========================================
-- 4. 检查 profiles 表结构
-- ===========================================
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- ===========================================
-- 5. 检查 profiles 表的约束
-- ===========================================
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition,
    convalidated as is_validated
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- ===========================================
-- 6. 检查 profiles 表的索引
-- ===========================================
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- ===========================================
-- 7. 检查 RLS 是否启用
-- ===========================================
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'profiles';

-- ===========================================
-- 8. 检查 auth.users 表结构
-- ===========================================
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- ===========================================
-- 9. 测试手动插入 profile（模拟触发器）
-- ===========================================
-- 注意：这个测试需要在事务中执行，然后回滚
-- 用于检查是否有约束阻止插入

BEGIN;

-- 生成一个测试 UUID
SELECT uuid_generate_v4() as test_user_id;

-- 尝试插入（用上面的 UUID 替换）
-- INSERT INTO profiles (id, username, avatar_url, role)
-- VALUES ('替换为上面的 UUID', 'test_user', 'https://test.com/avatar.png', 'user');

-- 回滚测试
ROLLBACK;

-- ===========================================
-- 10. 检查最近的 Auth 日志
-- ===========================================
-- 这个需要在 Dashboard 查看：
-- https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/auth/logs

-- ===========================================
-- 11. 检查是否有其他触发器在 auth.users 上
-- ===========================================
SELECT
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- ===========================================
-- 12. 检查 supabase_auth_admin 角色权限
-- ===========================================
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'supabase_auth_admin'
  AND table_name = 'profiles';

-- ===========================================
-- 13. 完整的 RLS 诊断
-- ===========================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ===========================================
-- 14. 检查是否有扩展需要创建
-- ===========================================
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';

-- 如果需要，创建扩展
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
