# Story 6.9: 预览窗口增强 - 视口大小 + Tab 导航

> **Epic:** 6 - 高级功能与增强  
> **Story ID:** 6.9  
> **状态:** ready-for-dev  
> **优先级:** P2  
> **创建日期:** 2026-04-04  
> **来源:** PRD.md v1.5, Correct Course 变更提案

---

## 1. 用户故事

As a 想要清晰查看风格效果的开发者，
I want 在风格详情页使用视口大小的预览窗口，通过 Tab 切换查看不同设计变量场景，
So that 我可以更专注、更有条理地理解风格的配色、字体、间距、圆角、阴影效果。

---

## 2. 验收标准

### 2.1 预览窗口布局

**Given** 用户访问风格详情页 /styles/[id]
**When** 页面加载
**Then** 预览窗口固定在视口大小（约 80vh x 80vw）
**And** 预览窗口位于风格参考区域下方、代码区域上方
**And** 预览窗口支持内部滚动

### 2.2 Tab 导航

**Given** 预览窗口包含多个内容分类
**When** 用户点击 Tab
**Then** 切换显示对应内容区域
**And** 当前 Tab 高亮显示
**And** Tab 切换有平滑过渡动画

### 2.3 Tab 内容分类

**Given** 预览窗口有 5 个 Tab
**When** 用户切换 Tab
**Then** 显示对应内容

| Tab 序号 | 名称 | 内容 |
|---------|------|------|
| 1 | 配色 | 主色/辅色/强调色应用场景（按钮、背景、文字、边框） |
| 2 | 字体 | 标题字体/正文/等宽字体展示（含字重、行高信息） |
| 3 | 间距 | 5 档间距可视化对比（XS/SM/MD/LG/XL） |
| 4 | 效果 | 圆角（small/medium/large）+ 阴影（light/medium/heavy）对比 |
| 5 | 预览 | 完整页面预览（导航栏/侧边栏/内容区/页脚） |

### 2.4 响应式适配

**Given** 不同视口尺寸
**When** 浏览器窗口大小改变
**Then** 预览窗口自适应调整
**And** 移动端显示优化（Tab 可横向滚动或下拉选择）

### 2.5 样式隔离

**Given** 预览窗口的样式隔离需求
**When** 组件渲染
**Then** 使用 CSS Variables 作用域隔离
**And** 不影响页面其他区域

---

## 3. 技术需求

### 3.1 架构要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-ARCH-01 | Server Actions | 复用 Story 6.8 的 `getStyleDesignTokens` |
| AR-ARCH-02 | 组件复用 | 复用 Story 6.8 的设计变量展示逻辑 |
| AR-ARCH-03 | 状态管理 | 使用 Zustand 或 React useState 管理 Tab 状态 |

### 3.2 前端要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-FE-01 | 视口布局 | 预览窗口约 80vh x 80vw，固定在页面指定位置 |
| AR-FE-02 | Tab 组件 | 5 个 Tab 标签页，支持点击切换 |
| AR-FE-03 | 响应式 | 移动端优化（Tab 横向滚动或下拉） |
| AR-FE-04 | 动画 | Tab 切换有平滑过渡效果 |
| AR-FE-05 | CSS Variables | 复用 Story 6.8 的 CSS Variables 映射 |

### 3.3 用户体验要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-UX-01 | 加载状态 | Tab 内容加载时显示骨架屏 |
| AR-UX-02 | 键盘导航 | 支持键盘左右键切换 Tab |
| AR-UX-03 | 焦点管理 | Tab 切换后焦点正确管理 |

---

## 4. 开发者上下文

### 4.1 前置依赖

- **Story 6.8: 风格预览组件** - 已完成 review，可复用设计变量系统和展示内容
- **Story 3.2: 设计变量展示** - 已完成，理解 design tokens 数据结构
- **Story 6.1: 实时预览编辑器** - 已完成，可复用 CSS Variables 生成逻辑

### 4.2 可复用代码

```typescript
// 复用 Story 6.8 的 Server Action
import { getStyleDesignTokens } from '@/actions/styles/get-design-tokens'

// 复用 Story 6.8 的设计变量数据结构
import { DesignTokens } from '@/stores/preview-editor-store'

// 复用 Story 6.8 的 CSS Variables 映射逻辑
```

### 4.3 组件结构建议

```
apps/web/components/
└── preview/
    └── style-preview-modal/
        ├── index.tsx              # 主组件 - 预览窗口容器
        ├── preview-tabs.tsx       # Tab 导航组件
        ├── tabs/
        │   ├── colors-tab.tsx     # 配色 Tab
        │   ├── fonts-tab.tsx      # 字体 Tab
        │   ├── spacing-tab.tsx    # 间距 Tab
        │   ├── effects-tab.tsx    # 效果 Tab（圆角 + 阴影）
        │   └── full-preview-tab.tsx # 完整预览 Tab
        ├── styles.module.css      # 样式
        └── index.ts               # 导出索引
```

---

## 5. 实现任务

### 5.1 前端组件任务

- [ ] **任务 1**: 创建 `StylePreviewModal` 主组件
  - 文件：`apps/web/components/preview/style-preview-modal/index.tsx`
  - 功能：视口大小预览窗口容器，集成 Tab 导航

- [ ] **任务 2**: 创建 `PreviewTabs` Tab 导航组件
  - 文件：`apps/web/components/preview/style-preview-modal/preview-tabs.tsx`
  - 功能：5 个 Tab 标签，支持点击切换、键盘导航

- [ ] **任务 3**: 创建各 Tab 内容组件
  - `tabs/colors-tab.tsx` - 配色方案展示
  - `tabs/fonts-tab.tsx` - 字体系统展示
  - `tabs/spacing-tab.tsx` - 间距系统展示
  - `tabs/effects-tab.tsx` - 圆角 + 阴影效果展示
  - `tabs/full-preview-tab.tsx` - 完整页面预览

