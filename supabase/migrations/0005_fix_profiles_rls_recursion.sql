-- 修复 profiles 表 RLS 策略无限递归问题
-- 创建时间：2026-03-24
-- 问题：profiles_admin_all 策略查询 profiles 表导致无限递归
-- 解决：使用 auth.users 的元数据而不是查询 profiles 表

-- ===========================================
-- 1. 删除导致递归的旧策略
-- ===========================================
DROP POLICY IF EXISTS profiles_admin_all ON profiles;

-- ===========================================
-- 2. 创建权限检查函数（使用 auth.users 元数据）
-- ===========================================
CREATE OR REPLACE FUNCTION is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- 从 auth.users 的 raw_user_meta_data 获取角色
    -- 避免查询 profiles 表导致递归
    SELECT (raw_user_meta_data->>'role')::TEXT INTO user_role
    FROM auth.users
    WHERE id = auth.uid();

    RETURN COALESCE(user_role, 'user') IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予执行权限
GRANT EXECUTE ON FUNCTION is_admin_or_super_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_or_super_admin TO anon;
GRANT EXECUTE ON FUNCTION is_admin_or_super_admin TO service_role;

-- ===========================================
-- 3. 创建新的 admin 策略（使用函数而不是子查询）
-- ===========================================
CREATE POLICY "profiles_admin_all" ON profiles
    FOR ALL USING (is_admin_or_super_admin());

-- ===========================================
-- 4. 验证修复
-- ===========================================
-- 执行后应该不再报 "infinite recursion detected" 错误
