-- Migration: 0021_add_follow_system.sql
-- Description: 添加关注系统数据库支持
-- Created: 2026-04-04

-- ============================================================================
-- 1. 创建关注表
-- ============================================================================

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 防止重复关注
  CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
  -- 不能关注自己
  CONSTRAINT check_not_self_follow CHECK (follower_id != following_id)
);

-- ============================================================================
-- 2. 创建索引（优化查询性能）
-- ============================================================================

-- 查询用户关注的作者
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);

-- 查询用户的粉丝
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- 组合索引（优化关注状态查询）
CREATE INDEX IF NOT EXISTS idx_follows_both ON follows(follower_id, following_id);

-- ============================================================================
-- 3. 添加 RLS 策略
-- ============================================================================

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看关注关系（公开社交图谱）
CREATE POLICY "allows_view_all_follows"
  ON follows FOR SELECT
  USING (true);

-- 只有登录用户可以创建关注
CREATE POLICY "allows_insert_authenticated"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = follower_id
    AND auth.uid() IS NOT NULL
  );

-- 只有发起用户可以取消关注
CREATE POLICY "allows_delete_by_follower"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- ============================================================================
-- 4. 创建关注计数同步触发器
-- ============================================================================

-- 在 profiles 表中添加关注计数字段
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- 初始化现有用户的计数
UPDATE profiles p
SET
  following_count = (
    SELECT COUNT(*) FROM follows f
    WHERE f.follower_id = p.user_id
  ),
  follower_count = (
    SELECT COUNT(*) FROM follows f
    WHERE f.following_id = p.user_id
  );

-- 创建触发器函数：同步关注计数
CREATE OR REPLACE FUNCTION sync_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 新增关注：更新双方的计数
    UPDATE profiles SET following_count = following_count + 1
      WHERE user_id = NEW.follower_id;
    UPDATE profiles SET follower_count = follower_count + 1
      WHERE user_id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 取消关注：更新双方的计数
    UPDATE profiles SET following_count = following_count - 1
      WHERE user_id = OLD.follower_id;
    UPDATE profiles SET follower_count = follower_count - 1
      WHERE user_id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
DROP TRIGGER IF EXISTS on_follow_insert ON follows;
CREATE TRIGGER on_follow_insert
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION sync_follow_counts();

-- ============================================================================
-- 5. 创建获取关注状态的函数（原子操作）
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_follow(
  p_following_id UUID
)
RETURNS TABLE (
  is_following BOOLEAN,
  follower_count INTEGER,
  following_count INTEGER
) AS $$
DECLARE
  v_is_following BOOLEAN;
BEGIN
  -- 检查是否已关注
  SELECT EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id = auth.uid() AND following_id = p_following_id
  ) INTO v_is_following;

  IF v_is_following THEN
    -- 已关注：取消关注
    DELETE FROM follows
    WHERE follower_id = auth.uid() AND following_id = p_following_id;

    RETURN QUERY SELECT false,
      (SELECT follower_count FROM profiles WHERE user_id = p_following_id),
      (SELECT following_count FROM profiles WHERE user_id = auth.uid());
  ELSE
    -- 未关注：创建关注
    INSERT INTO follows (follower_id, following_id)
    VALUES (auth.uid(), p_following_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    RETURN QUERY SELECT true,
      (SELECT follower_count FROM profiles WHERE user_id = p_following_id),
      (SELECT following_count FROM profiles WHERE user_id = auth.uid());
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. 创建获取用户信息的函数（包含关注状态）
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_profile(
  p_user_id UUID,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  style_count BIGINT,
  follower_count INTEGER,
  following_count INTEGER,
  is_following BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    p.display_name,
    p.avatar_url,
    p.bio,
    (SELECT COUNT(*) FROM styles s WHERE s.user_id = p.user_id)::BIGINT as style_count,
    p.follower_count,
    p.following_count,
    CASE
      WHEN p_viewer_id IS NOT NULL THEN
        EXISTS (
          SELECT 1 FROM follows f
          WHERE f.follower_id = p_viewer_id AND f.following_id = p.user_id
        )
      ELSE FALSE
    END as is_following
  FROM profiles p
  WHERE p.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. 创建获取关注动态的函数
-- ============================================================================

CREATE OR REPLACE FUNCTION get_following_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  style_id UUID,
  style_name TEXT,
  style_description TEXT,
  style_preview_light TEXT,
  style_preview_dark TEXT,
  category_id UUID,
  category_name TEXT,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  like_count INTEGER,
  favorite_count INTEGER,
  view_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id as style_id,
    s.name::TEXT as style_name,
    s.description::TEXT as style_description,
    s.preview_image_light::TEXT as style_preview_light,
    s.preview_image_dark::TEXT as style_preview_dark,
    s.category_id,
    c.name::TEXT as category_name,
    s.user_id as author_id,
    p.display_name::TEXT as author_name,
    p.avatar_url::TEXT as author_avatar,
    s.like_count,
    s.favorite_count,
    s.view_count,
    s.created_at
  FROM styles s
  INNER JOIN profiles p ON s.user_id = p.user_id
  INNER JOIN categories c ON s.category_id = c.id
  WHERE s.user_id IN (
    SELECT following_id FROM follows WHERE follower_id = p_user_id
  )
  AND s.is_published = true
  ORDER BY s.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. 注释说明
-- ============================================================================

COMMENT ON TABLE follows IS '用户关注关系表';
COMMENT ON COLUMN follows.follower_id IS '关注者 ID（主动关注的人）';
COMMENT ON COLUMN follows.following_id IS '被关注者 ID（被关注的作者）';
COMMENT ON FUNCTION toggle_follow IS '原子切换关注状态，防止并发问题';
COMMENT ON FUNCTION get_user_profile IS '获取用户资料，包含关注状态';
COMMENT ON FUNCTION get_following_feed IS '获取关注动态信息流';
