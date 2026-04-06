# design_tokens 迁移重构报告

> 日期：2026-04-06  
> 迁移编号：#0026  
> 重构状态：✅ 已完成

---

## 迁移背景

### 问题

在之前的迭代中，由于远程数据库缺少 `design_tokens` 列，代码使用了临时方案：
- 使用 5 个独立的 JSONB 字段存储设计变量
- `color_palette`, `fonts`, `spacing`, `border_radius`, `shadows`
- 代码需要解构和重建这些字段

### 解决

1. **迁移 #0020**: 添加 `design_tokens` JSONB 列
2. **迁移 #0026**: 将独立字段数据同步到 `design_tokens`
3. **代码重构**: 恢复使用统一的 `design_tokens` 字段

---

## 迁移执行记录

| 步骤 | 执行方式 | 日期 | 状态 |
|------|---------|------|------|
| #0020 | Supabase Dashboard | 2026-04-06 | ✅ 已完成 |
| #0026 | Supabase Dashboard | 2026-04-06 | ✅ 已完成 |
| 代码重构 | Git 提交 | 2026-04-06 | ✅ 已完成 |

---

## 代码变更

### 修改文件

`apps/web/app/workspace/actions/workspace-actions.ts`

### 变更详情

#### 1. createNewStyle 函数

**修改前**（独立字段）:
```typescript
const { data, error } = await supabase.from('styles').insert({
  title: name,
  description: '',
  category_id: category.id,
  author_id: user.id,
  status: 'draft',
  color_palette: DEFAULT_TOKENS.colorPalette,
  fonts: DEFAULT_TOKENS.fonts,
  spacing: DEFAULT_TOKENS.spacing,
  border_radius: DEFAULT_TOKENS.borderRadius,
  shadows: DEFAULT_TOKENS.shadows,
})
```

**修改后**（统一字段）:
```typescript
const { data, error } = await supabase.from('styles').insert({
  title: name,
  description: '',
  category_id: category.id,
  author_id: user.id,
  status: 'draft',
  design_tokens: DEFAULT_TOKENS,
})
```

**代码减少**: 4 行

---

#### 2. saveStyleDraft 函数

**修改前**（独立字段）:
```typescript
const { error: updateError } = await supabase.from('styles').update({
  title: basics.name,
  description: basics.description,
  category_id: basics.category,
  color_palette: designTokens.colorPalette,
  fonts: designTokens.fonts,
  spacing: designTokens.spacing,
  border_radius: designTokens.borderRadius,
  shadows: designTokens.shadows,
  status: 'draft',
  updated_at: new Date().toISOString(),
}).eq('id', styleId);
```

**修改后**（统一字段）:
```typescript
const { error: updateError } = await supabase.from('styles').update({
  title: basics.name,
  description: basics.description,
  category_id: basics.category,
  design_tokens: designTokens,
  status: 'draft',
  updated_at: new Date().toISOString(),
}).eq('id', styleId);
```

**代码减少**: 4 行

---

#### 3. getStyleDetail 函数

**修改前**（从独立字段重建）:
```typescript
// 从独立字段构建 DesignTokens
const designTokens: DesignTokens | null = (data as any).color_palette
  ? {
      colorPalette: (data as any).color_palette || DEFAULT_TOKENS.colorPalette,
      fonts: (data as any).fonts || DEFAULT_TOKENS.fonts,
      spacing: (data as any).spacing || DEFAULT_TOKENS.spacing,
      borderRadius: (data as any).border_radius || DEFAULT_TOKENS.borderRadius,
      shadows: (data as any).shadows || DEFAULT_TOKENS.shadows,
    }
  : null;
```

**修改后**（直接使用）:
```typescript
// 直接使用 design_tokens 字段
const designTokens: DesignTokens | null = (data as any).design_tokens || null;
```

**代码减少**: 8 行

---

## 重构效果

### 代码统计

| 指标 | 修改前 | 修改后 | 变化 |
|------|--------|--------|------|
| 代码行数 | 487 | 468 | -19 行 |
| createNewStyle | 40 行 | 36 行 | -4 行 |
| saveStyleDraft | 49 行 | 45 行 | -4 行 |
| getStyleDetail | 39 行 | 31 行 | -8 行 |

### 质量改进

| 方面 | 改进 |
|------|------|
| **可读性** | 不再需要注释解释独立字段 |
| **可维护性** | DesignTokens 对象直接存储/读取 |
| **类型安全** | 减少 `any` 类型转换 |
| **一致性** | 与本地 schema 保持一致 |

---

## 验证结果

### 构建验证 ✅

```bash
pnpm build
# 结果：成功，25 个页面生成，无错误
```

### 类型检查 ✅

```bash
pnpm typecheck
# workspace-actions.ts 无错误
```

### Git 提交 ✅

- 提交哈希：`5f8048d`
- 分支：`feat/bmad`
- 远程：已推送

---

## 数据库 Schema 现状

### `styles` 表字段

| 字段名 | 类型 | 状态 | 说明 |
|--------|------|------|------|
| `design_tokens` | JSONB | ✅ 使用中 | 设计变量配置（统一存储） |
| `color_palette` | JSONB | ⚠️ 保留 | [已弃用] 数据已同步 |
| `fonts` | JSONB | ⚠️ 保留 | [已弃用] 数据已同步 |
| `spacing` | JSONB | ⚠️ 保留 | [已弃用] 数据已同步 |
| `border_radius` | JSONB | ⚠️ 保留 | [已弃用] 数据已同步 |
| `shadows` | JSONB | ⚠️ 保留 | [已弃用] 数据已同步 |

**注意**: 独立字段暂时保留以实现向后兼容，可在未来迁移中删除。

---

## 后续工作

### 可选：清理独立字段

创建新的迁移文件删除独立字段：

```sql
-- 0027_drop_deprecated_fields.sql
-- 在确认所有代码都使用 design_tokens 后执行

ALTER TABLE styles
DROP COLUMN color_palette,
DROP COLUMN fonts,
DROP COLUMN spacing,
DROP COLUMN border_radius,
DROP COLUMN shadows;
```

**建议**: 在生产环境观察一段时间（如 1-2 周）后再执行。

---

## 参考文档

- `supabase/migrations/0020_add_submission_status.sql` - 添加 design_tokens 列
- `supabase/migrations/0026_sync_design_tokens_to_jsonb.sql` - 数据同步迁移
- `docs/reference/DATABASE_MIGRATION_INDEX.md` - 迁移索引
- `docs/reference/MIGRATION_0026_EXECUTION_GUIDE.md` - 执行指南

---

*报告生成时间：2026-04-06*
