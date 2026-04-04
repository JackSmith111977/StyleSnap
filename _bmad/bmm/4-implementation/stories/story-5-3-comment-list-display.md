---
title: '评论列表展示 - Story 5.3'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 风格详情页缺少评论列表展示功能，用户无法查看其他用户的评论和讨论，降低了社区参与感。

**Approach:** 创建 CommentList 组件和 getComments Server Action，按时间倒序显示评论，支持分页加载（每页 10 条），缩进显示二级回复，软删除占位。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `getComments` 获取评论列表
- 评论按 created_at 倒序排列
- 每页默认 10 条，支持"加载更多"
- 二级回复缩进显示
- 软删除评论显示占位（保留子评论）

**Ask First:**
- 无

**Never:**
- 不一次性加载全部评论（影响性能）
- 不删除有子评论的父评论（保留子评论）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 风格详情页加载 | 显示评论列表（倒序），每条评论包含头像、用户名、时间、内容 | N/A |
| EMPTY_LIST | 无评论 | 显示"暂无评论，抢沙发"占位 | N/A |
| PAGINATION | 评论超过 10 条 | 默认显示前 10 条，提供"加载更多"按钮 | N/A |
| HAS_REPLY | 评论包含回复 | 二级回复缩进显示，显示回复数量 | N/A |
| DELETED_COMMENT | 评论被软删除 | 显示"评论已删除"占位，保留子评论 | N/A |
| LOAD_MORE_FAIL | 加载更多失败 | 显示"加载更多失败，点击重试" | 错误边界处理 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/comments/index.ts` -- `getComments` Server Action（支持分页）
- `apps/web/components/comments/comment-list.tsx` -- 评论列表组件（新建）
- `apps/web/components/comments/comment-item.tsx` -- 评论项组件（含头像、用户名、时间）
- `apps/web/components/comments/load-more-button.tsx` -- 加载更多按钮（新建）
- `supabase/migrations/xxx_comments.sql` -- 评论表（应已存在）

## Tasks & Acceptance

**Execution:**
- [ ] `actions/comments/index.ts` -- 创建 `getComments` Server Action -- 支持分页、按时间倒序
- [ ] `components/comments/comment-list.tsx` -- 创建评论列表组件 -- 循环渲染 CommentItem
- [ ] `components/comments/comment-item.tsx` -- 创建评论项组件 -- 头像、用户名、时间、内容、回复数
- [ ] `components/comments/load-more-button.tsx` -- 创建加载更多按钮 -- 点击加载下一页
- [ ] 软删除处理 -- 被删除评论显示占位，保留子评论

**Acceptance Criteria:**
- Given 用户查看风格详情页，When 滚动到评论区，Then 系统显示评论列表（按时间倒序），每条评论显示用户头像、用户名、时间、内容，显示回复数量
- Given 评论列表过长，When 评论超过 10 条，Then 系统默认显示前 10 条，提供"加载更多"按钮
- Given 评论包含回复，When 评论有二级回复，Then 系统缩进显示回复，保持层级清晰
- Given 评论被删除，When 作者删除评论，Then 系统显示"评论已删除"占位，保留子评论（如有）

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问有评论的风格详情页，验证评论列表正常显示
- 查看评论排序是否为时间倒序
- 测试"加载更多"功能（如有足够评论）
- 查看包含回复的评论，验证缩进显示

## Change Log

- 2026-04-04: 创建 Story Spec
