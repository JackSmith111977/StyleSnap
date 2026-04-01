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

    // 检查风格是否存在
    const { data: style, error: styleError } = await supabase
      .from('styles')
      .select('id, like_count')
      .eq('id', validatedData.styleId)
      .single()

    if (styleError || !style) {
      return { success: false, error: '风格不存在' }
    }

    // 检查是否已点赞
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('style_id', validatedData.styleId)
      .single()

    let isLiked: boolean
    let count: number

    if (existing) {
      // 取消点赞
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('style_id', validatedData.styleId)

      if (deleteError) {
        throw deleteError
      }

      isLiked = false
      count = Math.max(style.like_count - 1, 0)
    } else {
      // 添加点赞
      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          style_id: validatedData.styleId,
        })

      if (insertError) {
        throw insertError
      }

      isLiked = true
      count = style.like_count + 1
    }

    // 更新点赞计数
    await supabase
      .from('styles')
      .update({ like_count: count })
      .eq('id', validatedData.styleId)

    // 清除缓存 - 使用精确的 tag 而非全局 revalidate
    revalidateTag(`style-${validatedData.styleId}`, 'max')
    revalidatePath(`/styles/${validatedData.styleId}`, 'page')
    revalidatePath('/styles', 'page')

    return {
      success: true,
      data: { isLiked, count },
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
