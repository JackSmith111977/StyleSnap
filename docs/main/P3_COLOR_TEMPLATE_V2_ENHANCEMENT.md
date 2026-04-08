# 颜色模板 v2.0 - 增强区分度

**文档版本**: 2.0  
**创建日期**: 2026-04-08  
**关联 PRD**: `docs/main/P2_COLOR_TEMPLATE_PRD.md`  
**关联 TECH**: `docs/main/P2_COLOR_TEMPLATE_TECH.md`

---

## 变更概述

根据用户反馈，颜色模板 v2.0 **扩展了颜色映射的 UI 元素范围**，使 4 个预设模板的视觉区分度更加明显。

### 核心设计理念

**不是新增独立的颜色字段，而是让每个 UI 区域选择一个颜色角色（primary/secondary/background/surface）**

通过巧妙的颜色角色分配，实现：
1. 三级背景层次（Header、导航、主体背景不全部相同）
2. 视觉锚点（每个模板有显著的色彩区域）

**v2.0 实际实现**: 新增 3 个维度（`headerBg`, `navBg`, `pageBg`），让 4 个模板的 Header 和导航栏背景色形成明显区分。

### v1.0 vs v2.0 对比

| 维度 | v1.0 | v2.0 |
|------|------|------|
| 可配置颜色角色的 UI 元素 | 10 个 | 13 个 |
| Header 背景色映射 | ❌ 固定 | ✅ 可选择颜色角色 |
| 导航栏背景色映射 | ❌ 固定 | ✅ 可选择颜色角色 |
| 页面背景色映射 | ❌ 固定 | ✅ 可选择颜色角色 |

**注意**: v2.0 实际新增 3 个维度（`headerBg`, `navBg`, `pageBg`）。`sidebarBg`, `cardBg`, `cardContentBg` 在当前代码中未实现。

---

## 设计原则

### 原则 1: 三级背景层次
**Header 栏、侧栏、主体背景不能同时一致** - 必须建立视觉层次

### 原则 2: 容器 - 内容对比
**容器背景 ≠ 容器内容背景** - 必须形成对比以区分层次

### 原则 3: 60-30-10 配色法则
- 60% 背景色 (主背景)
- 30% 表面色 (卡片、侧栏)
- 10% 强调色 (按钮、装饰)

### 原则 4: 视觉锚点
每个模板需要一个显著的色彩区域作为视觉锚点

---

## 4 个模板的视觉差异总览

**v2.0 实际实现的维度**: `headerBg`, `navBg`, `pageBg`

### 模板 1: 经典商务 (Classic Business)

**颜色角色分配策略**：

| 区域 | 颜色角色 | 视觉效果 |
|------|----------|----------|
| Header 栏 | Surface | 表面色用于页头，专业稳重 |
| 导航栏 | Background | 保持简洁，突出内容 |
| 页面背景 | Background | 主背景色 |

**视觉锚点**: Surface 色的 Header 栏形成专业框架

**特点**: 保守、专业，适合传统商务场景

---

### 模板 2: 活力创意 (Vibrant Creative)

**颜色角色分配策略**：

| 区域 | 颜色角色 | 视觉效果 |
|------|----------|----------|
| Header 栏 | **Secondary** | 辅色用于页头，活泼醒目 |
| 导航栏 | Surface | 表面色用于导航，层次分明 |
| 页面背景 | Background | 主背景色 |

**视觉锚点**: Secondary 色的 Header 栏制造视觉冲击

**特点**: 活泼、有创意，辅色用于 Header 制造惊喜

---

### 模板 3: 极简主义 (Minimalist)

**颜色角色分配策略**：

| 区域 | 颜色角色 | 视觉效果 |
|------|----------|----------|
| Header 栏 | Background | 保持简洁，无额外色彩 |
| 导航栏 | Background | 保持简洁 |
| 页面背景 | Background | 主背景色 |

**视觉锚点**: 全背景色，克制极简

**特点**: 克制、极简，所有背景色保持一致

---

### 模板 4: 科技现代 (Tech Modern)

**颜色角色分配策略**：

| 区域 | 颜色角色 | 视觉效果 |
|------|----------|----------|
| Header 栏 | **Primary** | 主色用于页头，科技感强 |
| 导航栏 | Surface | 表面色用于导航，层次分明 |
| 页面背景 | Background | 主背景色 |

**视觉锚点**: Primary 色的 Header 栏建立品牌识别

**特点**: 现代、科技感，主色用于 Header 建立强烈品牌识别

---

## 4 个模板的核心差异对比

### 颜色角色分配策略对比 (v2.0 实际实现)

