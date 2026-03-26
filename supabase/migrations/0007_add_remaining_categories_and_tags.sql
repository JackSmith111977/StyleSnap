-- 添加剩余的分类和初始标签数据
-- 创建时间：2026-03-26
-- 说明：添加 PRD 中定义的剩余 2 个分类，并初始化标签体系

-- ===========================================
-- 1. 添加剩余的分类
-- ===========================================

-- 添加第 9 个分类：复古网络 (Retro/Web 1.0)
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('复古网络', 'Retro/Web 1.0', '像素化、鲜艳色彩、早期互联网美学', 9)
ON CONFLICT (name) DO NOTHING;

-- 添加第 10 个分类：排版驱动 (Typography-Driven)
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('排版驱动', 'Typography-Driven', '大胆字体、文字即视觉、极简元素', 10)
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 2. 初始化标签体系
-- ===========================================

-- 按配色分类
INSERT INTO tags (name) VALUES
('#dark'),
('#light'),
('#colorful'),
('#monochrome'),
('#gradient'),
('#neon')
ON CONFLICT (name) DO NOTHING;

-- 按行业/场景分类
INSERT INTO tags (name) VALUES
('#saas'),
('#ecommerce'),
('#portfolio'),
('#blog'),
('#enterprise'),
('#web3'),
('#developer-tools')
ON CONFLICT (name) DO NOTHING;

-- 按复杂度分类
INSERT INTO tags (name) VALUES
('#simple'),
('#moderate'),
('#complex')
ON CONFLICT (name) DO NOTHING;

-- 按特点分类
INSERT INTO tags (name) VALUES
('#animated'),
('#typography'),
('#illustration'),
('#3d'),
('#glass'),
('#retro'),
('#organic-shapes')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 3. 验证查询
-- ===========================================

-- 检查分类总数（应该是 10 个）
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM categories;
    RAISE NOTICE '分类总数：% (预期：10)', category_count;

    IF category_count < 10 THEN
        RAISE EXCEPTION '分类数量不足，当前只有 % 个', category_count;
    END IF;
END $$;

-- 检查标签总数
DO $$
DECLARE
    tag_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tag_count FROM tags;
    RAISE NOTICE '标签总数：%', tag_count;
END $$;
