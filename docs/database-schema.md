# StyleSnap 数据库 Schema 设计

> 版本：1.0
> 创建日期：2026-03-23
> 数据库：Supabase (PostgreSQL 15)

---

## 目录

1. [ER 图](#1-er-图)
2. [表结构](#2-表结构)
3. [RLS 策略](#3-rls-策略)
4. [触发器](#4-触发器)
5. [使用示例](#5-使用示例)

---

## 1. ER 图

```
┌─────────────────┐
│    profiles     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ full_name       │
│ avatar_url      │
│ bio             │
│ role            │
└────────┬────────┘
         │
         │ author_id
         ▼
┌─────────────────┐       ┌─────────────────┐
│     styles      │       │   categories    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ title           │       │ name            │
│ description     │       │ name_en         │
│ category_id ────┼──────►│ description     │
│ author_id       │       │ icon            │
│ color_palette   │       └─────────────────┘
│ fonts           │
│ spacing         │
│ code_*          │
│ status          │
└────────┬────────┘
         │
         │ style_id
    ┌────┴────┬─────────────┬──────────┐
    ▼         ▼             ▼          ▼
┌────────┐ ┌────────┐ ┌─────────┐ ┌──────────┐
│  tags  │ │favorite│ │  likes  │ │ comments │
├────────┤ ├────────┤ ├─────────┤ ├──────────┤
│ id     │ │ id     │ │ id      │ │ id       │
│ name   │ │ user   │ │ user    │ │ style    │
└──┬─────┘ │ style  │ │ style   │ │ user     │
   │       └────────┘ └─────────┘ │ content  │
   │                              │ status   │
   ▼                              └──────────┘
┌──────────┐
│style_tags│
├──────────┤
│ style_id │
│ tag_id   │
└──────────┘
```

---

## 2. 表结构

### 2.1 profiles (用户资料)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键，引用 auth.users |
| `username` | VARCHAR(50) | 唯一用户名 |
| `full_name` | VARCHAR(100) | 全名 |
| `avatar_url` | TEXT | 头像 URL |
| `bio` | TEXT | 个人简介 |
| `role` | user_role | 角色：user/admin/super_admin |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

### 2.2 categories (风格分类)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `name` | VARCHAR(50) | 分类名（中文） |
| `name_en` | VARCHAR(50) | 分类名（英文） |
| `description` | TEXT | 描述 |
| `icon` | TEXT | 图标 |
| `sort_order` | INTEGER | 排序 |

### 2.3 styles (风格案例)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `title` | VARCHAR(200) | 标题 |
| `description` | TEXT | 描述 |
| `category_id` | UUID | 分类 ID |
| `author_id` | UUID | 作者 ID |
| `color_palette` | JSONB | 色板 |
| `fonts` | JSONB | 字体配置 |
| `spacing` | JSONB | 间距系统 |
| `border_radius` | JSONB | 圆角配置 |
| `shadows` | JSONB | 阴影配置 |
| `code_html` | TEXT | HTML 代码 |
| `code_css` | TEXT | CSS 代码 |
| `code_react` | TEXT | React 代码 |
| `code_tailwind` | TEXT | Tailwind 代码 |
| `preview_light` | TEXT | 浅色预览图 |
| `preview_dark` | TEXT | 深色预览图 |
| `preview_images` | JSONB | 预览图集合 |
| `status` | style_status | 状态：draft/published/archived |
| `view_count` | INTEGER | 浏览次数 |
| `like_count` | INTEGER | 点赞数 |
| `favorite_count` | INTEGER | 收藏数 |

### 2.4 tags (标签)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `name` | VARCHAR(50) | 标签名 |

### 2.5 style_tags (风格 - 标签关联)

| 字段 | 类型 | 说明 |
|------|------|------|
| `style_id` | UUID | 风格 ID |
| `tag_id` | UUID | 标签 ID |

### 2.6 favorites (收藏)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID |
| `style_id` | UUID | 风格 ID |

### 2.7 likes (点赞)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `user_id` | UUID | 用户 ID |
| `style_id` | UUID | 风格 ID |

### 2.8 comments (评论)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `style_id` | UUID | 风格 ID |
| `user_id` | UUID | 用户 ID |
| `parent_id` | UUID | 父评论 ID（嵌套回复） |
| `content` | TEXT | 内容 |
| `status` | comment_status | 状态：pending/approved/rejected/deleted |

---

## 3. RLS 策略

### profiles

| 策略 | 操作 | 条件 |
|------|------|------|
| `profiles_public_read` | SELECT | 所有人可读 |
| `profiles_user_update_own` | UPDATE | 仅更新自己的 |
| `profiles_admin_all` | ALL | 管理员完全访问 |

### categories

| 策略 | 操作 | 条件 |
|------|------|------|
| `categories_public_read` | SELECT | 所有人可读 |
| `categories_admin_all` | ALL | 管理员完全访问 |

### styles

| 策略 | 操作 | 条件 |
|------|------|------|
| `styles_public_read` | SELECT | 仅 published |
| `styles_auth_read` | SELECT | 登录用户可看自己的 |
| `styles_user_insert` | INSERT | 作者可创建 |
| `styles_user_update_own` | UPDATE | 作者可更新自己的 |
| `styles_admin_all` | ALL | 管理员完全访问 |

### tags, style_tags

| 策略 | 操作 | 条件 |
|------|------|------|
| `*_public_read` | SELECT | 所有人可读 |
| `*_admin_all` | ALL | 管理员完全访问 |

### favorites, likes

| 策略 | 操作 | 条件 |
|------|------|------|
| `*_public_read` | SELECT | 所有人可读 |
| `*_user_own` | ALL | 仅访问自己的 |

### comments

| 策略 | 操作 | 条件 |
|------|------|------|
| `comments_public_read` | SELECT | 已批准或自己的 |
| `comments_user_own` | ALL | 仅访问自己的 |
| `comments_admin_all` | ALL | 管理员完全访问 |

---

## 4. 触发器

### 4.1 自动更新 updated_at

```sql
-- 应用于：profiles, styles, categories, comments
CREATE TRIGGER trigger_*_updated_at
    BEFORE UPDATE ON *
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4.2 新用户自动创建 profile

```sql
CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

### 4.3 自动更新风格计数

```sql
-- likes 变化时更新 styles.like_count
CREATE TRIGGER trigger_update_style_counts_likes
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();

-- favorites 变化时更新 styles.favorite_count
CREATE TRIGGER trigger_update_style_counts_favorites
    AFTER INSERT OR DELETE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_style_counts();
```

---

## 5. 使用示例

### 5.1 获取所有风格

```sql
SELECT s.*, c.name as category_name, p.username as author_name
FROM styles s
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN profiles p ON s.author_id = p.id
WHERE s.status = 'published'
ORDER BY s.created_at DESC;
```

### 5.2 获取带标签的风格

```sql
SELECT s.*, json_agg(t.name) as tags
FROM styles s
LEFT JOIN style_tags st ON s.id = st.style_id
LEFT JOIN tags t ON st.tag_id = t.id
WHERE s.id = 'xxx'
GROUP BY s.id;
```

### 5.3 用户收藏

```sql
INSERT INTO favorites (user_id, style_id)
VALUES (auth.uid(), 'style-uuid');
```

### 5.4 切换数据库（Supabase Client）

```ts
// lib/supabase/server.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 查询风格
const { data } = await supabase
  .from('styles')
  .select('*, category:categories(name), author:profiles(username)')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
```

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
