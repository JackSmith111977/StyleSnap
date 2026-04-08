-- StyleSnap 添加代码存储字段迁移
-- 创建时间：2026-04-08
-- 说明：添加 code_readme 和 code_css_modules 字段，用于存储完整的设计系统代码

-- ===========================================
-- 1. 添加新字段
-- ===========================================

-- 添加 code_css_modules 字段（存储 CSS Modules 代码）
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS code_css_modules TEXT;

-- 添加 code_readme 字段（存储 README.md 文档）
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS code_readme TEXT;

-- ===========================================
-- 2. 添加索引（可选，用于加速查询）
-- ===========================================

-- 为 code_readme 添加 Gin 索引（用于全文搜索）
CREATE INDEX IF NOT EXISTS idx_styles_code_readme_search
ON styles USING gin(to_tsvector('simple', COALESCE(code_readme, '')));

-- ===========================================
-- 3. 验证
-- ===========================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'styles'
      AND column_name IN ('code_css_modules', 'code_readme');

    IF col_count = 2 THEN
        RAISE NOTICE '✅ 成功添加 code_css_modules 和 code_readme 字段';
    ELSE
        RAISE WARNING '⚠️ 字段添加可能失败，请检查';
    END IF;
END $$;
