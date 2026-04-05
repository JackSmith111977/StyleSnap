-- Migration: 0024_unified_favorites.sql
-- Description: 统一收藏管理系统 - 双表设计支持多合集关联
-- Created: 2026-04-05
-- Modified: 2026-04-05

-- ============================================================================
-- 变更说明
-- ============================================================================
-- 此迁移将"收藏"和"合集"两个独立系统合并为统一的收藏管理系统：
-- 1. 保留 favorites 表记录收藏关系（user_id + style_id 唯一）
-- 2. 创建 style_collection_tags 表支持风格与合集的多对多关系
-- 3. 删除冗余的 collection_styles 表
-- 4. 收藏计数独立于合集关联（无论加入多少合集，只算一次收藏）
-- ============================================================================

-- ============================================================================
-- 步骤 1: 清理旧迁移（如果已执行 0023）
-- ============================================================================

-- 删除旧的 collection_styles 表（如果存在）
DROP TABLE IF EXISTS collection_styles CASCADE;

-- ============================================================================
-- 步骤 2: 确保 favorites 表结构正确
-- ============================================================================

-- 确保 favorites 表存在
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_style UNIQUE(user_id, style_id)
);

-- 清理可能存在的旧索引
DROP INDEX IF EXISTS idx_favorites_user_id;
DROP INDEX IF EXISTS idx_favorites_style_id;
DROP INDEX IF EXISTS idx_favorites_collection_id;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_style_id ON favorites(style_id);

-- ============================================================================
-- 步骤 3: 创建 style_collection_tags 表（风格 - 合集多对多关联）
-- ============================================================================

CREATE TABLE IF NOT EXISTS style_collection_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_style_collection UNIQUE(user_id, style_id, collection_id),
  -- 复合外键：确保 (user_id, style_id) 必须存在于 favorites 表
  -- 这消除了竞态条件：如果收藏不存在，插入会被拒绝
  CONSTRAINT fk_favorites FOREIGN KEY (user_id, style_id)
    REFERENCES favorites(user_id, style_id)
    ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_style_collection_tags_user_id ON style_collection_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_style_collection_tags_collection_id ON style_collection_tags(collection_id);
CREATE INDEX IF NOT EXISTS idx_style_collection_tags_style_id ON style_collection_tags(style_id);

-- ============================================================================
-- 步骤 4: 迁移现有数据（从 0023 的 collection_styles）
-- ============================================================================

-- 如果存在旧的 collection_styles 数据，迁移到 style_collection_tags
-- 注意：这需要在 0023 迁移已执行的情况下才需要
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'collection_styles') THEN
    INSERT INTO style_collection_tags (user_id, style_id, collection_id, created_at)
    SELECT
      c.user_id,
      cs.style_id,
      cs.collection_id,
      cs.created_at
    FROM collection_styles cs
    JOIN collections c ON cs.collection_id = c.id
    ON CONFLICT (user_id, style_id, collection_id) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 步骤 5: 更新 RLS 策略
-- ============================================================================

-- favorites 表 RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "allows_view_own_favorites" ON favorites;
DROP POLICY IF EXISTS "allows_manage_own_favorites" ON favorites;
DROP POLICY IF EXISTS "favorites_public_read" ON favorites;

-- 创建新策略
CREATE POLICY "allows_view_own_favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allows_manage_own_favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- style_collection_tags 表 RLS
ALTER TABLE style_collection_tags ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "allows_view_own_tags" ON style_collection_tags;
DROP POLICY IF EXISTS "allows_manage_own_tags" ON style_collection_tags;
DROP POLICY IF EXISTS "allows_view_public_collection_tags" ON style_collection_tags;

-- 创建新策略
CREATE POLICY "allows_view_own_tags"
  ON style_collection_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "allows_manage_own_tags"
  ON style_collection_tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 公开合集的标签可被任何人查看
CREATE POLICY "allows_view_public_collection_tags"
  ON style_collection_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = style_collection_tags.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

-- ============================================================================
-- 步骤 6: 创建 RPC 函数（可选，用于简化 Server Actions）
-- ============================================================================

-- 删除旧函数（如果存在）- 必须先删除才能改变返回类型
DROP FUNCTION IF EXISTS toggle_favorite_atomic(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_favorites(UUID, UUID, INTEGER, INTEGER) CASCADE;

-- 切换收藏状态（返回是否已收藏和收藏计数）
CREATE OR REPLACE FUNCTION toggle_favorite_atomic(p_style_id UUID, p_user_id UUID)
RETURNS TABLE(is_favorite BOOLEAN, count BIGINT) AS $$
DECLARE
  v_is_favorite BOOLEAN;
  v_count BIGINT;
BEGIN
  -- 检查是否已收藏
  IF EXISTS (SELECT 1 FROM favorites WHERE user_id = p_user_id AND style_id = p_style_id) THEN
    -- 取消收藏（级联删除 style_collection_tags）
    DELETE FROM favorites WHERE user_id = p_user_id AND style_id = p_style_id;
    v_is_favorite := FALSE;
  ELSE
    -- 添加收藏
    INSERT INTO favorites (user_id, style_id) VALUES (p_user_id, p_style_id);
    v_is_favorite := TRUE;
  END IF;

  -- 获取收藏计数
  SELECT COUNT(*) INTO v_count FROM favorites WHERE style_id = p_style_id;

  RETURN QUERY SELECT v_is_favorite, v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 获取用户的收藏列表（支持按合集筛选）
CREATE OR REPLACE FUNCTION get_user_favorites(
  p_user_id UUID,
  p_collection_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  style_id UUID,
  favorited_at TIMESTAMPTZ,
  collections JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.style_id,
    f.created_at as favorited_at,
    COALESCE(
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'collection_id', sct.collection_id,
          'collection_name', c.name
        )
      ) FILTER (WHERE sct.collection_id IS NOT NULL),
      '[]'::JSONB
    ) as collections
  FROM favorites f
  LEFT JOIN style_collection_tags sct ON f.style_id = sct.style_id AND sct.user_id = p_user_id
  LEFT JOIN collections c ON sct.collection_id = c.id
  WHERE f.user_id = p_user_id
  AND (p_collection_id IS NULL OR sct.collection_id = p_collection_id)
  GROUP BY f.id, f.style_id, f.created_at
  ORDER BY f.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 步骤 7: 注释说明
-- ============================================================================

COMMENT ON TABLE favorites IS '用户收藏记录表（user_id + style_id 唯一，收藏计数依据）';
COMMENT ON TABLE style_collection_tags IS '风格 - 合集关联表（多对多关系，不影响收藏计数）';
COMMENT ON FUNCTION toggle_favorite_atomic IS '原子切换收藏状态，返回是否收藏和计数';
COMMENT ON FUNCTION get_user_favorites IS '获取用户收藏列表，支持按合集筛选';
