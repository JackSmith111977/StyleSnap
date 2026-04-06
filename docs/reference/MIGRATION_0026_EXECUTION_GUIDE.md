# 迁移 #0026 执行指南

> 文档创建日期：2026-04-06  
> 迁移文件：`supabase/migrations/0026_sync_design_tokens_to_jsonb.sql`  
> 执行方式：Supabase Dashboard SQL Editor

---

## 迁移目的

将 `styles` 表中的独立 JSONB 字段（`color_palette`, `fonts`, `spacing`, `border_radius`, `shadows`）同步到统一的 `design_tokens` JSONB 列中。

这是为了：
1. **统一数据结构** - 所有设计变量存储在单个 JSONB 字段中
2. **简化代码** - Server Action 不再需要解构/重建多个字段
3. **支持未来功能** - 审核、版本控制等功能依赖完整的 design_tokens

---

## 前置条件

### 1. 确认 migration #0020 已执行

通过 Supabase Dashboard 执行以下 SQL 验证：

```sql
-- 检查 design_tokens 列是否存在
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'styles' AND column_name = 'design_tokens';
```

**预期结果**：
```
column_name     | data_type
----------------|----------
design_tokens   | jsonb
```

### 2. 备份当前数据（推荐）

在执行迁移前，导出当前数据：

```sql
-- 导出当前所有风格数据
SELECT 
  id,
  title,
  color_palette,
  fonts,
  spacing,
  border_radius,
  shadows
FROM styles
ORDER BY created_at DESC;
```

---

## 执行步骤

### 步骤 1：打开 Supabase Dashboard

1. 访问 https://app.supabase.com
2. 选择你的项目
3. 进入 **SQL Editor**

### 步骤 2：复制迁移文件内容

打开文件：`supabase/migrations/0026_sync_design_tokens_to_jsonb.sql`

复制完整内容到 SQL Editor。

### 步骤 3：执行迁移

点击 **Run** 按钮执行 SQL。

### 步骤 4：验证结果

执行以下查询验证同步成功：

```sql
-- 验证 design_tokens 数据结构
SELECT 
  id,
  title,
  design_tokens IS NOT NULL as has_design_tokens,
  jsonb_typeof(design_tokens) as tokens_type,
  design_tokens->'colorPalette' IS NOT NULL as has_colors,
  design_tokens->'fonts' IS NOT NULL as has_fonts,
  design_tokens->'spacing' IS NOT NULL as has_spacing
FROM styles
ORDER BY created_at DESC
LIMIT 10;
```

**预期结果**：所有列应为 `true`，`tokens_type` 应为 `object`。

---

## 执行后代码变更

迁移执行成功后，需要修改代码恢复使用 `design_tokens` 字段。

### 修改文件：`apps/web/app/workspace/actions/workspace-actions.ts`

#### createNewStyle 函数

```typescript
// 修改前（独立字段）
const { data, error } = await supabase.from('styles').insert({
  title: name,
  color_palette: DEFAULT_TOKENS.colorPalette,
  fonts: DEFAULT_TOKENS.fonts,
  spacing: DEFAULT_TOKENS.spacing,
  border_radius: DEFAULT_TOKENS.borderRadius,
  shadows: DEFAULT_TOKENS.shadows,
  // ...
})

// 修改后（统一字段）
const { data, error } = await supabase.from('styles').insert({
  title: name,
  design_tokens: DEFAULT_TOKENS,
  // ...
})
```

#### saveStyleDraft 函数

```typescript
// 修改前
const { error: updateError } = await supabase.from('styles').update({
  title: basics.name,
  color_palette: designTokens.colorPalette,
  fonts: designTokens.fonts,
  spacing: designTokens.spacing,
  border_radius: designTokens.borderRadius,
  shadows: designTokens.shadows,
  // ...
}).eq('id', styleId);

// 修改后
const { error: updateError } = await supabase.from('styles').update({
  title: basics.name,
  design_tokens: designTokens,
  // ...
}).eq('id', styleId);
```

#### getStyleDetail 函数

```typescript
// 修改前（从独立字段构建）
const designTokens: DesignTokens | null = (data as any).color_palette
  ? {
      colorPalette: (data as any).color_palette,
      fonts: (data as any).fonts,
      spacing: (data as any).spacing,
      borderRadius: (data as any).border_radius,
      shadows: (data as any).shadows,
    }
  : null;

// 修改后（直接使用 design_tokens）
const designTokens: DesignTokens | null = (data as any).design_tokens || null;
```

---

## 回滚方案

如果迁移执行后出现问题，可以通过以下方式回滚：

### SQL 回滚（删除 design_tokens 数据）

```sql
-- 清空 design_tokens 字段
UPDATE styles SET design_tokens = '{}'::jsonb;
```

### 代码回滚

恢复使用独立字段的代码版本（git checkout 上一个提交）。

---

## 常见问题

### Q: 执行后独立字段还需要保留吗？

**A**: 建议保留。原因：
1. 向后兼容（旧代码可能仍在使用）
2. 数据冗余提供安全性
3. 可以在未来的迁移中再考虑删除

### Q: 如果 `design_tokens` 列不存在怎么办？

**A**: 先执行 migration #0020：

```sql
-- 简化版 0020 迁移
ALTER TABLE styles
ADD COLUMN IF NOT EXISTS design_tokens JSONB DEFAULT '{}';

ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'pending_review';
ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE style_status ADD VALUE IF NOT EXISTS 'rejected';
```

---

## 参考文档

- `supabase/migrations/0026_sync_design_tokens_to_jsonb.sql` - 迁移文件
- `docs/reference/DATABASE_MIGRATION_INDEX.md` - 迁移索引
- `docs/main/P14_WORKSPACE_CREATE_DESIGN_TOKENS_FIX.md` - 历史修复记录

---

*执行日期：待执行*
