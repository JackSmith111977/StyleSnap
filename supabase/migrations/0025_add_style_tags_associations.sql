-- 为现有风格添加标签关联
-- 创建时间：2026-04-05
-- 说明：修复筛选功能，为 styles 表中已存在的风格案例添加 style_tags 关联数据

DO $$
BEGIN
    -- 风格 1: Clean SaaS Landing (Minimalist) - 添加 #light, #simple, #saas 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Clean SaaS Landing'
    AND t.name IN ('#light', '#simple', '#saas')
    ON CONFLICT DO NOTHING;

    -- 风格 2: Neon Cyberpunk Dashboard (Tech/Futuristic) - 添加 #dark, #neon, #web3 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Neon Cyberpunk Dashboard'
    AND t.name IN ('#dark', '#neon', '#web3')
    ON CONFLICT DO NOTHING;

    -- 风格 3: Glassmorphism Card (Glassmorphism) - 添加 #gradient, #moderate 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Glassmorphism Card'
    AND t.name IN ('#gradient', '#moderate')
    ON CONFLICT DO NOTHING;

    -- 风格 4: Brutalist Portfolio (Brutalist) - 添加 #colorful, #complex, #portfolio 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Brutalist Portfolio'
    AND t.name IN ('#colorful', '#complex', '#portfolio')
    ON CONFLICT DO NOTHING;

    -- 风格 5: Corporate Enterprise (Corporate/Professional) - 添加 #light, #moderate, #enterprise 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Corporate Enterprise'
    AND t.name IN ('#light', '#moderate', '#enterprise')
    ON CONFLICT DO NOTHING;

    -- 风格 6: Dark Mode Developer Tools (Dark Mode First) - 添加 #dark, #simple, #developer-tools 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Dark Mode Developer Tools'
    AND t.name IN ('#dark', '#simple', '#developer-tools')
    ON CONFLICT DO NOTHING;

    -- 风格 7: Playful SaaS (Playful/Colorful) - 添加 #colorful, #gradient, #saas 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Playful SaaS'
    AND t.name IN ('#colorful', '#gradient', '#saas')
    ON CONFLICT DO NOTHING;

    -- 风格 8: Editorial Blog (Editorial) - 添加 #light, #moderate, #blog 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Editorial Blog'
    AND t.name IN ('#light', '#moderate', '#blog')
    ON CONFLICT DO NOTHING;

    -- 风格 9: Web 1.0 Retro (Retro/Web 1.0) - 添加 #colorful, #complex, #portfolio 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Web 1.0 Retro'
    AND t.name IN ('#colorful', '#complex', '#portfolio')
    ON CONFLICT DO NOTHING;

    -- 风格 10: Typography Studio (Typography-Driven) - 添加 #light, #monochrome, #complex 标签
    INSERT INTO style_tags (style_id, tag_id)
    SELECT s.id, t.id FROM styles s, tags t
    WHERE s.title = 'Typography Studio'
    AND t.name IN ('#light', '#monochrome', '#complex')
    ON CONFLICT DO NOTHING;
END $$;