| 模板 | Header 背景 | 导航栏背景 | 页面背景 | 核心策略 |
|------|------------|------------|----------|----------|
| 经典商务 | Surface | Background | Background | Surface 框架，专业稳重 |
| 活力创意 | **Secondary** | Surface | Background | 辅色锚点，活泼醒目 |
| 极简主义 | Background | Background | Background | 极简克制，全背景色 |
| 科技现代 | **Primary** | Surface | Background | 主色锚点，科技感强 |

### 关键差异点

1. **Header 背景色** - 活力创意用辅色、科技现代用主色、极简和商务用背景色/表面色
2. **导航栏背景** - 经典商务和极简用 Background 保持简洁，活力创意和科技现代用 Surface 创造层次

---

## CSS 变量清单 (v2.0)

```css
/* v1.0 已有 - 10 个 */
--template-title-color
--template-button-bg
--template-secondary-button-bg
--template-card-header-bg
--template-card-bg
--template-link-color
--template-border-accent
--template-list-marker
--template-input-focus
--template-badge-bg

/* v2.0 扩展 - 3 个区域的颜色角色映射 */
--template-header-bg       /* 映射到 var(--preview-surface) 或 var(--preview-primary) 等 */
--template-nav-bg          /* 映射到 var(--preview-background) 或 var(--preview-surface) 等 */
--template-page-bg         /* 映射到 var(--preview-background) */
```

**注意**: v2.0 不是新增独立的颜色字段，而是让每个区域可以选择不同的颜色角色（primary/secondary/background/surface）。

---

## 已修改文件清单

| 文件 | 变更内容 | 阶段 |
|------|----------|------|
| `docs/main/P2_COLOR_TEMPLATE_PRD.md` | 更新 4 个模板的颜色角色分配策略 | Phase 1A ✅ |
| `docs/main/P3_COLOR_TEMPLATE_V2_ENHANCEMENT.md` | 创建增强文档，记录设计原则和对比 | Phase 1A ✅ |
| `apps/web/lib/color-templates.ts` | 扩展 ColorMapping 接口（3 个区域），更新 4 个模板的颜色角色映射 | Phase 1B ✅ |
| `apps/web/components/preview/style-preview/styles.module.css` | Header、导航区域使用模板变量 | Phase 1C ⏳ |
| `apps/web/components/workspace/PreviewPanel.tsx` | 工作台预览同步更新 | Phase 1C ⏳ |

---

## 下一步行动

### Phase 1A - 文档更新 ✅
- [x] 更新 PRD 文档中的 4 个模板颜色角色分配策略
- [x] 创建/更新增强文档记录设计原则和对比表

### Phase 1B - 核心库更新 ✅
- [x] 更新 `apps/web/lib/color-templates.ts`:
  - 扩展 `ColorMapping` 接口（3 个区域的颜色角色映射：headerBg, navBg, pageBg）
  - 更新 4 个模板的 `mappings` 定义
  - 更新 `applyColorTemplate` 函数生成 3 个新 CSS 变量

### Phase 1C - 组件样式更新 ⏳
- [ ] 更新 `apps/web/components/preview/style-preview/styles.module.css`:
  - `.previewHeader` 使用 `--template-header-bg`
  - `.previewFooter` 使用 `--template-nav-bg`
  - 内容区背景使用 `--template-page-bg`
  
- [ ] 更新 `apps/web/components/workspace/PreviewPanel.tsx`:
  - 导航栏使用 `--template-header-bg`
  - 页面背景使用 `--template-page-bg`

### Phase 1D - MCP 浏览器测试 ⏳
- [ ] 使用 Next.js MCP 工具检测错误
- [ ] 使用 Playwright MCP 工具验证 4 个模板切换效果
- [ ] 验证 StylePreview 和 PreviewPanel 效果一致性

### Phase 2 - 阴影效果增强 (后续)
- [ ] 添加 `cardShadow` 维度（3 个强度级别）
- [ ] 添加 `cardHoverTransform` 维度（悬浮位移效果）

---

## UX 设计师审查 (Sally)

请审查以下设计决策:

1. **三级背景层次原则** - Header、侧栏、主体背景不全部相同 ✅
2. **容器 - 内容对比原则** - 卡片背景与内容背景形成对比 ✅
3. **4 个模板的视觉锚点** - 每个模板有显著色彩区域 ✅
4. **60-30-10 配色法则** - 背景/表面/强调色比例合理 ✅

---

## QA 审查 (Quinn)

请设计以下测试用例:

1. **模板切换测试** - 4 个模板切换后视觉效果正确
2. **持久化测试** - localStorage 保存和恢复正确
3. **同步测试** - StylePreview 和 PreviewPanel 效果一致
4. **边界测试** - 无模板时的默认行为正确

---

## 构建验证

- ⏳ `pnpm build` 待验证
- ⏳ `pnpm typecheck` 待验证
- ⏳ `pnpm lint` 待验证
