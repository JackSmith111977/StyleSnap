# 工作台布局问题修复报告

**报告日期:** 2026-04-06  
**问题发现:** 用户报告"工作台的工作页面布局混乱，所有面板揉在一起，相互重叠"  
**修复状态:** ✅ 已完成

---

## 问题描述

用户报告了以下问题：
1. **左右面板重叠** - EditorPanel 和 PreviewPanel 相互重叠（包括固定宽度和窗口缩放两种场景）
2. **Footer 位置异常** - PreviewPanel 内部的模拟页脚与页面 Footer 冲突
3. **颜色选择器遮挡** - 点击颜色选择器后 popover 遮挡内容

---

## 根因分析

### 问题 1: 容器高度和 overflow 设置不当

**文件:** `apps/web/app/workspace/page.tsx:184`

**原因:**
- 容器高度 `h-[calc(100vh-8rem)]` 计算值过大
- 容器和子面板没有 `overflow-hidden` 限制，导致内容溢出

### 问题 2: PreviewPanel 滚动行为错误

**文件:** `apps/web/components/workspace/PreviewPanel.tsx:55`

**原因:**
- PreviewPanel 外层使用 `overflow-auto`，但内容高度超过容器时，内容会溢出
- PreviewPanel 内部的模拟 footer 元素随内容滚动，渲染在页面 Footer 下方很远的位置

### 问题 3: 响应式布局缺失（窗口缩放时重叠）

**文件:** `apps/web/app/workspace/page.tsx:185`

**原因:**
- `grid-cols-4` 使用百分比布局（25% : 75%）
- `min-w-[280px]` + `min-w-[600px]` = 880px 最小宽度需求
- 当视口 < 880px 时，grid 列宽（百分比）小于 `min-w`，导致面板重叠而非换行
- 缺少响应式断点来切换垂直堆叠布局

---

## 解决方案

### 修复 1: 调整容器高度和 overflow

**文件:** `apps/web/app/workspace/page.tsx`

```diff
- <div className="h-[calc(100vh-8rem)] min-h-[600px]">
+ <div className="h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden">
    <div className="grid grid-cols-4 gap-6 h-full">
-     <div className="col-span-1 min-w-[280px]">
+     <div className="col-span-1 min-w-[280px] h-full overflow-hidden">
        <EditorPanel />
      </div>
-     <div className="col-span-3 min-w-[600px]">
+     <div className="col-span-3 min-w-[600px] h-full overflow-hidden">
        <PreviewPanel designTokens={designTokens} />
      </div>
    </div>
  </div>
```

### 修复 2: PreviewPanel 使用 flex 布局控制滚动

**文件:** `apps/web/components/workspace/PreviewPanel.tsx`

```diff
- <div className={cn('h-full overflow-auto bg-muted/30', className)}>
+ <div className={cn('h-full flex flex-col overflow-hidden bg-muted/30', className)}>
-   <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
+   <div className="shrink-0 sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
-   <div className="p-6">
+   <div className="flex-1 overflow-auto p-6">
```

**关键变更:**
1. 外层容器改为 `flex flex-col overflow-hidden`
2. 头部添加 `shrink-0` 防止被压缩
3. 内容区使用 `flex-1 overflow-auto` 实现内部滚动

### 修复 3: 响应式断点切换布局

**文件:** `apps/web/app/workspace/page.tsx`

```diff
- <div className="grid grid-cols-4 gap-6 h-full">
-   <div className="col-span-1 min-w-[280px] h-full overflow-hidden">
-   <div className="col-span-3 min-w-[600px] h-full overflow-hidden">
+ <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
+   <div className="lg:col-span-1 h-full overflow-hidden">
+   <div className="lg:col-span-3 h-full overflow-hidden">
```

**关键变更:**
1. 移除 `min-w` 限制，改用响应式断点
2. 窄屏 (`< 1024px`): `grid-cols-1` 垂直堆叠
3. 宽屏 (`≥ 1024px`): `lg:grid-cols-4` 双栏布局（25% : 75%）

---

## 验证结果

### 布局验证
- ✅ EditorPanel 和 PreviewPanel 正常分离，无重叠
- ✅ 容器高度正确，内容不会溢出
- ✅ PreviewPanel 内部滚动正常
- ✅ Footer 位置正常，不会被内容覆盖
- ✅ 窄屏（800px）：垂直堆叠布局正常
- ✅ 宽屏（1280px）：双栏布局正常

### 颜色选择器验证
- ✅ 点击颜色按钮，popover 正常弹出
- ✅ 预设颜色选择正常
- ✅ popover 位置计算正确（使用 fixed 定位）

### 截图证明
- `workspace-layout-before.png` - 初始问题页面
- `workspace-layout-test.png` - 颜色选择器测试
- `workspace-layout-after-fix.png` - 修复后布局（宽屏）
- `workspace-layout-scrolled.png` - 滚动后布局验证
- `narrow-viewport-800px.png` - 窄屏问题复现
- `narrow-viewport-800px-after-fix.png` - 窄屏修复验证
- `wide-viewport-1280px.png` - 宽屏布局验证

---

## 提交记录

```bash
git commit -m "fix: 修复工作台面板重叠布局问题（包括响应式）

- 问题根因：
  1. 容器高度计算过大，缺少 overflow-hidden 导致内容溢出
  2. PreviewPanel 使用 overflow-auto 导致内部 footer 元素溢出容器
  3. 缺少响应式断点，窄屏时 min-w 限制导致面板重叠

- 解决方案：
  1. 调整容器高度从 calc(100vh-8rem) 改为 calc(100vh-12rem)
  2. 为容器和子面板添加 overflow-hidden
  3. PreviewPanel 改用 flex col + flex-1 overflow-auto 实现内部滚动
  4. 使用 grid-cols-1 lg:grid-cols-4 响应式断点切换布局

- 调试报告：docs/main/P16_WORKSPACE_LAYOUT_FIX_REPORT.md
"
```

---

## 经验教训

1. **容器高度计算**: 使用 `calc(100vh-Xrem)` 时需要精确计算 Header、Footer 和间距的总高度
2. **滚动行为**: 当需要内容滚动时，优先使用 `flex` 布局 + `flex-1 overflow-auto` 而不是外层直接 `overflow-auto`
3. **overflow-hidden 层级**: 父容器和内容容器都应该设置 `overflow-hidden` 防止内容溢出
4. **响应式断点**: 使用固定宽度限制（如 `min-w-[600px]`）时，必须配合响应式断点，在窄屏下切换到垂直布局
5. **Grid + min-w 组合风险**: `grid-cols-N` 与 `min-w` 组合使用时，当总 `min-w` 超过视口宽度会导致重叠而非换行

---

*版本：1.0.0 | 修复日期：2026-04-06*
