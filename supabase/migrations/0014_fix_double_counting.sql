-- 修复点赞/收藏双重计数问题
-- 创建时间：2026-04-03
-- 说明：toggle_like_atomic 和 toggle_favorite_atomic 函数原本手动更新计数，
--      但数据库中已有触发器自动更新计数，导致每次操作计数增加 2。
--      此修复移除函数中的手动更新逻辑，改由触发器自动处理。

-- ===========================================
-- 1. 修复点赞原子更新函数
-- ===========================================

/**
 * 切换点赞状态（原子操作）
 * 注意：计数更新由 trigger_update_style_counts_likes 触发器自动处理
 */
CREATE OR REPLACE FUNCTION toggle_like_atomic(
  p_style_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_is_liked BOOLEAN;
  v_count INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- 检查是否已点赞
  SELECT EXISTS (
    SELECT 1 FROM likes WHERE user_id = p_user_id AND style_id = p_style_id
  ) INTO v_exists;

  IF v_exists THEN
    -- 取消点赞：删除记录
    DELETE FROM likes WHERE user_id = p_user_id AND style_id = p_style_id;

    -- 查询当前计数（触发器已自动减少）
    SELECT like_count INTO v_count FROM styles WHERE id = p_style_id;
    v_is_liked := FALSE;
  ELSE
    -- 添加点赞：插入记录
    INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);

    -- 查询当前计数（触发器已自动增加）
    SELECT like_count INTO v_count FROM styles WHERE id = p_style_id;
    v_is_liked := TRUE;
  END IF;

  RETURN json_build_object('is_liked', v_is_liked, 'count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 2. 修复收藏原子更新函数
-- ===========================================

/**
 * 切换收藏状态（原子操作）
 * 注意：计数更新由 trigger_update_style_counts_favorites 触发器自动处理
 */
CREATE OR REPLACE FUNCTION toggle_favorite_atomic(
  p_style_id UUID,
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_is_favorite BOOLEAN;
  v_count INTEGER;
  v_exists BOOLEAN;
BEGIN
  -- 检查是否已收藏
  SELECT EXISTS (
    SELECT 1 FROM favorites WHERE user_id = p_user_id AND style_id = p_style_id
  ) INTO v_exists;

  IF v_exists THEN
    -- 取消收藏：删除记录
    DELETE FROM favorites WHERE user_id = p_user_id AND style_id = p_style_id;

    -- 查询当前计数（触发器已自动减少）
    SELECT favorite_count INTO v_count FROM styles WHERE id = p_style_id;
    v_is_favorite := FALSE;
  ELSE
    -- 添加收藏：插入记录
    INSERT INTO favorites (user_id, style_id) VALUES (p_user_id, p_style_id);

    -- 查询当前计数（触发器已自动增加）
    SELECT favorite_count INTO v_count FROM styles WHERE id = p_style_id;
    v_is_favorite := TRUE;
  END IF;

  RETURN json_build_object('is_favorite', v_is_favorite, 'count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 3. 重新授予执行权限
-- ===========================================

GRANT EXECUTE ON FUNCTION toggle_like_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_favorite_atomic TO authenticated;

COMMENT ON FUNCTION toggle_like_atomic IS '原子切换点赞状态，由触发器自动更新计数';
COMMENT ON FUNCTION toggle_favorite_atomic IS '原子切换收藏状态，由触发器自动更新计数';
