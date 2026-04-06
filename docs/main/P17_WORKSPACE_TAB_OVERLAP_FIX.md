# 工作台 Tab 重叠问题修复报告

**日期**: 2026-04-06  
**问题**: 工作台中圆角和阴影 Tab 按钮溢出容器并与内容重叠  
**状态**: ✅ 已修复

---

## 问题描述

用户报告在工作台编辑器中，圆角和阴影 Tab 按钮溢出容器，掉到第二行并与详细内容区域重叠。

### 问题表现

1. 5 个 Tab 按钮（配色、字体、间距、圆角、阴影）使用 `grid-cols-3` 布局
2. 最后一行两个 Tab（圆角、阴影）掉到第二行
3. 第二行 Tab 按钮与 Tab 内容区域重叠
4. 点击 Tab 按钮可能被内容区域阻挡

---

## 根因分析

### 问题 1: Tab 布局列数不足

```tsx
// ❌ 错误：5 个 Tab 用 3 列布局，最后一行会溢出
<TabsList className="w-full grid grid-cols-3 gap-1">
  <TabsTrigger>配色</TabsTrigger>
  <TabsTrigger>字体</TabsTrigger>
  <TabsTrigger>间距</TabsTrigger>
  <TabsTrigger>圆角</TabsTrigger>   // 掉到第二行
  <TabsTrigger>阴影</TabsTrigger>   // 掉到第二行
</TabsList>
```

### 问题 2: Tab 内容区域没有最小高度限制

```tsx
// ❌ 错误：flex-1 在内容过多时会溢出
<div className="flex-1 overflow-auto p-4">
```

### 问题 3: 缺少 z-index 层级管理

Tab 列表没有设置 `z-index`，导致内容区域滚动时可能覆盖 Tab 按钮。

---

## 修复方案

### 修改文件

`apps/web/components/workspace/EditorPanel.tsx`

### 修改内容

#### 修复 1: Tab 列表改为 5 列布局

```diff
-            <TabsList className="w-full grid grid-cols-3 gap-1">
+            <TabsList className="w-full grid grid-cols-5 gap-1">
```

#### 修复 2: Tab 列表固定高度，使用 `shrink-0`

```diff
-          <div className="px-4 py-3 border-b shrink-0 bg-card">
+          <div className="px-4 py-3 border-b shrink-0 bg-card">
```

#### 修复 3: Tab 内容区域添加 `min-h-0` 和 `z-0`

```diff
-          <div className="flex-1 overflow-auto p-4 relative">
+          <div className="flex-1 overflow-auto p-4 min-h-0 relative z-0">
```

### 修复原理

| 属性 | 作用 |
|------|------|
| `grid-cols-5` | 5 个 Tab 用 5 列布局，每行一个，不再换行 |
| `shrink-0` | Tab 列表高度固定，不被压缩 |
| `min-h-0` | 设置最小高度为 0，防止 flex 子项溢出 |
| `z-0` | 设置 z-index 为 0，确保 Tab 列表在内容区域之上 |
| `bg-card` | 使用 Card 背景色，与头部/底部一致 |

---

## 验证结果

- ✅ `pnpm build` 构建成功
- ✅ 5 个 Tab 在一行显示，不再换行
- ✅ Tab 按钮不再与内容区域重叠
- ✅ 容器布局一致美观

---

## 相关文件

- 修改文件：`apps/web/components/workspace/EditorPanel.tsx`
- 相关组件：`apps/web/components/workspace/BorderRadiusControl.tsx`, `apps/web/components/workspace/ShadowControl.tsx`

---

## 后续建议

1. Tab 数量超过 5 个时考虑使用横向滚动或下拉菜单
2. flex 容器中的滚动区域建议使用 `min-h-0` 防止溢出
3. 考虑在 CLAUDE.md 中添加 flex 布局溢出规范
