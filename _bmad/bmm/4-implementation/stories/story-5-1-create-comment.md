---
title: '发表评论 - Story 5.1'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户在风格详情页缺少发表评论的功能，无法分享看法或提问，降低了社区互动性。

**Approach:** 创建 CommentForm 组件和 createComment Server Action，支持已登录用户发表评论，包含内容验证（1-500 字符）、Toast 反馈、未登录用户提示。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `createComment` 处理评论逻辑
- 评论内容必须验证（1-500 字符）
- 登录检查在服务端完成
- Toast 反馈操作结果
- 缓存失效使用 `revalidateTag('comments-{styleId}', 'max')`

**Ask First:**
- 无

**Never:**
- 不允许未登录用户评论（显示提示或跳转登录）
- 不允许空评论或超过 500 字符

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户输入有效内容 | 评论添加到列表顶部，清空输入框，显示 Toast | N/A |
| EMPTY_CONTENT | 用户提交空评论 | 显示"请输入评论内容"，不提交请求 | 前端验证拦截 |
| TOO_LONG | 用户输入超过 500 字符 | 显示"评论不能超过 500 字"，截断或拒绝 | 前端 + 服务端双重验证 |
| UNAUTHENTICATED | 未登录用户点击提交 | 显示"请先登录"，跳转登录页 | 服务端返回认证错误 |
| ERROR_CASE | 数据库写入失败 | 显示"评论失败，请重试"Toast | 记录错误日志 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/comments/index.ts` -- `createComment` Server Action
- `apps/web/components/comments/comment-form.tsx` -- 评论表单组件（新建）
- `apps/web/app/styles/[id]/page.tsx` -- 集成 CommentForm
- `apps/web/hooks/use-comment.ts` -- 评论状态 Hook（可选）
- `supabase/migrations/xxx_create_comments.sql` -- 评论表迁移（应已存在）

## Tasks & Acceptance

**Execution:**
- [ ] `actions/comments/index.ts` -- 创建 `createComment` Server Action -- 验证输入、写入数据库
- [ ] `components/comments/comment-form.tsx` -- 创建评论表单组件 -- 包含字符计数、提交按钮
- [ ] `app/styles/[id]/page.tsx` -- 集成 CommentForm -- 服务端传递 styleId
- [ ] 登录状态检查 -- 未登录显示"请先登录"提示
- [ ] Toast 通知 -- 评论成功/失败反馈

**Acceptance Criteria:**
- Given 用户已登录并查看风格详情页，When 用户在评论框输入内容并提交，Then 系统验证内容（1-500 字符），评论添加到列表顶部，清空评论框，显示"评论成功"Toast
- Given 用户输入内容为空，When 用户提交空评论，Then 系统显示"请输入评论内容"，不提交请求
- Given 用户输入超过 500 字符，When 用户提交过长评论，Then 系统显示"评论不能超过 500 字"，拒绝提交
- Given 未登录用户想要评论，When 用户未登录，Then 系统显示"请先登录"提示，评论框禁用或跳转登录页

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 登录用户访问风格详情页，输入评论并提交
- 验证评论出现在列表顶部，Toast 显示
- 尝试提交空评论和过长评论，验证错误提示
- 未登录用户查看评论功能，验证登录提示

## Change Log

- 2026-04-04: 创建 Story Spec
