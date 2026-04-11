-- Migration: 0033_add_review_fields.sql
-- Description: 添加审核相关字段到 styles 表（review_notes, reviewed_by, reviewed_at）

-- 添加审核相关字段
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

COMMENT ON COLUMN styles.review_notes IS '审核员备注（拒绝时必填）';
COMMENT ON COLUMN styles.reviewed_by IS '审核人 ID';
COMMENT ON COLUMN styles.reviewed_at IS '审核时间';

-- 为 reviewed_by 添加索引（用于查询某管理员的审核记录）
CREATE INDEX IF NOT EXISTS idx_styles_reviewed_by ON styles(reviewed_by) WHERE reviewed_by IS NOT NULL;
