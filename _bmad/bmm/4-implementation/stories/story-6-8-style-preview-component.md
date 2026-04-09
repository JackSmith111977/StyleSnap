# Story 6.8: 风格预览组件

> **Epic:** 6 - 高级功能与增强  
> **Story ID:** 6.8  
> **状态:** review  
> **优先级:** P2  
> **创建日期:** 2026-04-04  
> **来源:** PRD.md v1.3, 需求变更记录 2026-04-04

---

## 1. 用户故事

As a 想快速理解风格效果的开发者，
I want 在风格详情页查看一个固定尺寸、响应式的预览组件，
So that 我可以直观地看到该风格应用在网站时的完整效果（包括导航栏、侧边栏、标题、正文、卡片、列表、页脚等组件）。

---

## 2. 验收标准

### 2.1 核心功能

**Given** 用户访问风格详情页 /styles/[id]
**When** 页面加载
**Then** 系统显示风格预览组件（固定尺寸、响应式布局）
**And** 预览组件包含：导航栏、侧边栏、标题、正文、卡片、列表、页脚
**And** 预览组件使用 CSS Variables + CSS Modules 实现
**And** 预览组件完整体现该风格的所有设计变量（配色、字体、间距、圆角、阴影）

### 2.2 完整设计变量应用

**Given** 预览组件接收风格的完整设计变量
**When** 组件渲染
**Then** 系统使用 design tokens 渲染所有 UI 组件
**And** 配色方案正确应用（8 色：primary, secondary, background, surface, text, textMuted, border, accent）
**And** 字体设置正确应用（字体系 + 字重 + 行高）
**And** 间距系统正确应用（5 档：xs, sm, md, lg, xl）
**And** 圆角系统正确应用（3 档：small, medium, large）
**And** 阴影系统正确应用（3 档：light, medium, heavy）

### 2.3 深色模式支持

**Given** 用户查看预览组件
**When** 组件渲染完成
**Then** 系统展示该风格的浅色模式效果
**And** 深色模式通过算法生成（混合模式支持手动覆盖）

### 2.4 响应式适配

**Given** 预览组件需要适配不同视口
**When** 浏览器窗口大小改变
**Then** 预览组件响应式缩放
**And** 保持固定宽高比

### 2.5 样式隔离

**Given** 预览组件的样式隔离需求
**When** 组件渲染
**Then** 系统使用 CSS Variables 作用域隔离
**And** 不影响页面其他区域的样式

---

## 3. 技术需求

### 3.1 架构要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-ARCH-01 | Server Actions | 使用 Next.js 16 Server Actions 获取设计变量数据 |
| AR-ARCH-02 | Supabase 集成 | 直接使用 @supabase/supabase-js 查询 style_design_tokens 表 |
| AR-ARCH-03 | Zod 验证 | 服务端验证设计变量数据结构 |

### 3.2 前端要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-FE-01 | 轻量机能风 | 预览组件设计风格符合项目定位 |
| AR-FE-02 | 混合样式方案 | Tailwind CSS + CSS Modules |
| AR-FE-03 | Zustand | 如需要全局状态，使用 Zustand |
| AR-FE-04 | 响应式设计 | 预览组件本身支持响应式缩放 |
| AR-FE-05 | CSS Variables | 使用 CSS Variables 实现样式隔离 |

### 3.3 数据库要求

| ID | 要求 | 说明 |
|----|------|------|
| AR-DB-01 | style_design_tokens 表 | 需要从该表获取设计变量数据 |
| AR-DB-02 | RLS 策略 | 读取操作需要行级安全策略 |

---

## 4. 开发者上下文

### 4.1 前置依赖

- **Story 3.2: 设计变量展示** - 已完成，理解 design tokens 数据结构
- **Story 6.1: 实时预览编辑器** - 已完成，可复用 CSS Variables 生成逻辑
- **数据库表** - `style_design_tokens` 表需要存在

### 4.2 数据结构参考

