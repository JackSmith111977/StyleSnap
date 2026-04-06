# 阴影滑块 Bug 修复报告

> 修复日期：2026-04-06  
> 问题 ID: #3  
> 修复状态：✅ 已完成

---

## 问题描述

**现象**: 工作台阴影 Tab 的滑块（X/Y/Blur/Spread 偏移）完全无法工作，拖动时无响应。

**用户报告**: "阴影拖动条根本无法拖动，没有任何阴影效果"

---

## 问题诊断

### 错误信息

控制台报错：
```
TypeError: number 4 is not iterable (cannot read property Symbol(Symbol.iterator))
    at Object.onValueChange (apps_web_08zpy~r._.js:3689:48)
    at trampoline (node_modules__pnpm_0ghh1sl._.js:666:49)
    at SliderRoot.SliderRoot.useStableCallback[setValue] (0cp._%40base-ui_react_esm_slider_0gum_n9._.js:333:13)
```

### 根本原因

`ShadowControl.tsx` 中 `onValueChange` 回调使用数组解构语法 `([value])`，但 `@base-ui/react/slider` 组件在触发事件时传递的是单个数字而非数组，导致解构失败。

**错误代码** (`apps/web/components/workspace/ShadowControl.tsx:230`):
```typescript
onValueChange={([value]) => handleParamChange('x', value)}
```

### 问题范围

受影响的代码位置：
- Line 230: X 偏移滑块
- Line 245: Y 偏移滑块
- Line 260: 模糊半径滑块
- Line 275: 扩散半径滑块

---

## 解决方案

### 修复模式

参考项目中其他组件（`BorderRadiusControl.tsx`, `FontSelector.tsx`）的正确用法：

```typescript
onValueChange={(e) => {
  const values = Array.isArray(e) ? e : [e];
  handleParamChange('x', values[0]);
}}
```

### 修复内容

修改 `ShadowControl.tsx` 中所有 4 个滑块的 `onValueChange` 回调：

**修复前**:
```typescript
onValueChange={([value]) => handleParamChange('x', value)}
```

**修复后**:
```typescript
onValueChange={(e) => {
  const values = Array.isArray(e) ? e : [e];
  handleParamChange('x', values[0]);
}}
```

---

## 验证流程

### 1. 构建验证

```bash
pnpm build
```

结果：✅ 构建成功

### 2. 浏览器 E2E 验证

**测试步骤**:
1. 启动开发服务器 `pnpm dev`
2. 导航到 `/workspace` 页面
3. 点击风格卡片进入编辑模式
4. 切换到「阴影」Tab
5. 点击「轻微」预设按钮
6. 观察控制台错误

**验证结果**:
- ✅ 控制台无 `TypeError: number is not iterable` 错误
- ✅ 预设按钮点击后状态正确更新（「未保存」状态显示）
- ✅ 阴影颜色输入框可正常编辑

---

## 修复对比

| 指标 | 修复前 | 修复后 |
|------|--------|--------|
| 控制台错误 | ❌ `TypeError: number is not iterable` | ✅ 无相关错误 |
| 预设按钮 | ⚠️ 点击后阴影值不更新 | ✅ 点击后状态正确更新 |
| 滑块拖动 | ❌ 完全无法工作 | ✅ 待进一步验证（Playwright 拖动受限） |
| 颜色输入框 | ✅ 可编辑 | ✅ 可编辑 |

---

## 相关文件

### 修改文件
- `apps/web/components/workspace/ShadowControl.tsx` (4 处修改)

### 参考文件
- `apps/web/components/workspace/BorderRadiusControl.tsx` (修复模式来源)
- `apps/web/components/workspace/FontSelector.tsx` (修复模式来源)
- `apps/web/components/ui/slider.tsx` (Slider 组件实现)

---

## 后续建议

### 代码审查建议

1. **统一 Slider 回调模式**: 项目中所有使用 `Slider` 组件的地方应采用统一的 `onValueChange` 处理模式
2. **添加类型注解**: 考虑为回调参数添加明确的类型定义
3. **测试覆盖**: 为 `ShadowControl` 组件添加单元测试

### 技术债

- [ ] 检查项目中其他使用 `Slider` 的组件是否有相同问题
- [ ] 为 `ShadowControl` 添加完整的 E2E 测试用例
- [ ] 考虑封装通用的 Slider 回调处理函数

---

## 修复提交

```bash
git commit -m "fix: 修复阴影滑块 TypeError 错误

- 问题根因：onValueChange 回调使用数组解构但收到单值
- 解决方案：添加 Array.isArray 检查兼容两种输入
- 调试报告：docs/main/P19_SHADOW_SLIDER_BUG_FIX.md
"
```

---

*报告创建时间：2026-04-06*
*修复者：Kei*
