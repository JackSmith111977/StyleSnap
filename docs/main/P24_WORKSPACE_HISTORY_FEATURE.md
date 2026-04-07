# 工作台历史记录功能 - 需求规格说明

**文档类型:** 功能需求规格  
**创建日期:** 2026-04-07  
**优先级:** P24  
**状态:** ✅ 阶段 1 已完成  

---

## 1. 功能概述

为工作台编辑器增加历史记录功能，允许用户查看设计变量的变更历史并恢复到任意时间点的状态。

### 1.1 目标用户

- 需要频繁调整设计变量的前端开发者
- 希望在多个设计方案之间快速切换的用户
- 需要撤销误操作的用户

### 1.2 核心价值

- **编辑安全感** - 用户可以大胆尝试不同设计，随时回退
- **可追溯性** - 清楚知道每次变更的内容和时间
- **快速切换** - 在多个设计方案之间快速切换对比

---

## 2. 需求规格

### 2.1 功能范围

| 维度 | 决策 |
|------|------|
| 记录范围 | 仅设计变量（颜色、字体、间距、圆角、阴影） |
| 基本信息 | 不记录（名称、描述、分类等变更不纳入历史） |
| 时间范围 | 当次编辑会话内有效（刷新/关闭页面后清空） |
| 存储方式 | LocalStorage |
| 保留策略 | 可配置（用户设置保留条数 N） |

### 2.2 功能列表

#### MVP（阶段 1）✅
- [x] 设计变量变更自动记录
- [x] 历史时间线列表展示
- [x] 点击恢复到指定版本
- [x] LocalStorage 持久化（会话内）
- [x] 默认保留最近 10 条

#### 增强（阶段 2）✅
- [x] 撤销/重做快捷键（Ctrl+Z / Ctrl+Shift+Z）
- [x] 当前历史位置指示器
- [x] 超过 N 条时 FIFO 移除

#### 可选（阶段 3）待实现
- [ ] 用户设置界面（调整 N 值）
- [ ] 历史条目显示变更类型图标
- [ ] 历史 Diff 对比视图

---

## 3. 技术设计

### 3.1 数据结构

```typescript
/**
 * 变更记录类型
 */
export type HistoryChangeType = 
  | 'color' 
  | 'font' 
  | 'spacing' 
  | 'radius' 
  | 'shadow'
  | 'auto-save';

/**
 * 历史记录条目
 */
export interface HistoryEntry {
  id: string;              // 时间戳生成，用于 key
  timestamp: number;       // Date.now()
  changeType: HistoryChangeType;
  description: string;     // 如 "修改主色 #3B82F6 → #FF6B6B"
  designTokens: DesignTokens; // 完整设计变量快照
}

/**
 * 历史记录状态
 */
interface HistoryState {
  history: HistoryEntry[];    // 历史记录数组
  currentIndex: number;       // 当前指向的历史位置（支持前进/后退）
  maxHistory: number;         // 最大保留条数（默认 10）
}
```

### 3.2 Store 扩展

**文件:** `apps/web/stores/workspace-store.ts`

```typescript
interface WorkspaceState {
  // 现有字段...
  history: HistoryEntry[];
  historyIndex: number;
  maxHistory: number;
  
  // Actions
  pushHistory: (changeType: HistoryChangeType, description?: string) => void;
  restoreTo: (index: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
  setMaxHistory: (max: number) => void;
}
```

### 3.3 LocalStorage Key 设计

```typescript
// 按风格 ID 隔离历史记录
const getHistoryKey = (styleId: string) => `workspace-history-${styleId}`;

// 默认设置
const DEFAULT_MAX_HISTORY = 10;
```

### 3.4 自动记录时机

| 触发条件 | 记录行为 |
|----------|----------|
| `updateDesignTokens` 被调用 | 自动 pushHistory |
| 颜色变更 | changeType = 'color' |
| 字体变更 | changeType = 'font' |
| 间距变更 | changeType = 'spacing' |
| 圆角变更 | changeType = 'radius' |
| 阴影变更 | changeType = 'shadow' |
| `setCurrentStyle` 加载新风格 | 清空历史 |
| `clearWorkspace` | 清空历史 |

### 3.5 撤销/重做逻辑