```typescript
// Design Tokens 数据结构（完整版）
interface DesignTokens {
  colors: {
    primary: string        // 主色
    secondary: string      // 辅色
    background: string     // 背景色
    surface: string        // 表面色
    text: string           // 文字色
    textMuted: string      // 弱化文字色
    border: string         // 边框色
    accent: string         // 强调色（hover、焦点）
  }
  fonts: {
    heading: string        // 标题字体系
    body: string           // 正文字体系
    mono: string           // 等宽字体
    headingWeight: number  // 标题字重（如 700）
    bodyWeight: number     // 正文字重（如 400）
    headingLineHeight: number  // 标题行高（如 1.2）
    bodyLineHeight: number     // 正文行高（如 1.5）
  }
  spacing: {
    xs: number  // 4px
    sm: number  // 8px
    md: number  // 16px
    lg: number  // 24px
    xl: number  // 32px
  }
  borderRadius: {
    small: string   // 4px - 按钮、小元素
    medium: string  // 8px - 卡片、输入框
    large: string   // 16px - 大容器、头像
  }
  shadows: {
    light: string   // 轻微悬浮效果
    medium: string  // 卡片、导航栏阴影
    heavy: string   // 模态框、弹出层阴影
  }
  darkModeOverrides?: {
    colors?: Partial<DesignTokens['colors']>
  }
}
```

### 4.3 组件结构建议

```
apps/web/components/
└── preview/
    ├── style-preview/
    │   ├── index.tsx           # 主组件
    │   ├── preview-header.tsx   # 导航栏预览
    │   ├── preview-sidebar.tsx  # 侧边栏预览
    │   ├── preview-content.tsx  # 内容区域（标题/正文/卡片/列表）
    │   ├── preview-footer.tsx   # 页脚预览
    │   └── styles.module.css    # CSS Modules 样式
    └── index.ts                 # 导出索引
```

### 4.4 CSS Variables 作用域隔离方案

```css
/* styles.module.css */
.previewContainer {
  /* 创建样式作用域 */
  --preview-primary: var(--style-primary);
  --preview-background: var(--style-background);
  /* ... 其他变量映射 */
  
  /* 隔离样式 */
  * {
    color: var(--preview-text);
    background: var(--preview-background);
  }
}
```

---

## 5. 实现任务

### 5.1 数据库/后端任务

- [ ] **任务 1**: 更新 `getStyleDesignTokens` Server Action
  - 文件：`apps/web/actions/styles/get-design-tokens.ts`
  - 功能：从 `styles` 表获取完整设计变量（8 色、完整字体、圆角、阴影）
  - 新增字段：color_palette.border, color_palette.accent, fonts.headingWeight/bodyWeight/headingLineHeight/bodyLineHeight, border_radius, shadows

### 5.2 前端组件任务

- [ ] **任务 2**: 更新 `StylePreview` 主组件
  - 文件：`apps/web/components/preview/style-preview/index.tsx`
  - 功能：接收完整 design tokens props，更新 CSS Variables 映射

- [ ] **任务 3**: 更新 CSS Modules 样式
  - 文件：`apps/web/components/preview/style-preview/styles.module.css`
  - 功能：
    - 新增 CSS Variables 定义（--preview-border, --preview-accent, --preview-font-weight-*, --preview-border-radius-*, --preview-shadow-*）
    - 替换所有 hardcoded 值为 CSS 变量

- [ ] **任务 4**: 验证子组件样式应用
  - 文件：`preview-header.tsx`, `preview-sidebar.tsx`, `preview-content.tsx`, `preview-footer.tsx`
  - 功能：确认所有子组件使用 CSS Variables

### 5.3 数据初始化任务

- [x] **任务 5**: 执行 SQL 脚本初始化现有风格数据
  - 文件：`supabase/migrations/0022_init_style_design_tokens.sql`
  - 功能：为现有 styles 填充默认设计变量
  - 状态：✅ 已完成 - 迁移脚本已创建，需在 Supabase 云端执行

### 5.4 测试任务

- [ ] **任务 6**: 创建 E2E 测试
  - 文件：`apps/web/tests/e2e/story-6-8-style-preview.spec.ts`
  - 功能：验证完整设计变量正确应用

### 5.5 v1.3 预览组件增强任务

**背景**: 预览组件需要更好地展示设计变量场景，让用户能直观理解每个设计变量的效果

- [x] **任务 7**: 配色方案场景展示
  - 文件：`apps/web/components/preview/style-preview/preview-content.tsx`
  - 功能：
    - 主色应用场景：主色按钮、主色文字、主色背景
    - 辅色应用场景：辅色按钮、辅色标签
    - 强调色应用场景：链接 hover 状态、焦点环、强调边框
  - 验收标准：
    - [x] 展示至少 3 种主色应用场景
    - [x] 展示至少 2 种辅色应用场景
    - [x] 展示强调色的 hover 和 focus 状态效果

