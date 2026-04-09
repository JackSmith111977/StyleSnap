# 颜色搭配模板系统 - PRD

**文档版本：** 1.0  
**创建日期：** 2026-04-08  
**状态：** 待实施  
**Epic：** 颜色系统增强 - 搭配模板

---

## 1. 产品概述

### 1.1 产品定位

颜色搭配模板系统帮助用户快速应用预设的颜色使用方案，让用户直观看到主色、辅色、强调色在不同 UI 组件上的搭配效果，无需手动调整每个元素的颜色分配。

### 1.2 目标用户

- **前端开发者**：快速选择适合的配色方案应用于项目
- **设计师**：预览不同颜色分配策略的视觉效果
- **初学者**：学习专业的颜色搭配原则

### 1.3 核心价值

| 价值 | 描述 |
|------|------|
| **效率提升** | 一键切换多种颜色搭配方案，无需手动调整 |
| **视觉参考** | 直观展示主色/辅色在不同位置的实际效果 |
| **学习价值** | 通过预设模板学习专业的颜色分配原则 |

---

## 2. 功能需求

### 2.1 功能列表

| ID | 功能 | 优先级 | 描述 |
|----|------|--------|------|
| F1 | 4 个预设模板 | P0 | 经典商务、活力创意、极简主义、科技现代 |
| F2 | 模板切换器 UI | P0 | 画布顶部工具栏下拉列表 |
| F3 | 模板持久化 | P0 | localStorage 保存用户选择 |
| F4 | StylePreview 集成 | P0 | 详情页预览应用模板 |
| F5 | PreviewPanel 集成 | P0 | 工作台预览应用模板 |
| F6 | 自定义模板表单 | P1 | 用户自定义颜色分配规则 |
| F7 | 主色→辅色推荐 | P2 | 根据主色智能推荐辅色 |

### 2.2 预设模板定义

#### 颜色映射维度总览

**v1.0 (当前)** - 10 个维度：
- 标题文字、主按钮背景、次按钮背景、卡片头部背景、链接颜色、边框装饰色、列表项标记、输入框焦点环、徽章背景

**v2.0 Phase 1 (新增)** - 15 个维度：
- **Header 栏背景色** - 顶部导航栏/页头背景
- **导航栏背景色** - 导航链接区域背景
- **侧栏背景色** - 侧边导航栏背景
- **页面背景色** - 整个页面的主背景
- **卡片背景色** - 卡片组件的背景（与内容区域区分）
- **卡片内容背景色** - 卡片内容区域的背景

**v2.0 Phase 2 (后续)** - 17 个维度：
- **卡片阴影强度** - 卡片悬浮效果的阴影强度
- **悬浮位移效果** - 卡片悬浮时的位移变换

---

#### 模板 1：经典商务 (Classic Business)

**定位：** 专业、稳重的商务风格

**适用场景：** 企业官网、SaaS 后台、政府/金融机构网站

**颜色分配规则：**

| UI 元素 | 颜色角色 | 说明 |
|---------|----------|------|
| 标题文字 | Primary | 主色用于大标题，建立品牌识别 |
| 主按钮背景 | Primary | 主色用于 CTA 按钮 |
| 次按钮背景 | Secondary | 辅色用于次要操作 |
| 卡片头部背景 | Background | 保持简洁 |
| 卡片内容背景 | Background | 保持简洁 |
| 链接颜色 | Primary | 主色用于可点击链接 |
| 边框装饰色 | Primary | 主色用于强调边框 |
| 列表项标记 | Secondary | 辅色用于列表标记 • |
| 输入框焦点环 | Secondary | 辅色用于焦点状态 |
| 徽章背景 | Secondary | 辅色用于标签/徽章 |
| **Header 栏背景** | Surface | 表面色用于页头，专业稳重 |
| **导航栏背景** | Background | 保持简洁，突出内容 |
| **侧栏背景** | Surface | 表面色用于侧栏，与页头呼应 |
| **页面背景** | Background | 主背景色 |
| **卡片背景** | Surface | 表面色用于卡片，与内容区区分 |
| **卡片内容背景** | Background | 主背景色用于内容区，与卡片背景形成对比 |


---

#### 模板 2：活力创意 (Vibrant Creative)

**定位：** 活泼、有创意的视觉风格

**适用场景：** 创意机构、个人作品集、娱乐/社交类产品

**颜色分配规则：**

