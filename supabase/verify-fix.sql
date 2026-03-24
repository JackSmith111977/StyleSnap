-- 验证修复状态
-- 在 Supabase Dashboard SQL Editor 执行：
-- https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/sql/new

-- 1. 检查触发器函数配置
SELECT
    proname,
    proconfig as function_config,
    prosecdef as is_security_definer
FROM pg_proc
WHERE proname = 'create_profile_on_signup';

-- 预期结果：function_config = {search_path=public}

-- 2. 检查触发器是否存在
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'create_profile_on_signup';

-- 3. 检查 supabase_auth_admin 权限
SELECT
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'supabase_auth_admin'
  AND table_name = 'profiles';

-- 4. 检查 RLS 策略
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles';
