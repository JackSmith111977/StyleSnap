'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError } from '@/lib/sentry-capture'
import { validateOrThrow, styleIdSchema } from '@/lib/schemas'

/**
 * 获取作者信息（包含关注状态）
 */
export async function getAuthorInfo(
  authorId: string
): Promise<{
  success: boolean
  data?: {
    user_id: string
    display_name: string | null
    avatar_url: string | null
    bio: string | null
    style_count: number
    follower_count: number
    following_count: number
    is_following: boolean
    created_at: string
  }
  error?: string
}> {
  let validatedData: string | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, authorId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    // 获取作者资料
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        avatar_url,
        bio,
        follower_count,
        following_count,
        created_at
      `)
      .eq('user_id', validatedData)
      .single()

    if (profileError || !profile) {
      return { success: false, error: '作者不存在' }
    }

    // 获取作者作品数量
    const { count } = await supabase
      .from('styles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', validatedData)
      .eq('status', 'published')

    // 检查关注状态（仅登录用户）
    let isFollowing = false
    if (user) {
      const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', validatedData)
        .single()

      isFollowing = !!followData
    }

    // 类型断言：确保 profile 字段类型安全
    const typedProfile = profile as {
      user_id: string
      display_name: string | null
      avatar_url: string | null
      bio: string | null
      follower_count: number | null
      following_count: number | null
      created_at: string
    }

    return {
      success: true,
      data: {
        user_id: typedProfile.user_id,
        display_name: typedProfile.display_name,
        avatar_url: typedProfile.avatar_url,
        bio: typedProfile.bio,
        style_count: count ?? 0,
        follower_count: typedProfile.follower_count ?? 0,
        following_count: typedProfile.following_count ?? 0,
        is_following: isFollowing,
        created_at: typedProfile.created_at,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getAuthorInfo',
      authorId: validatedData ?? authorId,
    })
    return { success: false, error: '获取作者信息失败' }
  }
}
