# Supabase Storage 使用指南

> 版本：1.0
> 创建日期：2026-03-23
> 适用于：StyleSnap 项目

---

## 目录

1. [存储桶概述](#1-存储桶概述)
2. [客户端初始化](#2-客户端初始化)
3. [文件上传](#3-文件上传)
4. [文件下载](#4-文件下载)
5. [文件删除](#5-文件删除)
6. [签名 URL](#6-签名-url)
7. [Server Actions 示例](#7-server-actions-示例)
8. [客户端组件示例](#8-客户端组件示例)

---

## 1. 存储桶概述

### 1.1 存储桶配置

| 存储桶 ID | 名称 | 公开 | 大小限制 | 允许的 MIME 类型 |
|-----------|------|------|----------|------------------|
| `style-previews` | 风格预览图 | 是 | 10MB | PNG, JPEG, WebP, GIF |
| `user-avatars` | 用户头像 | 是 | 5MB | PNG, JPEG, WebP |

### 1.2 文件路径规范

```
style-previews/
└── {user_id}/
    └── {uuid}.{ext}    # 风格预览图

user-avatars/
└── {user_id}/
    └── avatar.{ext}    # 用户头像
```

### 1.3 RLS 策略摘要

| 操作 | style-previews | user-avatars |
|------|----------------|--------------|
| **公开读取** | ✓ | ✓ |
| **认证用户上传** | ✓ | ✓ |
| **用户删除自己的** | ✓ (通过文件夹路径) | ✓ (通过文件夹路径) |
| **管理员完全访问** | ✓ | ✓ |

---

## 2. 客户端初始化

### 2.1 创建 Supabase 客户端

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
```

### 2.2 环境变量配置

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://ngebqqkpizzomyxevjer.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 3. 文件上传

### 3.1 使用签名 URL 上传（推荐）

签名 URL 上传的优势：
- 更安全：不在客户端暴露存储策略
- 可控：服务端可验证文件类型和大小
- 灵活：支持直接上传到第三方 CDN

```typescript
// src/actions/storage/get-upload-url.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export interface GetUploadUrlResult {
  error?: string
  uploadUrl?: string
  publicUrl?: string
  filePath?: string
}

export async function getUploadUrl(
  filename: string,
  contentType: string,
  bucket: 'style-previews' | 'user-avatars' = 'style-previews'
): Promise<GetUploadUrlResult> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 生成唯一文件名
    const ext = filename.split('.').pop() || 'png'
    const uuid = uuidv4()
    const filePath = `${user.id}/${uuid}.${ext}`

    // 获取签名上传 URL
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(filePath)

    if (error) {
      console.error('生成上传 URL 失败:', error)
      return { error: '上传 URL 生成失败' }
    }

    // 获取公开访问 URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return {
      uploadUrl: data.url,
      publicUrl,
      filePath,
    }
  } catch (error) {
    console.error('获取上传 URL 失败:', error)
    return { error: '服务器错误' }
  }
}
```

### 3.2 客户端上传实现

```typescript
// src/components/upload/image-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { getUploadUrl } from '@/actions/storage/get-upload-url'

interface ImageUploadProps {
  onUpload: (url: string) => void
  accept?: string
  maxSize?: number  // MB
  bucket?: 'style-previews' | 'user-avatars'
}

export function ImageUpload({
  onUpload,
  accept = 'image/*',
  maxSize = 10,
  bucket = 'style-previews',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // 检查文件类型
    const allowedTypes = accept.split(',').map(t => t.trim())
    if (!allowedTypes.some(type => file.type.startsWith(type.replace('*', '')))) {
      return `不支持的文件类型：${file.type}`
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return `文件大小超过限制 (${maxSize}MB)`
    }

    return null
  }

  const handleFile = async (file: File) => {
    // 验证文件
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError(undefined)

    try {
      // 1. 获取签名 URL
      const result = await getUploadUrl(file.name, file.type, bucket)
      if (result.error) {
        throw new Error(result.error)
      }

      // 2. 上传到 Storage
      const uploadResponse = await fetch(result.uploadUrl!, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error('上传失败')
      }

      // 3. 回调公开 URL
      onUpload(result.publicUrl!)
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        disabled={uploading}
      />
      {uploading && <span>上传中...</span>}
      {error && <span className="text-red-500">{error}</span>}
    </div>
  )
}
```

### 3.3 直接上传（简单场景）

```typescript
// 简单上传，适用于小文件或内部工具
export async function uploadDirect(
  file: File,
  path: string,
  bucket: string = 'style-previews'
): Promise<{ error?: string; url?: string }> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)

  if (error) {
    return { error: error.message }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl }
}
```

---

## 4. 文件下载

### 4.1 获取公开 URL

```typescript
// src/actions/storage/get-public-url.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getPublicUrl(
  path: string,
  bucket: 'style-previews' | 'user-avatars' = 'style-previews'
): Promise<string> {
  const supabase = await createClient()

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}
```

### 4.2 获取签名 URL（私有文件）

```typescript
// src/actions/storage/get-signed-url.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600,  // 1 小时
  bucket: 'style-previews' | 'user-avatars' = 'style-previews'
): Promise<{ error?: string; signedUrl?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      return { error: error.message }
    }

    return { signedUrl: data.signedUrl }
  } catch (error) {
    console.error('生成签名 URL 失败:', error)
    return { error: '服务器错误' }
  }
}
```

### 4.3 下载文件

```typescript
// 客户端下载函数
export async function downloadFile(
  url: string,
  filename: string
): Promise<void> {
  const response = await fetch(url)
  const blob = await response.blob()

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()

  URL.revokeObjectURL(link.href)
}
```

---

## 5. 文件删除

### 5.1 Server Action 删除文件

```typescript
// src/actions/storage/delete-file.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteFile(
  path: string,
  bucket: 'style-previews' | 'user-avatars' = 'style-previews'
): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 检查是否是管理员
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

    // 非管理员检查文件所有权
    if (!isAdmin && !path.startsWith(user.id + '/')) {
      return { error: '无权限删除此文件' }
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard')
    return {}
  } catch (error) {
    console.error('删除文件失败:', error)
    return { error: '服务器错误' }
  }
}
```

---

## 6. 签名 URL

### 6.1 使用场景

- 私有文件临时访问
- 付费内容预览
- 限时下载链接

### 6.2 批量生成签名 URL

```typescript
// src/actions/storage/get-batch-signed-urls.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getBatchSignedUrls(
  paths: string[],
  expiresIn: number = 3600,
  bucket: 'style-previews' | 'user-avatars' = 'style-previews'
): Promise<{ error?: string; urls?: Record<string, string> }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn)

    if (error) {
      return { error: error.message }
    }

    // 转换为路径 -> URL 的映射
    const urls = paths.reduce((acc, path, index) => {
      acc[path] = data[index].signedUrl
      return acc
    }, {} as Record<string, string>)

    return { urls }
  } catch (error) {
    console.error('批量生成签名 URL 失败:', error)
    return { error: '服务器错误' }
  }
}
```

---

## 7. Server Actions 示例

### 7.1 风格预览图上传

```typescript
// src/actions/styles/upload-style-preview.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getUploadUrl } from '@/actions/storage/get-upload-url'

