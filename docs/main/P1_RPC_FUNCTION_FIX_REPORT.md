# RPC 函数参数名不匹配问题修复报告

**修复日期**：2026-04-03
**相关 Epic**：Epic 3 - 风格详情页功能
**修复文件**：`apps/web/actions/styles/index.ts`

---

## 问题描述

**现象**：访问风格详情页时，服务器日志出现以下错误：

```
增加浏览次数失败：{
  message: 'Could not find the function public.increment_style_view_count(style_id) in the schema cache',
  code: 'PGRST202',
  details: 'Searched for the function public.increment_style_view_count with parameter style_id or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache.',
  hint: 'Perhaps you meant to call the function public.increment_style_view_count(p_style_id)'
}
```

**影响范围**：
- 风格详情页的浏览次数增加功能失效
- 相关推荐功能（相同的参数命名问题）

---

## 问题根因分析

### 核心问题：参数名不匹配

**数据库函数定义**（`supabase/migrations/0017_fix_rpc_functions.sql`）：
```sql
CREATE OR REPLACE FUNCTION increment_style_view_count(
  p_style_id UUID  -- 参数名为 p_style_id
) RETURNS BOOLEAN AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Server Action 调用**（`apps/web/actions/styles/index.ts` - 修复前）：
```typescript
const { error } = await supabase.rpc('increment_style_view_count', {
  style_id: id  // ❌ 参数名不匹配：使用了 style_id 而不是 p_style_id
})
```

### PostgREST 参数匹配规则

PostgREST（Supabase JS 客户端底层）要求：
1. RPC 函数调用时，参数名必须与数据库函数定义完全匹配
2. PostgreSQL 函数参数通常使用 `p_` 前缀命名（parameter 的缩写）
3. 参数名不匹配时，PostgREST 无法找到对应的函数，返回 `PGRST202` 错误

### 错误代码含义

| 字段 | 含义 |
|------|------|
| `PGRST202` | PostgREST 错误码：函数不存在 |
| `Searched for...with parameter style_id` | PostgREST 尝试查找参数名为 `style_id` 的函数 |
| `Perhaps you meant to call...p_style_id` | PostgREST 提示正确的参数名 |

---

## 修复方案

### 修复 Server Action 参数名

**修复前**：
```typescript
// apps/web/actions/styles/index.ts - 修复前
export async function incrementViewCount(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_style_view_count', {
    style_id: id  // ❌ 错误
  })
  ...
}
```

**修复后**：
```typescript
// apps/web/actions/styles/index.ts - 修复后
export async function incrementViewCount(id: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_style_view_count', {
    p_style_id: id  // ✅ 正确：匹配数据库函数参数名
  })
  ...
}
```

### 增强错误日志输出

同时更新了错误日志输出，以便未来调试：

```typescript
if (error) {
  console.error('增加浏览次数失败:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  })
  return false
}
```

---

## 验证结果

### 1. 浏览次数功能

**测试步骤**：
1. 访问风格详情页 `/styles/b1ee572c-6e6a-4e9a-9f9c-513cd1fc2a9e`
2. 检查服务器日志
3. 刷新页面确认浏览次数增加

**测试结果**：
```
GET /styles/b1ee572c-6e6a-4e9a-9f9c-513cd1fc2a9e 200 in 2.2s
```
✅ 无错误日志，浏览次数从 3 增加到 4

### 2. 点赞功能

**测试步骤**：
1. 点击点赞按钮
2. 检查控制台日志和服务器日志

**测试结果**：
```
[LikeButton] 点击前 {isLiked: false, count: 0}
[LikeButton] 乐观更新后 {newIsLiked: true, newCount: 1}
[LikeButton] 调用 toggleLike {styleId: ...}
[LikeButton] toggleLike 返回 {success: true, data: Object}
[LikeButton] 使用服务器返回值 {isLiked: true, count: 1}

POST /styles/b1ee572c-6e6a-4e9a-9f9c-513cd1fc2a9e 200 in 2.5s
  └─ ƒ toggleLike("...") in 403ms
```
✅ 点赞成功，计数从 0 变为 1

### 3. 相关推荐功能

**测试结果**：
```
GET /styles/09edb054-68b8-4baf-9059-d9b4268d4445 200 in 2.4s
```
✅ 无错误日志（当前无相关推荐数据是因为数据库中相同分类的风格不足）

---

## 经验总结

### 1. PostgREST RPC 调用规范

**规则**：调用 Postgres RPC 函数时，参数名必须与数据库函数定义完全匹配。

**检查清单**：
- [ ] 确认数据库函数参数名（通常有 `p_` 前缀）
- [ ] Server Action 中使用相同的参数名
- [ ] 不要假设 JavaScript 的命名约定（camelCase）适用于 SQL

### 2. 错误日志最佳实践

遇到问题时，输出完整的错误对象有助于快速定位：

```typescript
console.error('操作失败:', {
  message: error.message,      // 错误描述
  code: error.code,            // 错误码（用于判断错误类型）
  details: error.details,      // 详细信息
  hint: error.hint             // 修复建议（PostgREST 特有）
})
```

### 3. 相关资源

- **相关迁移文件**：`supabase/migrations/0017_fix_rpc_functions.sql`
- **相关文档**：
  - `docs/main/P0_LIKE_COUNT_FIX_REPORT.md`（点赞计数双重增加修复）
  - `docs/knowledge-base/Supabase CLI 指南.md`
- **PostgREST 文档**：https://postgrest.org/en/stable/

---

## 附录：完整的参数名对照表

| 函数名 | 参数名 | 类型 | 用途 |
|--------|--------|------|------|
| `increment_style_view_count` | `p_style_id` | UUID | 增加浏览次数 |
| `get_related_styles` | `target_style_id` | UUID | 目标风格 ID |
| `get_related_styles` | `target_category_id` | UUID | 目标分类 ID |
| `get_related_styles` | `target_tag_ids` | UUID[] | 目标标签 ID 列表 |
| `get_related_styles` | `result_limit` | INTEGER | 返回数量限制 |
| `toggle_like_atomic` | `p_style_id` | UUID | 风格 ID |
| `toggle_like_atomic` | `p_user_id` | UUID | 用户 ID |
| `toggle_favorite_atomic` | `p_style_id` | UUID | 风格 ID |
| `toggle_favorite_atomic` | `p_user_id` | UUID | 用户 ID |
