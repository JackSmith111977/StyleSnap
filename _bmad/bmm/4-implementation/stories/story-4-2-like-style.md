---
title: '点赞风格 - Story 4.2'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户需要简单的方式表达对风格的喜爱，同时帮助其他用户发现优质内容，但缺少点赞功能。

**Approach:** 创建 LikeButton 组件和 useLike Hook，使用数据库 RPC 函数 `toggle_like_atomic` 实现原子更新，支持乐观更新、服务器同步和 Toast 反馈。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `toggleLike` 处理点赞逻辑
- 原子更新确保并发安全（`toggle_like_atomic` RPC）
- 计数同步通过数据库触发器自动更新
- 缓存失效使用 `revalidateTag('style-{id}', 'max')`
- Toast 反馈使用 sonner

**Ask First:**
- 无

**Never:**
- 不允许未登录用户点赞（显示提示或跳转登录）
- 不手动更新计数（使用触发器同步）
- 不在点赞函数中手动 UPDATE like_count（避免与触发器冲突导致双重增加）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户点击点赞 | 切换状态为"已点赞"，计数 +1，显示"点赞成功"Toast | N/A |
| UNAUTHENTICATED | 未登录用户点击 | 显示"请先登录"Toast，按钮状态回滚 | 服务端返回登录错误 |
| CONCURRENT | 快速连续点击 | 原子更新，最终状态一致 | N/A |
| ERROR_CASE | 网络/数据库失败 | 状态回滚，显示错误 Toast | 乐观更新失败回滚 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/likes/index.ts` -- `toggleLike`, `checkIsLiked` Server Actions
- `apps/web/components/like-button.tsx` -- 点赞按钮组件
- `apps/web/app/styles/[id]/page.tsx` -- 集成 LikeButton 组件
- `supabase/migrations/xxx_toggle_like_atomic.sql` -- 数据库 RPC 函数
- `supabase/migrations/xxx_trigger_update_style_counts_likes.sql` -- 计数触发器

## Tasks & Acceptance

**Execution:**
- [x] `actions/likes/index.ts` -- 检查 `toggleLike`, `checkIsLiked` 存在 -- Server Actions
- [x] `components/like-button.tsx` -- 检查组件存在 -- 复用现有组件
- [x] `app/styles/[id]/page.tsx` -- 检查 LikeButton 集成 -- 详情页展示
- [x] `components/like-button.tsx` -- 添加 Toast 反馈 -- sonner 集成
- [x] `components/like-button.tsx` -- 添加未登录用户跳转逻辑 -- 登录验证
- [x] 构建验证成功

**Acceptance Criteria:**
- Given 用户已登录并查看风格详情页，When 用户点击"点赞"按钮，Then 切换按钮状态为"已点赞"，点赞计数 +1，显示"已点赞"Toast
- Given 用户已点赞某风格，When 用户再次点击"点赞"按钮，Then 取消点赞，按钮状态恢复，计数 -1，显示"已取消点赞"Toast
- Given 未登录用户点击点赞按钮，When 用户未登录，Then 显示"请先登录"Toast，按钮状态回滚
- Given 用户快速连续点击点赞按钮，When 发生并发请求，Then 使用原子更新防止计数错误，最终状态与服务器一致

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 登录用户访问风格详情页，点击点赞按钮
- 验证按钮状态变化和 Toast 显示
- 验证计数 +1，再次点击验证计数 -1
- 未登录用户点击点赞，验证提示或跳转

## Change Log

- 2026-04-03: 创建 Story 文件
- 2026-04-03: 修复 LikeButton 组件（Toast + 登录跳转）
  - 添加 Toast 反馈
  - 添加未登录用户处理
  - 构建验证通过
