# BMad Module 文档索引

> 最后更新：2026-04-04 | 文档总数：50+ 份
> **用途**: 快速定位 BMad 框架内的文档，支持流程导航、技术参考、错误修复

---

## 🚀 快速入口

| 场景 | 文档路径 |
|------|------|
| **开始新需求** | `2-plan-workflows/artifacts/PRD.md` → `APP_FLOW.md` |
| **修复 Bug** | `4-implementation/artifacts/DEBUG_FIX_TEMPLATE.md` → `FIX_BEFORE_CONFIRM_CHECKLIST.md` |
| **技术调研** | `3-solutioning/artifacts/技术栈索引.md` |
| **Story 开发** | `4-implementation/stories/README.md` |

---

## 📂 文档分类

### 1. Analysis 阶段 (1-analysis)

| 类型 | 文档 |
|------|------|
| **调研** | `research/style-research/` - 5 份调研文档（风格分类、鹰角 UI、邮件服务、组件库、Monorepo） |

### 2. Plan Workflows 阶段 (2-plan-workflows)

| 类型 | 文档 |
|------|------|
| **PRD** | `artifacts/PRD.md` - 产品需求文档 |
| **流程** | `artifacts/APP_FLOW.md` - 应用流程图 |
| **计划** | `artifacts/IMPLEMENTATION_PLAN.md` - 实现计划 |

### 3. Solutioning 阶段 (3-solutioning)

| 类型 | 文档 |
|------|------|
| **架构** | `architecture.md`, `epics.md` |
| **技术栈** | `artifacts/TECH_STACK.md`, `database-schema.md` |
| **核心知识** | `artifacts/*核心知识体系.md` - 13 份技术栈核心知识 |
| **API 速查** | `artifacts/*-reference.md` - 6 份 API 参考 |
| **配置** | `artifacts/supabase-*-config.md`, `test-account.md` |

### 4. Implementation 阶段 (4-implementation)

| 类型 | 文档 |
|------|------|
| **指南** | `artifacts/FRONTEND_GUIDELINES.md`, `BACKEND_STRUCTURE.md` |
| **协同** | `artifacts/MULTI_AGENT_COLLABORATION.md`, `agent-browser-debug-tools.md` |
| **修复报告** | `artifacts/P0_*.md`, `artifacts/P1_*.md`, `artifacts/P2_*.md` - 6 份 |
| **调试模板** | `artifacts/DEBUG_*.md`, `FIX_*.md` - 4 份 |
| **测试** | `artifacts/Epic-4-Test-Report.md` |
| **Stories** | `stories/` - 8 份标准格式 Story Spec |

---

## 📊 文档分布

| Phase | 文档数 | 主要内容 |
|-------|--------|----------|
| 1-analysis | 5 | 调研文档 |
| 2-plan-workflows | 3 | PRD、流程、计划 |
| 3-solutioning | 25+ | 架构、技术栈、API |
| 4-implementation | 17+ | 指南、修复、Stories |
| **总计** | **50+** | - |

---

## 🔧 BMad Skill 快速命令

| 场景 | 命令 | 说明 |
|------|------|------|
| **创建 PRD** | `/bmad-help` → `[CP] Create PRD` | 产品需求文档 |
| **创建架构** | `/bmad-help` → `[CA] Create Architecture` | 技术架构设计 |
| **创建 Story** | `/bmad-help` → `[CS] Create Story` | 开发任务 Story |
| **代码审查** | `/bmad-help` → `[CR] Code Review` | 代码质量审查 |
| **编写文档** | `/bmad-help` → `[WD] Write Document` | 技术文档编写 |

---

## 📁 目录结构

```
_bmad/bmm/
├── 1-analysis/
│   └── research/
│       └── style-research/
│           ├── 01-style-classification.md
│           ├── 02-hypergryph-ui-analysis.md
│           ├── 03-email-service-selection.md
│           ├── 04-component-library-selection.md
│           └── 05-monorepo-structure.md
├── 2-plan-workflows/
│   └── artifacts/
│       ├── PRD.md
│       ├── APP_FLOW.md
│       └── IMPLEMENTATION_PLAN.md
├── 3-solutioning/
│   ├── artifacts/           # 25+ 文档
│   │   ├── TECH_STACK.md
│   │   ├── database-schema.md
│   │   ├── *核心知识体系.md (13 份)
│   │   └── *-reference.md (6 份)
│   ├── architecture.md
│   └── epics.md
└── 4-implementation/
    ├── artifacts/           # 17+ 文档
    │   ├── FRONTEND_GUIDELINES.md
    │   ├── BACKEND_STRUCTURE.md
    │   ├── P[0-2]_*.md (修复报告)
    │   └── DEBUG_*.md (调试模板)
    └── stories/             # 8 份 Story Spec
        ├── README.md
        ├── story-2-5-advanced-filtering.md
        ├── story-3-1-style-detail-page.md
        ├── story-3-2-design-tokens-display.md
        ├── story-3-4-code-copy.md
        ├── story-3-5-related-styles.md
        ├── story-4-1-favorite-style.md
        ├── story-4-2-like-style.md
        └── story-4-3-my-favorites-page.md
```

---

*索引版本：1.0 | 最后更新：2026-04-04*
