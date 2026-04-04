---
title: '风格详情页基础 - Story 3.1'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户需要查看风格案例的详细信息，包括预览图、设计变量、作者信息等，但当前只有列表页，缺少详情页承载深度信息展示。

**Approach:** 创建 `/styles/[id]` 路由的详情页，包含面包屑导航、风格基本信息、预览图、元数据展示，并实现 404 处理、加载骨架屏、浏览次数统计。

## Boundaries & Constraints

**Always:**
- 使用 Server Actions 获取数据 (`getStyle`)
- 浏览计数异步更新，不阻塞页面渲染
- 404 页面提供返回首页和风格列表链接
- 使用 Skeleton 组件显示加载状态

**Ask First:**
- 无

**Never:**
- 不在详情页做复杂交互（纯展示为主）
- 不使用额外的 API 路由（Server Actions 足够）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 风格存在且已发布 | 显示完整详情：名称、描述、分类、标签、预览图、作者、计数 | N/A |
| NOT_FOUND | 风格不存在或下架 | 显示 404 页面，提供返回首页链接 | 调用 `notFound()` |
| LOADING | 数据加载中 | 显示骨架屏动画 | N/A |
| ERROR | 数据库查询失败 | 显示错误提示，提供重试链接 | 记录错误日志 |

</frozen-after-approval>

## Code Map

- `apps/web/app/styles/[id]/page.tsx` -- 详情页服务端组件
- `apps/web/app/styles/[id]/loading.tsx` -- 加载骨架屏组件
- `apps/web/app/styles/[id]/not-found.tsx` -- 404 页面组件
- `apps/web/actions/styles/index.ts` -- `getStyle`, `incrementViewCount` Server Actions
- `supabase/migrations/0015_add_view_count_rpc.sql` -- 浏览次数 RPC 函数

## Tasks & Acceptance

**Execution:**
- [x] `actions/styles/index.ts` -- 创建 `incrementViewCount` 异步增加浏览次数 -- 使用 RPC 函数
- [x] `app/styles/[id]/loading.tsx` -- 创建骨架屏加载组件 -- 使用 Skeleton UI
- [x] `app/styles/[id]/not-found.tsx` -- 创建 404 页面 -- 带返回首页链接
- [x] `app/styles/[id]/page.tsx` -- 添加面包屑导航和浏览次数调用 -- 服务端获取数据
- [x] `components/ui/skeleton.tsx` -- 创建 Skeleton 组件 -- 加载状态 UI
- [x] `supabase/migrations/0015_add_view_count_rpc.sql` -- 创建 RPC 迁移 -- 增加浏览次数

**Acceptance Criteria:**
- Given 用户访问 `/styles/[id]` 页面，When 风格存在且已发布，Then 显示风格名称、描述、分类、标签、预览图、作者信息和创建时间
- Given 风格不存在或已下架，When 用户访问详情页，Then 显示 404 页面，提供"返回首页"链接
- Given 用户在详情页，When 点击面包屑导航，Then 支持跳转到首页或风格列表页
- Given 数据加载中，When 页面正在获取数据，Then 显示骨架屏动画

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功 (7.7s)

**Manual checks (if no CLI):**
- 访问 `/styles/xxx` 详情页，验证所有信息正常显示
- 访问不存在的风格 ID，验证 404 页面显示
- 刷新页面时观察骨架屏加载效果

## Change Log

- 2026-04-03: 初始实现完成
  - 创建 loading.tsx 和 not-found.tsx
  - 添加 incrementViewCount Server Action
  - 更新页面组件添加面包屑导航
  - 创建 Skeleton UI 组件
- 2026-04-03: 代码审查修复
  - 修复 incrementViewCount 使用正确的 RPC 调用
  - 创建数据库迁移 0015_add_view_count_rpc.sql
  - 修复 loading.tsx 移除不必要的图标
  - 修复 not-found.tsx 添加无障碍支持 (role="alert")