export async function uploadStylePreview(
  styleId: string,
  file: File
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient()

  // 验证用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '未登录' }
  }

  // 验证风格所有权
  const { data: style } = await supabase
    .from('styles')
    .select('author_id')
    .eq('id', styleId)
    .single()

  if (!style || style.author_id !== user.id) {
    return { error: '无权限上传预览图' }
  }

  // 获取上传 URL
  const result = await getUploadUrl(file.name, file.type, 'style-previews')
  if (result.error) {
    return { error: result.error }
  }

  // 执行上传
  const uploadResponse = await fetch(result.uploadUrl!, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!uploadResponse.ok) {
    return { error: '上传失败' }
  }

  // 更新风格表的预览图字段
  const { error: updateError } = await supabase
    .from('styles')
    .update({ preview_light: result.publicUrl })
    .eq('id', styleId)

  if (updateError) {
    console.error('更新风格预览图失败:', updateError)
  }

  return { url: result.publicUrl }
}
```

### 7.2 用户头像上传

```typescript
// src/actions/profiles/upload-avatar.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { getUploadUrl } from '@/actions/storage/get-upload-url'

export async function uploadAvatar(
  file: File
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '未登录' }
  }

  // 获取上传 URL（使用固定文件名便于管理）
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${user.id}/avatar.${ext}`

  const { data, error } = await supabase.storage
    .from('user-avatars')
    .createSignedUploadUrl(filename)

  if (error) {
    return { error: '上传 URL 生成失败' }
  }

  // 执行上传
  const uploadResponse = await fetch(data.url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  })

  if (!uploadResponse.ok) {
    return { error: '上传失败' }
  }

  // 获取公开 URL
  const { data: { publicUrl } } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filename)

  // 更新用户资料
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (updateError) {
    console.error('更新用户头像失败:', updateError)
  }

  return { url: publicUrl }
}
```

