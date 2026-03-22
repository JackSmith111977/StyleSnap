# 04 - 组件库选型调研

> 调研日期：2026-03-20
> 状态：已完成
> 用途：StyleSnap 前端 UI 组件库选型

---

## 一、调研概述

StyleSnap 需要选择一个适合 Next.js + CSS Modules 技术栈的 React UI 组件库。

**选型核心考量：**
1. 与 Next.js App Router 兼容性（SSR/RSC 支持）
2. 样式方案匹配（CSS Modules / Tailwind CSS）
3. 可访问性（A11y）支持
4. 组件丰富度
5. 定制灵活性
6. 包体积与性能
7. 社区活跃度与维护状态

---

## 二、主流组件库对比

### 2.1 核心候选名单

| 组件库 | 类型 | Stars | 下载量/月 | 许可 |
|--------|------|-------|-----------|------|
| **Shadcn UI** | 代码生成 | 63k+ | 500k+ | MIT |
| **Mantine** | 完整 UI 库 | 28k+ | 400k+ | MIT |
| **Ant Design** | 完整 UI 库 | 97k+ | 1.7M+ | MIT |
| **Material-UI** | 完整 UI 库 | 95k+ | 2M+ | MIT |
| **Radix UI** | Headless | 15k+ | 300k+ | MIT |
| **Chakra UI** | 完整 UI 库 | 38k+ | 350k+ | MIT |
| **NextUI** | 完整 UI 库 | 20k+ | 150k+ | MIT |
| **Headless UI** | Headless | 22k+ | 200k+ | MIT |

---

### 2.2 详细对比分析

#### 1. Shadcn UI ⭐ 强烈推荐

**定位**：不是传统组件库，而是通过 CLI 复制代码到项目中的组件生成器

**核心理念**：你的代码，你做主（Your code, your control）

**优势：**
- 🔓 **完全可定制**：组件代码直接复制到项目中，100% 可控
- 🎨 **基于 Tailwind CSS**：样式即代码，易于修改
- ♿ **基于 Radix UI**：无障碍访问性原生支持
- 📦 **零运行时开销**：只导入需要的组件
- 🚀 **Next.js 友好**：完美支持 SSR 和 RSC
- 📈 **增长最快**：2025 年前端最大黑马，63k+ stars

**劣势：**
- 需要 TypeScript 基础
- 默认使用 Tailwind CSS（如项目用 CSS Modules 需适配）
- 组件数量相对较少（约 50+）

**组件数量**：约 50+ 核心组件

**定价**：完全免费开源（MIT）

**适用场景**：
- 需要高度定制的项目
- Next.js 全栈项目
- 对包体积敏感的应用
- 希望完全掌控组件代码的团队

---

#### 2. Mantine ⭐ 推荐

**定位**：功能完整的现代化 React 组件库

**核心理念**：简单、灵活、功能齐全

**优势：**
- 📦 **100+ 组件**：覆盖绝大多数场景
- 🪝 **丰富的 Hooks**：50+ React Hooks 工具
- 🎨 **主题系统**：支持深色模式、自定义主题
- 📘 **TypeScript 优先**：完整类型支持
- 📱 **响应式**：移动优先设计
- 🧩 **模块化**：可按需导入

**劣势：**
- 基于 Emotion（CSS-in-JS），SSR 配置稍复杂
- 包体积相对较大
- v7 版本有 Breaking Changes

**组件数量**：100+ 组件，50+ Hooks

**定价**：完全免费开源（MIT）

**适用场景**：
- 快速开发原型
- 需要丰富组件的场景
- 中后台管理系统
- 不介意 CSS-in-JS 的项目

---

#### 3. Ant Design

**定位**：企业级 UI 设计语言和组件库

**核心理念**：确定性和幸福感

**优势：**
- 🏢 **企业级品质**：阿里出品，久经考验
- 📦 **组件丰富**：覆盖几乎所有场景
- 🌍 **国际化**：支持多语言
- 📚 **文档完善**：中文文档友好
- 🎨 **设计系统**：完整的设计语言

**劣势：**
- 🎨 **风格固定**：定制成本较高
- 📦 **包体积大**：即使按需加载也较重
- 🖥️ **偏 PC 端**：移动端体验一般
- 🏗️ **偏重**：不适合轻量级项目

**组件数量**：100+ 组件

**定价**：完全免费开源（MIT）

**适用场景**：
- 企业级中后台
- 复杂数据表格场景
- 需要阿里系生态集成
- 国内团队项目

---

