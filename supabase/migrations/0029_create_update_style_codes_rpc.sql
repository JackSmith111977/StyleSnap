-- StyleSnap 创建更新风格代码 RPC 函数
-- 创建时间：2026-04-08
-- 说明：创建 SECURITY DEFINER 函数，允许绕过 RLS 更新风格代码字段

-- ===========================================
-- 1. 创建 RPC 函数
-- ===========================================

CREATE OR REPLACE FUNCTION update_style_codes(
  p_style_id UUID,
  p_code_css TEXT,
  p_code_css_modules TEXT,
  p_code_html TEXT,
  p_code_readme TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE styles
  SET
    code_css = p_code_css,
    code_css_modules = p_code_css_modules,
    code_html = p_code_html,
    code_readme = p_code_readme,
    updated_at = NOW()
  WHERE id = p_style_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 2. 授予执行权限（已登录用户可执行）
-- ===========================================

GRANT EXECUTE ON FUNCTION update_style_codes TO authenticated;

-- ===========================================
-- 3. 验证
-- ===========================================

DO $$
DECLARE
  func_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'update_style_codes'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) INTO func_exists;

  IF func_exists THEN
    RAISE NOTICE '✅ 成功创建 update_style_codes RPC 函数';
  ELSE
    RAISE WARNING '⚠️ 函数创建可能失败，请检查';
  END IF;
END $$;
