# 远程数据库迁移索引

> 最后更新：2026-04-06  
> 数据库：Supabase 生产数据库  
> 记录方式：通过 Supabase Dashboard 执行 SQL 后手动更新

---

## 迁移状态总览

| 迁移编号 | 迁移文件名 | 远程状态 | 执行日期 | 备注 |
|---------|-----------|---------|---------|------|
| 0001 | `0001_initial_schema.sql` | ✅ 已完成 | - | 初始 Schema |
| 0002 | `0002_create_storage_buckets.sql` | ✅ 已完成 | - | 存储桶配置 |
| 0003 | `0003_create_auth_trigger.sql` | ✅ 已完成 | - | Auth 触发器 |
| 0004 | `0004_add_profiles_insert_policy.sql` | ✅ 已完成 | - | Profiles RLS |
| 0005 | `0005_fix_profiles_rls_recursion.sql` | ✅ 已完成 | - | RLS 递归修复 |
| 0006 | `0006_fix_auth_trigger_search_path.sql` | ✅ 已完成 | - | Search Path 修复 |
| 0007 | `0007_add_remaining_categories_and_tags.sql` | ✅ 已完成 | - | 剩余分类和标签 |
| 0008 | `0008_seed_initial_styles.sql` | ✅ 已完成 | - | 初始风格数据 |
| 0009 | `0009_atomic_updates.sql` | ✅ 已完成 | - | 原子更新优化 |
| 0010 | `0010_rls_policies_fix.sql` | ✅ 已完成 | - | RLS 策略修复 |
| 0012 | `0012_add_email_to_profiles.sql` | ✅ 已完成 | - | 邮箱字段 |
| 0013 | `0013_fix_like_counts.sql` | ✅ 已完成 | - | 点赞计数修复 |
| 0014 | `0014_fix_double_counting.sql` | ✅ 已完成 | - | 双重计数修复 |
| 0015 | `0015_add_view_count_rpc.sql` | ✅ 已完成 | - | 浏览量 RPC |
| 0016 | `0016_add_related_styles_rpc.sql` | ✅ 已完成 | - | 相关风格 RPC |
| 0017 | `0017_fix_rpc_functions.sql` | ✅ 已完成 | - | RPC 函数修复 |
| 0018 | `0018_fix_negative_counts.sql` | ✅ 已完成 | - | 负数计数修复 |
| 0019 | `0019_comment_reply_refactor.sql` | ✅ 已完成 | - | 评论回复重构 |
| 0020 | `0020_add_submission_status.sql` | ✅ 已完成 | 2026-04-06 | **通过 Dashboard 执行** - ENUM 状态 + design_tokens 列已创建 |
| 0021 | `0021_add_follow_system.sql` | ❌ 待执行 | - | 关注系统 |
| 0022 | `0022_init_style_design_tokens.sql` | ❌ 待执行 | - | 设计变量初始化（被 0026 替代） |
| 0023 | `0023_add_collections.sql` | ❌ 待执行 | - | 合集功能 |
| 0024 | `0024_unified_favorites.sql` | ❌ 待执行 | - | 统一收藏功能 |
| 0025 | `0025_add_style_tags_associations.sql` | ❌ 待执行 | - | 风格标签关联 |
| 0026 | `0026_sync_design_tokens_to_jsonb.sql` | ✅ 已完成 | 2026-04-06 | 数据同步迁移（独立字段 → design_tokens） |

---

## 当前数据库 Schema 状态

### `styles` 表实际字段（2026-04-06 确认）

| 字段名 | 类型 | 说明 |
|-------|------|------|
| `id` | UUID | 主键 |
| `title` | VARCHAR(200) | 风格名称 |
| `description` | TEXT | 描述 |
| `category_id` | UUID | 分类外键 |
| `author_id` | UUID | 作者外键 |
| `color_palette` | JSONB | 颜色配置 |
| `fonts` | JSONB | 字体配置 |
| `spacing` | JSONB | 间距配置 |
| `border_radius` | JSONB | 圆角配置 |
| `shadows` | JSONB | 阴影配置 |
| `code_html` | TEXT | HTML 代码 |
| `code_css` | TEXT | CSS 代码 |
| `code_react` | TEXT | React 代码 |
| `code_tailwind` | TEXT | Tailwind 代码 |
| `preview_light` | TEXT | 浅色预览图 |
| `preview_dark` | TEXT | 深色预览图 |
| `preview_images` | JSONB | 预览图集合 |
| `status` | ENUM | 状态（published, pending_review, approved, rejected） |
| `view_count` | INTEGER | 浏览量 |
| `like_count` | INTEGER | 点赞数 |
| `favorite_count` | INTEGER | 收藏数 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

