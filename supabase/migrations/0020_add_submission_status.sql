-- 添加风格提交审核状态
-- 修改 styles 表的 status ENUM 类型，添加审核相关状态

-- 创建新的 ENUM 类型（包含审核状态）
DO $$
BEGIN
  -- 检查是否已经存在 pending_review 状态
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'style_status' AND e.enumlabel = 'pending_review'
  ) THEN
    -- 如果 styles 表使用的是旧 ENUM，先添加新值
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'pending_review';
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'approved';
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'rejected';
  END IF;
END $$;

-- 添加设计变量字段（如果不存在）
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS design_tokens JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preview_images JSONB DEFAULT '{}';

-- 添加索引以支持审核队列查询
CREATE INDEX IF NOT EXISTS idx_styles_status ON styles(status);
CREATE INDEX IF NOT EXISTS idx_styles_author_id ON styles(author_id);

COMMENT ON COLUMN styles.design_tokens IS '设计变量配置（色板、字体、间距等）';
COMMENT ON COLUMN styles.preview_images IS '预览图 URLs（light/dark）';
