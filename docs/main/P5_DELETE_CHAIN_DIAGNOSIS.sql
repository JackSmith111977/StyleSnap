-- ============================================
-- 用户删除链路诊断脚本
-- 创建时间：2026-04-05
-- 用途：诊断为什么 ON DELETE CASCADE 不工作
-- ============================================

-- 1. 检查 profiles 表是否有孤立记录
-- 这些记录的 id 在 auth.users 中不存在
SELECT
    'Orphaned profiles' as check_type,
    COUNT(*) as count
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE u.id IS NULL;

-- 2. 检查外键约束状态
SELECT
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    confdeltype as delete_type
FROM pg_constraint
WHERE confrelid = 'auth.users'::regclass;

-- 3. 检查是否存在阻止删除的存储对象
SELECT
    'User storage objects' as check_type,
    owner,
    COUNT(*) as object_count
FROM storage.objects
GROUP BY owner;

-- 4. 检查 profiles 表的外键约束详情
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'profiles'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 5. 检查触发器列表
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- 6. 查看特定用户的完整删除链（用于调试）
-- 替换 'YOUR_USER_UUID' 为实际用户 ID
-- SELECT
--     'profiles' as table_name,
--     id,
--     username,
--     email
-- FROM profiles
-- WHERE id = 'YOUR_USER_UUID'::uuid;
--
-- SELECT
--     'storage.objects' as table_name,
--     id,
--     name,
--     owner
-- FROM storage.objects
-- WHERE owner = 'YOUR_USER_UUID'::uuid;

-- 7. 检查 RLS 策略是否影响删除
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'auth.users');
