# Story 6.11: 代码生成与导出功能

> **Story ID:** 6.11  
> **Epic:** 6 - 高级功能与增强  
> **状态:** ready-for-dev  
> **创建日期:** 2026-04-07  
> **最后更新:** 2026-04-07  
> **来源:** Party Mode 讨论结果 + PRD.md v1.6

---

## 1. User Story

**As a** 在工作台完成设计的前端开发者，  
**I want** 一键导出生成的 HTML 和 CSS Modules 代码，  
**So that** 我可以在实际项目中复用这套设计系统。

---

## 2. Story Context & Background

### 2.1 业务背景

StyleSnap 的核心价值主张是"设计即可用"。用户在工作台完成设计后，需要：
1. 将设计变量转换为可用的代码
2. 下载包含完整设计系统的代码包
3. 快速集成到自己的项目中

### 2.2 需求来源

用户在完成设计后的典型工作流：
```
工作台设计 → 调整设计变量 → 预览效果满意 → 
点击"导出代码" → 预览生成的代码 → 
复制/下载 ZIP → 在项目中集成使用
```

### 2.3 与 Story 6.10 的关系

| 对比项 | Story 6.10 (提交审核) | Story 6.11 (代码导出) |
|--------|----------------------|----------------------|
| **目标** | 发布到 StyleSnap 平台 | 导出代码到本地使用 |
| **检查** | 完整性检查（必填项） | 无需检查，随时可导出 |
| **输出** | 数据库存储 | 客户端 ZIP 下载 |
| **场景** | 创作分享 | 个人项目开发 |

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 导出代码按钮

**Given** 用户在工作台编辑器中  
**When** 编辑器加载完成  
**Then** 系统显示"导出代码"按钮（与"保存草稿"、"提交审核"并列）  
**And** 按钮始终可用（无需设计完整性检查）

### 3.2 导出对话框

**Given** 用户点击"导出代码"按钮  
**When** 对话框打开  
**Then** 系统显示以下代码预览：
- CSS Variables 预览（styles.css）
- CSS Modules 预览（styles.module.css）
- HTML 模板预览（index.html）

**And** 显示 ZIP 包内容清单：
- `styles.css` - CSS Variables
- `styles.module.css` - CSS Modules
- `index.html` - HTML 模板示例
- `README.md` - 使用说明

### 3.3 代码预览与复制

**Given** 导出对话框已打开  
**When** 用户点击任意代码标签页  
**Then** 系统显示对应文件的完整代码  
**And** 提供"复制代码"按钮

**Given** 用户点击"复制代码"  
**When** 复制成功  
**Then** 系统显示"已复制到剪贴板"Toast  
**And** 按钮文字短暂变为"已复制"

### 3.4 ZIP 下载

**Given** 用户点击"下载 ZIP"按钮  
**When** 点击触发下载  
**Then** 系统生成 ZIP 文件  
**And** 文件名为 `stylesnap-export-[风格名]-[日期].zip`  
**And** 自动下载到用户本地

### 3.5 生成代码质量

**Given** 用户导出代码  
**When** 打开 ZIP 文件  
**Then** CSS Variables 包含所有设计变量：
- 8 色配色（primary, secondary, background, surface, text, textMuted, border, accent）
- 字体配置（heading, body, weight, lineHeight）
- 间距配置（xs, sm, md, lg, xl，基于 4px 基准）
- 圆角配置（small, medium, large）
- 阴影配置（light, medium, heavy）

**And** CSS Modules 包含实用组件样式：
- `.container` - 容器
- `.heading` / `.body` - 排版
- `.button` - 按钮
- `.card` - 卡片

**And** HTML 模板包含：
- Hero Section 示例
- Button 组件示例
- Card 组件示例
- 正确引用 CSS 文件

**And** README.md 包含：
- 文件说明
- 快速开始指南
- 集成方法

---

## 4. Technical Requirements

### 4.1 前端技术要求

| 要求项 | 规格 |
|--------|------|
| **框架** | Next.js 16+ App Router |
| **语言** | TypeScript 5+ (strict: true) |
| **样式** | Tailwind CSS + CSS Modules |
| **UI 组件** | Shadcn UI + Radix UI |
| **ZIP 生成** | `jszip` 库 |
| **文件下载** | `file-saver` 或原生 Blob URL |
| **代码高亮** | `prismjs` 或 `highlight.js` |