| UI 元素 | 颜色角色 | 说明 |
|---------|----------|------|
| 标题文字 | Primary | 主色用于大标题 |
| 主按钮背景 | Secondary | 辅色用于主按钮，制造惊喜 |
| 次按钮背景 | Accent | 强调色用于次要操作 |
| 卡片头部背景 | Secondary | 辅色用于卡片头部 |
| 卡片内容背景 | Background | 保持简洁 |
| 链接颜色 | Accent | 强调色用于链接 |
| 边框装饰色 | Accent | 强调色用于装饰 |
| 列表项标记 | Primary | 主色用于列表标记 |
| 输入框焦点环 | Primary | 主色用于焦点状态 |
| 徽章背景 | Primary | 主色用于标签/徽章 |
| **Header 栏背景** | Secondary | 辅色用于页头，活泼醒目 |
| **导航栏背景** | Surface | 表面色用于导航区域 |
| **侧栏背景** | Background | 主背景色用于侧栏，保持简洁 |
| **页面背景** | Background | 主背景色 |
| **卡片背景** | Secondary | 辅色用于卡片，与内容区形成对比 |
| **卡片内容背景** | Surface | 表面色用于内容区，与卡片背景形成层次 |

---

#### 模板 3：极简主义 (Minimalist)

**定位：** 简洁、克制的极简美学

**适用场景：** 博客、新闻网站、高端品牌展示页

**颜色分配规则：**

| UI 元素 | 颜色角色 | 说明 |
|---------|----------|------|
| 标题文字 | Text | 文字色用于标题，极简克制 |
| 主按钮背景 | Primary | 仅主按钮使用主色 |
| 次按钮背景 | Secondary | 辅色用于次要操作 |
| 卡片头部背景 | Background | 保持简洁 |
| 卡片内容背景 | Background | 保持简洁 |
| 链接颜色 | Primary | 主色用于链接 |
| 边框装饰色 | TextMuted | 弱化色用于边框 |
| 列表项标记 | TextMuted | 弱化色用于列表标记 |
| 输入框焦点环 | Primary | 主色用于焦点 |
| 徽章背景 | TextMuted | 弱化色用于徽章 |
| **Header 栏背景** | Background | 保持简洁，无额外色彩 |
| **导航栏背景** | Background | 保持简洁 |
| **侧栏背景** | Surface | 表面色用于侧栏，微弱的层次感 |
| **页面背景** | Background | 主背景色 |
| **卡片背景** | Background | 主背景色，保持简洁 |
| **卡片内容背景** | Surface | 表面色用于内容区，与卡片背景形成内凹效果 |

---

#### 模板 4：科技现代 (Tech Modern)

**定位：** 现代科技感的视觉风格

**适用场景：** 科技公司、AI 产品、开发者工具、初创企业

**颜色分配规则：**

| UI 元素 | 颜色角色 | 说明 |
|---------|----------|------|
| 标题文字 | Primary | 主色用于大标题 |
| 主按钮背景 | Primary | 主色用于 CTA 按钮 |
| 次按钮背景 | Background | 次按钮使用边框样式 |
| 卡片头部背景 | Primary | 主色用于卡片头部 |
| 卡片内容背景 | Surface | 表面色用于卡片内容区 |
| 链接颜色 | Accent | 强调色用于链接 |
| 边框装饰色 | Secondary | 辅色用于装饰边框 |
| 列表项标记 | Accent | 强调色用于列表标记 |
| 输入框焦点环 | Accent | 强调色用于焦点 |
| 徽章背景 | Primary | 主色用于标签/徽章 |
| **Header 栏背景** | Primary | 主色用于页头，科技感强 |
| **导航栏背景** | Surface | 表面色用于导航，层次分明 |
| **页面背景** | Background | 主背景色 |
| **卡片背景** | Surface | 表面色用于卡片，与头部区分 |

---

### 2.3 模板切换器 UI 规格

**位置：** 画布顶部工具栏右侧

**交互形式：** 下拉列表

**UI 原型：**
```
┌─────────────────────────────────────────────────┐
│ [缩放控制]  [画布尺寸]    🎨 搭配：[经典商务 ▼] │
└─────────────────────────────────────────────────┘
                        ↓ 点击展开
┌─────────────────────────────────────────────────┐
│ 🎨 颜色搭配模板                                 │
│ ─────────────────────────────────────────────   │
│ ● 经典商务                                      │
│   专业、稳重的商务风格                          │
│ ○ 活力创意                                      │
│   活泼、有创意的视觉风格                        │
│ ○ 极简主义                                      │
│   简洁、克制的极简美学                          │
│ ○ 科技现代                                      │
│   现代科技感的视觉风格                          │
│ ─────────────────────────────────────────────   │
│ [✨ 自定义模板...]                              │
└─────────────────────────────────────────────────┘
```

**状态说明：**
- 选中态：当前模板前有 ● 标记
- Hover 态：背景色高亮
- 禁用态：无（所有模板始终可用）

---

### 2.4 持久化需求

