-- StyleSnap 存储桶配置
-- 创建时间：2026-03-23
-- 说明：创建风格预览图和用户头像存储桶，配置 RLS 策略

-- ===========================================
-- 1. 创建存储桶
-- ===========================================

-- 插入存储桶配置
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'style-previews',
    'style-previews',
    true,
    10 * 1024 * 1024,  -- 10MB 限制
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
  ),
  (
    'user-avatars',
    'user-avatars',
    true,
    5 * 1024 * 1024,   -- 5MB 限制
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 2. Storage RLS 策略
-- ===========================================

-- Storage 会自动启用 RLS，我们只需要创建策略

-- ===========================================
-- 2.1 style-previews 存储桶策略
-- ===========================================

-- 公开读取（任何人可查看预览图）
DROP POLICY IF EXISTS "style_previews_public_read" ON storage.objects;
CREATE POLICY "style_previews_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'style-previews');

-- 认证用户上传预览图
DROP POLICY IF EXISTS "style_previews_authenticated_upload" ON storage.objects;
CREATE POLICY "style_previews_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'style-previews' AND
    auth.role() = 'authenticated'
  );

-- 用户删除自己的文件（通过文件夹路径判断）
DROP POLICY IF EXISTS "style_previews_user_delete_own" ON storage.objects;
CREATE POLICY "style_previews_user_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'style-previews' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 管理员完全访问 style-previews
DROP POLICY IF EXISTS "style_previews_admin_all" ON storage.objects;
CREATE POLICY "style_previews_admin_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'style-previews' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ===========================================
-- 2.2 user-avatars 存储桶策略
-- ===========================================

-- 公开读取（任何人可查看头像）
DROP POLICY IF EXISTS "user_avatars_public_read" ON storage.objects;
CREATE POLICY "user_avatars_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

-- 认证用户上传头像
DROP POLICY IF EXISTS "user_avatars_authenticated_upload" ON storage.objects;
CREATE POLICY "user_avatars_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'user-avatars' AND
    auth.role() = 'authenticated'
  );

-- 用户更新自己的头像文件
DROP POLICY IF EXISTS "user_avatars_user_update_own" ON storage.objects;
CREATE POLICY "user_avatars_user_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'user-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 用户删除自己的头像文件
DROP POLICY IF EXISTS "user_avatars_user_delete_own" ON storage.objects;
CREATE POLICY "user_avatars_user_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'user-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 管理员完全访问 user-avatars
DROP POLICY IF EXISTS "user_avatars_admin_all" ON storage.objects;
CREATE POLICY "user_avatars_admin_all"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user-avatars' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
