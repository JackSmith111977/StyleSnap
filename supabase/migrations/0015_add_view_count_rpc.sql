-- StyleSnap 浏览次数增加函数
-- 创建时间：2026-04-03
-- 说明：原子增加风格浏览次数，避免并发计数错误

-- ===========================================
-- 浏览次数增加函数
-- ===========================================

/**
 * 增加风格浏览次数（原子操作）
 * 使用 PostgreSQL 原子操作避免并发问题
 * @param p_style_id - 风格 ID
 * @returns BOOLEAN - 是否成功
 */
CREATE OR REPLACE FUNCTION increment_style_view_count(
  p_style_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- 原子增加浏览次数
  UPDATE styles
  SET view_count = view_count + 1
  WHERE id = p_style_id;

  -- 检查是否找到记录
  IF NOT FOUND THEN
    RAISE NOTICE '风格不存在：%', p_style_id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 权限设置
-- ===========================================

-- 允许所有用户（包括匿名用户）调用此函数
GRANT EXECUTE ON FUNCTION increment_style_view_count TO authenticated, anon;

-- 注释说明
COMMENT ON FUNCTION increment_style_view_count IS '原子增加风格浏览次数，避免并发计数错误';