| 存储类型 | Key | 值 | 说明 | 阶段 |
|----------|-----|-----|------|------|
| localStorage | `stylesnap_color_template` | 模板 ID | 用户上次选择的模板 | P0 |
| 服务端 | `style.color_template_id` | 模板 ID | 风格保存时同步存储 | P1（后续） |

**说明：** 第一阶段仅实现 localStorage 持久化，服务端持久化延后到 P1 自定义模板功能一起实现。

---

## 3. 技术规格

### 3.1 数据结构

```typescript
// 颜色角色类型
export type ColorRole = 'primary' | 'secondary' | 'accent' | 'text' | 'textMuted';
export type BackgroundRole = 'background' | 'surface';

// 颜色映射接口 (v2.0 - 14 个维度)
export interface ColorMapping {
  // 文字颜色
  titleColor: ColorRole | 'text';           // 标题颜色
  
  // 按钮背景
  primaryButtonBg: ColorRole | BackgroundRole;      // 主按钮背景
  secondaryButtonBg: ColorRole | BackgroundRole;    // 次按钮背景
  
  // 卡片颜色
  cardHeaderBg: BackgroundRole | ColorRole;         // 卡片头部背景
  cardBg: BackgroundRole | ColorRole;               // 卡片内容背景
  
  // 链接和装饰
  linkColor: ColorRole;            // 链接颜色
  borderAccent: ColorRole | 'textMuted' | BackgroundRole;  // 边框装饰色
  listItemMarker: ColorRole | 'textMuted';       // 列表项标记色
  inputFocusRing: ColorRole;       // 输入框焦点色
  badgeBg: ColorRole | BackgroundRole | 'textMuted';  // 徽章背景
  
  // v2.0 新增：区域背景色
  headerBg: BackgroundRole;        // Header 栏背景（顶部页头）
  navBg: BackgroundRole;           // 导航栏背景（导航链接区域）
  pageBg: BackgroundRole;          // 页面主背景
}

// 颜色模板接口
export interface ColorTemplate {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
  mappings: ColorMapping;
}
```

### 3.2 CSS 变量映射

模板切换时生成以下 CSS 变量：

**v1.0 (已有):**
```css
--template-title-color: var(--preview-primary);
--template-button-bg: var(--preview-secondary);
--template-card-header-bg: var(--preview-background);
--template-card-bg: var(--preview-background);
--template-link-color: var(--preview-accent);
--template-border-accent: var(--preview-secondary);
--template-list-marker: var(--preview-primary);
--template-input-focus: var(--preview-accent);
--template-badge-bg: var(--preview-primary);
```

**v2.0 (新增):**
```css
--template-header-bg: var(--preview-surface);      /* Header 栏背景 */
--template-nav-bg: var(--preview-background);      /* 导航栏背景 */
--template-page-bg: var(--preview-background);     /* 页面主背景 */
```

### 3.3 Store 接口

```typescript
interface ColorTemplateState {
  currentTemplateId: string | null;
  customMapping: ColorMapping | null;
  setCurrentTemplate: (templateId: string) => void;
  setCustomMapping: (mapping: Partial<ColorMapping>) => void;
  resetToTemplate: () => void;
  getCurrentMapping: () => ColorMapping;
}
```

---

## 4. 验收标准

### 4.1 功能验收

- [ ] 4 个预设模板可正常切换
- [ ] 切换后预览效果实时更新
- [ ] localStorage 持久化生效
- [ ] StylePreview 和 PreviewPanel 效果一致
- [ ] 自定义模板入口可跳转（P1 实现）

### 4.2 性能验收

- [ ] 模板切换无卡顿（<100ms）
- [ ] 页面加载时模板恢复 <50ms

### 4.3 兼容性验收

- [ ] Chrome 最新版的正常显示
- [ ] Firefox 最新版的正常显示
- [ ] Safari 最新版的正常显示

---

## 5. 依赖关系

### 5.1 上游依赖

- 颜色系统 8 色色板（已完成）
- 预览组件 CSS 变量系统（已完成）

### 5.2 下游依赖

- 自定义模板表单（P1）
- 智能颜色推荐（P2）

---

## 6. 附录

### 6.1 术语表

| 术语 | 定义 |
|------|------|
| Primary | 主色，品牌主色调 |
| Secondary | 辅色，辅助配色 |
| Accent | 强调色，用于 hover、焦点等 |
| Color Mapping | 颜色映射，定义 UI 元素使用哪个颜色角色 |

### 6.2 参考文档

- `apps/web/stores/workspace-store.ts` - 工作台 Store
- `apps/web/stores/preview-editor-store.ts` - 预览编辑器 Store
- `apps/web/types/design-tokens.ts` - 设计变量类型定义
