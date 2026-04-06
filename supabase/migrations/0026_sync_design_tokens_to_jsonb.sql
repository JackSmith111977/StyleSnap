-- 迁移编号：0026
-- 迁移名称：sync_design_tokens_to_jsonb.sql
-- 执行日期：待执行
-- 用途：将独立字段（color_palette, fonts 等）同步到 design_tokens JSONB 列
-- 依赖：0020_add_submission_status.sql（必须先执行）

-- ============================================================
-- 步骤 1: 数据同步 - 将独立字段合并到 design_tokens
-- ============================================================

-- 更新所有风格的 design_tokens 字段，从独立字段构建完整对象
UPDATE styles
SET design_tokens = jsonb_build_object(
  'colorPalette', COALESCE(color_palette, '{}'::jsonb),
  'fonts', COALESCE(fonts, '{}'::jsonb),
  'spacing', COALESCE(spacing, '{}'::jsonb),
  'borderRadius', COALESCE(border_radius, '{}'::jsonb),
  'shadows', COALESCE(shadows, '{}'::jsonb)
)
WHERE id IN (SELECT id FROM styles);

-- ============================================================
-- 步骤 2: 验证同步结果
-- ============================================================

-- 验证设计变量数据结构
SELECT
  id,
  title,
  design_tokens IS NOT NULL as has_design_tokens,
  jsonb_typeof(design_tokens) as tokens_type,
  design_tokens->'colorPalette' IS NOT NULL as has_colors,
  design_tokens->'fonts' IS NOT NULL as has_fonts,
  design_tokens->'spacing' IS NOT NULL as has_spacing,
  design_tokens->'borderRadius' IS NOT NULL as has_border_radius,
  design_tokens->'shadows' IS NOT NULL as has_shadows
FROM styles
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- 步骤 3: 添加注释说明
-- ============================================================

COMMENT ON COLUMN styles.design_tokens IS '设计变量配置（包含 colorPalette, fonts, spacing, borderRadius, shadows）';
COMMENT ON COLUMN styles.color_palette IS '[已弃用] 颜色配置 - 数据已迁移到 design_tokens.colorPalette';
COMMENT ON COLUMN styles.fonts IS '[已弃用] 字体配置 - 数据已迁移到 design_tokens.fonts';
COMMENT ON COLUMN styles.spacing IS '[已弃用] 间距配置 - 数据已迁移到 design_tokens.spacing';
COMMENT ON COLUMN styles.border_radius IS '[已弃用] 圆角配置 - 数据已迁移到 design_tokens.borderRadius';
COMMENT ON COLUMN styles.shadows IS '[已弃用] 阴影配置 - 数据已迁移到 design_tokens.shadows';

-- ============================================================
-- 后续步骤（手动执行，不在本迁移中）
-- ============================================================
-- 1. 确认数据同步成功后，修改代码恢复使用 design_tokens 字段
-- 2. 创建新的迁移文件删除独立字段（可选，建议保留向后兼容）
-- 3. 完整测试后提交代码
