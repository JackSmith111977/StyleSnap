# 未分类收藏重定向问题修复报告

**日期**: 2026-04-05  
**问题**: 在收藏管理页面点击"未分类"会直接重定向到首页  
**状态**: 已修复（待验证）

---

## 问题描述

用户在 `/favorites` 收藏管理页面，点击侧边栏的"未分类"选项时，页面会直接重定向到首页（实际是登录页）。

## 问题根因分析

### 调用链路

```
FavoritesSidebar (组件)
  → router.push('/favorites?collectionId=uncategorized')
    → FavoritesPage (Server Component)
      → getFavorites(collectionId='uncategorized')
        → validateOrThrow(getFavoritesSchema) ← 这里失败了！
```

### 根本原因

1. **Schema 验证失败**: `getFavoritesSchema` 中 `collectionId` 字段定义为：
   ```typescript
   collectionId: collectionIdSchema.optional().nullable()
   // collectionIdSchema = z.string().uuid()  ← 'uncategorized' 不是有效 UUID
   ```

2. **验证异常导致重定向**:
   - `validateOrThrow` 抛出 ZodError
   - `catch` 块捕获错误后返回 `{ success: false, error: '获取收藏列表失败' }`
   - `page.tsx` 中判断 `!favoritesResult.success` 后执行 `redirect('/login')`

3. **用户体验问题**: 用户已登录但被重定向到登录页，造成困惑

---

## 修复方案

### 1. 修改 Schema 验证规则

**文件**: `apps/web/lib/schemas.ts`

```typescript
// 获取收藏列表参数验证
export const getFavoritesSchema = z.object({
  collectionId: z.union([
    collectionIdSchema,           // UUID 格式的合集 ID
    z.literal('uncategorized'),   // 特殊值：未分类
  ]).optional().nullable(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})
```

### 2. 修改 getFavorites 函数逻辑

**文件**: `apps/web/actions/favorites/index.ts`

处理 `'uncategorized'` 的特殊逻辑：
1. 获取用户所有收藏的 `style_id` 列表
2. 查询已关联合集的 `style_id` 列表
3. 过滤出未关联合集的 `style_id`（差集）
4. 使用过滤后的列表查询完整的风格信息

```typescript
if (validatedData.collectionId === 'uncategorized') {
  // 获取所有收藏的 style_id
  const allFavoritesData = await supabase
    .from('favorites')
    .select('style_id')
    .eq('user_id', user.id)

  // 获取已关联合集的 style_id
  const taggedData = await supabase
    .from('style_collection_tags')
    .select('style_id')
    .eq('user_id', user.id)
    .in('style_id', allStyleIds)

  // 计算差集
  const taggedStyleIds = new Set(taggedData?.map(t => t.style_id) || [])
  const uncategorizedStyleIds = allStyleIds.filter(id => !taggedStyleIds.has(id))

  // 使用过滤后的列表查询
  favoritesQuery = favoritesQuery.in('style_id', uncategorizedStyleIds)
}
```

### 3. 添加调试输出

在关键位置添加 `console.log` 调试输出：

- **favorites-sidebar.tsx**: 点击事件触发时打印参数
- **page.tsx**: 打印 Server Component 接收到的参数和函数调用结果
- **actions/favorites/index.ts**: 打印函数入参、验证结果、SQL 查询逻辑分支

---

## 影响范围

| 模块 | 影响 |
|------|------|
| `lib/schemas.ts` | Schema 验证规则变更 |
| `actions/favorites/index.ts` | `getFavorites` 函数逻辑增强 |
| `app/favorites/page.tsx` | 添加调试输出 |
| `components/favorites/favorites-sidebar.tsx` | 添加调试输出 |

---

## 验证步骤

1. **启动开发服务器**: `pnpm dev`
2. **访问收藏页面**: http://localhost:3000/favorites
3. **点击"未分类"**: 观察控制台输出和页面行为
4. **预期结果**:
   - 控制台显示正确的调试日志
   - 页面正常显示未分类的收藏列表
   - 不会发生重定向

---

## 调试日志说明

### 关键日志标记

| 日志标记 | 位置 | 说明 |
|----------|------|------|
| `[FavoritesSidebar] handleNavigate called` | 侧边栏组件 | 点击事件触发 |
| `[FavoritesPage] Search params` | Server Component | 接收到的参数 |
| `[getFavorites] Called with` | Server Action | 函数入参 |
| `[getFavorites] Collection filter` | Server Action | 收藏筛选逻辑 |
| `[getFavorites] Uncategorized style IDs` | Server Action | 未分类风格数量 |

### 日志查看方式

- 打开浏览器开发者工具
- 查看控制台输出
- 过滤日志关键字：`[FavoritesSidebar]`、`[getFavorites]`

---

## 后续优化建议

1. **移除调试输出**: 验证通过后移除所有 `console.log` 语句
2. **统一特殊值处理**: 考虑使用枚举或常量定义特殊 `collectionId` 值
3. **类型安全增强**: 使用字面量类型而非字符串联合
4. **错误处理优化**: 区分"未登录"和其他错误类型，避免一概重定向

---

## 相关文档

- [数据库触发器与手动操作冲突风险](./P0_LIKE_COUNT_FIX_REPORT.md)
- [认证状态同步分析](./P1_AUTH_SYNC_ANALYSIS.md)