- [x] **任务 8**: 字体系统场景展示
  - 文件：`apps/web/components/preview/style-preview/preview-content.tsx`
  - 功能：
    - 展示标题字体系、字重、行高效果（H1/H2/H3）
    - 展示正文字体系、字重、行高效果
    - 展示等宽字体场景（代码块）
  - 验收标准：
    - [x] H1/H2/H3 使用不同的字重和行高
    - [x] 正文段落展示标准行高
    - [x] 代码块使用等宽字体

- [x] **任务 9**: 间距系统展示
  - 文件：`apps/web/components/preview/style-preview/preview-content.tsx`
  - 功能：通过按钮组、卡片间隙等展示 5 档间距
  - 验收标准：
    - [x] 展示 xs/sm 间距（小组件内部）
    - [x] 展示 md/lg 间距（卡片 padding、组件间隙）
    - [x] 展示 xl 间距（大_section_间隔）

- [x] **任务 10**: 圆角效果展示
  - 文件：`apps/web/components/preview/style-preview/preview-content.tsx`
  - 功能：通过多个卡片展示 small/medium/large 圆角效果
  - 验收标准：
    - [x] 按钮使用 small 圆角
    - [x] 卡片使用 medium 圆角
    - [x] 大容器/头像使用 large 圆角

- [x] **任务 11**: 阴影效果展示
  - 文件：`apps/web/components/preview/style-preview/preview-content.tsx`
  - 功能：通过多个卡片展示 light/medium/heavy 阴影效果
  - 验收标准：
    - [x] 展示轻阴影（轻微悬浮）
    - [x] 展示中阴影（卡片默认）
    - [x] 展示重阴影（模态框效果）

---

## 6. 代码 Map（参考已有模式）

### 6.1 参考 Story 6.1 的实现模式

```typescript
// 参考：apps/web/lib/design-tokens.ts
// 可复用：generateCssVariables() 函数

// 参考：apps/web/stores/preview-editor-store.ts
// 可复用：设计变量 Zustand Store 模式
```

### 6.2 Server Action 模式

```typescript
// 参考：apps/web/actions/styles/[id]/page.ts
// 模式：获取风格数据的 Server Action 结构
```

---

## 7. 文件结构要求

### 7.1 新增文件列表

```
apps/web/
├── actions/
│   └── styles/
│       └── get-design-tokens.ts        # 新增
├── components/
│   └── preview/
│       └── style-preview/
│           ├── index.tsx               # 新增 - 主组件
│           ├── preview-header.tsx      # 新增
│           ├── preview-sidebar.tsx     # 新增
│           ├── preview-content.tsx     # 新增
│           ├── preview-footer.tsx      # 新增
│           ├── styles.module.css       # 新增
│           └── index.ts                # 新增
└── tests/e2e/
    └── story-6-8-style-preview.spec.ts # 新增
```

### 7.2 修改文件列表

```
apps/web/app/styles/[id]/page.tsx  # 添加 StylePreview 组件集成
```

---

## 8. 设计合规要求

### 8.1 预览组件布局规范

| 区域 | 建议尺寸 | 说明 |
|------|----------|------|
| 导航栏 | 高度 60px | 固定在预览组件顶部 |
| 侧边栏 | 宽度 200px | 固定在预览组件左侧 |
| 内容区 | 自适应 | 包含标题/正文/卡片/列表示例 |
| 页脚 | 高度 40px | 固定在预览组件底部 |

### 8.2 响应式断点

| 断点 | 预览组件行为 |
|------|--------------|
| < 640px | 侧边栏隐藏，只显示主内容 |
| ≥ 640px | 显示侧边栏 |
| ≥ 1024px | 完整布局 |

---

## 9. 测试要求

### 9.1 单元测试（Vitest）

- [ ] 测试 CSS Variables 正确生成
- [ ] 测试设计变量到样式的映射

### 9.2 E2E 测试（Playwright）

- [ ] 测试预览组件正确渲染
- [ ] 测试响应式行为
- [ ] 测试深色模式效果