#### 4. Material-UI (MUI)

**定位**：遵循 Google Material Design 的 React UI 库

**核心理念**：Material Design 实现

**优势：**
- 🎨 **设计成熟**：Google Material Design 规范
- 📦 **组件齐全**：包括复杂的数据表格、日期选择器
- 🌍 **生态庞大**：社区插件丰富
- 📘 **TypeScript 支持**：完整类型定义

**劣势：**
- 🎨 **风格明显**：Material Design 风格强烈，不易定制
- 📦 **包体积大**：完整库体积大
- 💰 **高级功能收费**：MUI X 高级组件需付费（$15/月/开发者）

**组件数量**：80+ 基础组件，MUI X 提供高级组件

**定价**：
- 基础版：免费（MIT）
- MUI X 高级版：$15/月/开发者

**适用场景**：
- 需要 Material Design 风格
- 复杂数据表格场景
- 海外市场项目

---

#### 5. Radix UI

**定位**：无样式、可访问的组件原语

**核心理念**：Headless UI，只提供功能和可访问性，无样式

**优势：**
- ♿ **可访问性最佳**：完整的键盘导航、ARIA 支持
- 🎨 **完全无样式**：100% 定制自由
- 📦 **轻量级**：按需导入，体积极小
- 🔌 **组合式**：可与其他样式方案配合

**劣势：**
- 🎨 **无样式**：需要自己实现所有样式
- 🧩 **组件较少**：专注基础组件
- 📝 **学习曲线**：需要理解 Headless 概念

**组件数量**：约 30+ 原语组件

**定价**：完全免费开源（MIT）

**适用场景**：
- 需要完全自定义样式
- 对可访问性要求高
- 作为其他组件库的补充

---

#### 6. Chakra UI

**定位**：简单、可访问、模块化的组件库

**核心理念**：让开发更简单

**优势：**
- 🎨 **易用性高**：直观的 API
- ♿ **可访问性好**：WAI-ARIA 标准
- 🌙 **深色模式**：内置支持
- 📱 **响应式**：移动优先

**劣势：**
- 基于 Emotion（CSS-in-JS）
- 社区活跃度下降
- 定制灵活性一般

**组件数量**：50+ 组件

**定价**：完全免费开源（MIT）

---

#### 7. NextUI

**定位**：现代化、快速、美观的 React UI 库

**核心理念**：美观与性能并存

**优势：**
- 🎨 **设计现代**：颜值高
- ⚡ **性能好**：基于 React Aria 优化
- 🌙 **深色模式**：内置支持
- 📱 **响应式**：移动友好

**劣势：**
- 社区相对较小
- 文档不够完善
- 基于 Tailwind CSS

**组件数量**：40+ 组件

**定价**：完全免费开源（MIT）

---

### 2.3 特性对比表

| 特性 | Shadcn UI | Mantine | Ant Design | MUI | Radix UI | Chakra UI | NextUI |
|------|-----------|---------|------------|-----|----------|-----------|--------|
| **样式方案** | Tailwind | Emotion | CSS-in-JS | Emotion | 无样式 | Emotion | Tailwind |
| **组件数量** | ~50 | 100+ | 100+ | 80+ | ~30 | 50+ | 40+ |
| **SSR 支持** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RSC 支持** | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **深色模式** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **可访问性** | ✅ | ✅ | ⚠️ | ✅ | ✅✅ | ✅ | ✅ |
| **定制难度** | 低 | 中 | 高 | 高 | 低 | 中 | 中 |
| **包体积** | 小 | 中 | 大 | 大 | 极小 | 中 | 小 |
| **中文文档** | ⚠️ | ⚠️ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ |

---

## 三、StyleSnap 选型建议

### 3.1 推荐方案

#### 首选：Shadcn UI + Radix UI

**理由：**
1. ✅ **完全可控**：组件代码复制到项目中，可自由修改
2. ✅ **Next.js 友好**：完美支持 App Router、SSR、RSC
3. ✅ **包体积小**：只导入需要的组件
4. ✅ **可访问性**：基于 Radix UI，A11y 原生支持
5. ✅ **定制灵活**：基于 Tailwind CSS，易于调整
6. ✅ **社区活跃**：2025 年增长最快的 UI 方案

**注意事项：**
- 项目当前技术栈为 CSS Modules，需决定是否切换到 Tailwind CSS
- 如保持 CSS Modules，可考虑：
  - 方案 A：仅使用 Radix UI（无样式）+ 自定义 CSS Modules
  - 方案 B：混合使用 Shadcn UI（参考其实现）+ CSS Modules

