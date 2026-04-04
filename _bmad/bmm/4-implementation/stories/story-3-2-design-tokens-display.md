---
title: '设计变量展示 - Story 3.2'
type: 'feature'
created: '2026-04-03'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 开发者用户需要理解风格背后的设计系统（色板、字体、间距等），但当前详情页只展示预览图，缺少设计变量的结构化展示和复制功能。

**Approach:** 创建 DesignTokens 展示区域和 ColorPalette 组件，支持点击颜色复制 Hex 值，显示字体预览效果，使用 Toast 反馈复制结果。

## Boundaries & Constraints

**Always:**
- 使用 Client Component 实现颜色复制功能（Clipboard API）
- Toast 反馈使用 sonner 库
- 支持键盘操作（Enter/Space 复制颜色）
- 显示字体预览效果（字母 + 中文示例）

**Ask First:**
- 无

**Never:**
- 不使用第三方颜色选择器库
- 不在服务端组件中实现复制功能

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户点击查看颜色 | 复制 Hex 值到剪贴板，显示"已复制"Toast | N/A |
| ERROR_CASE | 浏览器不支持 Clipboard API | 显示"复制失败"Toast，自动选中颜色值 | 降级处理 |
| EDGE_CASE | 键盘用户按 Enter/Space | 触发复制操作，与点击效果相同 | N/A |

</frozen-after-approval>

## Code Map

- `apps/web/components/style-color-palette.tsx` -- 色板组件（带复制功能）
- `apps/web/components/style-detail.tsx` -- 风格详情组件，集成 ColorPalette
- `apps/web/app/layout.tsx` -- 添加 Toaster 全局组件
- `apps/web/actions/styles/index.ts` -- getStyle 返回设计变量数据

## Tasks & Acceptance

**Execution:**
- [x] `app/layout.tsx` -- 添加 Toaster 组件 -- 全局 Toast 支持
- [x] `components/style-color-palette.tsx` -- 创建色板组件 -- 支持点击复制颜色
- [x] `components/style-detail.tsx` -- 集成 ColorPalette 组件 -- 展示设计变量
- [x] 安装 sonner -- Toast 通知库

**Acceptance Criteria:**
- Given 用户查看风格详情页，When 滚动到"设计变量"区域，Then 展示色板、字体、间距、圆角、阴影配置
- Given 用户点击色板中的颜色，When 用户想复制颜色值，Then 复制 Hex 值到剪贴板并显示"已复制"Toast
- Given 用户想查看字体效果，When 用户查看字体配置，Then 显示字体预览效果（字母/中文示例）

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功 (7.8s)

**Manual checks (if no CLI):**
- 访问风格详情页，滚动到设计变量区域
- 点击任意颜色块，验证 Toast 提示"已复制"
- 按 Enter/Space 键，验证键盘复制功能

## Change Log

- 2026-04-03: 实现完成
  - 安装 sonner ^2.0.7
  - 创建 ColorPalette 组件
  - 集成 Toast 通知
  - 添加键盘支持
