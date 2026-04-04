---
title: '删除评论 - Story 5.4'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户缺少删除自己评论的功能，无法撤回不想保留的评论，缺少内容管理能力。

**Approach:** 创建 deleteComment Server Action 和删除确认对话框，软删除评论（保留子评论），管理员可删除他人评论，Toast 反馈操作结果。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `deleteComment` 处理删除逻辑
- 软删除使用 deleted_at 字段标记
- 删除前弹出确认对话框
- Toast 反馈操作结果
- 缓存失效使用 `revalidateTag('comments-{styleId}', 'max')`
- 管理员删除需记录操作日志

**Ask First:**
- 无

**Never:**
- 不物理删除评论（影响子评论）
- 不允许删除他人评论（仅作者和管理员）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 作者点击删除并确认 | 评论软删除，显示占位，显示 Toast | N/A |
| CANCEL_DELETE | 用户取消删除 | 关闭对话框，不做任何操作 | N/A |
| HAS_CHILDREN | 评论包含子评论 | 软删除父评论，保留子评论 | 子评论父节点显示占位 |
| ADMIN_DELETE | 管理员删除他人评论 | 删除成功，记录操作日志 | 日志写入失败不阻塞 |
| UNAUTHORIZED | 未登录用户或非作者 | 不显示删除按钮 | 前端权限检查 |
| ERROR_CASE | 数据库删除失败 | 显示"删除失败，请重试"Toast | 记录错误日志 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/comments/index.ts` -- `deleteComment` Server Action（软删除）
- `apps/web/components/comments/delete-button.tsx` -- 删除按钮组件（新建）
- `apps/web/components/comments/comment-item.tsx` -- 集成删除按钮（仅作者可见）
- `apps/web/components/ui/confirm-dialog.tsx` -- 确认对话框组件（可复用 Shadcn）
- `supabase/migrations/xxx_comments_soft_delete.sql` -- 软删除支持（deleted_at 字段）

## Tasks & Acceptance

**Execution:**
- [ ] `actions/comments/index.ts` -- 创建 `deleteComment` Server Action -- 软删除、权限检查
- [ ] `components/comments/delete-button.tsx` -- 创建删除按钮组件 -- 点击弹出确认框
- [ ] `components/comments/comment-item.tsx` -- 集成删除按钮 -- 仅作者可见
- [ ] 确认对话框 -- 使用 Shadcn Dialog 组件
- [ ] 软删除处理 -- 使用 deleted_at 字段标记，不物理删除

**Acceptance Criteria:**
- Given 用户查看自己发表的评论，When 用户点击"删除"按钮，Then 系统弹出确认对话框，用户确认后删除评论
- Given 用户确认删除，When 删除操作完成，Then 系统从列表中移除评论（软删除占位），显示"评论已删除"Toast
- Given 管理员删除他人评论，When 管理员执行删除，Then 系统记录删除操作日志，通知原评论作者（可选）
- Given 未登录用户查看评论，When 无删除权限，Then 系统不显示删除按钮

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 登录用户查看自己的评论，验证删除按钮显示
- 点击删除按钮，验证确认对话框弹出
- 确认删除后，验证评论显示"已删除"占位
- 查看他人评论，验证删除按钮不显示

## Change Log

- 2026-04-04: 创建 Story Spec