---

## 10. 依赖和引用

### 10.1 前置 Story

- **Story 3.2** - 设计变量展示（理解数据结构）
- **Story 6.1** - 实时预览编辑器（复用 CSS Variables 逻辑）

### 10.2 相关文档

- `PRD.md` v1.3 - F2.8 功能定义
- `docs/main/CHANGELOG.md` - 需求变更记录
- `design-tokens.ts` - CSS Variables 工具函数

---

## 11. 验收检查清单

开发完成后，请确认：

- [ ] 预览组件正确显示所有 UI 元素（导航/侧边/内容/页脚）
- [ ] CSS Variables 正确应用到所有子组件
- [ ] 响应式行为符合预期
- [ ] 样式隔离正常工作，不影响页面其他区域
- [ ] 深色模式正确渲染
- [ ] E2E 测试通过

---

## 12. 修订历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-04-04 | 初始版本 - Story Spec 创建 |
| 1.1 | 2026-04-04 | 实施完成 - 创建所有组件并集成到风格详情页，构建验证通过 |
| 1.2 | 2026-04-04 | 需求增强 - 完整设计变量系统（8 色配色、完整字体参数、圆角、阴影、间距） |

---

## 13. 实施记录

### 已完成工作（v1.1）

**后端任务:**
- ✅ 创建 `getStyleDesignTokens` Server Action - 从 `styles` 表获取设计变量

**前端组件:**
- ✅ 创建 `StylePreview` 主组件 - 固定尺寸、响应式布局
- ✅ 创建 `PreviewHeader` - 导航栏预览
- ✅ 创建 `PreviewSidebar` - 侧边栏预览
- ✅ 创建 `PreviewContent` - 内容区域（标题/正文/卡片/列表）
- ✅ 创建 `PreviewFooter` - 页脚预览
- ✅ 创建 CSS Modules 样式 - 固定布局、响应式、CSS Variables 映射
- ✅ 创建组件导出索引

**集成任务:**
- ✅ 集成到风格详情页 `/styles/[id]/page.tsx`

**构建验证:**
- ✅ `pnpm build` 成功 (17.6s)

### 已完成工作（v1.2 - 完整设计变量系统）

**类型定义更新:**
- ✅ ColorTokens: 6 色 → 8 色（新增 border, accent）
- ✅ FontTokens: 新增 headingWeight, bodyWeight, headingLineHeight, bodyLineHeight
- ✅ 新增 BorderRadiusTokens (small/medium/large)
- ✅ 新增 ShadowTokens (light/medium/heavy)

**Server Action 更新:**
- ✅ 读取所有设计变量字段
- ✅ 返回完整 DesignTokens 数据结构

**预览组件更新:**
- ✅ 注入 26 个 CSS Variables

**CSS 样式更新:**
- ✅ 替换所有 hardcoded 值为 CSS 变量

**构建验证:**
- ✅ `pnpm build` 成功 (17.2s)
- ✅ git 提交：8939889

### 已完成工作（v1.3 - 预览场景增强）

**Preview Content 增强:**
- ✅ 配色方案展示：主色/辅色/强调色应用场景（按钮、背景、文字、边框、链接）
- ✅ 字体系统展示：标题字体/正文/代码块，包含字重和行高信息
- ✅ 间距系统展示：5 档间距可视化对比（XS/SM/MD/LG/XL）
- ✅ 圆角效果展示：small/medium/large 圆角对比卡片
- ✅ 阴影效果展示：light/medium/heavy 阴影对比卡片

**CSS 样式新增:**
- ✅ 配色展示样式（colorDemo, colorGrid, colorSwatch）
- ✅ 间距展示样式（spacingDemo, spacingRow, spacingBox）
- ✅ 圆角展示样式（borderRadiusDemo, borderRadiusCard）
- ✅ 阴影展示样式（shadowDemo, shadowCard）
- ✅ 字体展示样式（typographyDemo, fontSection, codeBlock）

**构建验证:**
- ✅ `pnpm build` 成功 (9.1s)

### 待实施工作（v1.3 剩余）

**测试任务:**
- [ ] 创建 E2E 测试验证展示场景

**数据初始化:**
- [ ] 在 Supabase 云端执行迁移脚本 `0022_init_style_design_tokens.sql`

---

