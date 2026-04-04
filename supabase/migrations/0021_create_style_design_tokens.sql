-- Story 6.8: 风格预览组件
-- 创建 style_design_tokens 表用于存储设计风格变量

-- 创建设计变量表
CREATE TABLE IF NOT EXISTS style_design_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID NOT NULL REFERENCES styles(id) ON DELETE CASCADE,

  -- 颜色变量 (JSONB)
  colors JSONB DEFAULT '{
    "primary": "#3B82F6",
    "secondary": "#10B981",
    "background": "#FFFFFF",
    "surface": "#F3F4F6",
    "text": "#1F2937",
    "textMuted": "#6B7280"
  }'::jsonb,

  -- 字体变量 (JSONB)
  typography JSONB DEFAULT '{
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingWeight": 700,
    "bodyWeight": 400,
    "scaleRatio": 1.25
  }'::jsonb,

  -- 间距变量 (JSONB)
  spacing JSONB DEFAULT '{
    "unit": "4px",
    "scale": [4, 8, 16, 24, 32]
  }'::jsonb,

  -- 圆角变量 (JSONB)
  border_radius JSONB DEFAULT '{
    "small": "4px",
    "medium": "8px",
    "large": "16px"
  }'::jsonb,

  -- 阴影变量 (JSONB)
  shadows JSONB DEFAULT '{
    "light": "0 1px 2px rgba(0,0,0,0.05)",
    "medium": "0 4px 6px rgba(0,0,0,0.1)",
    "heavy": "0 10px 15px rgba(0,0,0,0.15)"
  }'::jsonb,

  -- 深色模式覆盖 (JSONB, 可选)
  dark_mode_overrides JSONB DEFAULT '{}'::jsonb,

  -- 元数据
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- 约束：每个风格只能有一套设计变量
  CONSTRAINT unique_style_design_tokens UNIQUE (style_id)
);

-- 创建索引
CREATE INDEX idx_style_design_tokens_style_id ON style_design_tokens(style_id);
CREATE INDEX idx_style_design_tokens_colors ON style_design_tokens USING GIN (colors);
CREATE INDEX idx_style_design_tokens_typography ON style_design_tokens USING GIN (typography);

-- 启用行级安全
ALTER TABLE style_design_tokens ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略

-- 1. 允许任何人读取
CREATE POLICY "允许任何人读取设计变量"
  ON style_design_tokens
  FOR SELECT
  TO public
  USING (true);

-- 2. 只允许已登录用户插入（用于用户提交）
CREATE POLICY "允许已登录用户插入设计变量"
  ON style_design_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. 只允许作者或管理员更新
CREATE POLICY "允许作者或管理员更新设计变量"
  ON style_design_tokens
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM styles
      WHERE styles.id = style_design_tokens.style_id
      AND styles.author_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 4. 只允许作者或管理员删除
CREATE POLICY "允许作者或管理员删除设计变量"
  ON style_design_tokens
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM styles
      WHERE styles.id = style_design_tokens.style_id
      AND styles.author_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_style_design_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER style_design_tokens_updated_at
  BEFORE UPDATE ON style_design_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_style_design_tokens_updated_at();

-- 为现有风格创建默认设计变量（可选）
-- 如果已有风格数据，可以为它们创建默认的设计变量记录
INSERT INTO style_design_tokens (style_id, colors, typography, spacing, border_radius, shadows)
SELECT
  id,
  '{"primary": "#3B82F6", "secondary": "#10B981", "background": "#FFFFFF", "surface": "#F3F4F6", "text": "#1F2937", "textMuted": "#6B7280"}'::jsonb,
  '{"fontFamily": "Inter, system-ui, sans-serif", "headingWeight": 700, "bodyWeight": 400, "scaleRatio": 1.25}'::jsonb,
  '{"unit": "4px", "scale": [4, 8, 16, 24, 32]}'::jsonb,
  '{"small": "4px", "medium": "8px", "large": "16px"}'::jsonb,
  '{"light": "0 1px 2px rgba(0,0,0,0.05)", "medium": "0 4px 6px rgba(0,0,0,0.1)", "heavy": "0 10px 15px rgba(0,0,0,0.15)"}'::jsonb
FROM styles
ON CONFLICT (style_id) DO NOTHING;

-- 添加注释
COMMENT ON TABLE style_design_tokens IS '风格设计变量表 - 存储设计风格的颜色、字体、间距等设计系统变量';
COMMENT ON COLUMN style_design_tokens.colors IS '颜色变量：primary, secondary, background, surface, text, textMuted';
COMMENT ON COLUMN style_design_tokens.typography IS '字体变量：fontFamily, headingWeight, bodyWeight, scaleRatio';
COMMENT ON COLUMN style_design_tokens.spacing IS '间距变量：unit, scale 数组';
COMMENT ON COLUMN style_design_tokens.border_radius IS '圆角变量：small, medium, large';
COMMENT ON COLUMN style_design_tokens.shadows IS '阴影变量：light, medium, heavy';
COMMENT ON COLUMN style_design_tokens.dark_mode_overrides IS '深色模式覆盖值：可选择性覆盖自动生成的深色模式颜色';
