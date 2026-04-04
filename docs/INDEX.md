# StyleSnap 文档索引

> 最后更新：2026-04-04 | 文档总数：62 份  
> **用途**: 快速定位所需文档，支持 BMad 流程、技术栈参考、错误修复

---

## 🚀 快速入口

| 场景 | 文档 |
|------|------|
| **开始新需求** | [`PRD.md`](./main/PRD.md) → [`APP_FLOW.md`](./main/APP_FLOW.md) |
| **修复 Bug** | [`DEBUG_FIX_TEMPLATE.md`](./main/DEBUG_FIX_TEMPLATE.md) → [`FIX_BEFORE_CONFIRM_CHECKLIST.md`](./main/FIX_BEFORE_CONFIRM_CHECKLIST.md) |
| **技术调研** | [`技术栈索引.md`](./knowledge-base/技术栈索引.md) |
| **BMad 流程** | [`BMad 流程索引`](#bmad-流程文档) |

---

## 📂 文档分类

### 1. BMad 流程文档

| 阶段 | 文档 | 用途 |
|------|------|------|
| **需求梳理** | [`PRD.md`](./main/PRD.md) | 产品需求定义 |
| | [`APP_FLOW.md`](./main/APP_FLOW.md) | 应用流程图 |
| | [`需求梳理方法论.md`](./knowledge-base/需求梳理方法论.md) | BMad 需求分析方法 |
| **规划** | [`IMPLEMENTATION_PLAN.md`](./main/IMPLEMENTATION_PLAN.md) | 实现计划 |
| | [`TECH_STACK.md`](./main/TECH_STACK.md) | 技术栈清单 |
| **实施** | [`FRONTEND_GUIDELINES.md`](./main/FRONTEND_GUIDELINES.md) | 前端开发指南 |
| | [`BACKEND_STRUCTURE.md`](./main/BACKEND_STRUCTURE.md) | 后端结构 |
| | [`MULTI_AGENT_COLLABORATION.md`](./main/MULTI_AGENT_COLLABORATION.md) | 多 Agent 协同 |
| **修复** | [`DEBUG_FIX_TEMPLATE.md`](./main/DEBUG_FIX_TEMPLATE.md) | 修复流程模板 |
| | [`DEBUG_FIX_REPORT_TEMPLATE.md`](./main/DEBUG_FIX_REPORT_TEMPLATE.md) | 修复报告模板 |
| | [`FIX_BEFORE_CONFIRM_CHECKLIST.md`](./main/FIX_BEFORE_CONFIRM_CHECKLIST.md) | 修复前确认清单 |

---

### 2. 技术栈核心知识体系

| 技术 | 文档 | 状态 |
|------|------|------|
| **Next.js 16** | [`Next.js 核心知识体系.md`](./knowledge-base/Next.js 核心知识体系.md) | ✅ |
| **Supabase** | [`Supabase 核心知识体系.md`](./knowledge-base/Supabase 核心知识体系.md) | ✅ |
| **React Hook Form + Zod** | [`React Hook Form + Zod 核心知识体系.md`](./knowledge-base/React Hook Form + Zod 核心知识体系.md) | ✅ |
| **TanStack Query** | [`TanStack Query 核心知识体系.md`](./knowledge-base/TanStack Query 核心知识体系.md) | ✅ |
| **Zustand** | [`Zustand 核心知识体系.md`](./knowledge-base/Zustand 核心知识体系.md) | ✅ |
| **Shadcn UI + Radix UI** | [`Shadcn UI + Radix UI 核心知识体系.md`](./knowledge-base/Shadcn UI + Radix UI 核心知识体系.md) | ✅ |
| **T3 Env** | [`T3 Env 核心知识体系.md`](./knowledge-base/T3 Env 核心知识体系.md) | ✅ |
| **Vitest + Playwright** | [`Vitest + Playwright 核心知识体系.md`](./knowledge-base/Vitest + Playwright 核心知识体系.md) | ✅ |
| **Playwright MCP** | [`Playwright MCP 核心知识体系.md`](./knowledge-base/Playwright MCP 核心知识体系.md) | ✅ |
| **ESLint + Prettier** | [`ESLint + Prettier 核心知识体系.md`](./knowledge-base/ESLint + Prettier 核心知识体系.md) | ✅ |
| **Resend + React Email** | [`Resend + React Email 核心知识体系.md`](./knowledge-base/Resend + React Email 核心知识体系.md) | ✅ |
| **Sentry** | [`Sentry 配置指南.md`](./knowledge-base/Sentry 配置指南.md) | ✅ |

---

### 3. API 速查表

| 技术 | 文档 | 完整度 |
|------|------|--------|
| **Next.js** | [`nextjs-api-reference.md`](./reference/nextjs-api-reference.md) | ✅ |
| **Supabase** | [`supabase-reference.md`](./reference/supabase-reference.md) | ✅ |
| **React Hook Form** | [`react-hook-form-zod-reference.md`](./reference/react-hook-form-zod-reference.md) | ✅ |
| **TanStack Query** | [`tanstack-query-reference.md`](./reference/tanstack-query-reference.md) | ✅ |
| **T3 Env** | [`t3-env-reference.md`](./reference/t3-env-reference.md) | ✅ |
| **Sentry** | [`sentry-api-reference.md`](./reference/sentry-api-reference.md) | ✅ |
| **错误修复手册** | [`TROUBLESHOOTING_PLAYBOOK.md`](./reference/TROUBLESHOOTING_PLAYBOOK.md) | ✅ |

---

### 4. 错误修复报告（历史归档）

| 编号 | 问题 | 文档 | 日期 |
|------|------|------|------|
| FIX-2026-001 | 收藏页 RLS 嵌套查询问题 | [`FIX-2026-001-favorites-rls-issue.md`](./main/FIX-2026-001-favorites-rls-issue.md) | 2026-04-04 |
| - | 点赞计数双重增加 | [`P0_LIKE_COUNT_FIX_REPORT.md`](./main/P0_LIKE_COUNT_FIX_REPORT.md) | - |
| - | RPC 函数修复 | [`P1_RPC_FUNCTION_FIX_REPORT.md`](./main/P1_RPC_FUNCTION_FIX_REPORT.md) | - |
| - | 计数负数问题 | [`P2_COUNT_NEGATIVE_FIX_REPORT.md`](./main/P2_COUNT_NEGATIVE_FIX_REPORT.md) | - |
| - | Auth Sync 问题 | [`P1_AUTH_SYNC_ANALYSIS.md`](./main/P1_AUTH_SYNC_ANALYSIS.md) | - |
| - | Login Cookie 修复 | [`P2_LOGIN_COOKIE_FIX.md`](./main/P2_LOGIN_COOKIE_FIX.md) | - |

---

### 5. 调研与选型

| 主题 | 文档 |
|------|------|
| 风格分类体系 | [`01-style-classification.md`](./research/01-style-classification.md) |
| 鹰角 UI 风格分析 | [`02-hypergryph-ui-analysis.md`](./research/02-hypergryph-ui-analysis.md) |
| 邮件服务选型 | [`03-email-service-selection.md`](./research/03-email-service-selection.md) |
| 组件库选型 | [`04-component-library-selection.md`](./research/04-component-library-selection.md) |
| Monorepo 架构 | [`05-monorepo-structure.md`](./research/05-monorepo-structure.md) |

---

### 6. 工具与配置

| 工具 | 文档 |
|------|------|
| **Supabase** | [`Supabase CLI 指南.md`](./knowledge-base/Supabase CLI 指南.md) · [`Supabase 集成指南.md`](./knowledge-base/Supabase 集成指南.md) · [`Supabase Storage 指南.md`](./knowledge-base/Supabase Storage 指南.md) |
| **Git/GitHub** | [`GitHub 使用指南.md`](./knowledge-base/GitHub 使用指南.md) |
| **pnpm** | [`pnpm 使用指南.md`](./knowledge-base/pnpm 使用指南.md) |
| **CI/CD** | [`CI-CD 配置指南.md`](./knowledge-base/CI-CD 配置指南.md) |
| **构建流程** | [`构建流程指南.md`](./knowledge-base/构建流程指南.md) |

---

### 7. 调试工具

| 工具 | 文档 |
|------|------|
| **Agent + 浏览器调试** | [`agent-browser-debug-tools.md`](./guide/agent-browser-debug-tools.md) |
| **多 Agent 协同** | [`多 Agent 协同开发指南.md`](./knowledge-base/多 Agent 协同开发指南.md) |

---

## 🔧 BMad Skill 快速命令

| 场景 | 命令 | 说明 |
|------|------|------|
| **创建 PRD** | `/bmad-help` → `[CP] Create PRD` | 产品需求文档 |
| **创建架构** | `/bmad-help` → `[CA] Create Architecture` | 技术架构设计 |
| **创建 Story** | `/bmad-help` → `[CS] Create Story` | 开发任务 Story |
| **代码审查** | `/bmad-help` → `[CR] Code Review` | 代码质量审查 |
| **编写文档** | `/bmad-help` → `[WD] Write Document` | 技术文档编写 |
| **修复流程** | 手动流程 | 调研 → 确认 → 修复 → 文档 |

---

## 📊 文档健康度

| 分类 | 总数 | ✅ 完整 | ⚠️ 部分 | ⬜ 待创建 |
|------|------|--------|---------|----------|
| BMad 流程 | 10 | 10 | 0 | 0 |
| 技术栈核心 | 12 | 12 | 0 | 0 |
| API 速查 | 6 | 6 | 0 | 0 |
| 修复报告 | 6 | 6 | 0 | 0 |
| 调研选型 | 5 | 5 | 0 | 0 |
| **合计** | **39** | **39** | **0** | **0** |

---

## 📝 使用说明

### 给 Agent 的提示

1. **技术调研**: 优先阅读 [`技术栈索引.md`](./knowledge-base/技术栈索引.md) 找到对应技术的核心知识体系
2. **API 查询**: 使用 [`API 速查表`](#3-api-速查表) 快速找到 API 用法
3. **修复问题**: 遵循 [`DEBUG_FIX_TEMPLATE.md`](./main/DEBUG_FIX_TEMPLATE.md) 流程
4. **创建文档**: 使用 `[WD] Write Document` skill

### 文档命名规范

| 前缀 | 用途 | 示例 |
|------|------|------|
| `P[0-3]_` | 阶段修复报告 | `P0_LIKE_COUNT_FIX_REPORT.md` |
| `FIX-YYYY-` | 正式修复报告 | `FIX-2026-001-favorites-rls-issue.md` |
| `[数字]-` | 调研文档 | `01-style-classification.md` |

---

*索引版本：1.0 | 最后更新：2026-04-04*
