-- StyleSnap 认证触发器修复
-- 创建时间：2026-03-24
-- 说明：创建新用户自动创建 profile 的触发器

-- ===========================================
-- 1. 创建触发器函数
-- ===========================================

-- 如果已存在先删除
DROP FUNCTION IF EXISTS create_profile_on_signup() CASCADE;

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.email),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 2. 创建触发器
-- ===========================================

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- ===========================================
-- 3. 验证
-- ===========================================

-- 检查触发器是否创建成功
-- SELECT tgname, tgrelid::regclass FROM pg_trigger WHERE tgname = 'create_profile_on_signup';
