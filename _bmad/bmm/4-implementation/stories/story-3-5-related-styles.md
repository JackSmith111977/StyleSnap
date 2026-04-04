---
title: '相关推荐 - Story 3.5'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户在查看某个风格后，缺少发现相似风格的途径，难以探索更多可能喜欢的设计案例。

**Approach:** 创建 RelatedStyles 组件，通过数据库 RPC 函数按分类和标签匹配推荐 4 个相似风格，展示在详情页底部。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `getRelatedStyles` 获取推荐
- 推荐算法：优先同分类，其次按标签匹配
- 最多展示 4 个推荐风格
- 无推荐时显示"查看更多风格"链接

**Ask First:**
- 无

**Never:**
- 不使用复杂的推荐算法（保持简单高效）
- 不在客户端做筛选逻辑（服务端完成）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 风格有同分类/标签的内容 | 展示 4 个推荐风格卡片 | N/A |
| NO_RELATED | 无相似风格 | 显示"查看更多风格"链接跳转至 /styles | N/A |
| ERROR_CASE | RPC 查询失败 | 隐藏相关推荐区域，记录错误日志 | 静默失败 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/styles/index.ts` -- `getRelatedStyles` Server Action
- `apps/web/components/related-styles.tsx` -- 相关推荐组件
- `apps/web/app/styles/[id]/page.tsx` -- 集成 RelatedStyles 组件
- `supabase/migrations/0016_add_related_styles_rpc.sql` -- 数据库 RPC 函数

## Tasks & Acceptance

**Execution:**
- [x] `actions/styles/index.ts` -- 创建 `getRelatedStyles` Server Action -- 服务端筛选
- [x] `supabase/migrations/0016_add_related_styles_rpc.sql` -- 创建数据库 RPC 函数 -- 效率优化
- [x] `components/related-styles.tsx` -- 创建相关推荐组件 -- 4 列网格展示
- [x] `app/styles/[id]/page.tsx` -- 集成 RelatedStyles 组件 -- 详情页底部展示
- [x] 构建验证成功 (16.1s)

**Acceptance Criteria:**
- Given 用户查看风格详情页底部，When 页面加载，Then 显示"相关推荐"区域，展示 4 个同分类或同标签的风格卡片
- Given 无相关推荐，When 该风格无相似风格，Then 显示"查看更多风格"链接，跳转至 /styles 列表页
- Given 用户点击推荐风格，When 用户感兴趣，Then 跳转至推荐风格详情页

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功 (16.1s)

**Manual checks (if no CLI):**
- 访问风格详情页，滚动到底部
- 验证相关推荐区域显示 4 个风格卡片
- 点击推荐风格，验证跳转正确

## Change Log

- 2026-04-03: 实现完成
  - 创建 Story 文件
  - 实现 getRelatedStyles Server Action
  - 创建 RelatedStyles 组件
  - 集成到风格详情页
  - 构建验证通过
