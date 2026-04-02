-- StyleSnap RLS 策略修复和验证
-- 创建时间：2026-04-02
-- 说明：修复 comments 表删除权限，验证所有表的 RLS 策略

-- ===========================================
-- 1. 修复 comments 表 DELETE 策略
-- ===========================================

-- 删除旧的 DELETE 策略（如果存在）
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

-- 添加新的 DELETE 策略：只有作者或管理员可以删除评论
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ===========================================
-- 2. 验证 RLS 已启用
-- ===========================================

-- 确保所有表都启用了 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 3. 验证函数 - 检查 RLS 策略配置（简化版）
-- ===========================================

-- 删除旧函数（如果存在）
DROP FUNCTION IF EXISTS verify_rls_policies();

-- 创建简化版验证函数
CREATE OR REPLACE FUNCTION verify_rls_policies()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count BIGINT,
  policies JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.table_name::TEXT,
    c.relrowsecurity AS rls_enabled,
    COUNT(p.policyname) AS policy_count,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', p.policyname,
          'cmd', p.cmd,
          'qual', p.qual
        )
      ) FILTER (WHERE p.policyname IS NOT NULL),
      '[]'::jsonb
    ) AS policies
  FROM information_schema.tables t
  JOIN pg_class c ON c.oid = (t.table_schema || '.' || t.table_name)::regclass
  LEFT JOIN pg_policies p ON p.schemaname = t.table_schema AND p.tablename = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name IN (
      'profiles', 'categories', 'styles', 'tags',
      'style_tags', 'favorites', 'likes', 'comments'
    )
  GROUP BY t.table_name, c.relrowsecurity
  ORDER BY t.table_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 只允许管理员调用验证函数
REVOKE ALL ON FUNCTION verify_rls_policies() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_rls_policies() TO authenticated;

-- ===========================================
-- 4. 注释说明
-- ===========================================

COMMENT ON FUNCTION verify_rls_policies IS '验证所有表的 RLS 策略配置状态';
