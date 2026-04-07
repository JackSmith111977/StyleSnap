# 工作台创建风格 - design_tokens 列缺失修复报告

> 日期：2026-04-06  
> 状态：✅ 已修复  
> 问题：远程数据库缺少 `design_tokens` 列
> 修复方式：通过 Supabase Dashboard 执行迁移 #0020

---

## 问题描述

用户反馈：**在工作台中创建风格失败**

### 错误表现

点击创建按钮后显示 Toast 错误：
```
创建风格失败：Could not find the 'design_tokens' column of 'styles' in the schema cache
```

---

## 根因分析

### 数据库 Schema 差异

| 列名 | 本地数据库 | 远程数据库 | 说明 |
|------|------------|------------|------|
| `design_tokens` | ✅ 存在 (JSONB) | ❌ 缺失 | 存储完整设计变量配置 |
| `color_palette` | ✅ 存在 (JSONB) | ✅ 存在 (JSONB) | 颜色配置 |
| `fonts` | ✅ 存在 (JSONB) | ✅ 存在 (JSONB) | 字体配置 |
| `spacing` | ✅ 存在 (JSONB) | ✅ 存在 (JSONB) | 间距配置 |
| `border_radius` | ✅ 存在 (JSONB) | ✅ 存在 (JSONB) | 圆角配置 |
| `shadows` | ✅ 存在 (JSONB) | ✅ 存在 (JSONB) | 阴影配置 |

### 迁移文件状态

```
本地迁移：0001-0023 (共 23 个)
远程迁移：0001-0013 (共 13 个)
缺失迁移：0014-0023 (10 个未应用)
```

**关键迁移文件：**
- `0020_add_submission_status.sql` - 添加 `design_tokens` 列

### Server Action 代码问题

```typescript
// apps/web/app/workspace/actions/workspace-actions.ts:286
const { data, error } = await supabase
  .from('styles')
  .insert({
    name,
    description: '',
    category_id: category.id,
    author_id: user.id,
    status: 'draft',
    design_tokens: null,  // ❌ 远程数据库没有这个列
  })
```

---

## 解决方案

### 方案 A：应用迁移到远程数据库（推荐）

**步骤：**
1. 使用 Supabase CLI 应用缺失的迁移
2. 验证 `design_tokens` 列已创建

**命令：**
```bash
npx supabase db push
```

**优点：**
- 保持代码与本地 schema 一致
- 无需修改代码
- 未来功能（审核、设计变量）依赖此列

**缺点：**
- 需要 Docker 运行 Supabase CLI
- 需要访问远程数据库权限

---

### 方案 B：修改 Server Action 适配当前 Schema（临时方案）

**修改文件：** `apps/web/app/workspace/actions/workspace-actions.ts`

**修改内容：**

```typescript
// 修改前：使用 design_tokens
const { data, error } = await supabase
  .from('styles')
  .insert({
    name,
    description: '',
    category_id: category.id,
    author_id: user.id,
    status: 'draft',
    design_tokens: null,  // ❌ 远程数据库没有这个列
  })

// 修改后：移除 design_tokens，使用独立字段
const { data, error } = await supabase
  .from('styles')
  .insert({
    name,
    description: '',
    category_id: category.id,
    author_id: user.id,
    status: 'draft',
    // 使用默认值填充独立字段
    color_palette: {
      primary: "#3B82F6",
      secondary: "#10B981",
      background: "#FFFFFF",
      surface: "#F3F4F6",
      text: "#1F2937",
      textMuted: "#6B7280",
      border: "#E5E7EB",
      accent: "#60A5FA",
    },
    fonts: {
      heading: "Inter, system-ui, sans-serif",
      body: "Inter, system-ui, sans-serif",
      mono: "Fira Code, monospace",
      headingWeight: 700,
      bodyWeight: 400,
      headingLineHeight: 1.2,
      bodyLineHeight: 1.5,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    border_radius: {
      small: "4px",
      medium: "8px",
      large: "16px",
    },
    shadows: {
      light: "0 1px 2px rgba(0,0,0,0.05)",
      medium: "0 4px 6px rgba(0,0,0,0.1)",
      heavy: "0 10px 15px rgba(0,0,0,0.15)",
    },
  })
```

**优点：**
- 立即可用，无需依赖 Docker/Supabase CLI
- 适配当前远程数据库 schema

**缺点：**
- 代码冗余（重复默认值）
- 与本地 schema 不一致
- 未来需要回滚此修改

---

## 决策

**选择方案 A**（应用迁移）为长期解决方案。

**但在本修复中先实施方案 B**（临时适配），因为：
1. 用户需要立即使用创建功能
2. Docker 环境问题可能短期内无法解决
3. 可以在方案 A 完成后轻松回滚方案 B

---

## 修复步骤

### 步骤 1：修改 Server Action（方案 B）

修改 `createNewStyle` 函数，移除 `design_tokens` 字段，改为使用独立的 JSONB 字段。

### 步骤 2：修改保存草稿

修改 `saveStyleDraft` 函数，将 `design_tokens` 转换为独立字段存储。

### 步骤 3：验证修复

使用 Playwright 进行端到端测试：
1. 访问 `/workspace`
2. 点击「新建」
3. 填写风格名称和分类
4. 点击「创建」
5. 验证风格成功创建并进入编辑页面

---

## 后续工作

1. 解决 Docker 环境问题
2. 应用迁移到远程数据库
3. 回滚方案 B 的代码修改
4. 恢复使用 `design_tokens` 字段

---

## 参考文档

- `supabase/migrations/0020_add_submission_status.sql` - 添加 design_tokens 的迁移
- `supabase/migrations/0001_initial_schema.sql` - 初始 schema 定义
- `apps/web/app/workspace/actions/workspace-actions.ts` - Server Action 文件
- `apps/web/stores/workspace-store.ts` - DesignTokens 类型定义

---

*修复创建时间：2026-04-06*