---

#### 备选：Mantine

**适用场景：**
- 需要快速开发，不介意 CSS-in-JS
- 需要 100+ 丰富组件
- 需要内置 Hooks 工具库

---

#### 备选：Ant Design

**适用场景：**
- 需要复杂数据表格
- 团队熟悉 Ant Design
- 项目风格可接受 Ant Design 设计语言

---

### 3.2 技术栈适配建议

#### 当前技术栈
- 框架：Next.js
- 样式：CSS Modules
- 语言：TypeScript

#### 方案对比

| 方案 | 样式 | 组件库 | 优点 | 缺点 |
|------|------|--------|------|------|
| **方案 A（推荐）** | Tailwind CSS | Shadcn UI | 最佳开发体验、完全可控 | 需调整样式方案 |
| **方案 B** | CSS Modules | Radix UI | 保持当前技术栈、A11y 好 | 需自己实现样式 |
| **方案 C** | CSS Modules | Ant Design | 组件丰富、开箱即用 | 包体积大、定制难 |

---

### 3.3 集成示例

#### Shadcn UI 集成

```bash
# 1. 初始化
npx shadcn-ui@latest init

# 2. 添加组件
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
```

```typescript
// 使用示例
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function StyleCard() {
  return (
    <Card>
      <CardContent>
        <Button variant="primary">探索风格</Button>
      </CardContent>
    </Card>
  );
}
```

#### Radix UI + CSS Modules 集成

```bash
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
```

```typescript
// components/Dialog.tsx
import * as DialogPrimitive from '@radix-ui/react-dialog';
import styles from './Dialog.module.css';

export function Dialog({ children }: { children: React.ReactNode }) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger className={styles.trigger}>
        打开
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <DialogPrimitive.Content className={styles.content}>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

```css
/* Dialog.module.css */
.overlay {
  background-color: rgba(0, 0, 0, 0.7);
  position: fixed;
  inset: 0;
  z-index: 50;
}

.content {
  background: #2D2D2D;
  border-radius: 8px;
  padding: 24px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 51;
}
```

---

## 四、成本与性能对比

### 4.1 包体积对比（Tree-shaking 后）

| 组件库 | Button 组件 | Dialog 组件 | 完整库 |
|--------|-------------|-------------|--------|
| Shadcn UI | ~2KB | ~8KB | 按需导入 |
| Radix UI | ~1KB | ~6KB | ~50KB |
| Mantine | ~5KB | ~15KB | ~200KB |
| Ant Design | ~8KB | ~20KB | ~300KB |
| MUI | ~6KB | ~18KB | ~250KB |
| Chakra UI | ~4KB | ~12KB | ~150KB |

### 4.2 开发效率对比

| 组件库 | 上手难度 | 定制难度 | 文档质量 | 社区支持 |
|--------|----------|----------|----------|----------|
| Shadcn UI | 中 | 低 | 高 | 高 |
| Mantine | 低 | 中 | 高 | 中 |
| Ant Design | 低 | 高 | 高 | 高 |
| MUI | 中 | 高 | 高 | 高 |
| Radix UI | 高 | 低 | 中 | 中 |
| Chakra UI | 低 | 中 | 高 | 中 |

---

## 五、最终推荐

### StyleSnap 最佳组合

```
Next.js + TypeScript + Shadcn UI (Tailwind CSS) + Radix UI
```

**理由：**
1. **开发体验最佳**：Shadcn UI 的 CLI 工作流高效
2. **完全可控**：组件代码在项目中，可随时修改
3. **性能优秀**：Tree-shaking 友好，包体积小
4. **可访问性**：Radix UI 提供 A11y 原语
5. **未来证明**：RSC 友好，符合 React 发展方向
6. **社区活跃**：2025 年增长最快，持续维护

### 备选方案（如保持 CSS Modules）

```
Next.js + TypeScript + Radix UI + CSS Modules
```

**理由：**
- 保持当前技术栈不变
- Radix UI 提供无样式原语
- 完全自定义样式，符合鹰角 UI 设计风格

---

## 六、参考资料

- [Shadcn UI 官方文档](https://ui.shadcn.com)
- [Mantine 官方文档](https://mantine.dev)
- [Ant Design 官方文档](https://ant.design)
- [Material-UI 官方文档](https://mui.com)
- [Radix UI 官方文档](https://www.radix-ui.com)
- [Chakra UI 官方文档](https://chakra-ui.com)
- [NextUI 官方文档](https://nextui.org)
