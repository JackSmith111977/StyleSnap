# Z-Index 层级令牌系统

> 项目 z-index 层级规范文档 | 最后更新：2026-04-07

---

## 一、设计目标

1. **语义化** - 使用有意义的层级名称，而非魔法数字
2. **可维护** - 统一管理，便于调整和协作
3. **可扩展** - 预留层级空间，支持未来需求
4. **与 shadcn/ui 对齐** - 保持与 UI 库的一致性

---

## 二、层级定义

| 令牌名 | CSS 变量 | Tailwind 类 | 值 | 用途说明 | 典型组件 |
|--------|----------|-------------|-----|----------|----------|
| `base` | `--z-base` | `z-base` | 0 | 基础内容层 | 普通卡片、文本内容 |
| `sticky` | `--z-sticky` | `z-sticky` | 10 | 粘性/固定定位元素 | Header、Sidebar、滚动标题栏 |
| `dropdown` | `--z-dropdown` | `z-dropdown` | 50 | 下拉菜单 | Select、DropdownMenu |
| `popover` | `--z-popover` | `z-popover` | 100 | 浮层选择器 | ColorPicker、Popover、Tooltip |
| `modal-overlay` | `--z-modal-overlay` | `z-modal-overlay` | 500 | 模态框遮罩层 | Dialog overlay、Modal backdrop |
| `modal` | `--z-modal` | `z-modal` | 600 | 模态框内容层 | Dialog content、Modal panel |
| `toast` | `--z-toast` | `z-toast` | 1000 | 全局提示/通知 | Sonner Toast、全局 Message |

---

## 三、配置位置

### 3.1 CSS 变量定义

**文件**: `apps/web/styles/globals.css`

在 `:root` 中添加：

```css
:root {
  /* ====================
     Z-INDEX 层级系统
     ==================== */
  --z-base: 0;
  --z-sticky: 10;
  --z-dropdown: 50;
  --z-popover: 100;
  --z-modal-overlay: 500;
  --z-modal: 600;
  --z-toast: 1000;
}
```

### 3.2 Tailwind v4 配置

**文件**: `apps/web/styles/globals.css`

在 `@theme inline` 块中添加：

```css
@theme inline {
  /* Z-Index 层级映射 */
  --z-index-base: var(--z-base);
  --z-index-sticky: var(--z-sticky);
  --z-index-dropdown: var(--z-dropdown);
  --z-index-popover: var(--z-popover);
  --z-index-modal-overlay: var(--z-modal-overlay);
  --z-index-modal: var(--z-modal);
  --z-index-toast: var(--z-toast);
}
```

**使用方式**（Tailwind v4）:

```tsx
{/* 使用 CSS 变量语法 */}
<div style={{ zIndex: 'var(--z-popover)' }}>...</div>

{/* 或使用工具类（需手动编写） */}
<div className="z-popover">...</div>
```

> **注意**: Tailwind v4 不再使用 `tailwind.config.ts`，所有配置在 `globals.css` 中通过 `@theme` 完成。如需使用 `z-popover` 这类类名，需在 `@theme` 中定义 `--z-index-popover` 变量。

---

## 四、使用指南

### 4.1 推荐用法

✅ **使用 Tailwind 类名**（首选）:
```tsx
<div className="z-popover">...</div>
<div className="z-sticky">...</div>
```

✅ **使用 CSS 变量**（需要动态值时）:
```tsx
<div style={{ zIndex: 'var(--z-popover)' }}>...</div>
```

### 4.2 避免用法

❌ **避免魔法数字**:
```tsx
// 不要这样做
<div className="z-[9999]">...</div>
<div className="z-[100]">...</div>
```

❌ **避免直接使用数字**（除非 Tailwind 默认值）:
```tsx
// 不推荐
<div className="z-50">...</div>  {/* 应改为 z-dropdown */}
```

---

## 五、迁移清单

### 5.1 已迁移组件

