# Story 6.9 开发计划 - Sub-Agent 编排方案

> **版本:** 1.0  
> **创建日期:** 2026-04-06  
> **策略:** 并行开发 (方案 A)  
> **参与 Agent:** 3 个

---

## 执行摘要

**目标:** 通过 Sub-Agent 编排加速 Story 6.9 工作台编辑器核心功能的开发

**策略:** 并行启动 3 个 Agent，最大化开发效率

**预计加速比:** 2.5x - 3x (相比顺序开发)

---

## Agent 任务分配

### 📋 总览

```
┌─────────────────────────────────────────────────────────────┐
│                     Story 6.9 开发                          │
├─────────────────────────────────────────────────────────────┤
│  Agent 1 (前端开发)    Agent 2 (前端开发)   Agent 3 (测试)  │
│  ├─ Phase 1            ├─ Phase 3           ├─ 测试设计     │
│  └─ Phase 2            └─ Phase 4           └─ E2E 测试     │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent 1: 基础结构与风格选择器

### 任务范围

| 任务 | 文件 | 优先级 | 依赖 |
|------|------|--------|------|
| 创建工作台布局 | `app/workspace/layout.tsx` | P0 | 无 |
| 创建主页面 | `app/workspace/page.tsx` | P0 | layout.tsx |
| 创建 Zustand Store | `store/workspace-store.ts` | P0 | 无 |
| 创建风格选择器 | `components/workspace/StyleSelector.tsx` | P1 | page.tsx |
| 创建 Server Actions | `app/workspace/actions/workspace-actions.ts` | P0 | 无 |

### 验收标准

- [ ] 认证检查逻辑正确（未登录弹出提示）
- [ ] Zustand Store 状态管理正常
- [ ] 风格列表加载（支持状态筛选、搜索）
- [ ] Server Actions 返回值格式统一

### 输出物

```
app/workspace/
├── layout.tsx          ✅
├── page.tsx            ✅
└── actions/
    └── workspace-actions.ts  ✅
