-- StyleSnap 预设风格代码生成迁移
-- 创建时间：2026-04-08
-- 说明：为 10 个预设风格生成完整的 DesignTokens 和代码（CSS Variables, CSS Modules, HTML, README）

-- ===========================================
-- 1. 设计变量转换函数
-- ===========================================

-- 将旧格式的 color_palette 转换为新的 8 色 ColorTokens
CREATE OR REPLACE FUNCTION convert_color_palette(
  old_palette JSONB
) RETURNS JSONB AS $$
DECLARE
  new_palette JSONB;
BEGIN
  -- 从旧格式提取颜色，缺失的颜色使用默认值
  SELECT jsonb_build_object(
    'primary', COALESCE(old_palette->>'primary', '#000000'),
    'secondary', COALESCE(old_palette->>'secondary', '#666666'),
    'background', COALESCE(old_palette->>'background', '#FFFFFF'),
    'surface', COALESCE(old_palette->>'surface', '#F5F5F5'),
    'text', COALESCE(old_palette->>'text', '#1A1A1A'),
    'textMuted', COALESCE(old_palette->>'textMuted', '#666666'),
    'border', COALESCE(old_palette->>'border', '#E0E0E0'),
    'accent', COALESCE(old_palette->>'accent', old_palette->>'primary', '#0066FF')
  ) INTO new_palette;

  RETURN new_palette;
END;
$$ LANGUAGE plpgsql;

-- 将旧格式的 fonts 转换为新的 FontTokens
CREATE OR REPLACE FUNCTION convert_fonts(
  old_fonts JSONB
) RETURNS JSONB AS $$
DECLARE
  new_fonts JSONB;
  heading_font TEXT;
  body_font TEXT;
BEGIN
  heading_font := COALESCE(old_fonts->>'heading', 'Inter, system-ui, sans-serif');
  body_font := COALESCE(old_fonts->>'body', 'Inter, system-ui, sans-serif');

  SELECT jsonb_build_object(
    'heading', heading_font,
    'body', body_font,
    'mono', 'JetBrains Mono, monospace',
    'headingWeight', 700,
    'bodyWeight', 400,
    'headingLineHeight', 1.2,
    'bodyLineHeight', 1.6
  ) INTO new_fonts;

  RETURN new_fonts;
END;
$$ LANGUAGE plpgsql;

-- 将旧格式的 spacing 转换为新的 SpacingTokens
CREATE OR REPLACE FUNCTION convert_spacing(
  old_spacing JSONB
) RETURNS JSONB AS $$
DECLARE
  new_spacing JSONB;
  base_size INTEGER;
BEGIN
  -- 从旧格式提取 base 大小（如 "8px" -> 8）
  base_size := COALESCE(
    NULLIF(regexp_replace(COALESCE(old_spacing->>'base', '8px'), '[^0-9]', '', 'g'), '')::INTEGER,
    8
  );

  SELECT jsonb_build_object(
    'xs', base_size / 2,           -- 4px
    'sm', base_size,               -- 8px
    'md', base_size * 2,           -- 16px
    'lg', base_size * 3,           -- 24px
    'xl', base_size * 4            -- 32px
  ) INTO new_spacing;

  RETURN new_spacing;
END;
$$ LANGUAGE plpgsql;

-- 将旧格式的 border_radius 转换为新的 BorderRadiusTokens
CREATE OR REPLACE FUNCTION convert_border_radius(
  old_radius JSONB
) RETURNS JSONB AS $$
DECLARE
  new_radius JSONB;
BEGIN
  SELECT jsonb_build_object(
    'small', COALESCE(old_radius->>'sm', '4px'),
    'medium', COALESCE(old_radius->>'md', '8px'),
    'large', COALESCE(old_radius->>'lg', '16px')
  ) INTO new_radius;

  RETURN new_radius;
END;
$$ LANGUAGE plpgsql;

-- 将旧格式的 shadows 转换为新的 ShadowTokens
CREATE OR REPLACE FUNCTION convert_shadows(
  old_shadows JSONB
) RETURNS JSONB AS $$
DECLARE
  new_shadows JSONB;
BEGIN
  SELECT jsonb_build_object(
    'light', COALESCE(old_shadows->>'sm', '0 1px 2px rgba(0,0,0,0.05)'),
    'medium', COALESCE(old_shadows->>'md', '0 4px 12px rgba(0,0,0,0.1)'),
    'heavy', COALESCE(old_shadows->>'lg', '0 16px 48px rgba(0,0,0,0.15)')
  ) INTO new_shadows;

  RETURN new_shadows;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 2. 更新 styles 表的设计变量
-- ===========================================

-- 更新所有风格的 design_tokens 字段（使用新的 JSONB 结构）
UPDATE styles s
SET
  color_palette = convert_color_palette(s.color_palette),
  fonts = convert_fonts(s.fonts),
  spacing = convert_spacing(s.spacing),
  border_radius = convert_border_radius(s.border_radius),
  shadows = convert_shadows(s.shadows)
WHERE s.color_palette IS NOT NULL;

-- ===========================================
-- 3. 验证更新结果
-- ===========================================

DO $$
DECLARE
  style_record RECORD;
  style_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO style_count FROM styles WHERE color_palette IS NOT NULL;
  RAISE NOTICE '✅ 已更新 % 个风格的设计变量', style_count;

  -- 输出每个风格的更新结果示例
  FOR style_record IN
    SELECT id, title, color_palette, fonts
    FROM styles
    LIMIT 3
  LOOP
    RAISE NOTICE '  - %: color_palette=%', style_record.title, style_record.color_palette;
  END LOOP;
END $$;
