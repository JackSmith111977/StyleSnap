# StyleSnap - 技术栈版本清单

> 版本：1.0
> 创建日期：2026-03-21
> 状态：草稿

---

## 说明

本文档仅包含技术栈版本锁定清单。各技术栈的核心知识体系、最佳实践、集成指南详见独立调研文档：

**完整索引**：[`docs/tech-stack-research/tech-stack-index.md`](./tech-stack-research/tech-stack-index.md)

| 技术栈 | 调研文档 | 状态 |
|--------|----------|------|
| Next.js 16 | `docs/tech-stack-research/nextjs-16-technical-research.md` | ✅ 已完成 |
| Zustand | `docs/tech-stack-research/zustand-technical-research.md` | ✅ 已完成 |
| TanStack Query | `docs/tech-stack-research/tanstack-query-vs-swr.md` | ✅ 已完成 |
| T3 Env | `docs/tech-stack-research/t3-env-technical-research.md` | ✅ 已完成 |
| UI 组件库 | `docs/research/04-component-library-selection.md` | ✅ 已完成 |
| Monorepo | `docs/research/05-monorepo-structure.md` | ✅ 已完成 |

---

## 核心框架

| 包名 | 版本 | 用途 |
|------|------|------|
| `next` | `16.x` | React 全栈框架 |
| `react` | `19.2.x` | UI 库 |
| `react-dom` | `19.2.x` | React DOM 渲染 |
| `typescript` | `5.7+` | 类型系统 |

---

## UI 与样式

| 包名 | 版本 | 用途 |
|------|------|------|
| `tailwindcss` | `4.x` | 原子化 CSS |
| `@tailwindcss/postcss` | `4.x` | Tailwind PostCSS 插件 |
| `clsx` | `2.x` | 类名合并工具 |
| `tailwind-merge` | `2.x` | Tailwind 类名合并 |

---

## UI 组件

| 包名 | 版本 | 用途 |
|------|------|------|
| `shadcn/ui` | `latest` | 组件生成器（CLI） |
| `@radix-ui/react-dialog` | `latest` | 对话框原语 |
| `@radix-ui/react-dropdown-menu` | `latest` | 下拉菜单原语 |
| `@radix-ui/react-label` | `latest` | 标签原语 |
| `@radix-ui/react-slot` | `latest` | 插槽原语 |
| `lucide-react` | `latest` | 图标库（2000+ SVG 图标） |

---

## 状态管理

| 包名 | 版本 | 用途 |
|------|------|------|
| `zustand` | `5.x` | 客户端状态管理 |
| `@tanstack/react-query` | `5.x` | 服务端状态管理 |

---

## 表单处理

| 包名 | 版本 | 用途 |
|------|------|------|
| `react-hook-form` | `8.x` | 表单库 |
| `@hookform/resolvers` | `3.x` | Zod 解析器 |
| `zod` | `3.x` | Schema 验证 |

---

## 认证与数据库

| 包名 | 版本 | 用途 |
|------|------|------|
| `@supabase/ssr` | `latest` | Supabase 服务端集成 |
| `@supabase/supabase-js` | `2.x` | Supabase 客户端 |

---

## 环境变量管理

| 包名 | 版本 | 用途 |
|------|------|------|
| `@t3-oss/env-nextjs` | `latest` | 环境变量验证 |

---

## 邮件服务

| 包名 | 版本 | 用途 |
|------|------|------|
| `resend` | `latest` | 邮件发送 SDK |
| `@react-email/components` | `latest` | React 邮件组件 |
| `react-email` | `latest` | 邮件模板开发工具 |

---

## 测试工具

| 包名 | 版本 | 用途 |
|------|------|------|
| `vitest` | `3.x` | 单元测试运行器 |
| `@testing-library/react` | `latest` | 组件测试 |
| `@testing-library/jest-dom` | `latest` | DOM 断言 |
| `@testing-library/user-event` | `latest` | 用户交互模拟 |
| `playwright` | `latest` | E2E 测试 |
| `jsdom` | `latest` | Node.js DOM 环境 |

---

## 代码质量

| 包名 | 版本 | 用途 |
|------|------|------|
| `eslint` | `9.x` | 代码检查 |
| `eslint-config-next` | `16.x` | Next.js ESLint 配置 |
| `@typescript-eslint/parser` | `8.x` | TypeScript 解析器 |
| `@typescript-eslint/eslint-plugin` | `8.x` | TypeScript 规则 |
| `prettier` | `3.x` | 代码格式化 |
| `eslint-config-prettier` | `latest` | Prettier 兼容配置 |

---

## Monorepo 工具

| 包名 | 版本 | 用途 |
|------|------|------|
| `pnpm` | `9.x` | 包管理器 |
| `turbo` | `2.x` | 构建编排工具 |

---

## 文档工具

| 包名 | 版本 | 用途 |
|------|------|------|
| `typedoc` | `latest` | API 文档生成 |

---

## Node.js 环境

| 环境 | 版本 | 说明 |
|------|------|------|
| Node.js | `20.9+` | 最低要求 |

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本（仅版本清单） |
