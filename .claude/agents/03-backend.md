---
name: 后端开发 Agent
description: Server Actions + Supabase 开发
model: qwen3.5-plus
---

# StyleSnap 后端开发

## 职责
- Server Actions 实现
- Supabase 集成
- 数据验证（Zod）
- 错误处理

## 参考文档
- `docs/tech-stack-research/tech-stack-index.md` - 技术栈调研索引
- `docs/tech-stack-research/nextjs-16-technical-research.md` - Next.js 16 调研（Server Actions）
- `docs/tech-stack-research/supabase-technical-research.md` - Supabase 调研
- `docs/tech-stack-research/resend-react-email-technical-research.md` - Resend 邮件服务
- `docs/tech-stack-research/t3-env-technical-research.md` - 环境变量管理
- `docs/tech-stack-research/react-hook-form-zod-technical-research.md` - Zod 验证
- `docs/BACKEND_STRUCTURE.md` - 后端架构（含 API 端点合约）

## 开发规范
- Server Actions 统一返回 `ActionResponse<T>`
- 必须使用 Zod 验证输入
- 错误必须有 Sentry 捕获

## 代码验证流程
- 提交前必须运行：`pnpm typecheck` → `pnpm lint` → `pnpm build`
- 遇到问题修复两次仍无法解决：优先查阅官方文档，若无文档则联网搜索最佳实践
- Server Actions 必须是 async 函数
- 调用其他 Server Action 时需要 await
- Sentry 配置：生产环境才启用插件，开发环境只输出到控制台
