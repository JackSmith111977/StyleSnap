---
title: '预览风格 - Story 6.7'
type: 'feature'
created: '2026-04-05'
status: 'backlog'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户在浏览风格列表时，需要点击卡片进入详情页才能查看风格的详细预览，频繁跳转影响浏览效率，无法快速预览多个风格的效果。

**Approach:** 提供三种预览模式（卡片下拉预览、详情三按钮、全屏预览），让用户根据场景选择最合适的浏览方式，无需跳转即可查看风格效果。

## Boundaries & Constraints

**Always:**
- 三种预览模式：卡片下拉预览、详情三按钮、全屏预览
- 用户偏好保存到 LocalStorage
- 卡片下拉预览在列表页实现
- 详情三按钮和全屏预览在详情页实现
- 所有预览模式必须响应式

**Ask First:**
- 是否需要支持键盘快捷键切换预览模式

**Never:**
- 不允许破坏现有列表页和详情页的基本功能
- 不允许在未登录状态下限制预览功能

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| CARD_DROP_PREVIEW | 用户点击列表页卡片 | 卡片下方展开预览区域，显示设计变量和代码摘要 | 展开失败时保持原状 |
| DETAIL_THREE_TABS | 用户查看详情页 | 显示"预览/变量/代码"三个 Tab 按钮 | Tab 切换失败时保持当前 Tab |
| FULLSCREEN_MODE | 用户点击全屏预览 | 隐藏导航和侧边栏，只显示预览和核心信息 | ESC 键退出全屏 |
| PREFERENCE_SAVE | 用户切换预览模式 | 偏好保存到 LocalStorage | 保存失败时不影响功能 |
| PREFERENCE_LOAD | 用户再次访问 | 自动使用上次选择的预览模式 | 无偏好时使用默认模式 |
| RESPONSIVE | 窗口大小改变 | 预览模式自适应调整布局 | 布局错乱时降级为默认布局 |

</frozen-after-approval>

## Code Map

- `apps/web/stores/preview-mode-store.ts` -- 预览模式 Zustand Store（新建）
- `apps/web/components/preview/` -- 预览相关组件（新建/修改）
  - `card-drop-preview.tsx` -- 卡片下拉预览组件（列表页）
  - `detail-tabs.tsx` -- 详情三按钮 Tab 组件（详情页）
  - `fullscreen-preview.tsx` -- 全屏预览组件（详情页）
  - `preview-mode-toggle.tsx` -- 预览模式切换按钮
- `apps/web/components/style-card.tsx` -- 集成卡片下拉预览（修改）
- `apps/web/app/styles/page.tsx` -- 列表页集成预览模式（修改）
- `apps/web/app/styles/[id]/page.tsx` -- 详情页集成预览模式（修改）
- `apps/web/lib/preview-utils.ts` -- 预览工具函数（新建）

## Tasks & Acceptance

**Execution:**
- [ ] `stores/preview-mode-store.ts` -- 预览模式 Store（LocalStorage 持久化）
- [ ] `lib/preview-utils.ts` -- 预览工具函数
- [ ] `components/preview/card-drop-preview.tsx` -- 卡片下拉预览组件
- [ ] `components/preview/detail-tabs.tsx` -- 详情三按钮 Tab 组件
- [ ] `components/preview/fullscreen-preview.tsx` -- 全屏预览组件
- [ ] `components/preview/preview-mode-toggle.tsx` -- 预览模式切换按钮
- [ ] `components/style-card.tsx` -- 集成卡片下拉预览
- [ ] `app/styles/page.tsx` -- 列表页集成预览模式选择器
- [ ] `app/styles/[id]/page.tsx` -- 详情页集成三按钮和全屏预览

**Acceptance Criteria:**
- Given 用户查看风格列表页，When 用户点击"预览模式"按钮，Then 系统显示预览模式选项（卡片下拉/详情三按钮/全屏）
- Given 用户选择"卡片下拉预览"，When 用户点击风格卡片，Then 系统在卡片下方展开预览区域，显示设计变量和代码片段摘要，用户无需跳转页面即可预览
- Given 用户选择"详情三按钮"，When 用户查看风格详情页，Then 系统显示"预览/变量/代码"三个 Tab 按钮，用户可快速切换查看不同内容
- Given 用户选择"全屏预览"，When 用户点击"全屏预览"按钮，Then 系统进入全屏预览模式，隐藏导航和侧边栏，只显示风格预览和核心信息，按 ESC 退出全屏
- Given 用户想要切换预览模式，When 用户切换预览模式，Then 系统记住用户偏好，下次访问时自动使用上次选择的模式

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

## Developer Context

**前置依赖：**
- Story 6.8 风格预览组件（可复用 StylePreview 组件）
- Story 6.1 实时预览编辑器（可复用 design-tokens 显示逻辑）

**预览模式说明：**
```
1. 卡片下拉预览 (Card Drop Preview)
   - 位置：列表页 /styles
   - 交互：点击卡片→下方展开预览区域
   - 内容：设计变量摘要 + 代码片段摘要
   - 收起：再次点击卡片或点击收起按钮

2. 详情三按钮 (Detail Three Tabs)
   - 位置：详情页 /styles/[id]
   - 交互：点击"预览/变量/代码"Tab 切换
   - 内容：
     - 预览 Tab: StylePreview 组件
     - 变量 Tab: Design Tokens 详细展示
     - 代码 Tab: 代码片段展示

3. 全屏预览 (Fullscreen Preview)
   - 位置：详情页 /styles/[id]
   - 交互：点击全屏按钮→进入全屏模式
   - 内容：风格预览 + 核心信息（名称、描述、标签）
   - 退出：按 ESC 或点击关闭按钮
```

**组件结构：**
```
/styles (列表页)
  └── StyleGrid
       └── StyleCard
            ├── StyleCardPreview (现有)
            └── CardDropPreview (新增)

/styles/[id] (详情页)
  └── PreviewModeContainer
       ├── DetailTabs (三按钮 Tab)
       └── FullscreenPreview (全屏模式)
```
