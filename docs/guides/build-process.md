# StyleSnap 构建流程指南

> 版本：1.0
> 创建日期：2026-03-23
> 基于：IMPLEMENTATION_PLAN.md v1.2

---

## 目录

1. [架构概览](#1-架构概览)
2. [开发环境构建](#2-开发环境构建)
3. [本地开发流程](#3-本地开发流程)
4. [测试流程](#4-测试流程)
5. [构建与部署](#5-构建与部署)
6. [CI/CD 流程](#6-cicd-流程)
7. [故障排查](#7-故障排查)

---

## 1. 架构概览

### 1.1 Monorepo 结构

```
stylesnap/
├── apps/
│   └── web/                    # Next.js 16 主应用
│       ├── app/                # App Router
│       ├── components/         # React 组件
│       ├── hooks/              # 自定义 Hooks
│       ├── stores/             # Zustand Stores
│       ├── actions/            # Server Actions
│       ├── lib/                # 工具库
│       └── public/             # 静态资源
│
├── packages/
│   ├── config-eslint/          # ESLint 配置
│   ├── config-prettier/        # Prettier 配置
│   └── config-typescript/      # TypeScript 配置
│
├── turbo.json                  # Turborepo 管道配置
├── pnpm-workspace.yaml         # pnpm 工作区配置
└── package.json                # 根配置
```

### 1.2 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16.2.1 (App Router) |
| 语言 | TypeScript 5.7.2 (strict) |
| 样式 | Tailwind CSS + CSS Modules |
| 包管理 | pnpm 9.x + Turborepo |
| 数据库 | Supabase (PostgreSQL) |
| 认证 | Supabase Auth |
| 部署 | Vercel |

### 1.3 构建管道

```
┌─────────────────────────────────────────────────────────────┐
│                    Turborepo Pipeline                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   typecheck ──┬─> build ──> test ──> test:e2e               │
│               │                                              │
│   lint ───────┘                                              │
│                                                              │
│   dev (独立，persistent)                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 开发环境构建

### 2.1 环境要求

| 工具 | 版本 | 安装方式 |
|------|------|----------|
| Node.js | >=20.9.0 | [nodejs.org](https://nodejs.org/) |
| pnpm | 9.x | `npm install -g pnpm` |
| Git | 最新 | [git-scm.com](https://git-scm.com/) |

### 2.2 快速开始

```bash
# 1. 克隆仓库
git clone https://github.com/JackSmith111977/StyleSnap.git
cd StyleSnap

# 2. 安装依赖
pnpm install

# 3. 复制环境变量
cp .env.example .env
# 编辑 .env 填入实际值

# 4. 启动开发服务器
pnpm dev
```

### 2.3 环境变量配置

```bash
# .env 文件（根目录）

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Resend 邮件
RESEND_API_KEY=re_xxxxxxxx

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry（可选）
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project

# Vercel（可选）
VERCEL_TOKEN=vtk_xxxxxxxx
```

### 2.4 验证安装

```bash
# 类型检查
pnpm typecheck

# 代码检查
pnpm lint

# 格式化检查
pnpm format:check
```

---

## 3. 本地开发流程

### 3.1 启动开发服务器

```bash
# 启动所有应用（并行）
pnpm dev

# 启动指定应用
pnpm --filter @stylesnap/web dev
```

### 3.2 开发工作流

```
┌─────────────────────────────────────────────────────────────┐
│                    本地开发循环                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 修改代码 → 热更新 (HMR)                                  │
│       ↓                                                      │
│  2. 保存文件 → ESLint 检查                                   │
│       ↓                                                      │
│  3. 手动验证 → 浏览器测试                                    │
│       ↓                                                      │
│  4. 提交前 → pnpm lint && pnpm typecheck                     │
│       ↓                                                      │
│  5. Git 提交                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 常用开发命令

```bash
# 格式化代码
pnpm format

# 修复 ESLint 问题
pnpm lint -- --fix

# 运行特定包的脚本
pnpm --filter @stylesnap/web lint
```

---

## 4. 测试流程

### 4.1 测试类型

| 类型 | 工具 | 位置 |
|------|------|------|
| 单元测试 | Vitest | `*.test.ts`, `*.test.tsx` |
| 集成测试 | Vitest | `*.test.ts` (actions, hooks) |
| E2E 测试 | Playwright | `e2e/**/*.test.ts` |

### 4.2 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试（watch 模式）
pnpm test -- --watch

# 运行 E2E 测试
pnpm test:e2e

# 运行指定测试
pnpm test -- --run Button.test.tsx
```

### 4.3 测试覆盖率

```bash
# 生成覆盖率报告
pnpm test -- --coverage

# 输出目录：coverage/
```

---

## 5. 构建与部署

### 5.1 生产构建

```bash
# 构建所有包
pnpm build

# 构建指定包
pnpm --filter @stylesnap/web build

# 输出目录：apps/web/.next/
```

### 5.2 构建管道详解

```
pnpm build
    │
    ▼
┌─────────────────────────────────────────┐
│  Turborepo 执行顺序                      │
├─────────────────────────────────────────┤
│                                          │
│  1. packages/config-typescript build    │
│  2. packages/config-eslint build        │
│  3. packages/config-prettier build      │
│  4. apps/web build (依赖以上完成)        │
│                                          │
│  缓存：命中则跳过                        │
│  输出：.next/, dist/                     │
│                                          │
└─────────────────────────────────────────┘
```

### 5.3 Vercel 部署

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel 部署流程                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. git push → GitHub                                        │
│       ↓                                                      │
│  2. Vercel Webhook 触发                                      │
│       ↓                                                      │
│  3. Vercel 安装依赖 (pnpm)                                   │
│       ↓                                                      │
│  4. 运行 turbo build                                         │
│       ↓                                                      │
│  5. 输出 .next 到 CDN                                        │
│       ↓                                                      │
│  6. 部署完成 → 生成预览 URL                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 部署命令（本地）

```bash
# 登录 Vercel
npx vercel login

# 部署到 Preview
npx vercel

# 部署到 Production
npx vercel --prod
```

---

## 6. CI/CD 流程

### 6.1 GitHub Actions 工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9.x

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build

      - name: Test
        run: pnpm test

      - name: E2E Test
        run: pnpm test:e2e
```

### 6.2 部署分支策略

```
main (受保护)
  ├── develop (开发分支)
  │   ├── feature/* (功能分支)
  │   └── fix/* (修复分支)
  └── release/* (发布分支)

部署映射：
- main → Production (vercel.com)
- develop → Preview (develop.stylesnap.vercel.app)
- feature/* → Preview (pr-{id}.stylesnap.vercel.app)
```

---

## 7. 故障排查

### 7.1 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| `pnpm install` 失败 | 网络问题/锁文件损坏 | `pnpm store prune` + 删除 `pnpm-lock.yaml` 重装 |
| 开发服务器启动失败 | 端口占用/.env 缺失 | 检查 3000 端口，确认 `.env` 文件存在 |
| 类型检查失败 | TypeScript 配置问题 | `pnpm typecheck` 查看详细错误 |
| 构建失败 | 依赖问题/缓存污染 | `pnpm clean` + `pnpm build` |
| Turborepo 缓存失效 | 配置文件变更 | 删除 `.turbo/` 目录 |

### 7.2 清理命令

```bash
# 清理所有构建产物
pnpm clean

# 手动清理
rm -rf node_modules apps/web/node_modules .next
rm -rf packages/*/dist
rm -rf .turbo

# 重新安装
pnpm install
```

### 7.3 调试模式

```bash
# Turborepo 详细日志
pnpm build -- --verbosity=verbose

# 跳过缓存强制构建
pnpm build -- --force

# 并行度调整
pnpm build -- --concurrency=4
```

---

## 附录

### A. 命令速查表

```bash
# 开发
pnpm dev                    # 启动所有开发服务器
pnpm dev -- --filter=web    # 启动 web 应用

# 构建
pnpm build                  # 生产构建
pnpm build -- --force       # 强制构建（跳过缓存）

# 检查
pnpm lint                   # ESLint
pnpm typecheck              # TypeScript
pnpm format:check           # Prettier 检查
pnpm format                 # Prettier 修复

# 测试
pnpm test                   # 单元测试
pnpm test -- --watch        # 监听模式
pnpm test:e2e               # E2E 测试

# 清理
pnpm clean                  # 清理构建产物
```

### B. Turborepo 缓存说明

| 任务 | 缓存键 | 输出 |
|------|--------|------|
| build | 代码 + 依赖 | `.next/`, `dist/` |
| lint | 代码 + 配置 | 无 |
| test | 代码 + 配置 | `coverage/` |
| typecheck | 代码 + TS 配置 | 无 |

### C. 参考文档

- [Turborepo 文档](https://turbo.build/repo)
- [pnpm 指南](./pnpm-guide.md)
- [IMPLEMENTATION_PLAN.md](../IMPLEMENTATION_PLAN.md)

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
