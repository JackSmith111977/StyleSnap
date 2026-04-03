-- =====================================================
-- StyleSnap RPC 函数修复
-- 执行位置：Supabase Dashboard → SQL Editor
-- =====================================================

-- 删除旧函数（解决返回类型不匹配问题）
-- =====================================================
DROP FUNCTION IF EXISTS increment_style_view_count(UUID);
DROP FUNCTION IF EXISTS get_related_styles(UUID,UUID,UUID[],INTEGER);

-- 1. 修复 increment_style_view_count 函数
-- =====================================================
CREATE OR REPLACE FUNCTION increment_style_view_count(
  p_style_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE styles
  SET view_count = view_count + 1
  WHERE id = p_style_id;

  IF NOT FOUND THEN
    RAISE NOTICE '风格不存在：%', p_style_id;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_style_view_count TO authenticated, anon;

-- 2. 修复 get_related_styles 函数（title 类型改为 VARCHAR(200)，count 类型改为 INTEGER）
-- =====================================================
CREATE OR REPLACE FUNCTION get_related_styles(
  target_style_id UUID,
  target_category_id UUID DEFAULT NULL,
  target_tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
  result_limit INTEGER DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  description TEXT,
  category_id UUID,
  author_id UUID,
  color_palette JSONB,
  fonts JSONB,
  spacing JSONB,
  border_radius JSONB,
  shadows JSONB,
  code_html TEXT,
  code_css TEXT,
  code_react TEXT,
  code_tailwind TEXT,
  preview_light TEXT,
  preview_dark TEXT,
  preview_images JSONB,
  status TEXT,
  view_count INTEGER,
  like_count INTEGER,
  favorite_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  category JSONB,
  style_tags JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  same_category_count INTEGER;
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.title::VARCHAR(200),
    s.description,
    s.category_id,
    s.author_id,
    s.color_palette,
    s.fonts,
    s.spacing,
    s.border_radius,
    s.shadows,
    s.code_html,
    s.code_css,
    s.code_react,
    s.code_tailwind,
    s.preview_light,
    s.preview_dark,
    s.preview_images,
    s.status::TEXT,
    s.view_count::INTEGER,
    s.like_count::INTEGER,
    s.favorite_count::INTEGER,
    s.created_at,
    s.updated_at,
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'name_en', c.name_en,
      'icon', c.icon
    ) as category,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'tag', jsonb_build_object(
            'name', t.name
          )
        )
      ) FILTER (WHERE t.id IS NOT NULL),
      '[]'::jsonb
    ) as style_tags
  FROM styles s
  INNER JOIN categories c ON c.id = s.category_id
  LEFT JOIN style_tags st ON st.style_id = s.id
  LEFT JOIN tags t ON t.id = st.tag_id
  WHERE s.status = 'published'
    AND s.id != target_style_id
    AND (target_category_id IS NULL OR s.category_id = target_category_id)
  GROUP BY s.id, c.id
  ORDER BY s.like_count DESC, s.view_count DESC
  LIMIT result_limit;

  GET DIAGNOSTICS same_category_count = ROW_COUNT;

  IF same_category_count < result_limit AND array_length(target_tag_ids, 1) > 0 THEN
    RETURN QUERY
    SELECT
      s.id,
      s.title::VARCHAR(200),
      s.description,
      s.category_id,
      s.author_id,
      s.color_palette,
      s.fonts,
      s.spacing,
      s.border_radius,
      s.shadows,
      s.code_html,
      s.code_css,
      s.code_react,
      s.code_tailwind,
      s.preview_light,
      s.preview_dark,
      s.preview_images,
      s.status::TEXT,
      s.view_count::INTEGER,
      s.like_count::INTEGER,
      s.favorite_count::INTEGER,
      s.created_at,
      s.updated_at,
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'name_en', c.name_en,
        'icon', c.icon
      ) as category,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'tag', jsonb_build_object(
              'name', t.name
            )
          )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'::jsonb
      ) as style_tags
    FROM styles s
    INNER JOIN categories c ON c.id = s.category_id
    LEFT JOIN style_tags st ON st.style_id = s.id
    LEFT JOIN tags t ON t.id = st.tag_id
    WHERE s.status = 'published'
      AND s.id != target_style_id
      AND s.id NOT IN (
        SELECT related.id FROM (
          SELECT id FROM styles
          WHERE status = 'published'
            AND id != target_style_id
            AND (target_category_id IS NULL OR category_id = target_category_id)
          ORDER BY like_count DESC, view_count DESC
          LIMIT result_limit
        ) related
      )
      AND EXISTS (
        SELECT 1 FROM style_tags st2
        WHERE st2.style_id = s.id
          AND st2.tag_id = ANY(target_tag_ids)
      )
    GROUP BY s.id, c.id
    ORDER BY s.like_count DESC, s.view_count DESC
    LIMIT (result_limit - same_category_count);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION get_related_styles TO authenticated;

-- 验证
-- =====================================================
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc
  WHERE proname IN ('get_related_styles', 'increment_style_view_count');

  IF func_count >= 2 THEN
    RAISE NOTICE '✅ RPC 函数修复成功：get_related_styles, increment_style_view_count';
  ELSE
    RAISE WARNING '⚠️ 部分 RPC 函数可能创建失败';
  END IF;
END $$;
