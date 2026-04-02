---
title: '高级筛选功能 - Story 2.5'
type: 'feature'
created: '2026-04-02'
status: 'ready-for-dev'
context: ['_bmad-output/planning-artifacts/epics.md', 'apps/web/app/styles/style-grid.tsx']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 当前筛选功能仅支持单一分类筛选（FR-0.8），用户无法按颜色、行业、复杂度等多维度组合筛选，导致有特定需求的用户难以精确找到符合项目需求的风格。

**Approach:** 在现有 StyleGrid 组件中添加高级筛选面板，支持颜色选择器（多选）、行业标签（多选）、复杂度选择器（多选），URL 同步筛选参数，显示当前筛选条件标签（可删除），支持一键清除筛选。

## Boundaries & Constraints

**Always:**
- URL 同步所有筛选参数（支持分享和刷新保持）
- 筛选条件标签支持单独删除
- 多选筛选使用逗号分隔存储在 URL 中（如 `?colors=red,blue,green`）
- 保持与现有分类筛选、搜索功能的兼容性
- 使用现有 Button、Input 等 UI 组件

**Ask First:**
- 颜色选择器使用预设色板还是原生颜色选择器？→ 预设色板（12 种常用颜色）
- 行业标签数据来源？→ 使用现有 tags 表，筛选 `type='industry'` 的标签
- 复杂度选项定义？→ 简单/中等/复杂三级

**Never:**
- 不使用第三方颜色选择器库
- 不修改现有 Server Action 接口（新增 getStyles 参数）
- 不创建新路由（在 /styles 页面内实现）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户选择颜色=红色、行业=电商、复杂度=简单 → 应用筛选 | 列表刷新显示匹配的风格，URL 变为 `?colors=red&industries=ecommerce&complexities=simple` | N/A |
| ERROR_CASE | 筛选结果为空 | 显示空状态插画，提示"未找到符合筛选条件的风格"，提供"清除筛选"按钮 | N/A |
| EDGE_CASE | 用户刷新页面 | URL 参数保持，筛选状态保留 | N/A |
| EDGE_CASE | 用户点击浏览器后退 | 筛选状态回退到上一次 | N/A |
| EDGE_CASE | 同时使用分类筛选 + 高级筛选 | 所有条件同时生效，URL 包含所有参数 | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/actions/styles.ts` -- getStyles Server Action，需添加颜色、行业、复杂度筛选参数
- `apps/web/app/styles/style-grid.tsx` -- StyleGrid 组件，需添加高级筛选面板 UI 和逻辑
- `apps/web/app/styles/page.tsx` -- styles 页面，需传递筛选参数给 StyleGrid

## Tasks & Acceptance

**Execution:**
1. `apps/web/actions/styles.ts` -- 修改 getStyles 添加 colors、industries、complexities 筛选参数 -- 支持服务端筛选
2. `apps/web/app/styles/style-grid.tsx` -- 创建 AdvancedFilterPanel 组件（内联） -- 实现颜色选择器、行业标签、复杂度选择器
3. `apps/web/app/styles/style-grid.tsx` -- 添加筛选面板展开/收起状态管理 -- 控制面板显示
4. `apps/web/app/styles/style-grid.tsx` -- 添加筛选条件 URL 同步逻辑 -- 支持分享和刷新保持
5. `apps/web/app/styles/style-grid.tsx` -- 创建 FilterTags 组件（内联） -- 显示当前筛选标签（可删除）
6. `apps/web/app/styles/page.tsx` -- 传递高级筛选参数给 StyleGrid -- 服务端渲染支持

**Acceptance Criteria:**
- Given 用户点击"高级筛选"按钮，When 筛选面板展开，Then 显示颜色选择器、行业标签、复杂度等选项
- Given 用户设置多个筛选条件，When 用户点击"应用筛选"，Then 系统同时应用所有选定条件
- URL 同步筛选参数，显示当前筛选条件标签（可删除）
- Given 用户点击"清除筛选"，When 用户想重置所有筛选，Then 系统清除所有高级筛选条件

</frozen-after-approval>

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 导航到 /styles 页面，点击"高级筛选"按钮，面板展开显示颜色/行业/复杂度选项
- 选择多个筛选条件，点击"应用筛选"，列表刷新显示匹配结果
- URL 包含筛选参数，刷新页面后状态保持
- 点击筛选标签的 X 按钮，单个条件被删除
- 点击"清除筛选"按钮，所有条件被清除