| 组件文件 | 行号 | 当前值 | 目标令牌 | 优先级 | 状态 |
|----------|------|--------|----------|--------|------|
| `components/workspace/ColorPicker.tsx` | 398 | `z-[9999]` | `z-[var(--z-popover)]` | 🔴 高 | ✅ 已完成 |
| `components/workspace/PreviewPanel.tsx` | 57 | `z-10` | `z-[var(--z-sticky)]` | 🟡 中 | ✅ 已完成 |
| `components/layout/Header.tsx` | 13 | `z-50` | `z-[var(--z-sticky)]` | 🟡 中 | ✅ 已完成 |
| `app/workspace/page.tsx` | 204 | `z-50` | `z-[var(--z-modal-overlay)]` | 🟡 中 | ✅ 已完成 |
| `app/styles/style-grid.tsx` | 207 | `z-10` | `z-[var(--z-sticky)]` | 🟢 低 | ✅ 已完成 |
| `components/preview/fullscreen-preview.tsx` | 40 | `z-50` | `z-[var(--z-modal)]` | 🟢 低 | ✅ 已完成 |
| `components/preview/fullscreen-preview.tsx` | 42 | `z-10` | `z-[var(--z-sticky)]` | 🟢 低 | ✅ 已完成 |
| `components/auth/user-menu.tsx` | 40 | `z-10` | `z-[var(--z-dropdown)]` | 🟢 低 | ✅ 已完成 |
| `components/auth/user-menu.tsx` | 43 | `z-20` | `z-[var(--z-dropdown)]` | 🟢 低 | ✅ 已完成 |

### 5.2 shadcn UI 组件

shadcn/ui 组件已内置合理的 z-index，无需修改：

| 组件 | 内置 z-index | 说明 |
|------|-------------|------|
| `Select` | `z-50` | 与 `z-dropdown` 同级，可接受 |
| `Popover` | `z-50` | 与 `z-dropdown` 同级，可接受 |
| `DropdownMenu` | `z-50` | 与 `z-dropdown` 同级，可接受 |
| `Dialog` | `z-50` | 建议保持，内部已正确处理 |

---

## 六、实施步骤

### Step 1: 添加 CSS 变量到 `globals.css`

**操作**:
1. 打开 `apps/web/styles/globals.css`
2. 在 `:root` 块中添加 z-index 变量（第 78 行之前）
3. 在 `@theme inline` 块中添加映射（第 170 行之前）

**具体修改**:

```css
/* 在 :root 中添加 - 第 38 行之后 */
--z-base: 0;
--z-sticky: 10;
--z-dropdown: 50;
--z-popover: 100;
--z-modal-overlay: 500;
--z-modal: 600;
--z-toast: 1000;
```

```css
/* 在 @theme inline 中添加 - 第 170 行之后 */
/* Z-Index 层级映射 */
--z-index-base: var(--z-base);
--z-index-sticky: var(--z-sticky);
--z-index-dropdown: var(--z-dropdown);
--z-index-popover: var(--z-popover);
--z-index-modal-overlay: var(--z-modal-overlay);
--z-index-modal: var(--z-modal);
--z-index-toast: var(--z-toast);
```

**验证命令**:
```bash
pnpm dev
# 检查控制台无 CSS 相关错误
```

---

### Step 2: 迁移组件（按优先级）

**高优先级（必须完成）**:

```tsx
// 1. 修复 ColorPicker - components/workspace/ColorPicker.tsx:398
// 修改前:
className="fixed z-[9999] w-72 bg-popover ..."

// 修改后:
className="fixed z-[var(--z-popover)] w-72 bg-popover ..."
// 或
className="fixed z-popover w-72 bg-popover ..."
```

**中优先级（建议完成）**:

```tsx
// 2. 更新 PreviewPanel - components/workspace/PreviewPanel.tsx:57
// 修改前:
className="shrink-0 sticky top-0 z-10 ..."

// 修改后:
className="shrink-0 sticky top-0 z-[var(--z-sticky)] ..."
```

