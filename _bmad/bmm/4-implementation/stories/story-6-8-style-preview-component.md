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

- [ ] **任务 5**: 执行 SQL 脚本初始化现有风格数据
  - 文件：`scripts/init-style-design-tokens.sql`
  - 功能：为现有 styles 填充默认设计变量

### 5.4 测试任务

- [ ] **任务 6**: 创建 E2E 测试
  - 文件：`apps/web/tests/e2e/story-6-8-style-preview.spec.ts`
  - 功能：验证完整设计变量正确应用

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

### 待实施工作（v1.2 - 完整设计变量系统）

**后端任务:**
- [ ] 更新 `getStyleDesignTokens` 返回完整 tokens（8 色、完整字体、圆角、阴影）

**前端组件:**
- [ ] 更新 `StylePreview` CSS Variables 映射
- [ ] 更新 `styles.module.css` 添加所有缺失变量并替换 hardcoded 值

**数据初始化:**
- [ ] 执行 SQL 脚本填充现有风格数据

**文件列表**

**新增文件:**
- `apps/web/actions/styles/get-design-tokens.ts`
- `apps/web/components/preview/style-preview/index.tsx`
- `apps/web/components/preview/style-preview/preview-header.tsx`
- `apps/web/components/preview/style-preview/preview-sidebar.tsx`
- `apps/web/components/preview/style-preview/preview-content.tsx`
- `apps/web/components/preview/style-preview/preview-footer.tsx`
- `apps/web/components/preview/style-preview/styles.module.css`
- `apps/web/components/preview/style-preview/index.ts`

**修改文件:**
- `apps/web/app/styles/[id]/page.tsx`

**下一步:** 实施 v1.2 完整设计变量系统
