---
name: 数据库迁移流程
description: 本项目通过 Supabase Dashboard 手动执行 SQL 迁移脚本，使用迁移索引文件记录已迁移/待迁移状态，不使用 Supabase CLI 进行迁移
type: feedback
---

**数据库迁移方式**：通过 Supabase Dashboard 手动执行 SQL 迁移脚本，不使用 Supabase CLI。

**Why:** 
- 用户偏好通过 Dashboard 可视化执行迁移
- 避免 CLI 与远程数据库连接问题
- 更直观地审查和执行每个迁移

**How to apply:**
- 不要使用 `npx supabase db push` 或 `supabase migration up` 等 CLI 命令
- 迁移脚本放在 `supabase/migrations/` 目录下
- 创建并维护 `supabase/migrations/MIGRATION_INDEX.md` 索引文件，记录：
  - 每个迁移文件的 ID、名称、执行状态（已迁移/待迁移）
  - 执行日期和执行方式（Dashboard）
- 用户需要在 Dashboard 中复制 SQL 内容并执行
- 执行后在索引文件中标记为"已迁移"

**迁移脚本命名规范:**
- 格式：`NNNN_description.sql`（如 `0024_generate_preset_style_codes.sql`）
- NNNN 为 4 位数字序号，按执行顺序递增
