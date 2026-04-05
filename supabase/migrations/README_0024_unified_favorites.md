# 数据库迁移指南 - 0024_unified_favorites.sql

## 迁移说明

此迁移将"收藏"和"合集"两个独立系统合并为统一的收藏管理系统。

## 手动应用迁移步骤

### 方式 1: Supabase Dashboard SQL Editor（推荐）

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard/project/ngebqqkpizzomyxevjer/sql)
2. 进入 **SQL Editor** 页面
3. 复制 `supabase/migrations/0024_unified_favorites.sql` 的全部内容
4. 粘贴到 SQL Editor
5. 点击 **Run** 执行

### 方式 2: Supabase CLI（需要本地数据库）

```bash
# 如果有本地 Supabase 实例
npx supabase db push
```

## 验证迁移

执行以下 SQL 验证迁移是否成功：

```sql
-- 1. 检查表是否创建
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('favorites', 'style_collection_tags', 'collections');

-- 应该返回 3 个表

-- 2. 检查函数是否创建
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'toggle_favorite_atomic',
  'get_user_favorites'
);

-- 应该返回 2 个函数

-- 3. 检查 RLS 策略
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('favorites', 'style_collection_tags');

-- 应该返回多个策略
```

## 迁移后的数据结构

### favorites 表
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  style_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, style_id)  -- 同一用户同一风格只收藏一次
);
```

### style_collection_tags 表
```sql
CREATE TABLE style_collection_tags (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  style_id UUID NOT NULL,
  collection_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, style_id, collection_id)  -- 同一合集内不重复
);
```

## 数据迁移说明

如果之前已执行 `0023_add_collections.sql`，迁移脚本会自动：
1. 将 `collection_styles` 表的数据迁移到 `style_collection_tags`
2. 删除 `collection_styles` 表

如果是全新安装，直接创建新表结构。

## 常见问题

### Q: 迁移失败怎么办？
A: 检查 SQL Editor 中的错误信息，通常是：
- 表已存在：忽略错误继续执行
- 约束冲突：检查是否有重复数据
- RLS 策略冲突：先删除旧策略再执行

### Q: 如何回滚迁移？
A: 执行以下 SQL：
```sql
DROP TABLE IF EXISTS style_collection_tags CASCADE;
DROP FUNCTION IF EXISTS toggle_favorite_atomic CASCADE;
DROP FUNCTION IF EXISTS get_user_favorites CASCADE;
-- 恢复 collection_styles 表（如果需要回滚到旧版本）
```

## 下一步

迁移成功后，继续执行：
1. ✅ 阶段 1: 数据库迁移 ← 当前步骤
2. ⏳ 阶段 2: Server Actions 重构
3. ⏳ 阶段 3: 前端页面重构
4. ⏳ 阶段 4: 测试验证
