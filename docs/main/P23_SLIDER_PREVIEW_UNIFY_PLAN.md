# SliderWithPreview 通用组件封装与批量修复

> 创建日期：2026-04-07  
> 任务 ID: 拖动条样式统一  
> 执行状态：✅ 已完成

---

## 问题描述

**现象**: 拖动条（Slider）的辅助预览条进度与滑块实际位置不一致

**受影响组件**:
- `SpacingControl.tsx` - 5 个滑块，预览条使用 `value * 2` 硬编码计算
- `BorderRadiusControl.tsx` - 3 个滑块，无预览条（需新增）
- `FontSelector.tsx` - 4 个滑块，无预览条（按需新增）
- `ShadowControl.tsx` - 12 个滑块参数，无预览条（不加，已有阴影预览区）

**问题根因**:

以 `SpacingControl` 为例：
```tsx
// Slider 配置
<Slider max={64} ... />

// 预览条计算 - 错误！
<div style={{ width: `${Math.min(localValues[key] * 2, 100)}%` }} />
```

| 值 | Slider 位置 | 当前预览条 | 正确预览条 |
|----|-------------|-----------|-----------|
| 0 | 0% | 0% ✅ | 0% ✅ |
| 16 | 25% | 32% ❌ | 25% ✅ |
| 32 | 50% | 64% ❌ | 50% ✅ |
| 48 | 75% | 96% ❌ | 75% ✅ |
| 64 | 100% | 100% ✅ | 100% ✅ |

---

## 解决方案

### 阶段一：封装通用 `SliderWithPreview` 组件

#### 组件 API 设计

```tsx
interface SliderWithPreviewProps {
  // 核心参数
  value: number;
  min?: number;   // 默认 0
  max: number;    // 必填
  step?: number;  // 默认 1
  
  // 回调
  onValueChange: (value: number) => void;
  
  // 标签
  label?: React.ReactNode;
  labelSuffix?: React.ReactNode;  // 标签后缀（如单位 px）
  
  // 数值输入框
  showInput?: boolean;   // 是否显示数值输入框，默认 true
  inputWidth?: string;   // 输入框宽度，默认 "w-16"
  
  // 预览条
  showPreview?: boolean;     // 是否显示预览条，默认 true
  previewColor?: string;     // 预览条颜色，默认 "bg-primary/50"
  previewHeight?: string;    // 预览条高度，默认 "h-4"
  
  // 辅助说明
  description?: string;      // 滑块下方说明文字
  minLabel?: string;         // 最小值标签（如 "Light"）
  maxLabel?: string;         // 最大值标签（如 "Bold"）
  
  // 样式
  className?: string;
}
```

#### 核心计算公式

```tsx
/**
 * 计算预览条百分比
 * @param value 当前值
 * @param min 最小值（默认 0）
 * @param max 最大值
 */
const calculatePercentage = (value: number, min: number = 0, max: number): number => {
  if (max === min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
};
```

#### 组件实现

```tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SliderWithPreviewProps {
  // ... API 定义 ...
}

export function SliderWithPreview({
  value,
  min = 0,
  max,
  step = 1,
  onValueChange,
  label,
  labelSuffix,
  showInput = true,
  inputWidth = 'w-16',
  showPreview = true,
  previewColor = 'bg-primary/50',
  previewHeight = 'h-4',
  description,
  minLabel,
  maxLabel,
  className,
}: SliderWithPreviewProps) {
  // 计算预览条百分比
  const percentage = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('space-y-2', className)}>
      {/* 标签行 */}
      {(label || showInput) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label className="text-sm font-medium">
              {label}
              {labelSuffix && <span className="ml-1 text-muted-foreground">{labelSuffix}</span>}
            </Label>
          )}
          
          {showInput && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => onValueChange(parseInt(e.target.value) || min)}
                className={cn('h-8 text-right text-sm', inputWidth)}
                min={min}
                max={max}
              />
              {labelSuffix && <span className="text-xs text-muted-foreground w-8">{labelSuffix}</span>}
            </div>
          )}
        </div>
      )}

      {/* 滑块 */}
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(e) => onValueChange(Array.isArray(e) ? e[0] : e)}
        className="w-full"
      />

      {/* 预览条 */}
      {showPreview && (
        <div className={cn('relative w-full rounded overflow-hidden', previewHeight, 'bg-muted')}>
          <div
            className={cn('absolute left-0 top-0 h-full transition-all duration-100', previewColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* 辅助说明 */}
      {(description || minLabel || maxLabel) && (
        <div className="flex items-center justify-between">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {(minLabel || maxLabel) && (
            <div className="flex justify-between w-full text-xs text-muted-foreground">
              {minLabel && <span>{minLabel}</span>}
              {maxLabel && <span className="ml-auto">{maxLabel}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 文件位置

- **组件**: `apps/web/components/ui/slider-with-preview.tsx`
- **测试**: `apps/web/components/ui/slider-with-preview.test.tsx`

---

### 阶段二：批量替换修复

#### 2.1 SpacingControl 替换

**文件**: `apps/web/components/workspace/SpacingControl.tsx`

**当前代码**（每行都要替换）:
```tsx
<div className="space-y-2">
  <div className="flex items-center justify-between">
    <div>
      <Label className="text-sm font-medium">{SPACING_LABELS[key].label}</Label>
      <p className="text-xs text-muted-foreground">{SPACING_LABELS[key].usage}</p>
    </div>
    <div className="flex items-center gap-2">
      <Input type="number" value={localValues[key]} ... className="w-16 h-8" />
      <span className="text-xs text-muted-foreground w-8">px</span>
    </div>
  </div>
  <Slider value={[localValues[key]]} min={0} max={64} step={2} ... />
  <div className="relative h-4 bg-muted rounded overflow-hidden">
    <div className="absolute left-0 top-0 h-full bg-primary/50" style={{ width: `${Math.min(localValues[key] * 2, 100)}%` }} />
  </div>
</div>
```

**替换后**:
```tsx
<SliderWithPreview
  key={key}
  value={localValues[key]}
  min={0}
  max={64}
  step={2}
  onValueChange={(newValue) => handleSpacingChange(key, newValue)}
  label={SPACING_LABELS[key].label}
  labelSuffix="px"
  description={SPACING_LABELS[key].usage}
  showPreview={true}
  previewColor="bg-primary/50"
/>
```

**移除**: 原有的 `description` 单独渲染逻辑

#### 2.2 BorderRadiusControl 替换

**文件**: `apps/web/components/workspace/BorderRadiusControl.tsx`

**当前代码**: 无预览条

**替换后**（新增预览条）:
```tsx
// Small
<SliderWithPreview
  value={localValues.small}
  min={0}
  max={32}
  step={1}
  onValueChange={(newValue) => handleRadiusChange('small', newValue)}
  label="小圆角"
  labelSuffix="px"
  description="按钮、标签"
  showPreview={true}
/>

// Medium
<SliderWithPreview
  value={localValues.medium}
  min={0}
  max={48}
  step={2}
  onValueChange={(newValue) => handleRadiusChange('medium', newValue)}
  label="中圆角"
  labelSuffix="px"
  description="卡片、输入框"
  showPreview={true}
/>

// Large
<SliderWithPreview
  value={localValues.large}
  min={0}
  max={64}
  step={4}
  onValueChange={(newValue) => handleRadiusChange('large', newValue)}
  label="大圆角"
  labelSuffix="px"
  description="大容器、头像"
  showPreview={true}
/>
```

**移除**: 原有的滑块、输入框、标签单独渲染逻辑

#### 2.3 FontSelector 替换（可选预览条）

**文件**: `apps/web/components/workspace/FontSelector.tsx`

**字重滑块**（加预览条）:
```tsx
<SliderWithPreview
  value={localValues.headingWeight}
  min={300}
  max={800}
  step={100}
  onValueChange={(newValue) => handleSliderChange('headingWeight', newValue)}
  label="标题字重"
  showPreview={true}
  minLabel="Light"
  maxLabel="Bold"
/>

<SliderWithPreview
  value={localValues.bodyWeight}
  min={300}
  max={700}
  step={100}
  onValueChange={(newValue) => handleSliderChange('bodyWeight', newValue)}
  label="正文字重"
  showPreview={true}
  minLabel="Light"
  maxLabel="Bold"
