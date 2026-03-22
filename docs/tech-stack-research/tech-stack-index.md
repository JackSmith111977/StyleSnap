# StyleSnap - 技术栈调研索引

> 版本：1.0
> 创建日期：2026-03-22
> 说明：按功效归类的所有技术栈调研文档索引

---

## 目录

1. [核心框架](#1-核心框架)
2. [UI 与样式](#2-ui-与样式)
3. [状态管理](#3-状态管理)
4. [数据库与认证](#4-数据库与认证)
5. [邮件服务](#5-邮件服务)
6. [测试工具](#6-测试工具)
7. [代码质量](#7-代码质量)
8. [Monorepo 架构](#8-monorepo-架构)
9. [设计系统](#9-设计系统)
10. [产品需求](#10-产品需求)

---

## 1. 核心框架

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Next.js 16 | [`nextjs-16-technical-research.md`](./nextjs-16-technical-research.md) | ✅ 已完成 |

**核心知识点**：
- App Router 架构
- Server Actions 最佳实践
- 缓存策略（unstable_cache）
- 服务端组件 vs 客户端组件

---

## 2. UI 与样式

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Tailwind CSS 4.x | 待补充 | ⬜ 待调研 |
| CSS Modules | 待补充 | ⬜ 待调研 |

**相关文档**：
- [`FRONTEND_GUIDELINES.md`](../FRONTEND_GUIDELINES.md) - 前端开发指南（混合样式方案）

---

## 3. 状态管理

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Zustand | [`zustand-technical-research.md`](./zustand-technical-research.md) | ✅ 已完成 |
| TanStack Query | [`tanstack-query-vs-swr.md`](./tanstack-query-vs-swr.md) | ✅ 已完成 |

**核心知识点**：
- Zustand：客户端状态（主题、用户偏好）
- TanStack Query：服务端状态（数据获取、缓存、同步）

---

## 4. 数据库与认证

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Supabase | [`supabase-technical-research.md`](./supabase-technical-research.md) | ✅ 已完成 |

**核心知识点**：
- PostgreSQL Schema 设计
- RLS（Row Level Security）策略
- Auth 触发器
- Storage 存储桶

---

## 5. 邮件服务

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Resend | [`resend-react-email-technical-research.md`](./resend-react-email-technical-research.md) | ✅ 已完成 |
| React Email | [`resend-react-email-technical-research.md`](./resend-react-email-technical-research.md) | ✅ 已完成 |

**相关文档**：
- [`docs/research/03-email-service-selection.md`](../research/03-email-service-selection.md) - 邮件服务选型对比

---

## 6. 测试工具

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Vitest | [`vitest-playwright-technical-research.md`](./vitest-playwright-technical-research.md) | ✅ 已完成 |
| Playwright | [`playwright-core-knowledge.md`](./playwright-core-knowledge.md) | ✅ 已完成 |
| Testing Library | [`vitest-playwright-technical-research.md`](./vitest-playwright-technical-research.md) | ✅ 已完成 |

**核心知识点**：
- Vitest：单元测试运行器
- Playwright：E2E 浏览器自动化
- Testing Library：组件测试

---

## 7. 代码质量

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| ESLint | [`eslint-prettier-technical-research.md`](./eslint-prettier-technical-research.md) | ✅ 已完成 |
| Prettier | [`eslint-prettier-technical-research.md`](./eslint-prettier-technical-research.md) | ✅ 已完成 |

---

## 8. Monorepo 架构

| 技术 | 调研文档 | 状态 |
|------|----------|------|
| Turborepo + pnpm | [`docs/research/05-monorepo-structure.md`](../research/05-monorepo-structure.md) | ✅ 已完成 |

---

## 9. 设计系统

| 技术/主题 | 调研文档 | 状态 |
|-----------|----------|------|
| Shadcn UI + Radix UI | [`shadcn-ui-radix-ui-technical-research.md`](./shadcn-ui-radix-ui-technical-research.md) | ✅ 已完成 |
| 风格分类体系 | [`docs/research/01-style-classification.md`](../research/01-style-classification.md) | ✅ 已完成 |
| 鹰角 UI 风格分析 | [`docs/research/02-hypergryph-ui-analysis.md`](../research/02-hypergryph-ui-analysis.md) | ✅ 已完成 |
| 组件库选型 | [`docs/research/04-component-library-selection.md`](../research/04-component-library-selection.md) | ✅ 已完成 |

---

## 10. 产品需求

| 主题 | 调研文档 | 状态 |
|------|----------|------|
| 产品需求定义 | [`PRD.md`](../PRD.md) | ✅ 已完成 |
| 应用流程 | [`APP_FLOW.md`](../APP_FLOW.md) | ✅ 已完成 |
| 前端指南 | [`FRONTEND_GUIDELINES.md`](../FRONTEND_GUIDELINES.md) | ✅ 已完成 |
| 后端结构 | [`BACKEND_STRUCTURE.md`](../BACKEND_STRUCTURE.md) | ✅ 已完成 |
| 实现计划 | [`IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md) | ✅ 已完成 |
| 多智能体协同 | [`MULTI_AGENT_COLLABORATION.md`](../MULTI_AGENT_COLLABORATION.md) | ✅ 已完成 |
| 技术栈清单 | [`TECH_STACK.md`](../TECH_STACK.md) | ✅ 已完成 |

---

## 附录：按 Agent 分类的参考文档

### 架构师 Agent
- [`nextjs-16-technical-research.md`](./nextjs-16-technical-research.md)
- [`supabase-technical-research.md`](./supabase-technical-research.md)
- [`docs/research/05-monorepo-structure.md`](../research/05-monorepo-structure.md)
- [`TECH_STACK.md`](../TECH_STACK.md)

### 前端开发 Agent
- [`nextjs-16-technical-research.md`](./nextjs-16-technical-research.md)
- [`zustand-technical-research.md`](./zustand-technical-research.md)
- [`tanstack-query-vs-swr.md`](./tanstack-query-vs-swr.md)
- [`shadcn-ui-radix-ui-technical-research.md`](./shadcn-ui-radix-ui-technical-research.md)
- [`FRONTEND_GUIDELINES.md`](../FRONTEND_GUIDELINES.md)

### 后端开发 Agent
- [`nextjs-16-technical-research.md`](./nextjs-16-technical-research.md)
- [`supabase-technical-research.md`](./supabase-technical-research.md)
- [`resend-react-email-technical-research.md`](./resend-react-email-technical-research.md)
- [`t3-env-technical-research.md`](./t3-env-technical-research.md)
- [`BACKEND_STRUCTURE.md`](../BACKEND_STRUCTURE.md)

### 数据库 Agent
- [`supabase-technical-research.md`](./supabase-technical-research.md)
- [`BACKEND_STRUCTURE.md`](../BACKEND_STRUCTURE.md)（数据库 Schema 章节）

### 测试 Agent
- [`vitest-playwright-technical-research.md`](./vitest-playwright-technical-research.md)
- [`playwright-core-knowledge.md`](./playwright-core-knowledge.md)

### 文档 Agent
- 所有 `docs/` 目录下的文档

### 部署 Agent
- [`supabase-technical-research.md`](./supabase-technical-research.md)（部署章节）
- [`MULTI_AGENT_COLLABORATION.md`](../MULTI_AGENT_COLLABORATION.md)（MCP 服务器配置）

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-22 | StyleSnap Team | 初始版本 |
