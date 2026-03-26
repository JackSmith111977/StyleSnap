# 多 Agent 协同开发指南

> 版本：1.0
> 创建日期：2026-03-26
> 状态：已完成

---

## 目录

1. [概述](#1-概述)
2. [核心概念](#2-核心概念)
3. [快速入门](#3-快速入门)
4. [基础用法](#4-基础用法)
5. [高级特性](#5-高级特性)
6. [实战案例](#6-实战案例)
7. [常见问题](#7-常见问题)
8. [学习资源](#8-学习资源)

---

## 1. 概述

### 1.1 项目基本信息

| 项目 | 内容 |
|------|------|
| **名称** | StyleSnap |
| **定位** | 前端开发者选择网页开发视觉风格的工具 |
| **技术栈** | Next.js 16 + React 19 + Supabase + TypeScript |
| **开发模式** | 多 Agent 协同开发 |
| **统一模型** | qwen3.5-plus |

### 1.2 预定义 Agents（7 个）

| Agent | 职责 | 配置文件 |
|-------|------|----------|
| **架构师** | 技术架构设计、选型、规范制定 | `.claude/agents/01-architecture.md` |
| **前端开发** | Next.js 前端功能实现 | `.claude/agents/02-frontend.md` |
| **后端开发** | Server Actions + Supabase 集成 | `.claude/agents/03-backend.md` |
| **数据库** | PostgreSQL Schema 设计、迁移管理 | `.claude/agents/04-database.md` |
| **测试** | 单元测试 + E2E 测试 | `.claude/agents/05-testing.md` |
| **文档** | API 文档、使用指南 | `.claude/agents/06-documentation.md` |
| **部署** | Vercel 部署、环境配置 | `.claude/agents/07-deploy.md` |

### 1.3 为什么需要多 Agent 协同

| 问题 | 单一 Agent | 多 Agent 协同 |
|------|-----------|--------------|
| 上下文污染 | 容易污染主上下文 | 每个 Agent 独立上下文 |
| 角色混淆 | 需要在不同角色间切换 | 每个 Agent 专精一个角色 |
| 并行执行 | 顺序执行，效率低 | 多个 Agent 并行执行 |
| Git 分支管理 | 容易冲突 | 每个 Agent 独立分支 |

---

## 2. 核心概念

### 2.1 两种多 Agent 模式对比

| 特性 | **Sub-agents（子代理）** | **Agent Teams（代理团队）** |
|------|-------------------------|---------------------------|
| **通信模型** | 星形拓扑（主从模式） | 网状拓扑（点对点通信） |
| **上下文** | 独立上下文窗口 | 独立上下文窗口 |
| **生命周期** | 短期存在，任务完成后消失 | 长期运行，持续协作 |
| **协调方式** | 主 Agent 唯一协调者 | Team Lead + 共享任务池 |
| **嵌套能力** | ❌ 不能嵌套，不能互相通信 | ✅ 成员间可直接通信 |
| **Token 成本** | 较低（约 2-3 倍） | 较高（约 3-7 倍） |
| **适用场景** | 独立研究、代码探索、并行查询 | 复杂项目、多角度 Code Review、并行开发 |

### 2.2 架构对比图

```
Sub-agents（主从模式）              Agent Teams（团队协作）

    ┌─────────┐                        ┌───────────┐
    │ Main    │                        │ Team Lead │
    │ Agent   │                        │           │
    └────┬────┘                        └─────┬─────┘
         │                                   │
    ┌────┼────┐                    ┌─────────┼─────────┐
    ▼    ▼    ▼                    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐  ┌───────┐ ┌───────┐ ┌───────┐
│ Sub A │ │ Sub B │ │ Sub C │  │Team A │←→│Team B │←→│Team C │
│ 独立  │ │ 独立  │ │ 独立  │  │独立上下文│ │独立上下文│ │独立上下文│
└───────┘ └───────┘ └───────┘  └───────┘ └───────┘ └───────┘
    │         │         │           │         │         │
    └─────────┴────┬────┴───────────┘         │         │
                   ▼                          ▼         ▼
            返回压缩结果                  共享任务池 + 信箱系统
```

### 2.3 StyleSnap 项目推荐模式

| 开发阶段 | 推荐模式 | 理由 |
|----------|----------|------|
| **P0 阶段 1**（基础架构） | Agent Teams | Monorepo、数据库、认证系统需要并行且互相配合 |
| **P0 阶段 2**（核心功能） | Agent Teams | 前端 + 后端 + 数据库需要频繁同步 |
| **P0 阶段 3**（测试部署） | Sub-agents | 测试任务相对独立，可并行执行 |
| **代码审查** | Agent Teams | 安全、性能、测试多角度同时审查 |
| **技术调研** | Sub-agents | 各方向独立研究后汇总 |

---

## 3. 快速入门

### 3.1 必须安装的环境

| 序号 | 项目 | 版本要求 | 安装命令/说明 |
|------|------|----------|--------------|
| 1 | **Node.js** | 20.9+ | 从 [nodejs.org](https://nodejs.org/) 下载 LTS 版本 |
| 2 | **pnpm** | 9.x | `npm install -g pnpm` |
| 3 | **Git** | 最新 | 从 [git-scm.com](https://git-scm.com/) 下载 |
| 4 | **Supabase CLI** | 最新 | 项目初始化时作为 devDependency 安装 |
| 5 | **Claude Code** | 最新 | 已安装 |

### 3.2 MCP 服务安装（可选但推荐）

| MCP 服务 | 用途 | 安装命令 |
|---------|------|---------|
| **Playwright** | E2E 测试浏览器自动化 | `npm install -g @playwright/mcp-server` <br> `npx playwright install` |
| **GitHub** | GitHub API 集成 | `npm install -g @modelcontextprotocol/server-github` |

### 3.3 启用 Agent Teams

Agent Teams 是实验性功能，需要手动启用。有两种方法：

#### 方法 1：环境变量（推荐）

```bash
# Windows PowerShell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"

# Windows CMD
set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# macOS / Linux
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

#### 方法 2：settings.json（永久生效）

编辑 `~/.claude/settings.json` 或项目 `.claude/settings.local.json`：

```json
{
  "experimental": {
    "agentTeams": true
  }
}
```

### 3.4 settings.json 完整配置示例

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "--allowed-dirs", "D:\\WorkPlace\\VibeCoding\\Design Style"],
      "disabled": false
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp-server"],
      "disabled": false
    }
  },
  "experimental": {
    "agentTeams": true
  }
}
```

---

## 4. 基础用法

### 4.1 7 个预定义 Agent 配置详情

#### 架构师 Agent

```markdown
职责：技术架构设计、关键技术选型决策、开发规范制定、代码审查
参考文档：
- docs/TECH_STACK.md - 技术栈清单
- docs/BACKEND_STRUCTURE.md - 后端架构
- docs/FRONTEND_GUIDELINES.md - 前端指南
输出要求：
- 架构决策必须有 ADR 文档
- 输出包含架构图（ASCII 或 Mermaid）
- 所有选型必须有 pros/cons 分析
```

#### 前端开发 Agent

```markdown
职责：Next.js 16 功能开发、Shadcn UI 组件集成、Tailwind CSS 样式、响应式设计
技术栈：
- Next.js 16 (App Router)
- React 19.2
- TypeScript 5.7+ (strict)
- Tailwind CSS 4.x
- Shadcn UI + Radix UI
- Zustand (状态管理)
- TanStack Query (服务端状态)
开发规范：
- 所有组件必须有 TypeScript 类型
- 使用 CSS Modules + Tailwind 混合
- 组件必须有基本单元测试
```

#### 后端开发 Agent

```markdown
职责：Server Actions 实现、Supabase 集成、数据验证（Zod）、错误处理
参考文档：
- docs/BACKEND_STRUCTURE.md - 后端架构（含 API 端点合约）
- docs/tech-stack-research/supabase-technical-research.md
开发规范：
- Server Actions 统一返回 ActionResponse<T>
- 必须使用 Zod 验证输入
- 错误必须有 Sentry 捕获
```

#### 数据库 Agent

```markdown
职责：数据库 Schema 设计、Supabase CLI 迁移、RLS 策略配置、索引优化
工具：Supabase CLI、psql（本地调试）
输出：SQL 迁移文件、ER 图、RLS 策略文档
```

#### 测试 Agent

```markdown
职责：Vitest 单元测试、Playwright E2E 测试、测试覆盖率分析
技术栈：
- Vitest 3.x
- @testing-library/react
- Playwright
覆盖目标：
- 核心功能单元测试覆盖率 > 80%
- 关键流程 E2E 测试 100%
```

#### 文档 Agent

```markdown
职责：API 文档编写、组件文档、CHANGELOG 维护、README 更新
规范：
- 使用 Typedoc 生成 API 文档
- 组件文档跟随代码更新
```

#### 部署 Agent

```markdown
职责：Vercel 配置、环境变量管理、CI/CD 流程、Sentry 监控
环境：
- Development（本地）
- Preview（每 PR 自动）
- Production（main 分支）
```

### 4.2 如何使用 Agent

#### 方式 1：自然语言触发（推荐）

直接用自然语言描述任务，Claude 会自动判断是否需要委派给对应 Agent：

```
帮我设计用户认证系统的数据库 Schema，包括 profiles 表和认证流程
→ 自动委派给数据库 Agent

实现风格列表页，支持网格/列表视图切换
→ 自动委派给前端开发 Agent

创建登录和注册的 Server Actions
→ 自动委派给后端开发 Agent
```

#### 方式 2：Agent Teams 模式

启用 Agent Teams 后，使用自然语言创建团队：

```
我要实现 P0 认证功能。创建一个 3 人团队：
- 一个成员负责数据库 Schema 设计
- 一个成员负责 Server Actions 实现
- 一个成员负责登录/注册表单组件
```

#### 方式 3：Sub-agents 模式

Sub-agents 无需额外配置，默认即可使用。直接用自然语言描述任务即可触发。

---

## 5. 高级特性

### 5.1 Git 分支并行开发工作流

```
main (受保护)
  ├── develop (开发分支，每日合并)
  │   ├── feature/p0-auth (前端 Agent)
  │   ├── feature/p0-auth-api (后端 Agent)
  │   └── feature/p0-db (数据库 Agent)
  └── release/v1.0.0
```

**冲突解决策略**：
- 每个 Agent 在独立 Git 分支工作
- Main Agent 负责合并和解决冲突
- 使用文件锁避免同时修改同一文件

### 5.2 并行开发示例

```
Day 1-3: 基础架构并行任务

Main Agent (协调者)
├── [并行分支 A] 架构师 Agent → Monorepo 配置
├── [并行分支 B] 数据库 Agent → Supabase 项目创建 + Schema 设计
├── [并行分支 C] 部署 Agent → Vercel 项目配置
│
└── [汇总] 合并所有配置，解决冲突

Day 4-7: 认证系统并行任务

Main Agent
├── [并行分支 A] 后端 Agent → Server Actions (login/register)
├── [并行分支 B] 前端 Agent → 登录/注册表单组件
├── [并行分支 C] 后端 Agent → 邮件服务集成
│
└── [汇总] 联调测试
```

### 5.3 代码验证流程

所有 Agent 提交代码前必须运行：

```bash
pnpm typecheck → pnpm lint → pnpm build
```

**遇到问题处理原则**：
- 修复两次仍无法解决：优先查阅官方文档
- 若无官方文档：通过联网搜索参考官方文档，使用最佳实践

### 5.4 技术栈版本适配

根据 `TECH_STACK.md`，各 Agent 必须使用以下版本：

| 技术 | 版本 | 负责 Agent |
|------|------|----------|
| Next.js | 16.x | 前端、后端 |
| React | 19.2.x | 前端 |
| TypeScript | 5.7+ | 所有 Agent |
| Tailwind CSS | 4.x | 前端 |
| Shadcn UI | latest | 前端 |
| Zustand | 5.x | 前端 |
| TanStack Query | 5.x | 前端 |
| Zod | 3.x | 后端 |
| Supabase | 2.x | 后端、数据库 |
| Vitest | 3.x | 测试 |
| Playwright | latest | 测试 |

---

## 6. 实战案例

### 6.1 P0 阶段任务分配

#### 阶段 1：基础架构搭建（5-7 天）

| 任务 | 负责 Agent | 协同 Agent | 预计时间 |
|------|-----------|-----------|---------|
| Monorepo 初始化 | 架构师 | 部署 | 1 天 |
| Supabase 配置 | 数据库 | 后端 | 1 天 |
| 存储桶配置 | 数据库 | 部署 | 0.5 天 |
| 基础组件搭建 | 前端 | 架构师 | 1.5 天 |
| 认证系统 | 后端 | 前端 | 2 天 |
| 邮件服务集成 | 后端 | 部署 | 1 天 |
| 错误监控配置 | 部署 | 后端 | 0.5 天 |

#### 阶段 2：核心功能实现（10-14 天）

| 任务 | 负责 Agent | 协同 Agent | 预计时间 |
|------|-----------|-----------|---------|
| 数据库初始化 | 数据库 | 后端 | 1 天 |
| 风格浏览功能 | 前端 | 后端 | 3 天 |
| 风格详情功能 | 前端 | 后端 | 2 天 |
| 搜索与筛选 | 前端 | 后端、数据库 | 3 天 |
| SEO 优化 | 前端 | 文档 | 1 天 |

#### 阶段 3：测试与部署（5-7 天）

| 任务 | 负责 Agent | 协同 Agent | 预计时间 |
|------|-----------|-----------|---------|
| 单元测试编写 | 测试 | 前端、后端 | 2 天 |
| E2E 测试编写 | 测试 | 前端、后端 | 2 天 |
| 性能优化 | 架构师 | 前端、后端 | 1.5 天 |
| Vercel 部署 | 部署 | 架构师 | 1 天 |

### 6.2 使用示例

#### 示例 1：初始化项目

```
/architecture 初始化 StyleSnap Monorepo 项目
- 使用 Turborepo 标准结构
- 配置 pnpm workspace
- 安装 TECH_STACK.md 中定义的依赖
```

#### 示例 2：实现认证功能

```
我要实现用户认证功能，请创建 Agent Team：
- 数据库 Agent：设计 profiles 表和 RLS 策略
- 后端 Agent：实现登录/注册/密码重置 Server Actions
- 前端 Agent：创建登录/注册表单组件
```

#### 示例 3：代码审查

```
请审查 feature/p0-auth 分支的代码，重点关注：
- 安全性（SQL 注入、XSS、认证漏洞）
- 类型安全（TypeScript strict 模式）
- 代码规范（ESLint、Prettier）
```

#### 示例 4：运行测试

```
/test 运行所有测试并修复失败
- 单元测试覆盖率目标 > 80%
- E2E 测试覆盖关键流程
```

---

## 7. 常见问题

### 7.1 模式选择

| 场景 | 推荐模式 | 原因 |
|------|----------|------|
| 多目录搜索文件 | Sub-agents | 独立任务，无需协作，成本更低 |
| PR 审查（需互相质疑） | Agent Teams | 需要成员间直接通信、观点碰撞 |
| 代码语法检查 | Sub-agents | 批量独立任务，无需讨论 |
| 复杂架构评审 | Agent Teams | 多角色深度讨论、方案迭代 |
| 多模块开发（前端 + 后端 + 数据库） | Agent Teams | 各成员负责一块，互不干扰 |
| 调研多个方案对比 | Agent Teams | 各成员研究不同方案，最后对比 |

### 7.2 避免的陷阱

| 陷阱 | 错误做法 | 正确做法 |
|------|----------|----------|
| **顺序任务** | 先分析需求→再写代码→再写文档 | 适合单 Agent，无需多 Agent |
| **多人改同一文件** | 多个 Agent 同时编辑同一文件 | 会互相覆盖，避免使用 Agent Teams |
| **Token 成本** | 不注意控制 | Agent Teams 消耗约是标准会话的 7 倍 |

### 7.3 冲突解决

当多个 Agent 同时修改同一文件时：

1. **预防为主**：任务分配时明确文件边界
2. **文件锁机制**：一个 Agent 编辑时，其他 Agent 等待
3. **Main Agent 合并**：由 Main Agent 负责合并和解决冲突
4. **Git 分支隔离**：每个 Agent 在独立分支工作

### 7.4 成本优化

| 策略 | 说明 |
|------|------|
| **选择合适模式** | 简单任务用 Sub-agents，复杂项目用 Agent Teams |
| **保持团队精简** | 任务完成后立即清理，避免空闲成员持续消耗 Token |
| **任务粒度适中** | 一个函数、一份测试或一份评审报告为佳 |
| **定期查看进度** | 避免无限制消耗 Token |

---

## 8. 学习资源

### 8.1 项目内部文档

| 文档 | 路径 | 用途 |
|------|------|------|
| 技术栈清单 | `docs/TECH_STACK.md` | 技术栈版本锁定 |
| 多智能体协同方案 | `docs/main/MULTI_AGENT_COLLABORATION.md` | Agent 配置详情 |
| 实现计划 | `docs/main/IMPLEMENTATION_PLAN.md` | P0/P1/P2 阶段任务分配 |
| 前端指南 | `docs/main/FRONTEND_GUIDELINES.md` | 前端开发规范 |
| 后端架构 | `docs/main/BACKEND_STRUCTURE.md` | 后端 API 设计 |

### 8.2 技术栈知识库

| 技术栈 | 文档路径 |
|--------|----------|
| Next.js 16 | `docs/knowledge-base/Next.js 核心知识体系.md` |
| Zustand | `docs/knowledge-base/Zustand 核心知识体系.md` |
| TanStack Query | `docs/knowledge-base/TanStack Query 核心知识体系.md` |
| Supabase | `docs/knowledge-base/Supabase 核心知识体系.md` |
| React Hook Form + Zod | `docs/knowledge-base/React Hook Form + Zod 核心知识体系.md` |
| Vitest + Playwright | `docs/knowledge-base/Vitest + Playwright 核心知识体系.md` |

### 8.3 外部资源

| 资源 | 链接 |
|------|------|
| Claude Code 官方文档 | https://claude.ai/code |
| Agent Teams 介绍 | https://blog.csdn.net/sensen111111/article/details/159165568 |
| MCP 服务器配置 | https://zhuanlan.zhihu.com/p/2008161904904931325 |

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-26 | StyleSnap Team | 初始版本 |

---

*生成日期：2026-03-26*
*调研来源：CSDN、知乎、什么值得买、项目现有文档*
