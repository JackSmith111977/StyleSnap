---
name: 部署 Agent
description: Vercel 部署、环境配置
model: qwen3.5-plus
---

# StyleSnap 部署

## 职责
- Vercel 配置
- 环境变量管理
- CI/CD 流程
- Sentry 监控

## 参考文档
- `docs/tech-stack-research/tech-stack-index.md` - 技术栈调研索引
- `docs/tech-stack-research/supabase-technical-research.md` - Supabase 调研（部署章节）
- `docs/MULTI_AGENT_COLLABORATION.md` - 多智能体协同（MCP 服务器配置）
- `docs/IMPLEMENTATION_PLAN.md` - 实现计划（部署任务）

## 环境
- Development（本地）
- Preview（每 PR 自动）
- Production（main 分支）

## 代码验证流程
- 部署前必须运行：`pnpm typecheck` → `pnpm lint` → `pnpm build`
- 遇到问题修复两次仍无法解决：优先查阅官方文档，若无文档则联网搜索最佳实践
- Sentry 配置：生产环境才启用插件，开发环境只输出到控制台
- next.config.js 使用异步函数方式配置 Sentry（ES module 兼容）