```tsx
// 3. 更新 Header - components/layout/Header.tsx:13
// 修改前:
className="sticky top-0 z-50 w-full ..."

// 修改后:
className="sticky top-0 z-[var(--z-sticky)] w-full ..."
```

```tsx
// 4. 更新 workspace page Dialog - app/workspace/page.tsx:204
// 修改前:
className="fixed inset-0 z-50 ..."

// 修改后:
className="fixed inset-0 z-[var(--z-modal-overlay)] ..."
```

**低优先级（可选完成）**:

剩余组件择机迁移。

---

### Step 3: 验证与测试

**构建验证**:
```bash
pnpm typecheck  # 类型检查
pnpm lint       # ESLint 检查
pnpm build      # 生产构建
```

**视觉验证**:
1. 启动开发服务器：`pnpm dev`
2. 访问工作台：`/workspace`
3. 测试 ColorPicker：
   - 打开颜色选择器
   - 确认不被 PreviewPanel 标题遮挡
   - 确认 Popover 跟随滚动
4. 测试其他浮层组件：
   - Select 下拉
   - Dialog 弹窗
   - Toast 提示

**浏览器调试**（可选）:
```bash
# 使用 Playwright 进行视觉回归测试
pnpm test:e2e
```

---

### Step 4: 更新项目规范

**文件**: `.claude/CLAUDE.md`

在「约束条件」章节添加：

```markdown
## Z-Index 使用规范

- 禁止使用魔法数字（如 `z-[9999]`、`z-[100]`）
- 必须使用预定义 CSS 变量：`var(--z-base)`、`var(--z-sticky)`、`var(--z-dropdown)`、`var(--z-popover)`、`var(--z-modal-overlay)`、`var(--z-modal)`、`var(--z-toast)`
- 语法：`z-[var(--z-popover)]`（Tailwind v4 内联语法）
- 特殊情况需注释说明理由
- 参考文档：`docs/reference/z-index-tokens.md`
```

---

## 七、决策记录

### 2026-04-07: 初始建立

**背景**: ColorPicker Popover 被 PreviewPanel 标题栏遮挡，临时修复使用 `z-[9999]`

**决策**:
- 建立统一的 z-index 令牌系统
- 采用 CSS 变量 + Tailwind 配置双轨方案
- 与 shadcn/ui 保持兼容

**参与者**: Architect、Sally(UX)、Dev、PM

**参考 Issue**: 无（会话内讨论决定）

---

## 八、常见问题

### Q: 为什么 `z-popover` 设为 100 而不是 50？

A: shadcn/ui 的 Popover/Dropdown 默认使用 `z-50`。我们将 `z-dropdown` 设为 50 以对齐 shadcn，而 `z-popover` 设为 100 以支持更复杂的浮层场景（如 ColorPicker 需要高于普通下拉菜单）。

### Q: 可以使用 `z-[var(--z-popover)]` 吗？

A: 可以，但推荐直接使用 `z-popover` 类名，更简洁且符合 Tailwind 习惯。

### Q: 如果需要新层级怎么办？

A: 
1. 评估是否可复用现有层级
2. 如确需新增，在 `globals.css` 和 `tailwind.config.ts` 中同时添加
3. 更新本文档

### Q: 为什么层级之间间距不均匀？

A: 预留扩展空间。例如 `popover`(100) 和 `modal-overlay`(500) 之间留有 400 余量，便于未来插入中间层级。

---

## 九、相关文件

| 文件 | 说明 |
|------|------|
| `apps/web/styles/globals.css` | CSS 变量定义 |
| `apps/web/tailwind.config.ts` | Tailwind 配置 |
| `.claude/CLAUDE.md` | 项目规范（需更新） |
| `docs/reference/` | 参考文档目录 |
