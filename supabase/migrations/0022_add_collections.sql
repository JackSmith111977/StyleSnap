-- Migration: 0022_add_collections.sql
-- Description: 添加用户合集系统数据库支持
-- Created: 2026-04-05

-- ============================================================================
-- 1. 创建合集表
-- ============================================================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cover_style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 同一用户不能有重复合集名
  CONSTRAINT unique_user_collection_name UNIQUE(user_id, name),
  -- 合集名称长度验证
  CONSTRAINT check_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 50)
);

-- ============================================================================
-- 2. 创建合集 - 风格关联表
-- ============================================================================

CREATE TABLE IF NOT EXISTS collection_styles (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, style_id)
);

-- ============================================================================
-- 3. 创建索引（优化查询性能）
-- ============================================================================

-- 查询用户的合集
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);

-- 查询合集包含的风格
CREATE INDEX IF NOT EXISTS idx_collection_styles_collection_id ON collection_styles(collection_id);

-- 查询风格被哪些合集包含
CREATE INDEX IF NOT EXISTS idx_collection_styles_style_id ON collection_styles(style_id);

-- 查询公开合集
CREATE INDEX IF NOT EXISTS idx_collections_is_public ON collections(is_public);

-- ============================================================================
-- 4. 添加 RLS 策略
-- ============================================================================

-- collections 表 RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看公开合集
CREATE POLICY "allows_view_public_collections"
  ON collections FOR SELECT
  USING (is_public = true);

-- 用户可以查看自己的所有合集（包括私密）
CREATE POLICY "allows_view_own_collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

-- 只有登录用户可以创建合集
CREATE POLICY "allows_insert_authenticated"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 只有合集所有者可以更新
CREATE POLICY "allows_update_owner"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 只有合集所有者可以删除
CREATE POLICY "allows_delete_owner"
  ON collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- collection_styles 表 RLS
ALTER TABLE collection_styles ENABLE ROW LEVEL SECURITY;

-- 任何人都可以查看公开合集中的风格关联
CREATE POLICY "allows_view_public_collection_styles"
  ON collection_styles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_styles.collection_id
      AND (collections.is_public = true OR collections.user_id = auth.uid())
    )
  );

-- 只有合集所有者可以添加/移除风格
CREATE POLICY "allows_modify_owner"
  ON collection_styles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_styles.collection_id
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "allows_delete_owner"
  ON collection_styles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_styles.collection_id
      AND collections.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5. 创建触发器：自动更新 updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_collections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_collections_update
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_collections_updated_at();

-- ============================================================================
-- 6. 创建约束：每个合集最多 50 个风格
-- ============================================================================

CREATE OR REPLACE FUNCTION check_collection_style_limit()
RETURNS TRIGGER AS $$
DECLARE
  style_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO style_count
  FROM collection_styles
  WHERE collection_id = NEW.collection_id;

  IF style_count >= 50 THEN
    RAISE EXCEPTION '每个合集最多添加 50 个风格';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_collection_styles_insert
  BEFORE INSERT ON collection_styles
  FOR EACH ROW
  EXECUTE FUNCTION check_collection_style_limit();

-- ============================================================================
-- 7. 创建约束：每个用户最多 20 个合集
-- ============================================================================

CREATE OR REPLACE FUNCTION check_user_collection_limit()
RETURNS TRIGGER AS $$
DECLARE
  collection_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO collection_count
  FROM collections
  WHERE user_id = NEW.user_id;

  IF collection_count >= 20 THEN
    RAISE EXCEPTION '每个用户最多创建 20 个合集';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_collections_insert
  BEFORE INSERT ON collections
  FOR EACH ROW
  EXECUTE FUNCTION check_user_collection_limit();

-- ============================================================================
-- 8. 创建 RPC 函数：获取合集详情（包含风格列表）
-- ============================================================================

