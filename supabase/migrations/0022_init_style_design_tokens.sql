-- 为现有风格填充默认设计变量
-- 执行于：2026-04-04
-- 用途：Story 6.8 v1.2 完整设计变量系统数据初始化

-- 更新所有风格的设计变量字段（如果为空）
UPDATE styles
SET
  color_palette = COALESCE(color_palette, '{
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "background": "#FFFFFF",
    "surface": "#F3F4F6",
    "text": "#1F2937",
    "textMuted": "#6B7280",
    "border": "#E5E7EB",
    "accent": "#60A5FA"
  }'::jsonb),
  fonts = COALESCE(fonts, '{
    "heading": "Inter, system-ui, sans-serif",
    "body": "Inter, system-ui, sans-serif",
    "mono": "Fira Code, monospace",
    "headingWeight": 700,
    "bodyWeight": 400,
    "headingLineHeight": 1.2,
    "bodyLineHeight": 1.5
  }'::jsonb),
  spacing = COALESCE(spacing, '{
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32
  }'::jsonb),
  border_radius = COALESCE(border_radius, '{
    "small": "4px",
    "medium": "8px",
    "large": "16px"
  }'::jsonb),
  shadows = COALESCE(shadows, '{
    "light": "0 1px 2px rgba(0,0,0,0.05)",
    "medium": "0 4px 6px rgba(0,0,0,0.1)",
    "heavy": "0 10px 15px rgba(0,0,0,0.15)"
  }'::jsonb)
WHERE id IN (SELECT id FROM styles);

-- 验证更新结果
SELECT
  id,
  title,
  color_palette IS NOT NULL as has_colors,
  fonts IS NOT NULL as has_fonts,
  spacing IS NOT NULL as has_spacing,
  border_radius IS NOT NULL as has_border_radius,
  shadows IS NOT NULL as has_shadows
FROM styles
LIMIT 10;