### 4.2 代码生成器架构

```
apps/web/lib/code-generators/
├── css-generator.ts      # CSS Variables + CSS Modules 生成
├── html-generator.ts     # HTML 模板生成
├── readme-generator.ts   # README.md 生成
├── zip-export.ts         # ZIP 打包和下载
└── index.ts              # 统一导出接口
```

### 4.3 生成器接口设计

```typescript
// lib/code-generators/css-generator.ts
import { DesignTokens } from '@/stores/workspace-store';

export interface GeneratedCSS {
  variables: string;    // CSS Variables (:root {...})
  modules: string;      // CSS Modules 组件样式
}

export function generateCSS(tokens: DesignTokens): GeneratedCSS {
  // 实现逻辑
}
```

```typescript
// lib/code-generators/html-generator.ts
import { DesignTokens } from '@/stores/workspace-store';

export interface GeneratedHTML {
  index: string;        // 完整 HTML 页面
  components: {         // 可选：独立组件
    hero: string;
    card: string;
    button: string;
  };
}

export function generateHTML(tokens: DesignTokens): GeneratedHTML {
  // 实现逻辑
}
```

```typescript
// lib/code-generators/zip-export.ts
export interface ZipExportOptions {
  styleName: string;
  tokens: DesignTokens;
}

export async function exportToZip(options: ZipExportOptions): Promise<void> {
  // 生成 ZIP 并下载
}
```

### 4.4 性能要求

| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| ZIP 生成时间 | < 1s | 客户端性能测试 |
| 代码预览渲染 | < 200ms | UI 响应时间 |
| 复制操作响应 | < 100ms | 交互反馈 |

---

## 5. Architecture Compliance

### 5.1 文件结构

```
apps/web/
├── lib/
│   └── code-generators/
│       ├── css-generator.ts       # CSS 生成器（新建）
│       ├── html-generator.ts      # HTML 生成器（新建）
│       ├── readme-generator.ts    # README 生成器（新建）
│       ├── zip-export.ts          # ZIP 导出工具（新建）
│       └── index.ts               # 统一导出（新建）
├── components/
│   └── workspace/
│       ├── CodeExportDialog.tsx   # 导出对话框组件（新建）
│       ├── CodePreview.tsx        # 代码预览组件（新建）
│       └── EditorPanel.tsx        # 集成导出按钮（修改）
└── actions/
    └── workspace/
        └── export-code.ts         # 导出 Server Action（可选，纯客户端可不做）
```

### 5.2 代码生成模板

#### CSS Variables 模板

```css
:root {
  /* ========================================
   * StyleSnap Design Tokens
   * Generated for: [风格名]
   * Export Date: [日期]
   * ======================================== */

  /* Colors - 8 Color Palette */
  --color-primary: #[hex];
  --color-secondary: #[hex];
  --color-background: #[hex];
  --color-surface: #[hex];
  --color-text: #[hex];
  --color-text-muted: #[hex];
  --color-border: #[hex];
  --color-accent: #[hex];

  /* Typography */
  --font-heading: [font-family];
  --font-body: [font-family];
  --font-heading-weight: [weight];
  --font-body-weight: [weight];
  --line-height-heading: [lineHeight];
  --line-height-body: [lineHeight];

  /* Spacing (4px base scale) */
  --spacing-xs: [value}px;    /* 4px */
  --spacing-sm: [value}px;    /* 8px */
  --spacing-md: [value}px;    /* 16px */
  --spacing-lg: [value}px;    /* 24px */
  --spacing-xl: [value}px;    /* 32px */

  /* Border Radius */
  --radius-small: [value];    /* 4px */
  --radius-medium: [value];   /* 8px */
  --radius-large: [value];    /* 16px */

  /* Shadows */
  --shadow-light: [value];
  --shadow-medium: [value];
  --shadow-heavy: [value];
}
```

#### CSS Modules 模板

