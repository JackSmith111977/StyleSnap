# StyleSnap - CLAUDE.md

> 会话规则、约束、模式和上下文文档

---

## 会话规则

1. **文档优先** - 任何代码实现前，先有文档确认
2. **分阶段迭代** - 每个阶段完成后等待用户确认再继续
3. **生产级质量** - 类型安全、测试覆盖、代码规范
4. **工具调用失败处理** - 如工具调用失败，优先排查失败原因并尝试解决，不自行使用知识库替代
5. **网络搜索首选** - 需要搜索网络信息时，优先使用 `mcp__WebSearch__bailian_web_search` 工具
6. **Next.js 16 文档查阅** - 编写代码前必须查阅 `docs/knowledge-base/Next.js 核心知识体系.md`，确保使用最新 API 和最佳实践
7. **每次询问限 5 问** - 进行用户询问时，每次最多展示 5 个问题，待用户确认后再继续下一批
8. **TECH_STACK.md 规范** - 只包含技术栈版本锁定清单（包名、版本、用途）；各技术栈核心知识体系需分别调研并整合到独立文档（如 `docs/knowledge-base/Zustand 核心知识体系.md`）
9. **分支开发流程** - 开发新功能前，先从 `main` 分支创建新分支（命名格式：`feature/功能名`），开发完成后合并回 `main` 分支
10. **Supabase CLI 使用** - 执行 Supabase 相关命令必须使用 `npx supabase` 命令（不是 `pnpm supabase`），命令前必须查阅 `docs/knowledge-base/Supabase CLI 指南.md` 和 `.claude/knowledge/supabase-cli-knowledge.md`

11. **进度跟踪规范** - 任务开始前/完成时主动更新 `.claude/progress.txt`：
    - **任务开始前**：标记任务为 🔄 进行中，记录开始时间
    - **任务进行中**：记录关键节点和进度状态
    - **任务完成后**：标记为 ✅ 已完成，移入历史完成记录，**不删除已完成内容**
    - **文档完成后**：提交 git 并推送到远程仓库

12. **提交前代码验证** - 提交代码前必须验证代码质量：
    - **遇到问题修复两次仍无法解决**：优先查阅官方文档，若无文档则通过联网搜索参考官方文档，使用最佳实践
    - **验证流程**：运行 `pnpm typecheck` → `pnpm lint` → `pnpm build`
    - **验证通过标准**：类型检查无错误、ESLint 无错误、构建成功
    - **Sentry 配置注意**：生产环境才启用 Sentry 插件，开发环境只输出到控制台
    - **Server Actions**：必须是 async 函数，调用其他 Server Action 时需要 await

13. **阶段调试与修复流程** - 每个阶段子任务结束后必须执行：
    - **步骤 1：构建验证** - 运行 `pnpm build` 确保编译成功
    - **步骤 2：MCP 浏览器调试** - 使用 Next.js MCP 工具检测问题：
      - 启动开发服务器：`pnpm dev`
      - 使用 `next-devtools-mcp` 获取错误、日志、路由信息
      - 使用 `playwright-mcp` 进行页面功能测试
      - 使用 `browser_eval console_messages` 获取控制台错误
    - **步骤 3：问题记录与修复** - 创建或更新调试修复文档：
      - 文档位置：`docs/main/P[阶段]_DEBUG_FIX.md`
      - 记录问题描述、影响范围、错误信息、修复方案、修复状态
    - **步骤 4：修复验证** - 重新运行 `pnpm build` 并确认所有问题已解决
    - **步骤 5：提交推送** - 所有问题修复完成后才能 push 到远程仓库
    - **参考文档**：`docs/guide/agent-browser-debug-tools.md`

14. **MCP 浏览器调试** - 进行网页调试时优先使用 MCP 工具：
    - **Next.js 应用调试**：使用 `next-devtools-mcp`（错误检测、路由查询、日志访问）
    - **E2E 测试/自动化**：使用 `playwright-mcp`（导航、点击、截图、表单填写）
    - **控制台/网络分析**：使用 `browser-tools-mcp`（console 输出、网络请求、Lighthouse 审计）
    - **参考文档**：`docs/guide/agent-browser-debug-tools.md`

15. **数据库触发器与手动操作冲突风险** - 当数据库存在触发器时，避免在函数中手动执行相同操作：
    - **问题案例**：点赞计数双重增加问题（2026-04-03 修复）
    - **根因**：`toggle_like_atomic` 函数手动 `UPDATE like_count` + 触发器自动 `UPDATE like_count` = 计数增加 2
    - **修复方案**：移除函数中的手动 `UPDATE`，改为 `SELECT` 查询触发器更新后的值
    - **参考文档**：`docs/main/P0_LIKE_COUNT_FIX_REPORT.md`

15. **Next.js 16 Proxy 规范** - Next.js 16 中 `middleware.ts` 已重命名为 `proxy.ts`：
    - **文件位置**：项目根目录或 `src/` 下，与 `app/` 同级
    - **运行时**：Node.js 运行时（非 Edge）
    - **使用场景**：乐观认证检查、程序化重定向、修改请求头
    - **限制**：不在 Proxy 中做慢数据查询或完整授权验证
    - **参考文档**：`docs/knowledge-base/Next.js 核心知识体系.md` 第 11 章

16. **Supabase 认证状态同步** - Client Component 认证状态同步规范：
    - **问题**：Server Action 登录后，Cookie 已设置但 localStorage 为空
    - **原因**：Server Action 不会自动同步 session 到浏览器 localStorage
    - **解决方案**：`useAuth` Hook 使用 `supabase.auth.getSession()` 从 cookie 读取
    - **禁止**：不要在 Client Component 中依赖 `getUser()` 获取初始状态
    - **参考文档**：`docs/main/P1_AUTH_SYNC_ANALYSIS.md`

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
├── docs/                   # 项目文档
│   ├── main/              # 核心文档（PRD、APP_FLOW 等）
│   ├── research/          # 调研报告（技术选型、风格分析）
│   ├── knowledge-base/    # 知识库（技术栈核心知识、指南）
│   └── reference/         # Agent 参考（API 速查、最佳实践）
```

---

## 当前会话状态

- 需求定义阶段 - 已完成 PRD.md
- 待开始：调研任务
