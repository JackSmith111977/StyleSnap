'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, toggleLikeSchema, styleIdSchema } from '@/lib/schemas'

export interface ToggleLikeResult {
  isLiked: boolean
  count: number
}

/**
 * 切换点赞状态
 */
export async function toggleLike(
  styleId: string
): Promise<{ success: boolean; data?: ToggleLikeResult; error?: string }> {
  let validatedData: { styleId: string } | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(toggleLikeSchema, { styleId })

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

    // 使用数据库 RPC 函数实现原子更新
    const { data, error } = await supabase.rpc('toggle_like_atomic', {
      p_style_id: validatedData.styleId,
      p_user_id: user.id,
    })

    if (error) {
      throw error
    }

    const result = data as { is_liked: boolean; count: number }

    // 清除缓存 - 使用精确的 tag 而非全局 revalidate
    revalidateTag(`style-${validatedData.styleId}`, 'max')
    revalidatePath(`/styles/${validatedData.styleId}`, 'page')
    revalidatePath('/styles', 'page')

    return {
      success: true,
      data: { isLiked: result.is_liked, count: result.count },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'toggleLike',
      styleId: validatedData?.styleId ?? styleId,
    })
    return { success: false, error: '操作失败，请重试' }
  }
}

/**
 * 检查用户是否点赞了某个风格
 */
export async function checkIsLiked(
  styleId: string
): Promise<{ success: boolean; data?: { isLiked: boolean }; error?: string }> {
  let validatedData: string | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(styleIdSchema, styleId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('style_id', validatedData)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return {
      success: true,
      data: { isLiked: !!data },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'checkIsLiked',
      styleId: validatedData ?? styleId,
    })
    return { success: false, error: '检查点赞状态失败' }
  }
}
