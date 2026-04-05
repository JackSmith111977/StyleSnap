---
title: '代码导出选项 - Story 6.6'
type: 'feature'
created: '2026-04-05'
status: 'backlog'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 开发者在使用 StyleSnap 导出代码时，只能获得单一格式的代码，无法根据项目技术栈选择 Tailwind CSS、SCSS 或其他格式，需要手动转换代码格式，效率低下。

**Approach:** 在风格详情页提供多种代码格式导出选项（CSS/Tailwind/SCSS/CSS-in-JS），支持导出完整代码或仅设计变量，并可生成 ZIP 文件下载。

## Boundaries & Constraints

**Always:**
- 支持 4 种代码格式：原生 CSS、Tailwind CSS、SCSS、CSS-in-JS
- 支持 3 种导出范围：完整代码、仅设计变量、仅组件
- 使用 JSZip 生成 ZIP 文件下载
- 保留现有代码复制功能（一键复制）
- Design Tokens 支持 JSON/JS 格式复制

**Ask First:**
- 是否需要支持自定义组合导出（用户勾选特定组件）

**Never:**
- 不允许修改现有代码片段显示逻辑（只新增导出功能）
- 不允许在未登录状态下限制导出功能

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户选择 CSS 格式导出 | 生成原生 CSS 代码，包含 CSS Variables | N/A |
| TAILWIND_EXPORT | 用户选择 Tailwind 格式 | 生成 Tailwind 类名代码 | N/A |
| SCSS_EXPORT | 用户选择 SCSS 格式 | 生成 SCSS 代码，包含$variables | N/A |
| CSS_IN_JS | 用户选择 CSS-in-JS 格式 | 生成 Styled Components 或 Emotion 代码 | N/A |
| VARIABLES_ONLY | 用户选择"仅设计变量" | 只导出色板、字体、间距等变量定义 | N/A |
| COMPONENTS_ONLY | 用户选择"仅组件" | 只导出按钮、卡片、导航等组件代码 | N/A |
| ZIP_DOWNLOAD | 用户点击"下载 ZIP" | 生成包含多格式代码的 ZIP 文件 | 生成失败时显示错误提示 |
| COPY_TOKENS | 用户点击"复制 Design Tokens" | 复制 JSON/JS 格式的设计变量 | 降级为手动选中 |

</frozen-after-approval>

## Code Map

- `apps/web/lib/code-export/` -- 代码导出工具函数（新建）
  - `css-export.ts` -- 原生 CSS 导出
  - `tailwind-export.ts` -- Tailwind CSS 导出
  - `scss-export.ts` -- SCSS 导出
  - `css-in-js-export.ts` -- CSS-in-JS 导出
  - `tokens-export.ts` -- Design Tokens JSON/JS导出
- `apps/web/lib/zip-generator.ts` -- ZIP 文件生成工具（新建）
- `apps/web/components/export/` -- 导出相关组件（新建）
  - `export-modal.tsx` -- 导出选项弹窗
  - `export-format-selector.tsx` -- 格式选择器
  - `export-range-selector.tsx` -- 范围选择器
  - `tokens-copy-button.tsx` -- Design Tokens 复制按钮
- `apps/web/components/style-code-snippet.tsx` -- 添加导出按钮（修改）
- `apps/web/app/styles/[id]/page.tsx` -- 集成导出功能（修改）

## Tasks & Acceptance

**Execution:**
- [ ] `lib/code-export/css-export.ts` -- 原生 CSS 导出函数
- [ ] `lib/code-export/tailwind-export.ts` -- Tailwind CSS 导出函数
- [ ] `lib/code-export/scss-export.ts` -- SCSS 导出函数
- [ ] `lib/code-export/css-in-js-export.ts` -- CSS-in-JS 导出函数
- [ ] `lib/code-export/tokens-export.ts` -- Design Tokens 导出函数
- [ ] `lib/zip-generator.ts` -- ZIP 文件生成工具
- [ ] `components/export/export-modal.tsx` -- 导出选项弹窗
- [ ] `components/export/export-format-selector.tsx` -- 格式选择器
- [ ] `components/export/export-range-selector.tsx` -- 范围选择器
- [ ] `components/export/tokens-copy-button.tsx` -- Design Tokens 复制按钮
- [ ] `style-code-snippet.tsx` -- 添加"导出配置"按钮
- [ ] `app/styles/[id]/page.tsx` -- 集成导出弹窗

**Acceptance Criteria:**
- Given 用户查看风格详情页的代码片段区域，When 用户切换代码语言 Tab，Then 系统显示 HTML/CSS/React/Tailwind 选项
- Given 用户选择 Tailwind 导出，When 用户查看 Tailwind 代码，Then 系统显示使用 Tailwind 类名编写的代码，代码可直接用于 Tailwind CSS 项目
- Given 用户点击"导出配置"，When 用户想下载代码包，Then 系统显示导出选项弹窗，用户可选择格式（CSS/Tailwind/SCSS/CSS-in-JS），用户可选择范围（完整代码/仅变量/仅组件），系统生成 ZIP 文件并下载
- Given 用户想复制设计变量，When 用户点击"复制 Design Tokens"，Then 系统复制 JSON/JS 格式的设计变量，包含色板、字体、间距、圆角、阴影配置

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

## Developer Context

**前置依赖：**
- Story 6.1 实时预览编辑器（已复用 design-tokens.ts）
- Story 6.8 风格预览组件（已完整设计变量系统）

**数据结构：**
```typescript
// Design Tokens 接口（复用）
interface DesignTokens {
  colorPalette: {
    primary: string; secondary: string; background: string;
    surface: string; text: string; textMuted: string;
    border: string; accent: string;
  };
  fonts: {
    heading: string; body: string; mono: string;
    headingWeight: number; bodyWeight: number;
    headingLineHeight: number; bodyLineHeight: number;
  };
  spacing: { xs: string; sm: string; md: string; lg: string; xl: string };
  borderRadius: { small: string; medium: string; large: string };
  shadows: { light: string; medium: string; heavy: string };
}

// 导出选项
type ExportFormat = 'css' | 'tailwind' | 'scss' | 'css-in-js';
type ExportRange = 'full' | 'variables' | 'components';
```

**组件结构：**
```
StyleCodeSnippet
  ├── CodeBlock (现有)
  ├── CopyButton (现有)
  └── ExportButton (新增) → ExportModal
       ├── ExportFormatSelector
       ├── ExportRangeSelector
       └── DownloadButton → zip-generator.ts
```
