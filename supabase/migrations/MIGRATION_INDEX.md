# Supabase 迁移索引

> 最后更新：2026-04-08

本项目通过 **Supabase Dashboard** 手动执行 SQL 迁移脚本，不使用 CLI 命令。

## 使用方法

1. 在 Dashboard 中打开 SQL Editor
2. 复制下方"待迁移"文件的完整内容
3. 在 SQL Editor 中执行
4. 执行成功后，在下表中更新状态为"✅ 已迁移"

## 迁移记录

| ID | 文件名 | 描述 | 执行状态 | 执行日期 | 备注 |
|----|--------|------|----------|----------|------|
| 0001 | `0001_initial_schema.sql` | 初始数据库 Schema（表、索引、触发器、RLS） | ✅ 已迁移 | - | 基础架构 |
| 0008 | `0008_seed_initial_styles.sql` | 初始风格案例数据（10 个预设风格） | ✅ 已迁移 | - | 种子数据 |
| 0023 | `0023_add_collections.sql` | 合集功能（collection_styles 表） | ✅ 已迁移 | - | 收藏管理 |
| 0024 | `0024_generate_preset_style_codes.sql` | 预设风格代码生成（设计变量转换函数） | ⏳ 待迁移 | - | 代码生成 |

## 待执行迁移

### 0024 - 预设风格代码生成

**文件**: `supabase/migrations/0024_generate_preset_style_codes.sql`

**描述**: 为 10 个预设风格生成完整的代码（CSS Variables, CSS Modules, HTML, React, Tailwind）

**执行内容**:
- 创建 5 个转换函数：`convert_color_palette`, `convert_fonts`, `convert_spacing`, `convert_border_radius`, `convert_shadows`
- 更新 `styles` 表的设计变量字段为新格式

**执行后操作**:
1. 调用 Server Action `batchGeneratePresetStyleCodes()` 生成代码
2. 验证 `styles.code_css`, `code_html`, `code_react`, `code_tailwind` 字段已填充

---

## 已完成迁移 SQL 摘要

### 0001 - 初始 Schema
- 枚举类型：`style_status`, `comment_status`, `user_role`
- 核心表：`profiles`, `categories`, `styles`, `tags`, `style_tags`
- 社交功能表：`favorites`, `likes`, `comments`
- 触发器：自动更新 `updated_at`、新用户创建 profile、自动更新计数
- RLS 策略：所有表的读写权限控制

### 0008 - 初始风格数据
- 插入 10 个预设风格（每个分类一个）
- 包含设计变量（color_palette, fonts, spacing, border_radius, shadows）
- 包含基础代码片段（code_html, code_css）

### 0023 - 合集功能
- 新增 `collections` 表
- 新增 `collection_styles` 关联表
- 支持用户创建和管理风格合集
