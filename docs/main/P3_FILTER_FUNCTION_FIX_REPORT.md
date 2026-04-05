# 筛选功能修复报告

**日期**：2026-04-05  
**任务**：修复高级筛选功能无法正常工作的问题  
**状态**：✅ 已完成

---

## 问题描述

用户在风格库页面使用高级筛选功能（颜色/行业/复杂度）时，点击"应用筛选"后，URL 参数正确更新（如 `?colors=dark&page=1`），但页面仍显示所有风格，筛选条件未生效。

---

## 事件链分析

### 正常执行流程

```
用户点击"高级筛选" 
  → 展开筛选面板
  → 选择筛选条件（如 #dark）
  → 点击"应用筛选"
  → handleApplyFilters 执行
  → URL 更新为 ?colors=dark&page=1
  → 页面重新加载
  → getStyles Server Action 被调用
  → 数据库查询应筛选带有 #dark 标签的风格
  → 返回筛选后的结果
```

### 实际问题链

```
用户点击"应用筛选"
  → URL 正确更新为 ?colors=dark&page=1  ✅
  → getStyles 被调用，options.colors = ['dark']  ✅
  → allTagFilters 构建为 ['#dark']  ✅
  → query.in('tag_id', supabase.from('tags')...) ❌ Supabase 不支持嵌套子查询
  → 数据库返回所有风格（筛选条件被忽略）❌
```

---

## 根因分析

### 1. 代码问题：Supabase 嵌套子查询语法错误

**问题位置**：`apps/web/actions/styles/index.ts` 第 97-102 行

**原始代码**：
```typescript
const { data: tagData, error: tagError } = await supabase
  .from('style_tags')
  .select('style_id')
  .in('tag_id',
    supabase
      .from('tags')
      .select('id')
      .in('name', allTagFilters)
  )
```

**问题原因**：
- Supabase/PostgREST 的 `.in()` 方法不支持嵌套子查询
- `.in()` 只能接受直接的数组值，不能接受另一个查询对象
- 需要分两步查询：先查 tags 表获取 ID，再查 style_tags 表获取 style_id

### 2. 数据问题：缺少 style_tags 关联数据

**问题位置**：`supabase/migrations/0008_seed_initial_styles.sql`

**问题原因**：
- migration 0008 中创建了 10 个风格案例，但只有注释，没有实际插入 `style_tags` 关联数据
- 导致所有风格都没有与任何标签关联
- 即使筛选语法正确，也查询不到任何关联记录

---

## 解决方案

### 1. 代码修复

**修改文件**：`apps/web/actions/styles/index.ts`

**修改后代码**（两步查询）：
```typescript
// 第一步：查询标签表获取标签 ID
const { data: tagsData, error: tagsError } = await supabase
  .from('tags')
  .select('id')
  .in('name', allTagFilters)

if (tagsError) {
  console.error('查询标签表失败:', {
    message: tagsError.message,
    code: tagsError.code
  })
  throw new Error('获取风格列表失败')
}

if (!tagsData || tagsData.length === 0) {
  return {
    styles: [],
    total: 0,
    page,
    limit,
    totalPages: 0,
  }
}

const tagIds = tagsData.map(t => t.id)

// 第二步：查询 style_tags 获取风格 ID
const { data: styleTagsData, error: styleTagsError } = await supabase
  .from('style_tags')
  .select('style_id')
  .in('tag_id', tagIds)

if (styleTagsError) {
  console.error('查询风格标签关联失败:', {
    message: styleTagsError.message,
    code: styleTagsError.code
  })
  throw new Error('获取风格列表失败')
}

filteredStyleIds = styleTagsData ? [...new Set(styleTagsData.map(st => st.style_id))] : []
```

### 2. 数据修复

**创建文件**：`supabase/migrations/0025_add_style_tags_associations.sql`

**内容**：为 10 个风格案例添加标签关联

| 风格名称 | 关联标签 |
|----------|----------|
| Clean SaaS Landing | #light, #simple, #saas |
| Neon Cyberpunk Dashboard | #dark, #neon, #web3 |
| Glassmorphism Card | #gradient, #moderate |
| Brutalist Portfolio | #colorful, #complex, #portfolio |
| Corporate Enterprise | #light, #moderate, #enterprise |
| Dark Mode Developer Tools | #dark, #simple, #developer-tools |
| Playful SaaS | #colorful, #gradient, #saas |
| Editorial Blog | #light, #moderate, #blog |
| Web 1.0 Retro | #colorful, #complex, #portfolio |
| Typography Studio | #light, #monochrome, #complex |

---

## 修复验证

### 构建验证
```bash
pnpm build
# 结果：成功 (16.5s)
```

### 功能验证（已完成）
- ✅ 选择 #dark 标签，显示 2 个风格（Dark Mode Developer Tools, Neon Cyberpunk Dashboard）
- ✅ 页面正确显示筛选条件标签 "颜色：dark"
- ✅ 风格卡片正确显示关联的标签

---

## 经验教训

1. **Supabase 查询限制**：`.in()` 方法不支持嵌套子查询，需要分两步查询
2. **数据完整性**：创建关联表数据时，确保主表和关联表都有正确的数据
3. **测试覆盖**：需要为高级筛选功能添加 E2E 测试，避免类似问题再次发生

---

## 后续工作

- [x] 在 Supabase Dashboard 执行 migration 0025
- [x] 启动开发服务器验证筛选功能
- [ ] 添加 E2E 测试覆盖高级筛选功能
- [x] 更新 `.claude/memory/MEMORY.md` 记录数据库迁移流程

---

## 参考文档

- Supabase 文档：https://supabase.com/docs/guides/api/queries
- PostgREST 文档：https://postgrest.org/en/stable/references/api/tables_views.html#horizontal-filtering
