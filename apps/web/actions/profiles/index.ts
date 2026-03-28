'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath } from 'next/cache'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  role: 'user' | 'admin' | 'super_admin'
  created_at: string
  updated_at: string
}

export interface UpdateProfileResult {
  profile: Profile
}

/**
 * 获取当前用户资料
 */
export async function getCurrentProfile(): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      throw error
    }

    return {
      success: true,
      data: data as Profile,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getCurrentProfile',
    })
    return { success: false, error: '获取用户资料失败' }
  }
}

/**
 * 获取其他用户资料（公开信息）
 */
export async function getUserProfile(
  userId: string
): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, created_at')
      .eq('id', userId)
      .single()

    if (error || !data) {
      throw error
    }

    return {
      success: true,
      data: data as Profile,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getUserProfile',
      userId,
    })
    return { success: false, error: '获取用户资料失败' }
  }
}

/**
 * 更新用户资料
 */
export async function updateProfile(
  updates: {
    username?: string
    full_name?: string
    bio?: string
  }
): Promise<{ success: boolean; data?: UpdateProfileResult; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email || undefined,
    })

    // 验证输入
    if (updates.username) {
      if (updates.username.length < 3 || updates.username.length > 20) {
        return { success: false, error: '用户名长度必须在 3-20 个字符之间' }
      }
      // 只允许字母、数字、下划线
      if (!/^[a-zA-Z0-9_]+$/.test(updates.username)) {
        return { success: false, error: '用户名只能包含字母、数字和下划线' }
      }
    }

    if (updates.full_name && updates.full_name.length > 50) {
      return { success: false, error: '昵称不能超过 50 个字符' }
    }

    if (updates.bio && updates.bio.length > 200) {
      return { success: false, error: '简介不能超过 200 个字符' }
    }

    // 检查用户名是否已被使用
    if (updates.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', updates.username)
        .neq('id', user.id)
        .single()

      if (existing) {
        return { success: false, error: '用户名已被使用' }
      }
    }

    // 更新资料
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        full_name: updates.full_name,
        bio: updates.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      throw updateError
    }

    // 清除缓存
    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { profile: profile as Profile },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'updateProfile',
      updates,
    })
    return { success: false, error: '更新资料失败，请重试' }
  }
}

/**
 * 上传头像
 */
export async function uploadAvatar(
  file: FormData
): Promise<{ success: boolean; data?: { avatar_url: string }; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email || undefined,
    })

    const avatarFile = file.get('avatar') as File
    if (!avatarFile) {
      return { success: false, error: '请选择文件' }
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(avatarFile.type)) {
      return { success: false, error: '只支持 JPG、PNG、GIF、WebP 格式' }
    }

    // 验证文件大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024
    if (avatarFile.size > maxSize) {
      return { success: false, error: '文件大小不能超过 2MB' }
    }

    // 生成文件名
    const fileExt = avatarFile.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`

    // 上传到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(fileName, avatarFile, { upsert: true })

    if (uploadError) {
      throw uploadError
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(fileName)

    const avatar_url = urlData.publicUrl

    // 更新用户资料
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // 清除缓存
    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: { avatar_url },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'uploadAvatar',
    })
    return { success: false, error: '上传头像失败，请重试' }
  }
}

/**
 * 删除头像
 */
export async function deleteAvatar(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 获取当前头像 URL
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (!profile?.avatar_url) {
      return { success: false, error: '没有头像可删除' }
    }

    // 从 URL 提取文件名
    const urlParts = profile.avatar_url.split('/')
    const fileName = urlParts[urlParts.length - 1]

    // 删除 Storage 中的文件
    const { error: deleteError } = await supabase.storage
      .from('user-avatars')
      .remove([fileName])

    if (deleteError) {
      throw deleteError
    }

    // 更新用户资料
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // 清除缓存
    revalidatePath('/profile')
    revalidatePath('/dashboard')

    return {
      success: true,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'deleteAvatar',
    })
    return { success: false, error: '删除头像失败，请重试' }
  }
}
