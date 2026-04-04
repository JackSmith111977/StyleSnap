---
title: '我的收藏页 - Story 4.3'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户收藏了多个风格后，缺少统一的入口查看和管理所有收藏，无法快速回顾已收藏的设计案例。

**Approach:** 创建 `/favorites` 页面，使用 `getMyFavorites` Server Action 获取收藏列表，支持分页、空状态处理、取消收藏功能。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `getMyFavorites` 获取收藏列表
- 认证检查使用 `requireAuth()` 强制登录
- 分页：每页 12 个风格，支持 page 查询参数
- 空状态显示引导用户浏览风格库
- 缓存失效使用 `revalidateTag('favorites')`

**Ask First:**
- 无

**Never:**
- 不允许未登录用户访问（重定向至登录页）
- 不在客户端存储收藏列表（服务端获取）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户访问 /favorites | 显示收藏列表，按收藏时间倒序，显示总数 | N/A |
| EMPTY_STATE | 用户无收藏 | 显示空状态插画和"去浏览风格"按钮 | N/A |
| UNAUTHENTICATED | 未登录用户访问 | 重定向至 /login 页面 | 服务端返回登录错误 |
| PAGINATION | 收藏超过 12 个 | 显示分页控件，支持翻页 | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/actions/favorites/index.ts` -- `getMyFavorites`, `removeFavorite` Server Actions
- `apps/web/app/favorites/page.tsx` -- 收藏列表页面
- `apps/web/components/favorite-button.tsx` -- 复用收藏按钮（取消收藏）
- `apps/web/lib/auth.ts` -- `requireAuth()` 认证检查

## Tasks & Acceptance

**Execution:**
- [x] `app/favorites/page.tsx` -- 检查页面存在 -- 收藏列表页
- [x] `actions/favorites/index.ts` -- 检查 `getMyFavorites` 存在 -- 获取收藏列表
- [x] `actions/favorites/index.ts` -- 检查 `toggleFavorite` 存在 -- 取消收藏
- [x] 验证认证要求 -- `requireAuth()` 已实现
- [x] 验证空状态处理 -- 已实现
- [x] 验证分页功能 -- 已实现
- [x] 构建验证成功

**Acceptance Criteria:**
- Given 用户已登录，When 用户访问"/favorites"页面，Then 显示用户的收藏列表，显示收藏总数，按收藏时间倒序排列
- Given 用户没有任何收藏，When 用户访问收藏页，Then 显示空状态提示，提供"浏览风格库"的引导按钮
- Given 用户收藏超过 12 个风格，When 用户访问收藏页，Then 显示分页控件，每页显示 12 个风格，支持翻页浏览
- Given 未登录用户访问收藏页，When 用户未登录，Then 系统重定向至登录页，登录后返回收藏页

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 登录用户访问 /favorites，验证收藏列表显示
- 验证空状态处理（无收藏时）
- 验证分页功能（收藏 > 12 时）
- 未登录用户访问，验证跳转登录页

## Change Log

- 2026-04-03: 创建 Story 文件
- 2026-04-03: 验证现有实现完整
  - 检查 favorites 页面存在
  - 检查 getMyFavorites Server Action 存在
  - 验证认证要求已实现
  - 验证空状态处理已实现
  - 验证分页功能已实现
  - 构建验证通过
