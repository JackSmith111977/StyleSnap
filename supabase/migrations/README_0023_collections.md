# 应用 Migration 0023 - 合集系统

## 问题

Supabase CLI `db push` 命令无法应用包含多条 SQL 语句的迁移文件。

## 解决方案

请通过 Supabase Dashboard 手动应用此迁移：

### 步骤

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择项目：`ngebqqkpizzomyxevjer`
3. 进入 **SQL Editor** 页面
4. 复制并粘贴 `0023_add_collections.sql` 文件的全部内容
5. 点击 **Run** 执行

### 验证

执行成功后，运行以下 SQL 验证：

```sql
-- 检查表是否创建
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('collections', 'collection_styles');

-- 检查函数是否创建
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'get_collection_detail',
  'get_user_collections',
  'add_style_to_collection',
  'remove_style_from_collection'
);
```

应该返回 2 个表和 4 个函数。
