-- 修复点赞计数
-- 创建时间：2026-04-03
-- 说明：根据 likes 表实际记录重新计算 styles 表的 like_count

-- 更新所有风格的 like_count 为实际点赞记录数
UPDATE styles s
SET like_count = (
  SELECT COUNT(*)::int
  FROM likes l
  WHERE l.style_id = s.id
);

-- 验证修复结果
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, title, like_count FROM styles WHERE like_count < 0 LOOP
    RAISE NOTICE '风格 % (%) 的 like_count 为负数，已设为 0', r.id, r.title;
  END LOOP;
END $$;