- [ ] **任务 4**: 创建 CSS Modules 样式
  - 文件：`apps/web/components/preview/style-preview-modal/styles.module.css`
  - 功能：预览窗口布局、Tab 样式、响应式适配

- [ ] **任务 5**: 创建组件导出索引
  - 文件：`apps/web/components/preview/style-preview-modal/index.ts`

### 5.2 集成任务

- [ ] **任务 6**: 集成到风格详情页
  - 文件：`apps/web/app/styles/[id]/page.tsx`
  - 功能：在风格参考区域下方、代码区域上方添加预览窗口

### 5.3 测试任务

- [ ] **任务 7**: 创建 E2E 测试
  - 文件：`apps/web/tests/e2e/story-6-9-style-preview-modal.spec.ts`
  - 功能：验证预览窗口布局、Tab 切换功能

---

## 6. 代码 Map（参考已有模式）

### 6.1 参考 Story 6.8 的实现模式

```typescript
// 参考：apps/web/components/preview/style-preview/
// 可复用：CSS Variables 映射逻辑、设计变量展示组件
```

### 6.2 Tab 组件参考模式

```typescript
// 参考：shadcn/ui Tabs 组件模式
// 或使用原生 React useState 实现
```

---

## 7. 文件结构要求

### 7.1 新增文件列表

```
apps/web/
├── components/
│   └── preview/
│       └── style-preview-modal/
│           ├── index.tsx               # 新增 - 主组件
│           ├── preview-tabs.tsx        # 新增 - Tab 导航
│           ├── tabs/
│           │   ├── colors-tab.tsx      # 新增
│           │   ├── fonts-tab.tsx       # 新增
│           │   ├── spacing-tab.tsx     # 新增
│           │   ├── effects-tab.tsx     # 新增
│           │   └── full-preview-tab.tsx # 新增
│           ├── styles.module.css       # 新增
│           └── index.ts                # 新增
└── tests/e2e/
    └── story-6-9-style-preview-modal.spec.ts # 新增
```

### 7.2 修改文件列表

```
apps/web/app/styles/[id]/page.tsx  # 添加 StylePreviewModal 组件集成
```

### 7.3 可选复用文件

```
apps/web/components/preview/style-preview/preview-content.tsx
# 可拆分内容到各 Tab 组件
```

---

## 8. 设计合规要求

### 8.1 预览窗口布局规范

| 属性 | 值 | 说明 |
|------|-----|------|
| 宽度 | 80vw | 视口宽度的 80% |
| 高度 | 80vh | 视口高度的 80% |
| 位置 | 风格参考下方、代码上方 | 固定在页面指定区域 |
| 最大宽度 | 1200px | 大视口下限制最大宽度 |
| 最大高度 | 800px | 大视口下限制最大高度 |

### 8.2 Tab 设计规范

| 属性 | 值 | 说明 |
|------|-----|------|
| Tab 数量 | 5 个 | 配色/字体/间距/效果/预览 |
| Tab 高度 | 48px | 标准 Tab 高度 |
| 激活状态 | 主色下划线 + 文字加粗 | 视觉区分当前 Tab |
| 过渡动画 | 0.3s ease | 平滑切换效果 |

### 8.3 响应式断点

| 断点 | 预览窗口行为 |
|------|--------------|
| < 640px | Tab 横向滚动或下拉选择，预览窗口全宽 |
| ≥ 640px | 标准 Tab 布局，预览窗口 80vw |
| ≥ 1024px | 完整布局，预览窗口限制最大宽度 |

---

## 9. 测试要求

### 9.1 单元测试（Vitest）

- [ ] 测试 Tab 切换逻辑
- [ ] 测试键盘导航功能

### 9.2 E2E 测试（Playwright）

- [ ] 测试预览窗口正确渲染
- [ ] 测试所有 Tab 切换功能
- [ ] 测试响应式行为
- [ ] 测试键盘导航

---

## 10. 依赖和引用

### 10.1 前置 Story

- **Story 6.8** - 风格预览组件（复用设计变量系统）
- **Story 3.2** - 设计变量展示（理解数据结构）
- **Story 6.1** - 实时预览编辑器（复用 CSS Variables 逻辑）

### 10.2 相关文档

- `PRD.md` v1.5 - F2.8 预览窗口增强功能定义
- `docs/main/CHANGELOG.md` - 需求变更记录

---

## 11. 验收检查清单

开发完成后，请确认：

- [ ] 预览窗口尺寸正确（80vw x 80vh）
- [ ] 预览窗口位置正确（风格参考下方、代码上方）
- [ ] 5 个 Tab 全部正确显示
- [ ] Tab 切换功能正常
- [ ] 键盘导航功能正常
- [ ] 响应式行为符合预期
- [ ] 样式隔离正常工作
- [ ] E2E 测试通过

---

## 12. 修订历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-04-04 | 初始版本 - Story Spec 创建 |

---

## 13. 实施记录

### 待实施工作

**后端任务:**
- [ ] 复用 Story 6.8 的 Server Action（无需新增）

**前端组件:**
- [ ] 创建 `StylePreviewModal` 主组件
- [ ] 创建 `PreviewTabs` Tab 导航组件
- [ ] 创建 5 个 Tab 内容组件
- [ ] 创建 CSS Modules 样式

**集成任务:**
- [ ] 集成到风格详情页

**测试任务:**
- [ ] 创建 E2E 测试

**文件列表**

**新增文件:**
- `apps/web/components/preview/style-preview-modal/*`

**修改文件:**
- `apps/web/app/styles/[id]/page.tsx`

**下一步:** 运行 `bmad-dev-story` 开始实施
