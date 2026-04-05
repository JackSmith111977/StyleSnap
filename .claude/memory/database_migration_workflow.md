---
name: 数据库迁移流程
description: 所有 Supabase 迁移文件由用户在 Dashboard 手动执行，而非使用 CLI 推送
type: feedback
---

**规则**：所有 Supabase 数据库迁移文件（`supabase/migrations/*.sql`）由用户在 Supabase Dashboard 手动执行迁移，不使用 `supabase db push` 命令。

**原因**：CLI 推送多命令 migration 文件时会报错 "cannot insert multiple commands into a prepared statement"，且远程数据库同步存在权限问题。

**如何应用**：创建新的 migration 文件后，告知用户在 Dashboard → SQL Editor 中执行对应 SQL 内容。
