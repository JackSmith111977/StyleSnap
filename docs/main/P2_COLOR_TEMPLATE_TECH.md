# 颜色搭配模板系统 - 技术方案

**文档版本：** 1.0  
**创建日期：** 2026-04-08  
**作者：** Winston (bmad-agent-architect)  
**关联 PRD：** `docs/main/P2_COLOR_TEMPLATE_PRD.md`

---

## 1. 技术架构概述

### 1.1 架构原则

| 原则 | 说明 |
|------|------|
| **最小改动** | 现有组件代码尽量不动，通过 CSS 变量层实现 |
| **职责分离** | 模板逻辑独立 Store，不与现有 Store 耦合 |
| **双端一致** | StylePreview 和 PreviewPanel 共享映射逻辑 |
| **渐进增强** | 无模板时降级为默认行为 |

### 1.2 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      用户界面层                              │
│  ┌─────────────────┐           ┌─────────────────────────┐ │
│  │ CanvasPreview   │           │ PreviewHeader           │ │
│  │ (工具栏 UI)      │           │ (模板选择器)             │ │
│  └────────┬────────┘           └────────────┬────────────┘ │
│           │                                  │              │
└───────────┼──────────────────────────────────┼──────────────┘
            │                                  │
┌───────────┼──────────────────────────────────┼──────────────┐
│           ▼                                  ▼              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ColorTemplateStore (Zustand)               ││
│  │  - currentTemplateId                                    ││
│  │  - customMapping                                        ││
│  │  - getCurrentMapping()                                  ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              颜色映射层 (Color Mapping Layer)            ││
│  │  applyColorTemplate(mapping, tokens) → CSS Variables    ││
│  └────────────────────────┬────────────────────────────────┘│
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────┐
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              预览组件层 (Preview Components)             ││
│  │  ┌───────────────────┐     ┌─────────────────────────┐  ││
│  │  │ StylePreview      │     │ PreviewPanel            │  ││
│  │  │ (详情页)           │     │ (工作台)                 │  ││
│  │  │ - 使用 template CSS  │     │ - 使用 template CSS       │  ││
│  │  └───────────────────┘     └─────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 文件结构

### 2.1 新增文件

```
apps/web/
├── lib/
│   └── color-templates.ts          # 模板定义和工具函数
├── stores/
│   └── color-template-store.ts     # 模板状态管理
├── components/
│   └── workspace/
│       └── ColorTemplateSelector.tsx  # 模板选择器 UI 组件
│   └── preview/
│       └── style-preview/
│           └── ColorTemplateSelector.tsx  # (复用或独立实现)
```

### 2.2 修改文件

| 文件 | 修改内容 |
|------|----------|
| `apps/web/components/workspace/CanvasPreview.tsx` | 新增模板选择器 UI |
| `apps/web/components/workspace/PreviewPanel.tsx` | 应用模板 CSS 变量 |
| `apps/web/components/preview/style-preview/index.tsx` | 应用模板 CSS 变量 |
| `apps/web/components/preview/style-preview/styles.module.css` | 使用模板 CSS 变量 |

---

## 3. 详细实现方案

### 3.1 模板定义 (`lib/color-templates.ts`)