```typescript
// 撤销：回退到上一条历史
undo: () => {
  const { history, historyIndex } = get();
  if (historyIndex > 0) {
    const prevEntry = history[historyIndex - 1];
    set({
      designTokens: { ...prevEntry.designTokens },
      historyIndex: historyIndex - 1,
      isDirty: true,
    });
  }
}

// 重做：前进到下一条历史
redo: () => {
  const { history, historyIndex, maxHistory } = get();
  if (historyIndex < history.length - 1) {
    const nextEntry = history[historyIndex + 1];
    set({
      designTokens: { ...nextEntry.designTokens },
      historyIndex: historyIndex + 1,
      isDirty: true,
    });
  }
}
```

---

## 4. UI 设计

### 4.1 历史入口

**位置:** EditorPanel 顶部 CardHeader 区域

```
┌─────────────────────────────────────────┐
│ 设计编辑器         [📜 历史]  [💾 状态]  │
│ 配置您的设计变量                         │
└─────────────────────────────────────────┘
```

### 4.2 历史抽屉/弹窗

**样式:** 侧边抽屉（从右侧滑出）

```
┌───────────────────────────────┐
│ 历史记录              [X]     │
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ > 15:42  修改颜色          │ │
│ │   主色 → #FF6B6B          │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ > 15:40  修改字体          │ │
│ │   标题字重 → 700          │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ > 15:38  修改间距          │ │
│ │   md → 16                 │ │
│ └───────────────────────────┘ │
│                               │
│ 最多保留 [10 ▼] 条记录         │
└───────────────────────────────┘
```

### 4.3 组件结构

```
apps/web/components/workspace/
├── HistoryPanel.tsx          # 历史抽屉组件
├── HistoryList.tsx           # 历史列表（可复用）
├── HistoryItem.tsx           # 单条历史记录
└── HistorySettings.tsx       # 历史记录设置（可选）
```

---

## 5. 实现计划

### 阶段 1: 核心功能 ✅
- [x] 扩展 `workspace-store.ts` 添加历史状态和方法
- [x] 创建 `HistoryPanel.tsx` 组件
- [x] 在 `EditorPanel.tsx` 添加历史按钮
- [x] 实现 `updateDesignTokens` 自动记录
- [x] 实现恢复到指定版本功能

### 阶段 2: 撤销/重做 ✅
- [x] 实现 `undo()` / `redo()` 方法
- [x] 添加键盘事件监听
- [x] 实现 `getCanUndo` / `getCanRedo` 计算属性
- [x] 历史位置指示器 UI

### 阶段 3: 设置与优化 待实现
- [ ] `setMaxHistory()` 方法
- [ ] 历史设置 UI
- [ ] 变更类型图标显示
- [ ] 性能优化（防抖、节流）

---

## 9. 已实现文件清单

### 新增文件
- `apps/web/stores/workspace-store.ts` - 扩展历史记录功能
- `apps/web/components/workspace/HistoryPanel.tsx` - 历史抽屉组件
- `apps/web/components/workspace/HistoryItem.tsx` - 单条历史记录组件
- `apps/web/components/ui/sheet.tsx` - shadcn-ui Sheet 组件
- `apps/web/components/ui/scroll-area.tsx` - shadcn-ui ScrollArea 组件

### 修改文件
- `apps/web/components/workspace/EditorPanel.tsx` - 添加历史按钮和快捷键支持

---

## 6. 验收标准

### 功能验收
- [ ] 修改变量后，历史列表自动更新
- [ ] 点击历史条目，设计变量正确恢复
- [ ] 超过 N 条记录后，最旧记录自动移除
- [ ] Ctrl+Z 撤销、Ctrl+Shift+Z 重做正常工作
- [ ] 加载新风格时，历史记录清空
- [ ] 刷新页面后，历史记录清空（会话级）

### 体验验收
- [ ] 历史记录响应流畅（<100ms）
- [ ] LocalStorage 占用 < 1MB
- [ ] 抽屉动画流畅

---

## 7. 技术债务与后续优化

### 当前限制
- 会话级历史（刷新后丢失）
- 完整快照存储（占用空间较大）

### 未来优化方向
1. **数据库持久化** - 跨设备历史同步
2. **Diff 存储** - 只存储变更字段，节省空间
3. **时间聚合** - 按时间衰减策略聚合历史记录
4. **协作历史** - 多人协作时的历史追溯

---

## 8. 相关文件

- `apps/web/stores/workspace-store.ts` - 状态管理
- `apps/web/components/workspace/EditorPanel.tsx` - 编辑器面板
- `docs/main/P16_WORKSPACE_LAYOUT_FIX_REPORT.md` - 工作台布局修复

---

*版本：1.0 | 状态：待确认*
