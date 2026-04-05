# 分类页筛选功能修复报告

**日期**：2026-04-05  
**问题**：不能通过分类页进入正确筛选  
**状态**：✅ 已完成

---

## 问题描述

用户从分类页（`/categories`）点击任意分类卡片（如"极简主义"）后，跳转到风格库页面，URL 参数正确显示 `?category=极简主义`，但页面显示"已加载全部风格"，实际只显示 1 个风格，筛选条件未生效。

---

## 事件链分析

### 正常执行流程

```
用户点击分类卡片（如"极简主义"）
  → 跳转到 /styles?category=极简主义
  → getStyles Server Action 被调用
  → options.category = "极简主义"（分类名称）
  → query.eq('category_id', category) 筛选
  → 返回该分类下的所有风格
```

### 实际问题链

```
用户点击分类卡片
  → URL 正确更新为 ?category=极简主义  ✅
  → getStyles 被调用，options.category = "极简主义"  ✅
  → query.eq('category_id', "极简主义")  ❌ 类型不匹配
  → category_id 字段是 UUID，但传入的是分类名称
  → 查询条件不匹配任何记录
  → 返回空结果或错误结果
```

---

## 根因分析

### 数据库 Schema

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- UUID 类型
    name VARCHAR(50) UNIQUE NOT NULL,                -- 分类名称，如 "极简主义"
    ...
);

CREATE TABLE styles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id),  -- 外键是 UUID
    ...
);
```

### 代码问题

**文件**：`apps/web/actions/styles/index.ts` 第 172-174 行

**原始代码**：
```typescript
// 分类筛选
if (category) {
  query = query.eq('category_id', category)  // ❌ 直接比较
}
```

**问题**：
- `category_id` 是 UUID 类型（如 `b1ee572c-6e6a-4e9a-9f9c-513cd1fc2a9e`）
- URL 参数传入的是分类名称（如 `"极简主义"`）
- 两者类型不匹配，导致筛选条件永远无法满足

### 数据来源差异

| 入口 | URL 参数格式 | 值类型 |
|------|-------------|--------|
| 分类页卡片链接 | `?category=极简主义` | 分类名称 |
| 风格库快速筛选按钮 | `?category=9d03f642-...` | 分类 UUID |

**原因**：`style-grid.tsx` 第 231 行使用 `category.id`（UUID）作为按钮点击值

---

## 解决方案

### 代码修复

**文件**：`apps/web/actions/styles/index.ts`

**修复后代码**：
```typescript
// 分类筛选：支持分类名称或 UUID
if (category) {
  // 判断传入的是 UUID 还是名称
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category)

  if (isUuid) {
    // 直接是 UUID，直接使用
    query = query.eq('category_id', category)
  } else {
    // 是分类名称，需要先查询分类表获取 UUID
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('name', category)
      .single()

    if (categoryData) {
      query = query.eq('category_id', categoryData.id)
    } else {
      // 分类名称不存在，返回空结果
      return {
        styles: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      }
    }
  }
}
```

**修复逻辑**：
1. 使用正则判断 `category` 参数是 UUID 还是名称
2. 如果是 UUID，直接用于筛选
3. 如果是名称，先查询 `categories` 表获取对应 UUID
4. 如果名称不存在，返回空结果（避免无效查询）

---

## 修复验证

### 构建验证
```bash
pnpm build
# 结果：成功 (18.5s)
```

### 功能验证

#### 测试用例 1：从分类页进入"极简主义"
- **操作**：点击 `/categories` 页面的"极简主义"卡片
- **URL**：`/styles?category=%E6%9E%81%E7%AE%80%E4%B8%BB%E4%B9%89`
- **结果**：✅ 正确显示 1 个极简主义风格（Clean SaaS Landing）

#### 测试用例 2：从风格库快速筛选"科技未来"
- **操作**：点击风格库页面顶部的"科技未来"按钮
- **URL**：`/styles?category=9d03f642-4f07-467f-8a43-189fd0b73b87`
- **结果**：✅ 正确显示 1 个科技未来风格（Neon Cyberpunk Dashboard）

#### 测试用例 3：页面标题
- **分类名称筛选**：页面标题显示 `极简主义 - StyleSnap` ✅
- **UUID 筛选**：页面标题显示 UUID（可优化，但不影响功能）

---

## 经验教训

1. **类型一致性**：数据库字段类型与 URL 参数类型的映射关系需要明确
2. **URL 设计**：分类筛选使用名称更直观，但使用 UUID 更高效
3. **兼容性处理**：同时支持两种格式（名称和 UUID）提高了系统鲁棒性

---

## 后续工作

- [x] 修复分类筛选功能
- [x] 验证从分类页进入的筛选功能
- [x] 验证从风格库快速筛选按钮的功能
- [ ] 优化页面标题显示（当 URL 是 UUID 时显示分类名称而非 UUID）

---

## 参考文档

- 前序修复报告：`docs/main/P3_FILTER_FUNCTION_FIX_REPORT.md`（筛选功能语法修复）
- 数据库 Schema：`supabase/migrations/0001_initial_schema.sql`
- 分类数据：`supabase/migrations/0007_add_remaining_categories_and_tags.sql`