```typescript
/**
 * 颜色角色类型
 */
export type ColorRole = 'primary' | 'secondary' | 'accent' | 'text' | 'textMuted';

/**
 * 颜色映射接口 - 定义每个 UI 元素使用的颜色角色
 */
export interface ColorMapping {
  titleColor: ColorRole;
  primaryButtonBg: ColorRole;
  secondaryButtonBg: ColorRole;
  cardHeaderBg: ColorRole;
  cardBg: ColorRole;
  linkColor: ColorRole;
  borderAccent: ColorRole;
  listItemMarker: ColorRole;
  inputFocusRing: ColorRole;
  badgeBg: ColorRole;
}

/**
 * 颜色模板接口
 */
export interface ColorTemplate {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  mappings: ColorMapping;
}

/**
 * 4 个预设模板
 */
export const COLOR_TEMPLATES: ColorTemplate[] = [
  {
    id: 'classic-business',
    name: '经典商务',
    nameEn: 'Classic Business',
    description: '专业、稳重的商务风格',
    mappings: {
      titleColor: 'primary',
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'secondary',
      cardHeaderBg: 'background',
      cardBg: 'background',
      linkColor: 'primary',
      borderAccent: 'primary',
      listItemMarker: 'secondary',
      inputFocusRing: 'secondary',
      badgeBg: 'secondary',
    },
  },
  {
    id: 'vibrant-creative',
    name: '活力创意',
    nameEn: 'Vibrant Creative',
    description: '活泼、有创意的视觉风格',
    mappings: {
      titleColor: 'primary',
      primaryButtonBg: 'secondary',
      secondaryButtonBg: 'accent',
      cardHeaderBg: 'secondary',
      cardBg: 'background',
      linkColor: 'accent',
      borderAccent: 'accent',
      listItemMarker: 'primary',
      inputFocusRing: 'primary',
      badgeBg: 'primary',
    },
  },
  {
    id: 'minimalist',
    name: '极简主义',
    nameEn: 'Minimalist',
    description: '简洁、克制的极简美学',
    mappings: {
      titleColor: 'text',
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'secondary',
      cardHeaderBg: 'background',
      cardBg: 'background',
      linkColor: 'primary',
      borderAccent: 'muted',
      listItemMarker: 'muted',
      inputFocusRing: 'primary',
      badgeBg: 'muted',
    },
  },
  {
    id: 'tech-modern',
    name: '科技现代',
    nameEn: 'Tech Modern',
    description: '现代科技感的视觉风格',
    mappings: {
      titleColor: 'primary',
      primaryButtonBg: 'primary',
      secondaryButtonBg: 'background',
      cardHeaderBg: 'primary',
      cardBg: 'background',
      linkColor: 'accent',
      borderAccent: 'secondary',
      listItemMarker: 'accent',
      inputFocusRing: 'accent',
      badgeBg: 'primary',
    },
  },
];

/**
 * 默认映射（无模板时的行为）
 */
export const DEFAULT_MAPPING: ColorMapping = {
  titleColor: 'text',
  primaryButtonBg: 'primary',
  secondaryButtonBg: 'secondary',
  cardHeaderBg: 'background',
  cardBg: 'background',
  linkColor: 'primary',
  borderAccent: 'primary',
  listItemMarker: 'primary',
  inputFocusRing: 'primary',
  badgeBg: 'primary',
};

/**
 * 获取模板映射
 */
export function getTemplateMapping(templateId: string | null): ColorMapping {
  if (!templateId) return DEFAULT_MAPPING;
  const template = COLOR_TEMPLATES.find((t) => t.id === templateId);
  return template?.mappings ?? DEFAULT_MAPPING;
}

/**
 * 根据映射和 tokens 生成 CSS 变量（简化版 - 移除 cardBg）
 */
export function applyColorTemplate(
  mapping: ColorMapping,
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textMuted: string;
    background: string;
    surface: string;
    border: string;
  }
): React.CSSProperties {
  const colorMap: Record<ColorRole, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    text: colors.text,
    textMuted: colors.textMuted,
  };

  return {
    '--template-title-color': colorMap[mapping.titleColor],
    '--template-button-bg': colorMap[mapping.primaryButtonBg],
    '--template-secondary-button-bg': colorMap[mapping.secondaryButtonBg],
    '--template-card-header-bg': colorMap[mapping.cardHeaderBg],
    '--template-link-color': colorMap[mapping.linkColor],
    '--template-border-accent': colorMap[mapping.borderAccent],
    '--template-list-marker': colorMap[mapping.listItemMarker],
    '--template-input-focus': colorMap[mapping.inputFocusRing],
    '--template-badge-bg': colorMap[mapping.badgeBg],
  } as React.CSSProperties;
}
```

