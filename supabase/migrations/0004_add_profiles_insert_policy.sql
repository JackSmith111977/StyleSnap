-- 添加 profiles 表 INSERT RLS 策略
-- 创建时间：2026-03-24
-- 说明：允许新用户注册时自动创建 profile

-- 添加允许 INSERT 的策略
-- 触发器使用 SECURITY DEFINER，但 RLS 仍然会检查
-- 需要添加一个允许 INSERT 的策略，否则注册会失败
CREATE POLICY "profiles_insert_on_signup" ON profiles
    FOR INSERT WITH CHECK (true);