/>
```

**行高滑块**（不加预览条，保留 Select）:
```tsx
<div className="space-y-2">
  <div className="flex justify-between">
    <Label className="text-sm">标题行高</Label>
    <span className="text-xs text-muted-foreground">{localValues.headingLineHeight}</span>
  </div>
  <SliderWithPreview
    value={localValues.headingLineHeight}
    min={1}
    max={2}
    step={0.1}
    onValueChange={(newValue) => handleSliderChange('headingLineHeight', newValue)}
    showPreview={false}  // 不加预览条
  />
  <Select ...>...</Select>
</div>
```

#### 2.4 ShadowControl（不修改）

**原因**: 已有完善的阴影预览区，且 12 个滑块都加预览条会过于拥挤

**保持现状**: 不加预览条

---

## 实施步骤

### 步骤 1: 创建通用组件

1. 创建文件 `apps/web/components/ui/slider-with-preview.tsx`
2. 实现 `SliderWithPreview` 组件（见上方代码）
3. 导出组件（更新 `apps/web/components/ui/index.ts` 如果有）

### 步骤 2: 批量替换

按顺序修改以下文件：

1. `SpacingControl.tsx` - 移除原有 Slider + Input + 预览条，替换为 `SliderWithPreview`
2. `BorderRadiusControl.tsx` - 移除原有 Slider + Input，替换为 `SliderWithPreview`（新增预览条）
3. `FontSelector.tsx` - 移除原有 Slider + Input，替换为 `SliderWithPreview`（字重加预览条，行高不加）

### 步骤 3: 清理代码

- 移除各组件中不再使用的导入（`Slider`, `Input`, `Label` 如果不再直接使用）
- 移除原有的本地 `handleXXXChange` 函数（如果已被封装替代）

### 步骤 4: 验证流程

#### 4.1 构建验证
```bash
pnpm typecheck && pnpm lint && pnpm build
```

#### 4.2 浏览器测试

**测试步骤**:
1. 启动 `pnpm dev`
2. 进入 `/workspace` 页面
3. 分别测试以下 Tab:
   - **间距 Tab**: 拖动 5 个滑块，确认预览条与滑块位置一致
   - **圆角 Tab**: 拖动 3 个滑块，确认预览条与滑块位置一致
   - **字体 Tab**: 拖动 4 个滑块，确认预览条（如有）与滑块位置一致

**验证标准**:
- ✅ 预览条百分比 = Slider 百分比（在所有值上）
- ✅ 输入框数值与滑块同步
- ✅ 拖动流畅无卡顿
- ✅ 视觉样式统一

---

## 代码改动统计

| 文件 | 改动类型 | 行数变化 |
|------|---------|---------|
| `slider-with-preview.tsx` | 新增 | ~150 行 |
| `SpacingControl.tsx` | 重构 | -80 行 / +20 行 |
| `BorderRadiusControl.tsx` | 重构 | -60 行 / +30 行 |
| `FontSelector.tsx` | 重构 | -50 行 / +30 行 |
| **总计** | | **~280 行新增，~190 行移除** |

---

## 后续建议

### 组件优化
- [ ] 添加 `disabled` 状态支持
- [ ] 添加 `error` 状态支持
- [ ] 支持自定义预览条渲染（如显示具体数值而非百分比）
- [ ] 添加 `Tooltip` 显示当前值

### 测试覆盖
- [ ] 为 `SliderWithPreview` 编写单元测试
- [ ] 为替换后的组件编写 E2E 测试

---

## 提交记录

✅ 已完成提交并推送到远程仓库

```bash
git commit -m "feat(ui): 新增 SliderWithPreview 通用组件

- 支持 min/max 自动计算预览条百分比，解决进度不一致问题
- 可选数值输入框、预览条、辅助说明
- 统一的样式和交互体验

refactor(workspace): 批量替换为 SliderWithPreview 组件

- SpacingControl: 5 个滑块替换，修复预览条进度不一致问题
- BorderRadiusControl: 3 个滑块替换，新增预览条
- FontSelector: 4 个滑块替换，字重加预览条，行高不加
- 移除重复代码约 150 行，统一使用通用组件

Party Mode 团队协作修复 🐙"
```

---

*方案创建时间：2026-04-07*  
*执行者：Party Mode Team*  
*完成时间：2026-04-07*