```css
/* ========================================
 * StyleSnap CSS Modules
 * Generated for: [风格名]
 * ======================================== */

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
  background: var(--color-background);
}

/* Typography */
.heading {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  line-height: var(--line-height-heading);
  color: var(--color-text);
  margin: 0;
}

.heading-xl {
  font-size: clamp(2.5rem, 5vw, 4rem);
}

.heading-lg {
  font-size: clamp(2rem, 4vw, 3rem);
}

.heading-md {
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.body {
  font-family: var(--font-body);
  font-weight: var(--font-body-weight);
  line-height: var(--line-height-body);
  color: var(--color-text);
}

.body-lg {
  font-size: 1.25rem;
}

.body-md {
  font-size: 1rem;
}

.body-sm {
  font-size: 0.875rem;
}

/* Button */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-medium);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.button-primary {
  background: var(--color-primary);
  color: #FFFFFF;
}

.button-primary:hover {
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.button-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.button-secondary:hover {
  background: var(--color-primary);
  color: #FFFFFF;
}

/* Card */
.card {
  padding: var(--spacing-lg);
  background: var(--color-surface);
  border-radius: var(--radius-medium);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-light);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-medium);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.card-title {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  color: var(--color-text);
  margin: 0;
}

.card-description {
  font-family: var(--font-body);
  font-size: var(--font-body-size);
  color: var(--color-text-muted);
  line-height: var(--line-height-body);
}

/* Hero Section */
.hero {
  padding: var(--spacing-xl) 0;
  text-align: center;
  background: var(--color-background);
}

.hero-title {
  font-family: var(--font-heading);
  font-weight: var(--font-heading-weight);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: var(--line-height-heading);
  color: var(--color-text);
  margin-bottom: var(--spacing-md);
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 1.25rem;
  color: var(--color-text-muted);
  max-width: 600px;
  margin: 0 auto var(--spacing-lg);
  line-height: var(--line-height-body);
}

.hero-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}
```

#### HTML 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[风格名] - Generated by StyleSnap</title>
  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="styles.module.css">
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1 class="hero-title">欢迎来到 [风格名]</h1>
      <p class="hero-subtitle">这是一个使用 StyleSnap 生成的设计系统示例</p>
      <div class="hero-actions">
        <button class="button button-primary">开始使用</button>
        <button class="button button-secondary">了解更多</button>
      </div>
    </div>
  </section>

  <!-- Card Section -->
  <section class="container" style="padding-top: var(--spacing-xl); padding-bottom: var(--spacing-xl);">
    <div class="card">
      <div class="card-header">
        <span style="font-size: 2rem;">✨</span>
        <h2 class="card-title">卡片组件示例</h2>
      </div>
      <p class="card-description">
        这是一个使用 CSS Modules 构建的卡片组件，展示了设计变量的实际应用效果。
        所有颜色、间距、圆角和阴影都来自您的设计配置。
      </p>
    </div>
  </section>
</body>
</html>
```

#### README.md 模板

```markdown
# [风格名] Design System

> 由 StyleSnap 生成 | [生成日期]

这个设计系统包含完整的 CSS 变量配置和组件样式，可直接集成到您的项目中。

## 📦 文件说明

| 文件 | 说明 |
|------|------|
| `styles.css` | CSS Variables 定义（`:root {...}`） |
| `styles.module.css` | CSS Modules 组件样式 |
| `index.html` | 完整 HTML 示例页面 |
| `README.md` | 本说明文档 |

## 🚀 快速开始

### 方式一：直接使用（推荐）

1. 将 `styles.css` 和 `styles.module.css` 复制到你的项目中
2. 在 HTML 中引入：
   ```html
   <link rel="stylesheet" href="styles.css">
   <link rel="stylesheet" href="styles.module.css">
   ```
3. 使用组件类名：
   ```html
   <button class="button button-primary">按钮</button>
   <div class="card">
     <div class="card-header">
       <h2 class="card-title">标题</h2>
     </div>
     <p class="card-description">描述文字</p>
   </div>
   ```

### 方式二：CSS Modules（React/Vue）

1. 将 `styles.module.css` 重命名为 `DesignSystem.module.css`
2. 在组件中导入：
   ```tsx
   import styles from './DesignSystem.module.css';

   function MyComponent() {
     return (
       <div className={styles.card}>
         <h2 className={styles['card-title']}>标题</h2>
       </div>
     );
   }
   ```

