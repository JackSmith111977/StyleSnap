-- =====================================================
-- StyleSnap 触发器计数修复
-- 执行位置：Supabase Dashboard → SQL Editor
-- =====================================================

-- 问题：favorite_count 和 like_count 可能变成负数
-- 根因：触发器在 DELETE 操作时直接 -1，没有检查当前值
-- =====================================================

-- 1. 修复现有的负数计数
-- =====================================================
UPDATE styles SET like_count = 0 WHERE like_count < 0;
UPDATE styles SET favorite_count = 0 WHERE favorite_count < 0;

-- 2. 删除旧触发器
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_style_counts_likes ON likes;
DROP TRIGGER IF EXISTS trigger_update_style_counts_favorites ON favorites;

-- 3. 创建修复后的触发器函数（防止负数）
-- =====================================================
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles
            SET like_count = GREATEST(like_count - 1, 0)  -- 防止负数
            WHERE id = OLD.style_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'favorites' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET favorite_count = favorite_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles
            SET favorite_count = GREATEST(favorite_count - 1, 0)  -- 防止负数
            WHERE id = OLD.style_id;
        END IF;
    END IF;

    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. 重新创建触发器
-- =====================================================
CREATE TRIGGER trigger_update_style_counts_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

CREATE TRIGGER trigger_update_style_counts_favorites
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

-- 5. 验证修复
-- =====================================================
DO $$
DECLARE
    negative_likes INTEGER;
    negative_favorites INTEGER;
BEGIN
    SELECT COUNT(*) INTO negative_likes FROM styles WHERE like_count < 0;
    SELECT COUNT(*) INTO negative_favorites FROM styles WHERE favorite_count < 0;

    IF negative_likes = 0 AND negative_favorites = 0 THEN
        RAISE NOTICE '✅ 触发器修复成功：没有负数计数';
    ELSE
        RAISE WARNING '⚠️ 仍有负数计数：likes=%, favorites=%', negative_likes, negative_favorites;
    END IF;
END $$;