store/
└── workspace-store.ts  ✅
components/workspace/
└── StyleSelector.tsx   ✅
```

---

## Agent 2: 编辑器组件与自动保存

### 任务范围

| 任务 | 文件 | 优先级 | 依赖 |
|------|------|--------|------|
| 编辑器面板 | `components/workspace/EditorPanel.tsx` | P0 | workspace-store |
| 预览面板 | `components/workspace/PreviewPanel.tsx` | P0 | workspace-store |
| 颜色选择器 | `components/workspace/ColorPicker.tsx` | P0 | EditorPanel |
| 字体选择器 | `components/workspace/FontSelector.tsx` | P0 | EditorPanel |
| 间距控制 | `components/workspace/SpacingControl.tsx` | P0 | EditorPanel |
| 圆角控制 | `components/workspace/BorderRadiusControl.tsx` | P0 | EditorPanel |
| 阴影控制 | `components/workspace/ShadowControl.tsx` | P0 | EditorPanel |
| 自动保存指示器 | `components/workspace/AutoSaveIndicator.tsx` | P1 | workspace-store |
| 自动保存逻辑 | (集成到 workspace-store.ts) | P0 | 所有编辑器 |

### 验收标准

- [ ] 8 色颜色选择器（HEX/RGB 输入）
- [ ] 字体系统（字体系、字重、行高）
- [ ] 间距系统（5 档，支持滑块 + 数字输入）
- [ ] 圆角系统（3 档）
- [ ] 阴影系统（X/Y/Blur/Spread 四参数）
- [ ] 实时预览延迟 < 200ms
- [ ] 自动保存（30 秒定时 + 编辑后 5 秒）
- [ ] 一键重置功能

### 输出物

```
components/workspace/
├── EditorPanel.tsx           ✅
├── PreviewPanel.tsx          ✅
├── ColorPicker.tsx           ✅
├── FontSelector.tsx          ✅
├── SpacingControl.tsx        ✅
├── BorderRadiusControl.tsx   ✅
├── ShadowControl.tsx         ✅
└── AutoSaveIndicator.tsx     ✅
```

### 可复用组件

从 Story 6.1 和 Story 6.8 复用：
- `components/style-detail/DesignTokenEditor.tsx` → 参考改造
- `components/style-preview/StylePreview.tsx` → 直接复用

---

## Agent 3: 测试开发

### 任务范围

| 任务 | 文件 | 优先级 | 依赖 |
|------|------|--------|------|
| Store 单元测试 | `store/workspace-store.test.ts` | P1 | workspace-store.ts |
| 组件单元测试 | `components/workspace/*.test.tsx` | P1 | 各组件 |
| E2E 测试 - 编辑流程 | `tests/e2e/workspace-editor.spec.ts` | P0 | 功能完成 |
| E2E 测试 - 认证检查 | `tests/e2e/workspace-auth.spec.ts` | P0 | layout.tsx |
| E2E 测试 - 自动保存 | `tests/e2e/workspace-auto-save.spec.ts` | P1 | 自动保存完成 |

### 验收标准

- [ ] 单元测试覆盖率 ≥ 80%
- [ ] E2E 测试覆盖所有 Acceptance Criteria
- [ ] 所有测试通过

### 输出物

```
tests/e2e/
├── workspace-editor.spec.ts    ✅
├── workspace-auth.spec.ts      ✅
└── workspace-auto-save.spec.ts ✅
store/
└── workspace-store.test.ts     ✅
components/workspace/
├── ColorPicker.test.tsx        ✅
├── FontSelector.test.tsx       ✅
├── SpacingControl.test.tsx     ✅
├── BorderRadiusControl.test.tsx ✅
└── ShadowControl.test.tsx      ✅
```

---

## 依赖关系图

```
                    ┌─────────────────┐
                    │  Story 6.9 Start │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐        ┌─────────┐        ┌─────────┐
    │ Agent 1 │        │ Agent 2 │        │ Agent 3 │
    │  Phase 1│        │  等待   │        │  测试   │
    │  基础   │        │  (待命) │        │  设计   │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                  │                  │
         ▼                  │                  │
    ┌─────────┐             │                  │
    │ Agent 1 │             │                  │
    │  Phase 2│             │                  │
    │  选择器 │             │                  │
    └────┬────┘             │                  │
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  代码审查   │
                     │  (可选)     │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Agent 3    │
                     │  E2E 测试   │
                     └──────┬──────┘
                            │
                            ▼
                     ┌─────────────┐
                     │ Story 6.9   │
                     │   完成      │
                     └─────────────┘
```

---

## 执行时间表

| 时间 | Agent 1 | Agent 2 | Agent 3 |
|------|---------|---------|---------|
| **T+0** | Phase 1: 基础结构 | 等待中 | 测试设计 |
| **T+30min** | Phase 2: 风格选择器 | Phase 3: 编辑器组件 | 测试设计 |
| **T+60min** | Phase 2 完成 | Phase 3 继续 | 开始单元测试 |
| **T+90min** | 代码审查 (可选) | Phase 4: 自动保存 | 单元测试继续 |
| **T+120min** | 完成 | 完成 | E2E 测试 |
| **T+150min** | - | - | 测试完成 |

**预计总时长:** 2.5 - 3 小时 (vs 顺序开发 7-8 小时)

---

## 通信协议

### Agent 间依赖同步

当 Agent 1 完成 Phase 1 后：
1. 更新 `workspace-store.ts` 导出
2. 通知 Agent 2 可以开始 Phase 3
3. 共享 Store 类型定义

当 Agent 2 完成 Phase 3/4 后：
1. 提交所有组件
2. 通知 Agent 3 可以开始 E2E 测试

### 统一类型定义

所有 Agent 使用同一类型定义文件：

```typescript
// store/workspace-store.ts (由 Agent 1 创建，其他 Agent 引用)
export interface WorkspaceState {
  currentStyle: Style | null;
  designTokens: DesignTokens;
  basics: { name, description, category, tags };
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  isDirty: boolean;
  lastSavedAt: Date | null;
}

export interface DesignTokens {
  colorPalette: { primary, secondary, background, surface, text, textMuted, border, accent };
  fonts: { heading, body, mono, weights, lineHeights };
  spacing: { xs, sm, md, lg, xl };
  borderRadius: { small, medium, large };
  shadows: { light, medium, heavy };
  darkModeOverrides?: Partial<DesignTokens>;
}
```

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Agent 1 延迟 | 阻塞 Agent 2 | Agent 2 先准备组件骨架 |
| 类型定义冲突 | 集成失败 | 统一使用 workspace-store.ts 导出的类型 |
| 组件接口不一致 | 集成失败 | Agent 1 在 store 中定义统一 props 接口 |
| 测试等待时间长 | 效率降低 | Agent 3 先写 mock 测试，后替换为真实测试 |

---

## 启动指令

### 方式 1: 手动启动各 Agent

```
Agent 1: "请实现 Story 6.9 的 Phase 1 和 Phase 2：基础结构和风格选择器"
Agent 2: "请实现 Story 6.9 的 Phase 3 和 Phase 4：编辑器组件和自动保存"
Agent 3: "请实现 Story 6.9 的 Phase 5：单元测试和 E2E 测试"
```

### 方式 2: 使用 bmad-party-mode

```
/bmad-party-mode 启动 Story 6.9 并行开发
- Agent 1 (前端): Phase 1 & 2
- Agent 2 (前端): Phase 3 & 4
- Agent 3 (测试): Phase 5
```

---

## 验收检查清单 (汇总)

### 功能验收

- [ ] 导航栏显示"工作台"入口
- [ ] 未登录用户弹出登录提示（含"稍后再说"选项）
- [ ] 已登录用户直接进入工作台
- [ ] 风格列表支持状态筛选（全部/草稿/审核中/已发布）
- [ ] 风格列表支持搜索
- [ ] 支持创建新风格
- [ ] 编辑器包含所有设计变量控件（8 色、字体、间距、圆角、阴影）
- [ ] 实时预览延迟 < 200ms
- [ ] 一键重置功能正常
- [ ] 自动保存（30 秒定时 + 编辑后 5 秒）
- [ ] 双栏布局（左侧 25%，右侧 75%）
- [ ] 代码导出功能（HTML+CSS、React、Tailwind）

### 测试验收

- [ ] 单元测试通过率 100%
- [ ] E2E 测试通过率 100%
- [ ] 无 TypeScript 类型错误
- [ ] pnpm build 成功

---

## 下一步

**启动 Agent 开发：**

1. 启动 Agent 1 (前端开发 - 基础结构)
2. 启动 Agent 2 (前端开发 - 编辑器组件)
3. 启动 Agent 3 (测试开发)

**或者：** 使用 `bmad-party-mode` 一次性启动所有 Agent