### 方式三：Tailwind CSS 集成

如需将设计变量转换为 Tailwind 配置，参考以下主题扩展：

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        // ...
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        // ...
      },
    },
  },
};
```

## 🎨 设计变量

### 配色方案

| 变量 | 值 | 用途 |
|------|-----|------|
| `--color-primary` | #[hex] | 主色调、按钮、链接 |
| `--color-secondary` | #[hex] | 辅色、强调元素 |
| `--color-background` | #[hex] | 页面背景 |
| `--color-surface` | #[hex] | 卡片、面板背景 |
| `--color-text` | #[hex] | 主要文字 |
| `--color-text-muted` | #[hex] | 弱化文字 |
| `--color-border` | #[hex] | 边框、分割线 |
| `--color-accent` | #[hex] | 强调色（hover、焦点） |

### 排版系统

| 变量 | 值 | 用途 |
|------|-----|------|
| `--font-heading` | [font] | 标题字体 |
| `--font-body` | [font] | 正文字体 |
| `--font-heading-weight` | [weight] | 标题字重 |
| `--font-body-weight` | [weight] | 正文字重 |
| `--line-height-heading` | [value] | 标题行高 |
| `--line-height-body` | [value] | 正文行高 |

### 间距系统（基于 4px）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--spacing-xs` | 4px | 紧凑间距 |
| `--spacing-sm` | 8px | 小间距 |
| `--spacing-md` | 16px | 中间距 |
| `--spacing-lg` | 24px | 大间距 |
| `--spacing-xl` | 32px | 超大间距 |

## 📱 响应式支持

所有组件样式均为响应式设计，自动适配移动端和桌面端。

## 🔧 定制建议

如需修改设计变量，编辑 `styles.css` 中的 `:root {...}` 块即可。所有组件样式会自动继承新的变量值。

## 📄 License

本设计系统由 StyleSnap 生成，可自由用于商业和个人项目。

---