### 缺失字段

| 缺失字段 | 预期类型 | 迁移文件 |
|---------|---------|---------|
| `design_tokens` | JSONB | 0020 |
| `submitted_at` | TIMESTAMPTZ | 0020 |
| `reviewer_comments` | TEXT | 0020 |

---

## 修复方案

由于远程数据库 `styles` 表已有独立的 JSONB 字段（`color_palette`, `fonts`, `spacing`, `border_radius`, `shadows`），代码需要适配当前 schema：

**Server Action 适配：**
- 创建风格时：使用独立字段而非 `design_tokens`
- 保存草稿时：将 `DesignTokens` 对象解构为独立字段
- 获取详情时：从独立字段构建 `DesignTokens` 对象

**代码位置：** `apps/web/app/workspace/actions/workspace-actions.ts`

---

## 2026-04-06 迁移详情

### 迁移 #0020: `0020_add_submission_status.sql`

**执行方式**: Supabase Dashboard → SQL Editor  
**执行日期**: 2026-04-06  
**执行原因**: 修复工作台创建风格失败问题（缺少 `design_tokens` 列）

#### 执行的 SQL 内容

```sql
-- 添加风格提交审核状态
-- 修改 styles 表的 status ENUM 类型，添加审核相关状态

-- 创建新的 ENUM 类型（包含审核状态）
DO $$
BEGIN
  -- 检查是否已经存在 pending_review 状态
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'style_status' AND e.enumlabel = 'pending_review'
  ) THEN
    -- 如果 styles 表使用的是旧 ENUM，先添加新值
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'pending_review';
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'approved';
    ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'rejected';
  END IF;
END $$;

-- 添加设计变量字段（如果不存在）
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS design_tokens JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preview_images JSONB DEFAULT '{}';

-- 添加索引以支持审核队列查询
CREATE INDEX IF NOT EXISTS idx_styles_status ON styles(status);
CREATE INDEX IF NOT EXISTS idx_styles_author_id ON styles(author_id);

COMMENT ON COLUMN styles.design_tokens IS '设计变量配置（色板、字体、间距等）';
COMMENT ON COLUMN styles.preview_images IS '预览图 URLs（light/dark）';
```

#### 新增字段

| 表 | 字段 | 类型 | 说明 |
|----|------|------|------|
| `styles` | `design_tokens` | JSONB | 设计变量配置（色板、字体、间距等） |
| `styles` | `preview_images` | JSONB | 预览图 URLs（light/dark） |
| `styles` | `status` | ENUM (新增值) | 新增 `pending_review`, `approved`, `rejected` 状态 |

#### 新增索引

| 索引名 | 表 | 字段 | 用途 |
|-------|----|------|------|
| `idx_styles_status` | `styles` | `status` | 支持审核队列查询 |
| `idx_styles_author_id` | `styles` | `author_id` | 支持用户风格查询 |

---

## 待执行迁移计划

### 优先级 1：数据初始化
- **0022** - `init_style_design_tokens.sql` - 为现有风格填充默认设计变量

### 优先级 2：新功能
- **0021** - `add_follow_system.sql` - 关注系统
- **0023** - `add_collections.sql` - 合集功能
- **0024** - `unified_favorites.sql` - 统一收藏功能
- **0025** - `add_style_tags_associations.sql` - 风格标签关联

---

## 执行记录

| 日期 | 操作 | 迁移编号 | 执行人 | 备注 |
|------|------|---------|-------|------|
| 2026-04-06 | Dashboard 执行 SQL | 0020 | Kei | 修复工作台创建风格问题 |

---

## 注意事项

1. **迁移 #0020 执行后**：代码中的 `createNewStyle` 和 `saveStyleDraft` Server Action 已适配远程数据库字段
2. **临时适配代码**：由于远程数据库之前缺少 `design_tokens` 列，代码中使用了独立字段（`color_palette`, `fonts` 等）作为临时方案
3. **后续清理**：当所有迁移完成后，可以考虑回滚临时适配代码，直接使用 `design_tokens` 字段

---

## 相关文档

- 调试报告：`docs/main/P14_WORKSPACE_CREATE_DESIGN_TOKENS_FIX.md`
- 迁移文件：`supabase/migrations/0020_add_submission_status.sql`
- Supabase Dashboard: https://app.supabase.com

---

*最后更新：2026-04-06*