CREATE OR REPLACE FUNCTION get_collection_detail(
  p_collection_id UUID,
  p_viewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  description TEXT,
  cover_style_id UUID,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  style_count BIGINT,
  owner_name TEXT,
  owner_avatar TEXT,
  styles JSONB
) AS $$
BEGIN
  -- 检查权限
  IF NOT EXISTS (
    SELECT 1 FROM collections
    WHERE id = p_collection_id
    AND (is_public = true OR user_id = p_viewer_id)
  ) THEN
    RAISE EXCEPTION '无权访问此合集';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.user_id,
    c.name::TEXT,
    c.description::TEXT,
    c.cover_style_id,
    c.is_public,
    c.created_at,
    c.updated_at,
    COUNT(cs.style_id)::BIGINT as style_count,
    p.display_name::TEXT as owner_name,
    p.avatar_url::TEXT as owner_avatar,
    COALESCE(
      JSONB_AGG(
        JSONB_BUILD_OBJECT(
          'id', s.id,
          'name', s.name,
          'description', s.description,
          'preview_image_light', s.preview_image_light,
          'preview_image_dark', s.preview_image_dark,
          'category_id', s.category_id
        )
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::JSONB
    ) as styles
  FROM collections c
  LEFT JOIN profiles p ON c.user_id = p.user_id
  LEFT JOIN collection_styles cs ON c.id = cs.collection_id
  LEFT JOIN styles s ON cs.style_id = s.id
  WHERE c.id = p_collection_id
  GROUP BY c.id, p.display_name, p.avatar_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. 创建 RPC 函数：获取用户的合集列表
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_collections(
  p_user_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  cover_style_id UUID,
  is_public BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  style_count BIGINT,
  cover_preview TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name::TEXT,
    c.description::TEXT,
    c.cover_style_id,
    c.is_public,
    c.created_at,
    c.updated_at,
    COUNT(cs.style_id)::BIGINT as style_count,
    (s.preview_image_light)::TEXT as cover_preview
  FROM collections c
  LEFT JOIN collection_styles cs ON c.id = cs.collection_id
  LEFT JOIN styles s ON c.cover_style_id = s.id
  WHERE c.user_id = p_user_id
  AND (c.is_public = true OR c.user_id = p_viewer_id)
  GROUP BY c.id, s.preview_image_light
  ORDER BY c.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. 创建 RPC 函数：添加风格到合集
-- ============================================================================

CREATE OR REPLACE FUNCTION add_style_to_collection(
  p_collection_id UUID,
  p_style_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查合集是否存在且属于当前用户
  IF NOT EXISTS (
    SELECT 1 FROM collections
    WHERE id = p_collection_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION '合集不存在或无权操作';
  END IF;

  -- 检查风格是否存在
  IF NOT EXISTS (
    SELECT 1 FROM styles
    WHERE id = p_style_id
  ) THEN
    RAISE EXCEPTION '风格不存在';
  END IF;

  -- 检查是否已存在
  IF EXISTS (
    SELECT 1 FROM collection_styles
    WHERE collection_id = p_collection_id
    AND style_id = p_style_id
  ) THEN
    RAISE EXCEPTION '风格已在合集中';
  END IF;

  -- 插入关联
  INSERT INTO collection_styles (collection_id, style_id)
  VALUES (p_collection_id, p_style_id);

  -- 更新合集的 updated_at
  UPDATE collections SET updated_at = NOW() WHERE id = p_collection_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. 创建 RPC 函数：从合集移除风格
-- ============================================================================

CREATE OR REPLACE FUNCTION remove_style_from_collection(
  p_collection_id UUID,
  p_style_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- 检查合集是否存在且属于当前用户
  IF NOT EXISTS (
    SELECT 1 FROM collections
    WHERE id = p_collection_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION '合集不存在或无权操作';
  END IF;

  -- 删除关联
  DELETE FROM collection_styles
  WHERE collection_id = p_collection_id
  AND style_id = p_style_id;

  -- 更新合集的 updated_at
  UPDATE collections SET updated_at = NOW() WHERE id = p_collection_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. 注释说明
-- ============================================================================

COMMENT ON TABLE collections IS '用户风格合集表';
COMMENT ON TABLE collection_styles IS '合集 - 风格关联表';
COMMENT ON FUNCTION get_collection_detail IS '获取合集详情（包含风格列表）';
COMMENT ON FUNCTION get_user_collections IS '获取用户的合集列表';
COMMENT ON FUNCTION add_style_to_collection IS '添加风格到合集';
COMMENT ON FUNCTION remove_style_from_collection IS '从合集移除风格';
