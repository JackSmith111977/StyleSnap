-- 修复注册触发器 - search_path 问题
-- 创建时间：2026-03-24
-- 问题：SECURITY DEFINER 函数没有显式设置 search_path，导致找不到 profiles 表
-- 错误：ERROR: relation "profiles" does not exist (SQLSTATE 42P01)
-- 解决：在函数定义中添加 SET search_path = public

-- ===========================================
-- 1. 授予 supabase_auth_admin 完整权限
-- ===========================================
GRANT ALL ON profiles TO supabase_auth_admin;
GRANT ALL ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO supabase_auth_admin;

-- ===========================================
-- 2. 重新创建触发器函数（关键：设置 search_path）
-- ===========================================
DROP FUNCTION IF EXISTS create_profile_on_signup() CASCADE;

-- 关键修复：SECURITY DEFINER 函数必须显式设置 search_path
-- 否则函数执行时 search_path 默认为 pg_catalog，找不到 public.profiles
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

-- 授予执行权限
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO postgres;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO anon;
GRANT EXECUTE ON FUNCTION create_profile_on_signup() TO authenticated;

-- ===========================================
-- 3. 重新创建触发器
-- ===========================================
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ===========================================
-- 4. 确保 RLS 策略允许插入
-- ===========================================
DROP POLICY IF EXISTS "profiles_insert_on_signup" ON profiles;
DROP POLICY IF EXISTS "profiles_auth_insert" ON profiles;

-- 允许触发器插入（使用 SECURITY DEFINER 时绕过 RLS）
CREATE POLICY "profiles_insert_on_signup" ON profiles
    FOR INSERT
    WITH CHECK (true);
