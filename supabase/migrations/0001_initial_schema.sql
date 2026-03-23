-- StyleSnap 初始数据库 Schema
-- 创建时间：2026-03-23
-- 说明：包含核心表结构、RLS 策略、Auth 触发器

-- ===========================================
-- 1. 扩展
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- 2. 枚举类型
-- ===========================================

-- 风格状态
CREATE TYPE style_status AS ENUM ('draft', 'published', 'archived');

-- 评论状态
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected', 'deleted');

-- 用户角色
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- ===========================================
-- 3. 核心表
-- ===========================================

-- 3.1 用户资料表 (profiles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 风格分类表 (categories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(50),
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 风格案例表 (styles)
CREATE TABLE styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- 设计变量
    color_palette JSONB,  -- { primary: '#xxx', secondary: '#xxx', ... }
    fonts JSONB,          -- { heading: 'xxx', body: 'xxx' }
    spacing JSONB,        -- { base: '8px', scale: '1.5' }
    border_radius JSONB,  -- { sm: '4px', md: '8px', lg: '16px' }
    shadows JSONB,        -- { sm: '...', md: '...', lg: '...' }

    -- 代码片段
    code_html TEXT,
    code_css TEXT,
    code_react TEXT,
    code_tailwind TEXT,

    -- 预览图
    preview_light TEXT,
    preview_dark TEXT,
    preview_images JSONB,

    -- 元数据
    status style_status DEFAULT 'published',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,

    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 标签表 (tags)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 风格 - 标签关联表 (style_tags)
CREATE TABLE style_tags (
    style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (style_id, tag_id)
);

-- ===========================================
-- 4. 社交功能表 (P1)
-- ===========================================

-- 4.1 收藏表 (favorites)
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, style_id)
);

-- 4.2 点赞表 (likes)
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, style_id)
);

-- 4.3 评论表 (comments)
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status comment_status DEFAULT 'approved',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 5. 索引
-- ===========================================

-- profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);

-- categories
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_sort ON categories(sort_order);

-- styles
CREATE INDEX idx_styles_category ON styles(category_id);
CREATE INDEX idx_styles_author ON styles(author_id);
CREATE INDEX idx_styles_status ON styles(status);
CREATE INDEX idx_styles_created ON styles(created_at DESC);
CREATE INDEX idx_styles_title_search ON styles USING gin(to_tsvector('simple', title));

-- tags
CREATE INDEX idx_tags_name ON tags(name);

-- style_tags
CREATE INDEX idx_style_tags_style ON style_tags(style_id);
CREATE INDEX idx_style_tags_tag ON style_tags(tag_id);

-- favorites
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_style ON favorites(style_id);

-- likes
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_style ON likes(style_id);

-- comments
CREATE INDEX idx_comments_style ON comments(style_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);

-- ===========================================
-- 6. 触发器函数
-- ===========================================

-- 6.1 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.2 新用户自动创建 profile
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.email),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6.3 自动更新风格计数
CREATE OR REPLACE FUNCTION update_style_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET like_count = like_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles SET like_count = like_count - 1 WHERE id = OLD.style_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'favorites' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE styles SET favorite_count = favorite_count + 1 WHERE id = NEW.style_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE styles SET favorite_count = favorite_count - 1 WHERE id = OLD.style_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- 7. 应用触发器
-- ===========================================

-- 更新 profiles.updated_at
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 更新 styles.updated_at
CREATE TRIGGER trigger_styles_updated_at
    BEFORE UPDATE ON styles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 更新 categories.updated_at
CREATE TRIGGER trigger_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 更新 comments.updated_at
CREATE TRIGGER trigger_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 新用户自动创建 profile
CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();

-- 自动更新风格计数
CREATE TRIGGER trigger_update_style_counts_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

CREATE TRIGGER trigger_update_style_counts_favorites
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

-- ===========================================
-- 8. RLS (行级安全)
-- ===========================================

-- 启用所有表的 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- profiles RLS
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_user_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- categories RLS
CREATE POLICY "categories_public_read" ON categories
    FOR SELECT USING (true);

CREATE POLICY "categories_admin_all" ON categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- styles RLS
CREATE POLICY "styles_public_read" ON styles
    FOR SELECT USING (status = 'published');

CREATE POLICY "styles_auth_read" ON styles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        (status = 'published' OR author_id = auth.uid())
    );

CREATE POLICY "styles_user_insert" ON styles
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "styles_user_update_own" ON styles
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "styles_admin_all" ON styles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- tags RLS
CREATE POLICY "tags_public_read" ON tags
    FOR SELECT USING (true);

CREATE POLICY "tags_admin_all" ON tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- style_tags RLS
CREATE POLICY "style_tags_public_read" ON style_tags
    FOR SELECT USING (true);

CREATE POLICY "style_tags_user_insert" ON style_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM styles s
            WHERE s.id = style_id AND s.author_id = auth.uid()
        )
    );

CREATE POLICY "style_tags_admin_all" ON style_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- favorites RLS
CREATE POLICY "favorites_public_read" ON favorites
    FOR SELECT USING (true);

CREATE POLICY "favorites_user_own" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- likes RLS
CREATE POLICY "likes_public_read" ON likes
    FOR SELECT USING (true);

CREATE POLICY "likes_user_own" ON likes
    FOR ALL USING (auth.uid() = user_id);

-- comments RLS
CREATE POLICY "comments_public_read" ON comments
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "comments_user_own" ON comments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "comments_admin_all" ON comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- ===========================================
-- 9. 初始数据
-- ===========================================

-- 插入初始分类
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('极简主义', 'Minimalist', '简洁、留白、少即是多', 1),
('科技未来', 'Tech/Futuristic', '赛博朋克、霓虹、科技感', 2),
('玻璃拟态', 'Glassmorphism', '毛玻璃效果、半透明、层次感', 3),
('粗野主义', 'Brutalist', '原始、粗糙、反传统', 4),
('企业专业', 'Corporate/Professional', '稳重、专业、可信赖', 5),
('深色优先', 'Dark Mode First', '深色主题、护眼、现代', 6),
('活泼多彩', 'Playful/Colorful', '鲜艳、渐变、活力', 7),
('杂志编辑', 'Editorial', '排版精美、图文结合', 8);