---

### 3.2 Store 实现 (`stores/color-template-store.ts`)

```typescript
/**
 * Color Template Store - 颜色搭配模板状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ColorMapping, DEFAULT_MAPPING } from '@/lib/color-templates';

const STORAGE_KEY = 'stylesnap_color_template';

interface ColorTemplateState {
  // 当前选中的模板 ID
  currentTemplateId: string | null;
  // 自定义映射（覆盖模板）
  customMapping: ColorMapping | null;
  
  // Actions
  setCurrentTemplate: (templateId: string) => void;
  setCustomMapping: (mapping: Partial<ColorMapping>) => void;
  resetToTemplate: () => void;
  getCurrentMapping: () => ColorMapping;
  clearCustomMapping: () => void;
}

export const useColorTemplateStore = create<ColorTemplateState>()(
  persist(
    (set, get) => ({
      currentTemplateId: null,
      customMapping: null,

      setCurrentTemplate: (templateId: string) => {
        set({ currentTemplateId: templateId, customMapping: null });
      },

      setCustomMapping: (mapping: Partial<ColorMapping>) => {
        set((state) => ({
          customMapping: state.customMapping
            ? { ...state.customMapping, ...mapping }
            : { ...DEFAULT_MAPPING, ...mapping },
        }));
      },

      resetToTemplate: () => {
        set({ customMapping: null });
      },

      getCurrentMapping: () => {
        const { currentTemplateId, customMapping } = get();
        if (customMapping) return customMapping;
        return getTemplateMapping(currentTemplateId);
      },

      clearCustomMapping: () => {
        set({ customMapping: null });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currentTemplateId: state.currentTemplateId,
      }),
    }
  )
);
```

---

### 3.3 模板选择器 UI (`components/workspace/ColorTemplateSelector.tsx`)

```typescript
'use client';

import React from 'react';
import { Check, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { COLOR_TEMPLATES } from '@/lib/color-templates';
import { useColorTemplateStore } from '@/stores/color-template-store';
import { cn } from '@/lib/utils';

export function ColorTemplateSelector() {
  const { currentTemplateId, setCurrentTemplate } = useColorTemplateStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Palette className="h-4 w-4" />
          <span>搭配：{currentTemplateId ? getColorTemplateName(currentTemplateId) : '默认'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>🎨 颜色搭配模板</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {COLOR_TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => setCurrentTemplate(template.id)}
            className="flex items-start gap-3 py-3 cursor-pointer"
          >
            <Check
              className={cn(
                'h-4 w-4 mt-0.5 shrink-0',
                currentTemplateId === template.id ? 'opacity-100' : 'opacity-0'
              )}
            />
            <div className="flex-1">
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-muted-foreground">{template.description}</div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-primary">
          ✨ 自定义模板（开发中）
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getColorTemplateName(templateId: string): string {
  return COLOR_TEMPLATES.find((t) => t.id === templateId)?.name ?? '默认';
}
```

---

### 3.4 PreviewPanel 集成

```typescript
// apps/web/components/workspace/PreviewPanel.tsx

import { useColorTemplateStore } from '@/stores/color-template-store';
import { applyColorTemplate, getTemplateMapping } from '@/lib/color-templates';

export function PreviewPanel({ designTokens, className }: PreviewPanelProps) {
  const { getCurrentMapping } = useColorTemplateStore();
  const mapping = getCurrentMapping();
  
  // 生成基础 CSS 变量
  const cssVariables: React.CSSProperties = {
    // ...现有代码
  };
  
  // 生成模板 CSS 变量
  const templateVariables = applyColorTemplate(mapping, designTokens.colorPalette);
  
  // 合并
  const allVariables = { ...cssVariables, ...templateVariables };

  return (
    <div
      className="..."
      style={allVariables}
    >
      {/* 内容使用 template CSS 变量 */}
    </div>
  );
}
```

