---
title: '代码片段展示 - Story 3.3'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 风格详情页缺少代码片段展示功能，开发者无法查看和复制风格的源代码，降低了学习价值。

**Approach:** 创建 CodeSnippet 组件和 CodeTabs 组件，支持多语言代码展示（HTML/CSS/React/Tailwind），语法高亮，可滚动区域，空代码自动隐藏对应 Tab。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `getStyle` 获取代码片段
- Tabs 切换使用客户端状态
- 语法高亮使用现有库（如 prismjs 或 highlight.js）
- 代码区域最大高度 500px，支持滚动
- 空代码自动隐藏对应 Tab

**Ask First:**
- 无

**Never:**
- 不使用外部 CDN 加载高亮库（本地打包）
- 不显示空代码的 Tab

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 风格详情页加载 | 显示 Tabs（HTML/CSS/React/Tailwind），代码带语法高亮 | N/A |
| SINGLE_LANG | 仅一种语言代码 | 只显示有代码的 Tab，隐藏空 Tab | N/A |
| NO_CODE | 无任何代码 | 隐藏整个代码区域或显示"暂未提供" | N/A |
| TAB_SWITCH | 用户切换 Tab | 切换显示对应代码，保持复制按钮可见 | N/A |
| LONG_CODE | 代码超过 500px 高 | 代码区域滚动，复制按钮始终可见 | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/components/code-snippet/code-snippet.tsx` -- 代码片段主组件（新建）
- `apps/web/components/code-snippet/code-tabs.tsx` -- Tabs 切换组件（新建）
- `apps/web/components/code-snippet/code-display.tsx` -- 代码显示区域（新建）
- `apps/web/components/code-snippet/copy-button.tsx` -- 复制按钮（可与 Story 3.4 复用）
- `apps/web/app/styles/[id]/page.tsx` -- 集成 CodeSnippet 组件

## Tasks & Acceptance

**Execution:**
- [ ] `components/code-snippet/code-snippet.tsx` -- 创建代码片段主组件 -- 管理 Tab 状态
- [ ] `components/code-snippet/code-tabs.tsx` -- 创建 Tabs 切换组件 -- 只显示有代码的语言
- [ ] `components/code-snippet/code-display.tsx` -- 创建代码显示区域 -- 语法高亮、滚动
- [ ] `components/code-snippet/copy-button.tsx` -- 创建复制按钮 -- 与 Story 3.4 复用
- [ ] `app/styles/[id]/page.tsx` -- 集成 CodeSnippet -- 服务端传递代码数据

**Acceptance Criteria:**
- Given 用户查看风格详情页，When 滚动到"代码片段"区域，Then 系统显示 Tabs 切换（HTML/CSS/React/Tailwind），代码带有语法高亮，代码区域可滚动（max-height: 500px）
- Given 用户切换代码 Tab，When 用户点击不同语言标签，Then 系统切换显示对应代码，保持复制按钮始终可见
- Given 代码为空，When 该语言版本代码未提供，Then 系统隐藏该 Tab 或显示"暂未提供"

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问风格详情页，验证代码片段区域正常显示
- 切换不同语言 Tab，验证代码正确切换
- 查看无代码的语言 Tab，验证自动隐藏或显示"暂未提供"
- 测试长代码滚动效果

## Change Log

- 2026-04-04: 创建 Story Spec