## 14. v2.0 增强：颜色模板系统

### 14.1 增强背景

**问题**: 4 个预设颜色模板的视觉区分度不够明显，用户难以直观感受不同模板的差异。

**根因**: 
1. Header 栏、侧栏、主体背景色在多个模板中使用相同颜色角色
2. 容器背景与容器内容背景没有形成对比
3. 缺乏视觉锚点，各模板特色不明显

### 14.2 v2.0 变更范围

**新增 6 个颜色映射维度**:

| 维度 | 说明 | 验收标准 |
|------|------|----------|
| headerBg | Header 栏背景色 | 4 个模板各不相同 |
| navBg | 导航栏背景色 | 形成层次区分 |
| sidebarBg | 侧栏背景色 | 与 Header 形成呼应或对比 |
| pageBg | 页面主背景色 | 保持统一或形成对比 |
| cardBg | 卡片背景色 | 与内容区形成对比 |
| cardContentBg | 卡片内容背景色 | 内凹或外凸效果 |

### 14.3 4 个模板的颜色分配

| 维度 | 经典商务 | 活力创意 | 极简主义 | 科技现代 |
|------|----------|----------|----------|----------|
| headerBg | Surface | **Secondary** | Background | **Primary** |
| navBg | Background | Surface | Background | Surface |
| sidebarBg | Surface | Background | Surface | Background |
| pageBg | Background | Background | Background | Background |
| cardBg | Surface | **Secondary** | Background | **Primary** |
| cardContentBg | Background | Surface | Surface | Surface |

### 14.4 设计原则

**原则 1: 三级背景层次**
- Header 栏、侧栏、主体背景不能同时一致
- 必须建立视觉层次

**原则 2: 容器 - 内容对比**
- 容器背景 ≠ 容器内容背景
- 形成内凹或外凸效果

**原则 3: 60-30-10 配色法则**
- 60% 背景色 (主背景)
- 30% 表面色 (卡片、侧栏)
- 10% 强调色 (按钮、装饰)

**原则 4: 视觉锚点**
- 每个模板需要一个显著的色彩区域
- 活力创意：Secondary 色的 Header 和卡片
- 科技现代：Primary 色的 Header 和卡片

### 14.5 技术实现

**CSS 变量新增 (6 个)**:
```css
--template-header-bg
--template-nav-bg
--template-sidebar-bg
--template-page-bg
--template-card-bg
--template-card-content-bg
```

**文件修改清单**:
| 文件 | 变更内容 |
|------|----------|
| `apps/web/lib/color-templates.ts` | 新增 6 个维度到 ColorMapping 接口和 4 个模板定义 |
| `apps/web/components/preview/style-preview/styles.module.css` | Header、侧栏、导航、卡片背景使用模板变量 |
| `apps/web/components/workspace/PreviewPanel.tsx` | 工作台预览同步更新 |

### 14.6 验收标准

**视觉差异验证**:
- [ ] 4 个模板的 Header 背景色可明显区分
- [ ] 4 个模板的卡片背景色可明显区分
- [ ] 4 个模板的侧栏与主体关系清晰
- [ ] 容器与内容区形成对比

**功能验证**:
- [ ] 模板切换后预览效果实时更新
- [ ] localStorage 持久化正常
- [ ] StylePreview 和 PreviewPanel 效果一致

### 14.7 相关文档

- `docs/main/P2_COLOR_TEMPLATE_PRD.md` - 产品需求文档
- `docs/main/P3_COLOR_TEMPLATE_V2_ENHANCEMENT.md` - 增强文档
- `docs/main/P2_COLOR_TEMPLATE_BROWSER_TEST.md` - 浏览器测试报告

---

## 15. 修订历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0 | 2026-04-04 | 初始版本 - Story Spec 创建 |
| 1.1 | 2026-04-04 | 实施完成 - 创建所有组件并集成到风格详情页，构建验证通过 |
| 1.2 | 2026-04-04 | 需求增强 - 完整设计变量系统（8 色配色、完整字体参数、圆角、阴影、间距） |
| 1.3 | 2026-04-04 | 预览场景增强 - 配色/字体/间距/圆角/阴影展示 |
| 2.0 | 2026-04-08 | 颜色模板 v2.0 - 新增 6 个区域背景色维度，增强 4 个模板视觉区分度 |
