'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, styleIdSchema } from '@/lib/schemas'

export interface ToggleFollowResult {
  isFollowing: boolean
  followerCount: number
  followingCount: number
}

/**
 * 切换关注状态（原子操作）
 */
export async function toggleFollow(
  followingId: string
): Promise<{ success: boolean; data?: ToggleFollowResult; error?: string }> {
  let validatedData: { followingId: string } | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, { followingId })

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email ?? undefined,
    })

    // 不能关注自己
    if (user.id === validatedData.followingId) {
      return { success: false, error: '不能关注自己' }
    }

    // 使用数据库 RPC 函数实现原子更新
    const { data, error } = await supabase.rpc('toggle_follow', {
      p_following_id: validatedData.followingId,
    })

    if (error) {
      throw error
    }

    const result = data as unknown as {
      is_following: boolean
      follower_count: number
      following_count: number
    }

    // 清除缓存 - 使用精确的 tag
    revalidateTag(`profile-${validatedData.followingId}`, 'max')
    revalidatePath(`/profile/${validatedData.followingId}`, 'page')

    return {
      success: true,
      data: {
        isFollowing: result.is_following,
        followerCount: result.follower_count,
        followingCount: result.following_count,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'toggleFollow',
      followingId: validatedData?.followingId ?? followingId,
    })
    return { success: false, error: '操作失败，请重试' }
  }
}

/**
 * 获取用户的关注状态
 */
export async function getFollowStatus(
  userId: string
): Promise<{
  success: boolean
  data?: { isFollowing: boolean; followerCount: number; followingCount: number }
  error?: string
}> {
  let validatedData: string | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, userId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    // 获取关注关系
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', validatedData)
      .single()

    // 获取用户的关注统计
    const { data: profileData } = await supabase
      .from('profiles')
      .select('follower_count, following_count')
      .eq('user_id', validatedData)
      .single()

    return {
      success: true,
      data: {
        isFollowing: !!followData,
        followerCount: profileData?.follower_count ?? 0,
        followingCount: profileData?.following_count ?? 0,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getFollowStatus',
      userId: validatedData ?? userId,
    })
    return { success: false, error: '获取关注状态失败' }
  }
}

/**
 * 获取关注动态（用户关注的作者提交的风格）
 */
export async function getFollowingFeed(
  page = 1,
  limit = 20
): Promise<{
  success: boolean
  data?: {
    styles: Array<{
      id: string
      name: string
      description: string | null
      preview_image_light: string | null
      preview_image_dark: string | null
      category_id: string
      category_name: string
      author_id: string
      author_name: string | null
      author_avatar: string | null
      like_count: number
      favorite_count: number
      view_count: number
      created_at: string
    }>
    total: number
    page: number
    limit: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const offset = (page - 1) * limit

    // 使用数据库 RPC 函数获取关注动态
    const { data, error } = await supabase.rpc('get_following_feed', {
      p_user_id: user.id,
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      throw error
    }

    // 类型转换
    const styles = ((data as unknown[]) ?? []).map((item: unknown) => {
      const typedItem = item as Record<string, unknown>
      return {
        id: typedItem.style_id as string,
        name: typedItem.style_name as string,
        description: typedItem.style_description as string | null,
        preview_image_light: typedItem.style_preview_light as string | null,
        preview_image_dark: typedItem.style_preview_dark as string | null,
        category_id: typedItem.category_id as string,
        category_name: typedItem.category_name as string,
        author_id: typedItem.author_id as string,
        author_name: typedItem.author_name as string,
        author_avatar: typedItem.author_avatar as string | null,
        like_count: typedItem.like_count as number,
        favorite_count: typedItem.favorite_count as number,
        view_count: Number(typedItem.view_count),
        created_at: typedItem.created_at as string,
      }
    })

    return {
      success: true,
      data: {
        styles,
        total: styles.length,
        page,
        limit,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getFollowingFeed',
      page,
    })
    return { success: false, error: '获取关注动态失败' }
  }
}

/**
 * 获取用户资料（包含关注状态）
 */
export async function getUserProfile(
  userId: string
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
  }
  error?: string
}> {
  let validatedData: string | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, userId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    // 获取用户资料（包含关注状态）
    const { data, error } = await supabase.rpc('get_user_profile', {
      p_user_id: validatedData,
      p_viewer_id: user?.id ?? null,
    })

    if (error) {
      throw error
    }

    const profile = (data as unknown[])[0]

    if (!profile) {
      return { success: false, error: '用户不存在' }
    }

    const typedProfile = profile as Record<string, unknown>
    return {
      success: true,
      data: {
        user_id: typedProfile.user_id as string,
        display_name: typedProfile.display_name as string | null,
        avatar_url: typedProfile.avatar_url as string | null,
        bio: typedProfile.bio as string | null,
        style_count: Number(typedProfile.style_count),
        follower_count: typedProfile.follower_count as number,
        following_count: typedProfile.following_count as number,
        is_following: typedProfile.is_following as boolean,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getUserProfile',
      userId: validatedData ?? userId,
    })
    return { success: false, error: '获取用户资料失败' }
  }
}
