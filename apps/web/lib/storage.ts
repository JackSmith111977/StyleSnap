/**
 * Supabase Storage 工具函数
 * 用于图片上传、URL 生成等操作
 */

import { createClient } from '@supabase/supabase-js'

/**
 * 图片上传配置
 */
export const STORAGE_CONFIG = {
  bucket: 'style-previews',
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
} as const

/**
 * 获取 Storage 客户端
 */
function getStorageClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return supabase.storage
}

/**
 * 上传单张图片到 Storage
 * @param file - 图片文件
 * @param path - 存储路径
 * @returns 上传结果（public URL 或错误信息）
 */
export async function uploadImage(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // 验证文件大小
    if (file.size > STORAGE_CONFIG.maxSize) {
      return {
        success: false,
        error: '图片大小不能超过 5MB',
      }
    }

    // 验证文件类型
    if (!STORAGE_CONFIG.allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '图片格式仅支持 JPG、PNG、WEBP',
      }
    }

    const storage = getStorageClient()
    const { data, error } = await storage
      .from(STORAGE_CONFIG.bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) {
      console.error('图片上传失败:', error)
      return {
        success: false,
        error: `图片上传失败：${error.message}`,
      }
    }

    // 生成公共访问 URL
    const { data: urlData } = storage
      .from(STORAGE_CONFIG.bucket)
      .getPublicUrl(path)

    if (!urlData?.publicUrl) {
      return {
        success: false,
        error: '无法生成图片 URL',
      }
    }

    return {
      success: true,
      url: urlData.publicUrl,
    }
  } catch (err) {
    console.error('图片上传异常:', err)
    return {
      success: false,
      error: '图片上传失败，请重试',
    }
  }
}

/**
 * 删除图片
 * @param path - 存储路径
 */
export async function deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    const storage = getStorageClient()
    const { error } = await storage
      .from(STORAGE_CONFIG.bucket)
      .remove([path])

    if (error) {
      console.error('图片删除失败:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (err) {
    console.error('图片删除异常:', err)
    return {
      success: false,
      error: '图片删除失败',
    }
  }
}

/**
 * 生成存储路径
 * @param userId - 用户 ID
 * @param styleId - 风格 ID（可选）
 * @param imageType - 图片类型（light/dark）
 * @param extension - 文件扩展名
 */
export function generateStoragePath(
  userId: string,
  styleId: string | undefined,
  imageType: 'light' | 'dark',
  extension: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8)

  if (styleId) {
    return `submissions/${userId}/${styleId}/${imageType}-${timestamp}-${randomId}.${extension}`
  }

  return `submissions/${userId}/pending/${imageType}-${timestamp}-${randomId}.${extension}`
}

/**
 * 获取文件扩展名
 */
export function getFileExtension(file: File): string {
  const type = file.type.split('/')[1]
  return type || 'jpg'
}