**Generated by [StyleSnap](https://stylesnap.dev)** - 前端开发者的设计系统生成工具
```

### 5.3 依赖管理

```json
{
  "dependencies": {
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7"
  }
}
```

---

## 6. Library/Framework Requirements

| 库 | 版本 | 用途 | 引入位置 |
|----|------|------|----------|
| `next` | 16+ | Next.js App Router | `components/workspace/*.tsx` |
| `react` | 19+ | React 框架 | 所有组件 |
| `zustand` | latest | 状态管理 | `stores/workspace-store.ts` |
| `jszip` | ^3.10.1 | ZIP 生成 | `lib/code-generators/zip-export.ts` |
| `file-saver` | ^2.0.5 | 文件下载 | `lib/code-generators/zip-export.ts` |
| `@radix-ui/react-dialog` | latest | 导出对话框 | `components/workspace/CodeExportDialog.tsx` |
| `lucide-react` | latest | 图标 | 所有组件 |
| `sonner` | latest | Toast 通知 | 操作反馈 |

---

## 7. File Structure Requirements

### 7.1 必须创建的文件

| 文件路径 | 说明 | 优先级 |
|----------|------|--------|
| `lib/code-generators/css-generator.ts` | CSS 生成器 | P0 |
| `lib/code-generators/html-generator.ts` | HTML 生成器 | P0 |
| `lib/code-generators/readme-generator.ts` | README 生成器 | P0 |
| `lib/code-generators/zip-export.ts` | ZIP 导出工具 | P0 |
| `lib/code-generators/index.ts` | 统一导出接口 | P0 |
| `components/workspace/CodeExportDialog.tsx` | 导出对话框 | P0 |
| `components/workspace/CodePreview.tsx` | 代码预览组件 | P0 |

### 7.2 必须修改的文件

| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `components/workspace/EditorPanel.tsx` | 添加"导出代码"按钮 | P0 |
| `package.json` | 添加 jszip、file-saver 依赖 | P0 |

---

## 8. Testing Requirements

### 8.1 单元测试（Vitest）

| 测试文件 | 测试内容 |
|----------|----------|
| `lib/code-generators/css-generator.test.ts` | CSS 生成逻辑、变量完整性 |
| `lib/code-generators/html-generator.test.ts` | HTML 生成逻辑 |
| `lib/code-generators/readme-generator.test.ts` | README 生成逻辑 |
| `lib/code-generators/zip-export.test.ts` | ZIP 生成和下载 |

### 8.2 组件测试（Vitest + Testing Library）

| 测试文件 | 测试场景 |
|----------|----------|
| `components/workspace/CodeExportDialog.test.tsx` | 对话框交互、代码复制 |
| `components/workspace/CodePreview.test.tsx` | 代码预览渲染 |

### 8.3 E2E 测试（Playwright）

| 测试文件 | 测试场景 |
|----------|----------|
| `tests/e2e/workspace-code-export.spec.ts` | 完整导出流程、ZIP 下载验证 |

---

## 9. Previous Story Intelligence

### 9.1 来自 Story 6.1 (实时预览编辑器)

**可复用的代码：**
- `lib/design-tokens.ts` - 设计变量工具函数
- `stores/preview-editor-store.ts` - 预览状态管理（参考模式）

### 9.2 来自 Story 6.9 (工作台编辑器)

**可复用的代码：**
- `stores/workspace-store.ts` - DesignTokens 接口定义
- `components/workspace/EditorPanel.tsx` - 集成导出按钮

### 9.3 来自 Story 6.10 (提交审核)

**可复用的代码：**
- `@radix-ui/react-dialog` - 对话框组件模式
- `sonner` - Toast 通知使用模式

---

## 10. Git Intelligence

### 代码模式观察

从现有代码中提取的模式：
- Server Action 返回格式：`{ success: boolean, data?: T, error?: string }`
- 组件命名：`PascalCase` + 描述性名称
- 状态管理：Zustand actions 模式

---

## 11. Security Considerations

### 11.1 客户端安全

- ZIP 生成在客户端完成，无需上传服务器
- 不涉及敏感数据传输
- 无需认证检查（所有用户均可导出）

### 11.2 代码安全

- 生成的代码不包含任何追踪代码或水印
- 用户可自由修改和分发

---

## 12. Developer Context

### 12.1 实现顺序建议

1. **Phase 1: 代码生成器核心**
   - 创建 `css-generator.ts`
   - 创建 `html-generator.ts`
   - 创建 `readme-generator.ts`
   - 创建 `zip-export.ts`
   - 编写单元测试

2. **Phase 2: UI 组件**
   - 创建 `CodeExportDialog.tsx`
   - 创建 `CodePreview.tsx`
   - 编写组件测试

3. **Phase 3: 集成到工作台**
   - 修改 `EditorPanel.tsx` 添加导出按钮
   - 集成对话框和预览组件
   - 手动测试完整流程

4. **Phase 4: 测试与优化**
   - E2E 测试
   - 性能优化（ZIP 生成速度）
   - 代码审查

### 12.2 关键实现细节

#### 导出流程

```typescript
// components/workspace/CodeExportDialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/code-block';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { generateCSS, generateHTML, generateREADME, exportToZip } from '@/lib/code-generators';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface CodeExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CodeExportDialog({ open, onOpenChange }: CodeExportDialogProps) {
  const { currentStyle, designTokens } = useWorkspaceStore();
  const [isGenerating, setIsGenerating] = useState(false);

  // 生成代码
  const css = generateCSS(designTokens);
  const html = generateHTML(designTokens);
  const readme = generateREADME({ 
    styleName: currentStyle?.name || 'My Design System',
    tokens: designTokens 
  });

  // 处理复制
  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success('已复制到剪贴板');
  };

  // 处理下载
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await exportToZip({
        styleName: currentStyle?.name || 'design-system',
        tokens: designTokens,
      });
      toast.success('ZIP 下载已开始');
    } catch (error) {
      toast.error('下载失败：' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>导出代码 - {currentStyle?.name || '设计系统'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="css-variables" className="flex-1 overflow-hidden flex flex-col">
          <TabsList>
            <TabsTrigger value="css-variables">CSS Variables</TabsTrigger>
            <TabsTrigger value="css-modules">CSS Modules</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="readme">README</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="css-variables">
              <CodeBlock code={css.variables} language="css" showLineNumbers />
            </TabsContent>
            <TabsContent value="css-modules">
              <CodeBlock code={css.modules} language="css" showLineNumbers />
            </TabsContent>
            <TabsContent value="html">
              <CodeBlock code={html.index} language="html" showLineNumbers />
            </TabsContent>
            <TabsContent value="readme">
              <CodeBlock code={readme} language="markdown" showLineNumbers />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-between gap-4 mt-6">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            复制当前代码
          </Button>
          <Button onClick={handleDownload} disabled={isGenerating}>
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? '生成中...' : '下载 ZIP'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### ZIP 导出实现

```typescript
// lib/code-generators/zip-export.ts
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DesignTokens } from '@/stores/workspace-store';
import { generateCSS } from './css-generator';
import { generateHTML } from './html-generator';
import { generateREADME } from './readme-generator';

export interface ZipExportOptions {
  styleName: string;
  tokens: DesignTokens;
}

export async function exportToZip(options: ZipExportOptions): Promise<void> {
  const zip = new JSZip();
  const { styleName, tokens } = options;

  // 生成所有文件内容
  const css = generateCSS(tokens);
  const html = generateHTML(tokens);
  const readme = generateREADME({ styleName, tokens });

  // 添加到 ZIP
  zip.file('styles.css', css.variables);
  zip.file('styles.module.css', css.modules);
  zip.file('index.html', html.index);
  zip.file('README.md', readme);

  // 生成并下载
  const blob = await zip.generateAsync({ type: 'blob' });
  const timestamp = new Date().toISOString().split('T')[0];
  const safeName = styleName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const filename = `stylesnap-export-${safeName}-${timestamp}.zip`;

  saveAs(blob, filename);
}
```

### 12.3 已知依赖

- 依赖 Story 6.9 的工作台编辑器（DesignTokens 数据来源）
- 需要 `jszip` 和 `file-saver` 库支持

---

## 13. Open Questions

以下问题需要在实现前或实现中明确：

1. **代码高亮库选择**：使用项目已有的 `CodeBlock` 组件还是需要额外引入 Prism.js？
2. **对话框大小**：代码预览需要较大空间，是否需要自定义 Dialog 尺寸？
3. **多组件支持**：是否需要生成更多组件（如 Navigation、Footer 等）？MVP 阶段建议只做 Hero + Card + Button

---

## 14. Acceptance Checklist

实现完成后，请对照以下清单验证：

- [ ] CSS Variables 生成正确（8 色 + 字体 + 间距 + 圆角 + 阴影）
- [ ] CSS Modules 生成正确（container + heading + body + button + card + hero）
- [ ] HTML 模板生成正确（Hero Section + Card 示例）
- [ ] README.md 生成正确（包含完整使用说明）
- [ ] ZIP 下载功能正常
- [ ] ZIP 文件名格式正确（stylesnap-export-[name]-[date].zip）
- [ ] 代码复制功能正常
- [ ] Toast 通知反馈正确
- [ ] 导出对话框 UI 美观
- [ ] 代码预览支持语法高亮
- [ ] 单元测试通过
- [ ] E2E 测试通过

---

## 15. Story Completion Status

**状态:** ready-for-dev  
**完成日期:** 2026-04-07  
**完成说明:** Ultimate context engine analysis completed - comprehensive developer guide created

---

## 16. Implementation Notes

### 16.1 代码生成器设计原则

1. **纯函数**：所有生成器都是纯函数，输入 DesignTokens，输出字符串
2. **可测试**：每个生成器都可独立测试
3. **可扩展**：未来可轻松添加新的生成器（如 Tailwind config、React 组件）

### 16.2 未来扩展方向

| 扩展 | 说明 | 优先级 |
|------|------|--------|
| Tailwind config 生成 | 生成 `tailwind.config.js` | P1 |
| React 组件生成 | 生成 Typed React 组件 | P1 |
| Vue 组件生成 | 生成 Vue 3 SFC | P2 |
| Figma 插件 | 导出到 Figma | P2 |
| Storybook 生成 | 生成 Storybook 配置 | P2 |
