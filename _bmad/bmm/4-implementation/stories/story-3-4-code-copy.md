---
title: '代码复制功能 - Story 3.4'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 开发者用户需要快速复制风格的代码片段（HTML/CSS/React）到自己的项目中，但当前代码块缺少一键复制功能和操作反馈。

**Approach:** 在 CodeBlock 组件中集成复制按钮，使用 Clipboard API 实现一键复制，通过 Toast 反馈操作结果，支持失败降级处理。

## Boundaries & Constraints

**Always:**
- 使用 Clipboard API 实现复制
- 复制成功/失败都显示 Toast 反馈
- 按钮显示"已复制"状态（2 秒后恢复）
- 支持语法高亮显示代码

**Ask First:**
- 无

**Never:**
- 不修改现有 Server Action 接口
- 不使用复杂的第三方复制库

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户点击复制按钮 | 复制当前 Tab 代码到剪贴板，按钮显示"已复制"（2 秒），显示 Toast | N/A |
| ERROR_CASE | 浏览器不支持 Clipboard API | 显示"复制失败，请手动选择复制"Toast，自动选中全部代码 | 降级为选中文字 |
| EDGE_CASE | 用户快速连续点击 | 每次点击都触发复制，状态正常切换 | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/components/code-block.tsx` -- 代码块组件，含复制按钮
- `apps/web/components/style-detail.tsx` -- 集成 CodeBlock 展示代码片段
- `apps/web/app/layout.tsx` -- Toaster 全局组件（与 Story 3.2 共用）

## Tasks & Acceptance

**Execution:**
- [x] `components/code-block.tsx` -- 添加 sonner toast 导入 -- Toast 反馈
- [x] `components/code-block.tsx` -- handleCopy 成功后调用 toast.success() -- 成功反馈
- [x] `components/code-block.tsx` -- handleCopy 失败后调用 toast.error() -- 失败反馈
- [x] 验证构建成功 (7.8s)

**Acceptance Criteria:**
- Given 用户查看代码片段，When 用户点击"复制"按钮，Then 复制当前 Tab 的代码到剪贴板，按钮显示"已复制"状态（2 秒）
- Given 复制失败，When 浏览器不支持 Clipboard API，Then 显示"复制失败，请手动选择复制"Toast，自动选中全部代码
- Given 用户再次点击已复制的按钮，When 复制操作已完成，Then 系统恢复正常"复制"状态

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功 (7.8s)

**Manual checks (if no CLI):**
- 访问风格详情页，滚动到代码片段区域
- 点击复制按钮，验证 Toast 提示"代码已复制"
- 验证按钮显示"已复制"状态并在 2 秒后恢复

## Change Log

- 2026-04-03: 实现完成
  - 创建 Story 文件
  - CodeBlock 添加 Toast 通知
  - 构建验证通过
