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
| 0024 | `0024_unified_favorites.sql` | 统一收藏管理 | ✅ 已迁移 | - | 收藏系统 |
| 0025 | `0025_add_style_tags_associations.sql` | 风格标签关联 | ✅ 已迁移 | - | 标签系统 |
| 0026 | `0026_sync_design_tokens_to_jsonb.sql` | 设计变量同步到 JSONB | ✅ 已迁移 | - | 设计变量 |
| 0027 | `0027_generate_preset_style_codes.sql` | 预设风格代码生成（设计变量转换函数） | ✅ 已迁移 | 2026-04-08 | 代码生成 |

## 待执行迁移

无待执行迁移。

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

### 0024 - 统一收藏管理
- 重构收藏系统
- 支持合集管理

### 0025 - 风格标签关联
- 添加风格与标签的关联表
- 支持多标签筛选

### 0026 - 设计变量同步到 JSONB
- 将设计变量同步到 JSONB 字段
- 支持更灵活的数据结构

### 0027 - 预设风格代码生成
- 创建 5 个转换函数：`convert_color_palette`, `convert_fonts`, `convert_spacing`, `convert_border_radius`, `convert_shadows`
- 更新 `styles` 表的设计变量字段为新格式
- 为后续代码生成 Server Action 提供数据基础
