# StyleSnap - CLAUDE.md

> 会话规则、约束、模式和上下文文档

---

## 会话规则

1. **文档优先** - 任何代码实现前，先有文档确认
2. **分阶段迭代** - 每个阶段完成后等待用户确认再继续
3. **生产级质量** - 类型安全、测试覆盖、代码规范
4. **工具调用失败处理** - 如工具调用失败，优先排查失败原因并尝试解决，不自行使用知识库替代
5. **网络搜索首选** - 需要搜索网络信息时，优先使用 `mcp__WebSearch__bailian_web_search` 工具
6. **Next.js 16 文档查阅** - 编写代码前必须查阅 `docs/research/nextjs-16-technical-research.md`，确保使用最新 API 和最佳实践
7. **每次询问限 5 问** - 进行用户询问时，每次最多展示 5 个问题，待用户确认后再继续下一批
8. **TECH_STACK.md 规范** - 只包含技术栈版本锁定清单（包名、版本、用途）；各技术栈核心知识体系需分别调研并整合到独立文档（如 `docs/tech-stack-research/zustand-technical-research.md`）
9. **分支开发流程** - 开发新功能前，先从 `main` 分支创建新分支（命名格式：`feature/功能名`），开发完成后合并回 `main` 分支
10. **Supabase CLI 使用** - 执行 Supabase 相关命令前必须查阅 `docs/tech-stack-research/supabase-cli-technical-research.md` 和 `.claude/knowledge/supabase-cli-knowledge.md`

---

## 约束条件

- 不假设任何问题，有疑问先询问用户
- 所有决策需基于已确认的框架
- 代码质量要求：TypeScript strict 模式、ESLint、Prettier、测试覆盖
- 工具调用失败时：
  - 首先分析错误信息，尝试调整参数或方法重试
  - 如多次失败，向用户报告并请求指导
  - 不自行使用知识库内容替代工具调用结果

---

## 工作模式

### 决策模式
- **大方向**：调研后给出建议，用户确认
- **小决定**：在已确认的框架内自主决策

### 沟通风格
- 简洁直接，避免冗长总结
- 使用表格和列表呈现信息
- 关键决策点需用户确认

---

## 项目上下文

| 项目 | 内容 |
|------|------|
| 名称 | StyleSnap |
| 定位 | 前端开发者选择网页开发视觉风格的工具 |
| 性质 | 个人开源项目，生产级质量 |
| 技术栈 | Next.js + Node.js + Supabase + TypeScript |
| 部署 | Vercel |
| 样式 | CSS Modules |
| 状态管理 | Zustand |
| 测试 | Vitest + Playwright |

---

## 文档结构

```
D:\WorkPlace\VibeCoding\Design Style\
├── .claude/
│   ├── CLAUDE.md          # 会话规则（本文件）
│   └── progress.txt       # 任务进度跟踪
├── docs/                   # 项目规范文档
│   ├── PRD.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── APP_FLOW.md
│   ├── TECH_STACK.md
│   ├── FRONTEND_GUIDELINES.md
│   └── BACKEND_STRUCTURE.md
```

---

## 当前会话状态

- 需求定义阶段 - 已完成 PRD.md
- 待开始：调研任务
