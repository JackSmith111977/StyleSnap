-- StyleSnap 原子更新函数
-- 创建时间：2026-04-01
-- 说明：使用数据库函数实现点赞/收藏的原子更新，避免并发问题

-- ===========================================
-- 1. 点赞原子更新函数
-- ===========================================

/**
 * 切换点赞状态并更新计数（原子操作）
 * @param p_style_id - 风格 ID
 * @param p_user_id - 用户 ID
 * @returns JSON { is_liked: boolean, count: number }
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
    -- 取消点赞：删除记录并减少计数
    DELETE FROM likes WHERE user_id = p_user_id AND style_id = p_style_id;

    UPDATE styles
    SET like_count = GREATEST(like_count - 1, 0)
    WHERE id = p_style_id
    RETURNING like_count INTO v_count;

    v_is_liked := FALSE;
  ELSE
    -- 添加点赞：插入记录并增加计数
    INSERT INTO likes (user_id, style_id) VALUES (p_user_id, p_style_id);

    UPDATE styles
    SET like_count = like_count + 1
    WHERE id = p_style_id
    RETURNING like_count INTO v_count;

    v_is_liked := TRUE;
  END IF;

  RETURN json_build_object('is_liked', v_is_liked, 'count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 2. 收藏原子更新函数
-- ===========================================

/**
 * 切换收藏状态并更新计数（原子操作）
 * @param p_style_id - 风格 ID
 * @param p_user_id - 用户 ID
 * @returns JSON { is_favorite: boolean, count: number }
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
    -- 取消收藏：删除记录并减少计数
    DELETE FROM favorites WHERE user_id = p_user_id AND style_id = p_style_id;

    UPDATE styles
    SET favorite_count = GREATEST(favorite_count - 1, 0)
    WHERE id = p_style_id
    RETURNING favorite_count INTO v_count;

    v_is_favorite := FALSE;
  ELSE
    -- 添加收藏：插入记录并增加计数
    INSERT INTO favorites (user_id, style_id) VALUES (p_user_id, p_style_id);

    UPDATE styles
    SET favorite_count = favorite_count + 1
    WHERE id = p_style_id
    RETURNING favorite_count INTO v_count;

    v_is_favorite := TRUE;
  END IF;

  RETURN json_build_object('is_favorite', v_is_favorite, 'count', v_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 3. 权限设置
-- ===========================================

-- 允许认证用户调用这些函数
GRANT EXECUTE ON FUNCTION toggle_like_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION toggle_favorite_atomic TO authenticated;

-- 注释说明
COMMENT ON FUNCTION toggle_like_atomic IS '原子切换点赞状态，避免并发计数错误';
COMMENT ON FUNCTION toggle_favorite_atomic IS '原子切换收藏状态，避免并发计数错误';
