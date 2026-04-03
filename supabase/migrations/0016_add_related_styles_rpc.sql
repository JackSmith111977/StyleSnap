-- 获取相关推荐风格的 RPC 函数
-- 创建时间：2026-04-03
-- 说明：用于 Story 3.5 相关推荐功能，按分类和标签匹配相似风格

-- ===========================================
-- 获取相关推荐风格
-- ===========================================

CREATE OR REPLACE FUNCTION get_related_styles(
  target_style_id UUID,
  target_category_id UUID DEFAULT NULL,
  target_tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
  result_limit INTEGER DEFAULT 4
)
RETURNS TABLE (
  id UUID,
  title TEXT,
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
  view_count BIGINT,
  like_count BIGINT,
  favorite_count BIGINT,
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
  same_tag_count INTEGER;
BEGIN
  -- 1. 先尝试获取同分类的其他风格（排除自己）
  -- 按点赞数排序，取前 limit 个
  RETURN QUERY
  SELECT
    s.id,
    s.title,
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
    s.view_count,
    s.like_count,
    s.favorite_count,
    s.created_at,
    s.updated_at,
    -- 聚合分类信息为 JSONB
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'name_en', c.name_en,
      'icon', c.icon
    ) as category,
    -- 聚合标签信息为 JSONB 数组
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

  -- 检查是否找到结果
  GET DIAGNOSTICS same_category_count = ROW_COUNT;

  -- 如果同分类风格不足，再按标签匹配补充
  IF same_category_count < result_limit AND array_length(target_tag_ids, 1) > 0 THEN
    -- 返回剩余数量的结果，按标签匹配
    RETURN QUERY
    SELECT
      s.id,
      s.title,
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
      s.view_count,
      s.like_count,
      s.favorite_count,
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
        -- 排除已经返回的结果
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
        -- 至少有一个匹配的标签
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

-- 授予执行权限
GRANT EXECUTE ON FUNCTION get_related_styles TO authenticated;

-- ===========================================
-- 验证查询
-- ===========================================

-- 测试函数是否创建成功
DO $$
DECLARE
  test_count INTEGER;
BEGIN
  -- 检查函数是否存在
  SELECT COUNT(*) INTO test_count
  FROM pg_proc
  WHERE proname = 'get_related_styles';

  IF test_count > 0 THEN
    RAISE NOTICE '✅ get_related_styles RPC 函数创建成功';
  ELSE
    RAISE WARNING '⚠️ get_related_styles RPC 函数创建失败';
  END IF;
END $$;
