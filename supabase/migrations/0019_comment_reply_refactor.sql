-- =====================================================
-- StyleSnap 评论系统重构 - 扁平化存储方案
-- 执行位置：Supabase Dashboard → SQL Editor
-- 说明：将评论系统从深度嵌套改为扁平化存储
-- =====================================================

-- 1. 添加新字段
-- =====================================================
ALTER TABLE comments
ADD COLUMN IF NOT EXISTS reply_to_user_id UUID REFERENCES profiles(id);

-- 2. 添加索引（优化查询性能）
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_comments_reply_to_user
ON comments(reply_to_user_id);

-- 3. 更新现有数据的 parent_id（将二级回复的 parent_id 指向一级评论）
-- =====================================================
-- 注意：此迁移假设现有数据中二级回复的 parent_id 指向一级评论
-- 如果存在三级回复，需要将它们的 parent_id 更新为爷爷评论的 parent_id
UPDATE comments c1
SET parent_id = c2.parent_id
FROM comments c2
WHERE c1.parent_id = c2.id
  AND c2.parent_id IS NOT NULL;

-- 4. 更新 reply_to_user_id（根据回复关系）
-- =====================================================
-- 对于所有二级回复，设置 reply_to_user_id 为其直接父评论的 user_id
UPDATE comments c1
SET reply_to_user_id = c2.user_id
FROM comments c2
WHERE c1.parent_id = c2.id
  AND c1.user_id != c2.user_id;

-- 5. 验证迁移
-- =====================================================
DO $$
DECLARE
    total_comments INTEGER;
    level1_comments INTEGER;
    level2_comments INTEGER;
    comments_with_reply_to INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_comments FROM comments;
    SELECT COUNT(*) INTO level1_comments FROM comments WHERE parent_id IS NULL;
    SELECT COUNT(*) INTO level2_comments FROM comments WHERE parent_id IS NOT NULL;
    SELECT COUNT(*) INTO comments_with_reply_to FROM comments WHERE reply_to_user_id IS NOT NULL;

    RAISE NOTICE '📊 评论迁移统计:';
    RAISE NOTICE '  总评论数：%', total_comments;
    RAISE NOTICE '  一级评论：%', level1_comments;
    RAISE NOTICE '  二级回复：%', level2_comments;
    RAISE NOTICE '  有回复目标的评论：%', comments_with_reply_to;

    -- 验证：所有二级回复的 parent_id 应该指向一级评论
    IF EXISTS (
        SELECT 1 FROM comments c1
        JOIN comments c2 ON c1.parent_id = c2.id
        WHERE c2.parent_id IS NOT NULL
    ) THEN
        RAISE WARNING '⚠️ 检测到仍有嵌套层级过深的评论';
    ELSE
        RAISE NOTICE '✅ 验证通过：所有二级回复的 parent_id 都指向一级评论';
    END IF;
END $$;

-- 6. 回滚脚本（如需回滚）
-- =====================================================
-- DROP INDEX IF EXISTS idx_comments_reply_to_user;
-- ALTER TABLE comments DROP COLUMN IF EXISTS reply_to_user_id;
