---
title: '收藏风格 - Story 4.1'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户遇到喜欢的风格时，缺少收藏功能以便稍后回顾，无法管理个人喜欢的设计案例。

**Approach:** 创建 FavoriteButton 组件和 useFavorite Hook，使用数据库 RPC 函数 `toggle_favorite_atomic` 实现原子更新，支持乐观更新和服务器同步。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `toggleFavorite` 处理收藏逻辑
- 原子更新确保并发安全
- 登录检查在服务端完成
- Toast 反馈操作结果
- 缓存失效使用 `revalidateTag('style-{id}', 'max')`

**Ask First:**
- 无

**Never:**
- 不允许未登录用户收藏（强制跳转登录）
- 不手动更新计数（使用触发器同步）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户点击收藏 | 切换状态为"已收藏"，计数 +1，显示 Toast | N/A |
| UNAUTHENTICATED | 未登录用户点击 | 跳转至登录页，登录后返回原页面 | 服务端返回登录错误 |
| CONCURRENT | 快速连续点击 | 原子更新，最终状态一致 | N/A |
| ERROR_CASE | 网络/数据库失败 | 状态回滚，显示错误 Toast | 乐观更新失败回滚 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/favorites/index.ts` -- `toggleFavorite`, `checkIsFavorite` Server Actions
- `apps/web/components/favorite-button.tsx` -- 收藏按钮组件（已存在）
- `apps/web/app/styles/[id]/page.tsx` -- 集成 FavoriteButton
- `supabase/migrations/xxx_toggle_favorite_atomic.sql` -- 数据库 RPC 函数
- `supabase/migrations/xxx_trigger_update_style_counts_favorites.sql` -- 计数触发器

## Tasks & Acceptance

**Execution:**
- [x] `actions/favorites/index.ts` -- 检查 `toggleFavorite`, `checkIsFavorite` 存在 -- Server Actions
- [x] `components/favorite-button.tsx` -- 检查组件存在 -- 复用现有组件
- [x] `app/styles/[id]/page.tsx` -- 集成 FavoriteButton -- 服务端获取收藏状态
- [x] 获取用户收藏状态（服务端） -- `checkIsFavorite` 调用
- [x] 构建验证成功 (21.1s)

**Acceptance Criteria:**
- Given 用户已登录并查看风格详情页，When 用户点击"收藏"按钮，Then 切换按钮状态为"已收藏"，收藏计数 +1，显示"已加入收藏夹"Toast
- Given 用户已收藏某风格，When 用户再次点击"收藏"按钮，Then 取消收藏，按钮状态恢复，计数 -1，显示"已取消收藏"Toast
- Given 未登录用户点击收藏按钮，When 用户未登录，Then 跳转至登录页，登录后返回原风格详情页
- Given 用户快速连续点击收藏按钮，When 发生并发请求，Then 使用原子更新防止计数错误，最终状态与服务器一致

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功 (21.1s)

**Manual checks (if no CLI):**
- 登录用户访问风格详情页，点击收藏按钮
- 验证按钮状态变化和 Toast 显示
- 验证计数 +1，再次点击验证计数 -1
- 未登录用户点击收藏，验证跳转登录页

## Change Log

- 2026-04-03: 创建 Story 文件
- 2026-04-03: 实现收藏按钮集成到风格详情页
  - 检查现有 FavoriteButton 组件
  - 在风格详情页添加 `checkIsFavorite` 导入
  - 获取用户收藏状态（服务端）
  - 集成 FavoriteButton 到页面元数据区域
  - 构建验证通过
