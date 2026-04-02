-- StyleSnap 添加 profiles.email 字段
-- 创建时间：2026-04-02
-- 说明：在 profiles 表中添加 email 字段，用于注册时检查邮箱是否已存在

-- ===========================================
-- 1. 添加 email 字段到 profiles 表
-- ===========================================

-- 添加 email 列（允许 NULL，因为已有记录）
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 添加注释
COMMENT ON COLUMN profiles.email IS '用户邮箱（用于注册时检查重复）';

-- ===========================================
-- 2. 为已有记录填充 email 数据
-- ===========================================

-- 从 auth.users 表同步 email 到 profiles 表
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- ===========================================
-- 3. 添加唯一索引（允许 NULL）
-- ===========================================

-- 创建唯一索引（只针对非 NULL 值）
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email) WHERE email IS NOT NULL;

-- ===========================================
-- 4. 更新 auth 触发器，确保新注册用户同时写入 email
-- ===========================================

-- 修改 create_profile_on_signup 触发器，确保 email 字段也被填充
-- 注意：如果触发器已存在，需要先删除再创建
DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

-- 创建新的触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user_with_email()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, avatar_url, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      'https://avatar.vercel.sh/' || NEW.email
    ),
    'user',
    NEW.created_at,
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, profiles.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_with_email();
