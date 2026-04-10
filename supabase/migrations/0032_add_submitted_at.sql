-- 添加 submitted_at 字段用于审核队列排序
-- 为 styles 表添加提交审核时间戳

-- 添加 submitted_at 字段（如果不存在）
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NULL;

-- 为 submitted_at 创建索引以优化审核队列查询
CREATE INDEX IF NOT EXISTS idx_styles_submitted_at_desc
  ON styles(submitted_at DESC NULLS LAST)
  WHERE status = 'pending_review';

COMMENT ON COLUMN styles.submitted_at IS '风格提交审核的时间，用于审核队列排序';
