---
title: '实时预览编辑器 - Story 6.1'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 开发者在使用风格案例时，无法直观地看到自定义设计变量后的效果，需要手动修改代码并刷新预览，学习效率低。

**Approach:** 在风格详情页添加实时预览编辑器组件，支持调整颜色、字体、间距等设计变量，实时更新预览效果并同步更新代码片段。

## Boundaries & Constraints

**Always:**
- 使用 Zustand 管理编辑器状态（与 theme-store 一致的模式）
- 所有设计变量调整必须实时反映到预览区域
- 代码片段区域必须同步更新自定义后的 CSS
- 提供"重置"按钮一键恢复默认值
- 提供"导出配置"功能生成自定义 CSS 代码

**Ask First:**
- 是否需要持久化用户的自定义配置到本地存储

**Never:**
- 不允许修改原始风格数据（只读预览）
- 不允许在未登录状态下导出配置（可选限制）

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户调整颜色选择器 | 预览区域实时更新颜色，代码片段同步更新 | N/A |
| RESET | 用户点击重置按钮 | 所有参数恢复默认值，预览和代码同步更新 | N/A |
| EXPORT | 用户点击导出配置 | 生成自定义 CSS 代码，提供复制/下载选项 | 生成失败时显示错误提示 |
| BROWSER_UNSUPPORTED | 浏览器不支持 Clipboard API | 导出时自动选中代码供手动复制 | 降级处理 |
| PERFORMANCE | 频繁调整滑块 | 使用防抖（debounce）避免过度渲染 | 性能优化 |

</frozen-after-approval>

## Code Map

- `apps/web/components/preview/live-preview-editor.tsx` -- 实时预览编辑器主组件（新建）
- `apps/web/components/preview/preview-panel.tsx` -- 预览面板组件（新建）
- `apps/web/components/preview/edit-control-panel.tsx` -- 编辑控制面板（新建）
- `apps/web/stores/preview-editor-store.ts` -- 预览编辑器 Zustand Store（新建）
- `apps/web/lib/design-tokens.ts` -- 设计变量工具函数（新建）
- `apps/web/app/styles/[id]/page.tsx` -- 集成 LivePreviewEditor 组件（修改）
- `apps/web/components/style-code-snippet.tsx` -- 支持自定义代码显示（修改）

## Tasks & Acceptance

**Execution:**
- [ ] `stores/preview-editor-store.ts` -- 创建 Zustand Store -- 管理颜色、字体、间距等状态
- [ ] `components/preview/preview-panel.tsx` -- 创建预览面板 -- 实时展示风格效果
- [ ] `components/preview/edit-control-panel.tsx` -- 创建控制面板 -- 颜色选择器、字体选择器、间距滑块
- [ ] `components/preview/live-preview-editor.tsx` -- 创建主编辑器组件 -- 整合预览和控制面板
- [ ] `lib/design-tokens.ts` -- 创建设计变量工具 -- CSS 变量生成、代码导出
- [ ] `app/styles/[id]/page.tsx` -- 集成编辑器 -- 在详情页添加 LivePreviewEditor
- [ ] `components/style-code-snippet.tsx` -- 支持自定义代码 -- 显示自定义后的 CSS
- [ ] 重置功能 -- 一键恢复默认设计变量
- [ ] 导出功能 -- 生成自定义 CSS 代码，支持复制/下载

**Acceptance Criteria:**
- Given 用户查看风格详情页的"实时预览"区域，When 页面加载，Then 系统显示风格预览区域和编辑控制面板，控制面板包含颜色选择器、字体选择器、间距滑块等
- Given 用户调整颜色选择器，When 用户修改主色/辅色/背景色，Then 系统实时更新预览区域的颜色，显示对应的 CSS 变量值，代码片段区域同步更新
- Given 用户调整间距滑块，When 用户修改间距值（4px 基准），Then 系统实时更新预览元素的间距，显示当前间距值
- Given 用户想恢复默认值，When 用户点击"重置"按钮，Then 系统恢复所有参数到原始风格配置，预览区域实时更新
- Given 用户满意自定义效果，When 用户点击"导出配置"，Then 系统生成自定义后的 CSS 代码，提供下载或复制选项

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问风格详情页，实时预览编辑器正常显示
- 调整颜色选择器，预览区域和代码片段实时更新
- 调整间距滑块，预览元素间距实时变化
- 点击重置按钮，所有参数恢复默认
- 点击导出配置，生成正确的 CSS 代码并可复制