---

### 3.5 StylePreview 集成

```typescript
// apps/web/components/preview/style-preview/index.tsx

import { useColorTemplateStore } from '@/stores/color-template-store';
import { applyColorTemplate } from '@/lib/color-templates';

export function StylePreview({ tokens, designTokens, className }: StylePreviewProps) {
  const { getCurrentMapping } = useColorTemplateStore();
  const mapping = getCurrentMapping();
  const normalizedTokens = normalizeTokens(tokens || designTokens);
  
  // 生成模板 CSS 变量
  const templateVariables = applyColorTemplate(
    mapping,
    normalizedTokens.colors
  );

  return (
    <div
      className={`${styles.previewContainer} ${className || ''}`}
      style={{ ...previewStyles, ...templateVariables }}
      data-preview-container
    >
      {/* ... */}
    </div>
  );
}
```

---

### 3.6 CSS 修改 (`styles.module.css`)

```css
/* 标题颜色 - 使用模板变量 */
.heading1,
.heading2,
.heading3 {
  color: var(--template-title-color, var(--preview-text));
}

/* 主按钮背景 - 使用模板变量 */
.cardButton {
  background-color: var(--template-button-bg, var(--preview-primary));
}

/* 次按钮背景 - 使用模板变量 */
.cardButtonSecondary {
  background-color: var(--template-secondary-button-bg, var(--preview-secondary));
}

/* 卡片头部背景 - 使用模板变量 */
.cardHeader {
  background-color: var(--template-card-header-bg, var(--preview-background));
}

/* 链接颜色 - 使用模板变量 */
.navLink,
.accentLink {
  color: var(--template-link-color, var(--preview-primary));
}

/* 列表项标记 - 使用模板变量 */
.listItem::before {
  color: var(--template-list-marker, var(--preview-primary));
}

/* 徽章背景 - 使用模板变量 */
.tag {
  background-color: var(--template-badge-bg, var(--preview-primary));
}
```

---

## 4. 实施计划

### 4.1 Story 拆分

| Story | 内容 | 预计工时 |
|-------|------|----------|
| S1 | 模板定义和工具函数 | 2h |
| S2 | ColorTemplateStore 实现 | 2h |
| S3 | ColorTemplateSelector UI 组件 | 3h |
| S4 | CanvasPreview 集成 | 1h |
| S5 | PreviewPanel 模板集成 | 3h |
| S6 | StylePreview 模板集成 | 3h |
| S7 | CSS 变量应用和测试 | 2h |
| S8 | E2E 测试 | 2h |

### 4.2 依赖顺序

```
S1 → S2 → S3 → S4
         ↓
         S5 → S7 → S8
         ↓
         S6 → S7 → S8
```

---

## 5. 测试策略

### 5.1 单元测试

- [ ] `getTemplateMapping` 函数测试
- [ ] `applyColorTemplate` 函数测试
- [ ] Store actions 测试

### 5.2 集成测试

- [ ] 模板切换后 CSS 变量正确更新
- [ ] localStorage 持久化生效
- [ ] StylePreview 和 PreviewPanel 效果一致

### 5.3 E2E 测试

- [ ] 切换模板后预览实时更新
- [ ] 刷新页面后模板保持
- [ ] 4 个模板都能正确应用

---

## 6. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| CSS 变量名冲突 | 中 | 使用 `--template-` 前缀隔离 |
| 双端效果不一致 | 中 | 共享 `applyColorTemplate` 函数 |
| 性能问题 | 低 | CSS 变量更新无需 re-render |

---

## 7. 附录

### 7.1 参考资源

- Zustand 文档：https://zustand-demo.pmnd.rs/
- Zustand persist middleware: https://github.com/pmndrs/zustand#persist-middleware
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
