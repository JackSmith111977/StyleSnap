# StyleSnap - 多智能体协同开发方案

> 版本：1.4
> 创建日期：2026-03-22
> 模型配置：qwen3.5-plus

---

## 目录

1. [核心概念](#1-核心概念)
2. [架构设计](#2-架构设计)
3. [Sub-agents 配置](#3-sub-agents-配置)
4. [MCP 服务器安装](#4-mcp-服务器安装)
5. [Claude Code Agent Teams 机制](#5-claude-code-agent-teams-机制)
6. [Subagents（子代理）模式](#6-subagents-子代理模式)
7. [Agent Teams 核心特性](#7-agent-teams-核心特性)
8. [任务分配方案](#8-任务分配方案)
9. [并行开发工作流](#9-并行开发工作流)
10. [用户待办事项清单](#10-用户待办事项清单)
11. [成本优化建议](#11-成本优化建议)

---

## 1. 核心概念

### 1.1 什么是 Sub-agent 模式

Sub-agent（子代理）模式是将复杂任务拆解为多个专业子任务的 AI 协作架构。每个 Sub-agent 拥有：

- **专业化配置**：针对特定任务类型优化的系统提示词
- **领域知识库**：项目特定的业务规则、技术规范、代码风格
- **工具集**：配置专属的工具和插件
- **上下文隔离**：独立的对话上下文，避免信息污染

### 1.2 为什么需要多智能体协同

| 问题 | 单一 Agent | 多 Agent 协同 |
|------|-----------|--------------|
| 上下文污染 | 容易污染主上下文 | 每个 Agent 独立上下文 |
| 角色混淆 | 需要在不同角色间切换 | 每个 Agent 专精一个角色 |
| 并行执行 | 顺序执行，效率低 | 多个 Agent 并行执行 |
| 可复用性 | 提示词难以复用 | 配置化，团队共享 |
| 安全隔离 | 全权限访问 | 可按需限制权限 |

### 1.3 Sub-agent 层级

```
├── Built-in Agents（内置代理）
│   ├── agent-statusline-setup（配置状态行）
│   └── general-purpose（通用研究代理）
│
├── User Agents（用户级代理，跨项目复用）
│   └── ~/.claude/agents/*.md
│
└── Project Agents（项目级代理，团队共享）
    └── {project}/.claude/agents/*.md
```

---

## 2. 架构设计

### 2.1 多 Agent 协作架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Main Agent (主代理)                         │
│         任务接收 → 任务拆解 → Sub-agent 调度 → 结果整合            │
└───────────────┬─────────────────┬─────────────────┬─────────────┘
                │                 │                 │
    ┌───────────▼───────┐ ┌──────▼────────┐ ┌─────▼──────────────┐
    │  Architecture     │ │   Code        │ │   Testing         │
    │  Agent            │ │   Agent       │ │   Agent           │
    │  - 架构设计        │ │  - 功能实现    │ │  - 单元测试        │
    │  - 技术选型        │ │  - 代码重构    │ │  - E2E 测试        │
    │  - 规范制定        │ │  - 代码审查    │ │  - 覆盖率分析      │
    └───────────────────┘ └───────────────┘ └───────────────────┘
                │                 │                 │
    ┌───────────▼───────┐ ┌──────▼────────┐ ┌─────▼──────────────┐
    │  Documentation    │ │   Database    │ │   Deploy          │
    │  Agent            │ │   Agent       │ │   Agent           │
    │  - API 文档        │ │  - Schema 设计  │ │  - Vercel 部署     │
    │  - 使用指南        │ │  - 迁移脚本    │ │  - 环境配置        │
    │  - CHANGELOG       │ │  - 种子数据    │ │  - 监控配置        │
    └───────────────────┘ └───────────────┘ └───────────────────┘
```

### 2.2 任务调度流程

```
1. 用户提交需求 → Coordinator Agent（协调器）
2. Coordinator Agent 分析需求，拆解为子任务
3. 根据任务类型分派给对应 Sub-agent
4. Sub-agents 并行执行（通过 Git 同步）
5. Coordinator Agent 汇总结果，解决冲突
6. 输出最终结果
```

### 2.3 上下文隔离机制

```
主上下文
├── 项目目标、用户需求
├── 整体架构决策
└── 最终汇总结果

Sub-agent A 上下文（架构）
├── 技术选型讨论
├── 架构设计文档
└── 不干扰主上下文

Sub-agent B 上下文（代码）
├── 实现细节
├── 代码修改记录
└── 不干扰主上下文
```

---

## 3. Sub-agents 配置

### 3.1 项目级 Agents 目录结构

```
.claude/
└── agents/
    ├── 01-architecture.md      # 架构师 Agent
    ├── 02-frontend.md          # 前端开发 Agent
    ├── 03-backend.md           # 后端开发 Agent
    ├── 04-database.md          # 数据库 Agent
    ├── 05-testing.md           # 测试 Agent
    ├── 06-documentation.md     # 文档 Agent
    └── 07-deploy.md            # 部署 Agent
```

### 3.2 StyleSnap 项目 Agents 配置

各 Agent 的详细配置已创建在 `.claude/agents/` 目录下，每个 Agent 包含：
- 职责定义
- 参考文档列表
- 技术栈说明
- 开发规范/输出要求

---

## 4. MCP 服务器安装

### 4.1 什么是 MCP

MCP（Model Context Protocol）是标准化协议，使 LLM 能够与外部工具和服务交互。通过 MCP，Agent 可以：

- 访问数据库
- 调用 API
- 操作文件系统
- 执行浏览器自动化

### 4.2 核心 MCP 服务器安装清单

| MCP 服务 | 用途 | 安装命令 |
|---------|------|---------|
| `filesystem` | 文件系统访问 | 内置，无需安装 |
| `playwright` | 浏览器自动化（E2E 测试） | `npm install -g @playwright/mcp-server` |
| `github` | GitHub API 集成 | `npm install -g @modelcontextprotocol/server-github` |

### 4.3 settings.json 配置

编辑 `~/.claude/settings.json` 或项目 `.claude/settings.local.json`：

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
  }
}
```

---

### 5.1 什么是 Agent Teams

**Agent Teams** 是 Claude Code 原生支持的多智能体协作功能（2026 年新增，实验性功能）。主智能体（Lead Agent）将任务分解成多个部分，启动多个队友（Teammates），它们在相互协调的同时并行开展工作。

### 5.2 如何开启 Agent Teams

Agent Teams 默认是**禁用**的（实验性功能），需要手动开启。有两种方法：

#### 方法 1：设置环境变量（推荐）

在终端中执行：

```bash
# Windows PowerShell
$env:CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS="1"

# Windows CMD
set CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# macOS / Linux
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

#### 方法 2：修改 settings.json（永久生效）

编辑 `~/.claude/settings.json` 或项目 `.claude/settings.local.json`：

```json
{
  "experimental": {
    "agentTeams": true
  }
}
```

#### 开启后如何使用

开启功能后，使用**自然语言**告诉 Claude 即可：

```
我要重构认证模块。创建一个 Agent Team：
- 一个成员负责重构代码
- 一个成员负责更新测试
- 一个成员负责检查安全漏洞
```

Claude 会自动生成团队、分配任务、协调工作。

---

## 6. Subagents（子代理）模式

### 6.1 Subagents vs Agent Teams 对比

**Subagents** 和 **Agent Teams** 是两种不同的多智能体模式：

| 特性 | Subagents | Agent Teams |
|------|-----------|-------------|
| **开启方式** | 无需开启，默认支持 | 需要实验性配置 |
| **触发方式** | 自动识别或自然语言 | 自然语言命令 |
| **协作模式** | 中心辐射型（子智能体只能与主智能体通信） | 网格化（成员间可直接通信） |
| **上下文** | 独立上下文窗口 | 独立上下文窗口 |
| **Token 成本** | 较低 | 约 7 倍标准会话 |
| **适用场景** | 简单任务拆分、独立子任务 | 复杂项目协作、需互相质疑的场景 |

### 6.2 如何开启 Subagents

**Subagents 无需额外配置，默认即可使用**。有以下两种触发方式：

#### 方式 1：自然语言（推荐）

直接用自然语言描述任务，Claude 会自动判断是否需要委派给 Subagent：

```
帮我检查这个项目的安全漏洞，重点关注：
- 环境变量硬编码
- API 密钥泄露
- SQL 注入风险
```

Claude 会自动启动一个"安全审查"Subagent 来执行任务。

#### 方式 2：预配置 Subagent 指令

在 `.claude/agents/` 目录下配置专门的 Subagent 后，可以通过特定指令触发：

```
/test-coverage  # 启动测试覆盖率检查 Subagent
/security-review  # 启动安全审查 Subagent
/refactor-clean  # 启动代码清理 Subagent
```

### 6.3 Subagents 配置示例

在 `.claude/agents/` 目录下创建专门的 Subagent 配置：

**security-reviewer.md**
```markdown
---
name: 安全审查员
description: 代码安全漏洞审查
---

# 职责
- 检查环境变量硬编码
- 检查 API 密钥泄露
- 检查 SQL 注入风险
- 检查 XSS 漏洞

# 工具限制
只允许使用：Read, Grep
禁止使用：Write, Bash
```

### 6.4 选型建议

| 场景 | 推荐模式 | 原因 |
|------|----------|------|
| 多目录搜索文件 | Subagents | 独立任务，无需协作，成本更低 |
| PR 审查（需互相质疑） | Agent Teams | 需要成员间直接通信、观点碰撞 |
| 代码语法检查 | Subagents | 批量独立任务，无需讨论 |
| 复杂架构评审 | Agent Teams | 多角色深度讨论、方案迭代 |
| 多模块开发（前端 + 后端 + 数据库） | Agent Teams | 各成员负责一块，互不干扰 |
| 调研多个方案对比 | Agent Teams | 各成员研究不同方案，最后对比 |

**注意事项**：
- ❌ **顺序任务**（先分析需求→再写代码→再写文档）适合单 Agent
- ❌ **多人改同一文件** 会互相覆盖，避免使用 Agent Teams
- ⚠️ **Token 成本高**：Agent Teams 消耗约是标准会话的 7 倍

---

## 7. Agent Teams 核心特性

### 7.1 上下文管理优势

```
┌─────────────────────────────────────────────────────────┐
│                    主上下文窗口                           │
│  - 项目整体目标                                          │
│  - 最终汇总结果                                          │
│  - 用户交互                                              │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Teammate A    │ │ Teammate B    │ │ Teammate C    │
│ 独立上下文     │ │ 独立上下文     │ │ 独立上下文     │
│ 读取旧代码     │ │ 读取 API 文档   │ │ 编写测试      │
│ 3000 行        │ │ 50 页          │ │ 200 行        │
└───────────────┘ └───────────────┘ └───────────────┘
```

**优势**：
- 避免 Token 爆炸：每个 Sub-agent 在自己的上下文中工作
- 防止上下文污染：子任务交互不干扰主上下文
- 提升专注度：每个 Agent 专注于自身目标

### 7.2 点对点通信机制

在传统 Agent 框架中，子智能体必须通过主智能体传话。Claude Code 的队友之间建立了**点对点消息通道**：

```
场景示例：测试 Agent 发现 Bug

传统模式：
测试 Agent → 主 Agent → 开发 Agent → 主 Agent → 测试 Agent
     （信息损耗严重，来回 4 次传递）

Claude Code 模式：
测试 Agent → [直接消息] → 开发 Agent
     "第 42 行空指针异常"
开发 Agent → [直接回复] → 测试 Agent
     "已修复，请复测"
（无需 Lead Agent 介入，信息无损）
```

### 7.3 对抗性验证（左右互搏）

单个 AI 容易产生幻觉或盲从用户的错误假设。通过 Agent Teams 可以设置**对抗性角色**：

```
架构师 Agent 提出方案
        ↓
反方辩手 Agent 挑刺
        ↓
        ├── "这个设计没有考虑并发场景"
        ├── "RLS 策略可能导致性能问题"
        └── "建议添加重试机制"
        ↓
架构师 Agent 修正方案
        ↓
最终输出（更健壮的设计）
```

---

## 8. 任务分配方案

### 8.1 P0 阶段任务分配

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

### 8.2 并行开发工作流示例

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

Day 8-14: 浏览功能并行任务

Main Agent
├── [并行分支 A] 前端 Agent → 风格列表页
├── [并行分支 B] 后端 Agent → getStyles Server Action
├── [并行分支 C] 数据库 Agent → 初始数据导入
│
└── [汇总] 端到端测试
```

### 8.3 Git 协作策略

```
main (受保护)
  ├── develop (开发分支，每日合并)
  │   ├── feature/p0-auth (前端 Agent)
  │   ├── feature/p0-auth-api (后端 Agent)
  │   └── feature/p0-db (数据库 Agent)
  └── release/v1.0.0
```

**冲突解决**：
- 每个 Agent 在独立 Git 分支工作
- Main Agent 负责合并和解决冲突
- 使用文件锁避免同时修改同一文件

---

## 9. 并行开发工作流

### 9.1 Oh-My-ClaudeCode 插件（推荐）

[Oh-My-ClaudeCode](https://github.com/Yeachan-Heo/oh-my-claudecode) 提供增强的多 Agent 编排：

- **32 个预定义 Agent**：架构、研究、设计、测试等
- **并行执行**：最多 5 个并发 worker
- **Token 节省**：30-50%

**安装**：
```bash
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/oh-my-claudecode:omc-setup
```

**注意**：本项目统一使用 qwen3.5-plus 模型，Oh-My-ClaudeCode 的智能模型路由功能无需启用。

### 9.2 执行模式

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| **Autopilot** | 全自动执行 | 标准功能开发 |
| **Ultrapilot** | 5 并发 worker | 大型任务并行 |
| **Swarm** | N 个协调 Agent | 超复杂项目 |

### 9.3 推荐工作流

```bash
# 1. 初始化项目（架构师 Agent）
/architect: initialize StyleSnap monorepo with Turborepo

# 2. 并行开发（Ultrapilot 模式）
/ultrapilot: implement P0 features
  - Agent A: 认证系统（后端）
  - Agent B: 认证 UI（前端）
  - Agent C: 数据库 Schema
  - Agent D: 邮件服务
  - Agent E: 测试用例

# 3. 代码审查（Code Review Agent）
/code-review: review feature/p0-auth branch

# 4. 测试（Testing Agent）
/test: run all tests and fix failures

# 5. 部署（Deploy Agent）
/deploy: push to Vercel preview
```

---

## 10. 用户待办事项清单

### 10.1 必须安装

| 序号 | 项目 | 说明 | 状态 |
|------|------|------|------|
| 1 | 多智能体协同平台 | 核心平台 | ✅ 已安装 |
| 2 | Node.js 20.9+ | 运行环境 | ✅ 已安装 (v25.0.0) |
| 3 | pnpm 9.x | 包管理器 | ✅ 已安装 (10.29.3) |
| 4 | Git | 版本控制 | ✅ 已安装 (2.51.1) |
| 5 | Supabase CLI | 数据库迁移 | ⬜ 项目初始化时安装 |

### 10.2 MCP 服务安装

```bash
# 1. 文件系统 MCP（内置，无需安装）

# 2. Playwright MCP（E2E 测试）
npm install -g @playwright/mcp-server
npx playwright install

# 3. GitHub MCP（可选，GitHub 集成）
npm install -g @modelcontextprotocol/server-github
# 需要设置 GITHUB_TOKEN 环境变量
```

### 10.3 多智能体插件安装

```bash
# 多智能体协同插件（推荐）
/plugin marketplace add https://github.com/Yeachan-Heo/oh-my-claudecode
/plugin install oh-my-claudecode
/oh-my-claudecode:omc-setup
```

### 10.4 项目初始化步骤

```bash
# 1. 创建项目目录（已存在）
cd "D:\WorkPlace\VibeCoding\Design Style"

# 2. 初始化 Git（如未初始化）
git init

# 3. 创建 .claude/agents 目录
mkdir -p .claude/agents

# 4. Agents 配置已创建在 .claude/agents/
```

### 10.5 环境变量配置

创建 `.env.example`：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=your_resend_key

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

复制为 `.env` 并填入实际值：
```bash
cp .env.example .env
```

---

## 11. 成本优化建议

### 11.1 统一模型配置

本项目所有 Agent 统一使用 **qwen3.5-plus** 模型，确保：

| 特性 | 说明 |
|------|------|
| **一致性** | 所有任务输出风格统一 |
| **简化管理** | 无需配置模型路由策略 |
| **可预测性** | 性能和输出质量稳定 |

### 11.2 Token 优化

- 使用 Sub-agents 隔离上下文，减少无效 token
- 每个 Agent 专注特定领域，提高输出效率
- 合理拆解任务，避免单次请求过长

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-22 | StyleSnap Team | 初始版本 |
| 1.1 | 2026-03-22 | StyleSnap Team | 统一模型配置为 qwen3.5-plus |
| 1.2 | 2026-03-22 | StyleSnap Team | 补充 Claude Code Agent Teams 机制 |
| 1.3 | 2026-03-22 | StyleSnap Team | 补充 Agent Teams 开启方法和使用方式 |
| 1.4 | 2026-03-22 | StyleSnap Team | 完整重构：区分 Subagents 和 Agent Teams 两种模式 |