---

## 8. 客户端组件示例

### 8.1 头像上传组件

```typescript
// src/components/profiles/avatar-upload.tsx
'use client'

import { useState, useRef } from 'react'
import { uploadAvatar } from '@/actions/profiles/upload-avatar'
import { useRouter } from 'next/navigation'

interface AvatarUploadProps {
  currentAvatar?: string
  userId: string
}

export function AvatarUpload({ currentAvatar, userId }: AvatarUploadProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    // 验证文件
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过 5MB')
      return
    }

    setUploading(true)
    setError(undefined)

    try {
      const result = await uploadAvatar(file)
      if (result.error) {
        setError(result.error)
      } else {
        router.refresh()  // 刷新页面显示新头像
      }
    } catch (err) {
      setError('上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        <img
          src={currentAvatar || '/default-avatar.png'}
          alt="Avatar"
          className="h-24 w-24 rounded-full object-cover"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        disabled={uploading}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
      >
        {uploading ? '上传中...' : '更换头像'}
      </button>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
```

### 8.2 风格预览图上传组件

```typescript
// src/components/styles/preview-upload.tsx
'use client'

import { useState, useRef, useCallback } from 'react'
import { getUploadUrl } from '@/actions/storage/get-upload-url'
import { uploadStylePreview } from '@/actions/styles/upload-style-preview'

interface PreviewUploadProps {
  styleId: string
  currentPreview?: string
  onUploadComplete: (url: string) => void
}

export function PreviewUpload({ styleId, currentPreview, onUploadComplete }: PreviewUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    // 验证
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('仅支持 PNG、JPEG、WebP、GIF 格式')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }

    setUploading(true)
    setError(undefined)

    try {
      const result = await uploadStylePreview(styleId, file)
      if (result.error) {
        setError(result.error)
      } else if (result.url) {
        onUploadComplete(result.url)
      }
    } catch (err) {
      setError('上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }, [styleId, onUploadComplete])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  return (
    <div className="preview-upload">
      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {currentPreview ? (
          <img src={currentPreview} alt="Preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">
            <span>拖拽图片到此处或点击上传</span>
          </div>
        )}

        {uploading && <div className="uploading-overlay">上传中...</div>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
        disabled={uploading}
        className="hidden"
      />

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
```

---

## 9. 常见问题

### 9.1 上传失败 "Permission denied"

**原因**：RLS 策略配置错误或用户未登录

**解决**：
1. 检查用户是否已认证
2. 验证存储桶 RLS 策略
3. 确保文件路径符合规范

### 9.2 获取公开 URL 返回 404

**原因**：文件尚未上传成功或路径错误

**解决**：
1. 确认上传完成后再获取 URL
2. 检查路径格式是否正确

### 9.3 签名 URL 过期

**原因**：签名 URL 超过有效期

**解决**：
1. 增加 `expiresIn` 参数
2. 实现自动刷新机制

---

## 10. 参考资源

- [Supabase Storage 官方文档](https://supabase.com/docs/guides/storage)
- [RLS 策略最佳实践](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage API](https://supabase.com/docs/reference/javascript/storage-createbucket)
