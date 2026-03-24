-- Supabase 认证问题排查 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行以下查询

-- 1. 检查触发器是否存在
SELECT tgname, tgrelid::regclass as table_name, tgenabled
FROM pg_trigger
WHERE tgname = 'create_profile_on_signup';

-- 2. 检查触发器函数是否存在
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'create_profile_on_signup';

-- 3. 检查 profiles 表结构
\d profiles

-- 4. 检查 profiles 表的 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. 检查是否有检查约束
SELECT conname, contype, condeferrable, condeferred, convalidated
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass;

-- 6. 手动测试触发器函数（模拟注册）
-- 注意：这个测试需要在事务中执行，执行后需要回滚
BEGIN;
-- 手动插入一个测试用户到 auth.users（不要真的执行，这只是说明）
-- 实际上应该通过 Supabase SDK 测试
ROLLBACK;

-- 7. 查看最近的 Auth 日志（需要在 Dashboard 查看）
-- 访问：https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/auth/logs
