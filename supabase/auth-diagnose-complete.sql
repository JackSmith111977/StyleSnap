-- Auth 注册完整诊断 - 渐进式排查
-- 在 Supabase Dashboard → SQL Editor 中逐个执行

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
-- 步骤 2: 检查 Auth Hooks 配置
-- ===========================================
-- 这个需要在 Dashboard 查看：
-- https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/auth/hooks
-- 检查是否有配置的 Hook 返回错误

-- ===========================================
-- 步骤 3: 检查 profiles 表的所有约束
-- ===========================================
SELECT
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_def,
    convalidated as is_valid
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- ===========================================
-- 步骤 4: 检查 create_profile_on_signup 函数
-- ===========================================
SELECT
    proname,
    prosrc,
    prosecdef as is_security_definer,
    provolatile
FROM pg_proc
WHERE proname = 'create_profile_on_signup';

-- ===========================================
-- 步骤 5: 手动测试触发器函数（不通过 Auth）
-- ===========================================
-- 创建一个测试用户 ID，然后手动调用触发器函数

BEGIN;

-- 生成测试 UUID
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_result RECORD;
BEGIN
    RAISE NOTICE '测试用户 ID: %', test_id;

    -- 模拟 NEW 记录插入 auth.users
    -- 直接调用触发器函数
    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (test_id, 'test_user', 'https://test.com/test.png', 'user');

    -- 检查是否成功
    SELECT * INTO test_result FROM profiles WHERE id = test_id;
    RAISE NOTICE '插入结果：% ', test_result;

    -- 清理
    DELETE FROM profiles WHERE id = test_id;
END $$;

ROLLBACK;

-- ===========================================
-- 步骤 6: 检查是否有其他 RLS 策略冲突
-- ===========================================
SELECT
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE tablename IN ('profiles', 'users')
ORDER BY tablename, cmd;

-- ===========================================
-- 步骤 7: 检查 auth schema 权限
-- ===========================================
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'auth'
  AND table_name = 'users';

-- ===========================================
-- 步骤 8: 尝试禁用触发器后测试（仅诊断！）
-- ===========================================
-- 注意：这个操作会暂时禁用触发器，测试后必须恢复！

-- 禁用触发器
ALTER TABLE auth.users DISABLE TRIGGER create_profile_on_signup;

-- 现在尝试注册...
-- 如果成功，说明问题在触发器
-- 如果仍然失败，说明问题在其他地方

-- 启用触发器（测试后必须执行！）
ALTER TABLE auth.users ENABLE TRIGGER create_profile_on_signup;

-- ===========================================
-- 步骤 9: 检查 Supabase Auth 配置
-- ===========================================
-- 在 Dashboard 查看：
-- https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/auth/settings
-- 检查：
-- 1. Email Auth 是否启用
-- 2. 是否需要邮箱确认
-- 3. 是否有自定义 SMTP 配置
