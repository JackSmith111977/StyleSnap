# StyleSnap

> 面向前端开发者的网页设计风格参考平台

## 项目定位

StyleSnap 帮助开发者快速选择、理解和应用网页开发的视觉风格。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5.7+
- **样式**: Tailwind CSS 4.x + CSS Modules
- **UI 组件**: Shadcn UI + Radix UI
- **状态管理**: Zustand + TanStack Query
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **邮件**: Resend
- **部署**: Vercel
- **测试**: Vitest + Playwright

## 文档

| 文档 | 说明 |
|------|------|
| [PRD.md](./docs/PRD.md) | 产品需求文档 |
| [IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) | 实现计划 |
| [MULTI_AGENT_COLLABORATION.md](./docs/MULTI_AGENT_COLLABORATION.md) | 多智能体协同方案 |
| [TECH_STACK.md](./docs/TECH_STACK.md) | 技术栈清单 |
| [FRONTEND_GUIDELINES.md](./docs/FRONTEND_GUIDELINES.md) | 前端指南 |
| [BACKEND_STRUCTURE.md](./docs/BACKEND_STRUCTURE.md) | 后端架构 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 类型检查
pnpm typecheck

# 运行测试
pnpm test
```

## 环境变量

复制 `.env.example` 并填写实际值：

```bash
cp .env.example .env
```

## 项目状态

- [x] 需求定义与调研
- [ ] 项目初始化
- [ ] P0 核心功能开发
- [ ] P1 增强功能开发
- [ ] P2 迭代功能开发

## 许可证

MIT
