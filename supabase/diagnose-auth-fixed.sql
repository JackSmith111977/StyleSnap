-- Auth 注册完整诊断 - 修复版
-- 在 Supabase Dashboard → SQL Editor 中执行
-- https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/sql/new

-- ===========================================
-- 步骤 1: 检查 auth.users 表上的所有触发器
-- ===========================================
SELECT
    tgname as trigger_name,
    tgtype as trigger_type,
    tgenabled as enabled,
    pg_get_triggerdef(oid) as trigger_def
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- ===========================================
-- 步骤 2: 检查 profiles 表的所有约束
-- ===========================================
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_def,
    convalidated as is_valid
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- ===========================================
-- 步骤 3: 检查 create_profile_on_signup 函数
-- ===========================================
SELECT
    proname,
    prosrc,
    prosecdef as is_security_definer,
    provolatile
FROM pg_proc
WHERE proname = 'create_profile_on_signup';

-- ===========================================
-- 步骤 4: 检查 profiles 表 RLS 策略
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
-- 步骤 5: 测试手动插入 profile
-- ===========================================
-- 在事务中测试，然后回滚
BEGIN;

DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_result RECORD;
BEGIN
    RAISE NOTICE '测试用户 ID: %', test_id;

    -- 尝试插入 profiles 表
    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (test_id, 'test_user', 'https://test.com/test.png', 'user');

    -- 检查是否成功
    SELECT * INTO test_result FROM profiles WHERE id = test_id;
    RAISE NOTICE '插入结果：%', test_result;

    -- 清理
    DELETE FROM profiles WHERE id = test_id;
    RAISE NOTICE '测试完成，已清理';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '插入失败：%', SQLERRM;
END $$;

ROLLBACK;
RAISE NOTICE '事务已回滚';

-- ===========================================
-- 步骤 6: 检查 supabase_auth_admin 对 profiles 的权限
-- ===========================================
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'supabase_auth_admin'
  AND table_name = 'profiles';

-- ===========================================
-- 步骤 7: 检查 auth.users 表的 RLS 状态
-- ===========================================
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'users' AND schemaname = 'auth';
