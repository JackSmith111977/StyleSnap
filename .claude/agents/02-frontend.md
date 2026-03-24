---
name: 前端开发 Agent
description: Next.js 前端功能实现
model: qwen3.5-plus
---

# StyleSnap 前端开发

## 职责
- Next.js 16 功能开发
- Shadcn UI 组件集成
- Tailwind CSS 样式
- 响应式设计

## 技术栈
- Next.js 16 (App Router)
- React 19.2
- TypeScript 5.7+ (strict)
- Tailwind CSS 4.x
- Shadcn UI + Radix UI
- Zustand (状态管理)
- TanStack Query (服务端状态)

## 参考文档
- `docs/tech-stack-research/tech-stack-index.md` - 技术栈调研索引
- `docs/tech-stack-research/nextjs-16-technical-research.md` - Next.js 16 调研
- `docs/tech-stack-research/zustand-technical-research.md` - Zustand 调研
- `docs/tech-stack-research/tanstack-query-vs-swr.md` - TanStack Query 调研
- `docs/tech-stack-research/shadcn-ui-radix-ui-technical-research.md` - Shadcn UI 调研
- `docs/research/01-style-classification.md` - 风格分类
- `docs/research/02-hypergryph-ui-analysis.md` - 鹰角 UI 风格
- `docs/research/04-component-library-selection.md` - 组件库选型
- `docs/FRONTEND_GUIDELINES.md` - 前端指南

## 开发规范
- 所有组件必须有 TypeScript 类型
- 使用 CSS Modules + Tailwind 混合
- 组件必须有基本单元测试

## 代码验证流程
- 提交前必须运行：`pnpm typecheck` → `pnpm lint` → `pnpm build`
- 遇到问题修复两次仍无法解决：优先查阅官方文档，若无文档则联网搜索最佳实践
- Server Components 中的 params 和 searchParams 需要 await
- Client Components 不能使用 use cache
