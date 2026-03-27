'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath } from 'next/cache'

export interface ToggleFavoriteResult {
  isFavorite: boolean
  count: number
}

/**
 * 切换收藏状态
 */
export async function toggleFavorite(
  styleId: string
): Promise<{ success: boolean; data?: ToggleFavoriteResult; error?: string }> {
  try {
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

    // 检查风格是否存在
    const { data: style, error: styleError } = await supabase
      .from('styles')
      .select('id, favorite_count')
      .eq('id', styleId)
      .single()

    if (styleError || !style) {
      return { success: false, error: '风格不存在' }
    }

    // 检查是否已收藏
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('style_id', styleId)
      .single()

    let isFavorite: boolean
    let count: number

    if (existing) {
      // 取消收藏
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('style_id', styleId)

      if (deleteError) {
        throw deleteError
      }

      isFavorite = false
      count = Math.max(style.favorite_count - 1, 0)
    } else {
      // 添加收藏
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          style_id: styleId,
        })

      if (insertError) {
        throw insertError
      }

      isFavorite = true
      count = (style.favorite_count ?? 0) + 1
    }

    // 更新收藏计数
    await supabase
      .from('styles')
      .update({ favorite_count: count })
      .eq('id', styleId)

    // 清除缓存
    revalidatePath(`/styles/${styleId}`)
    revalidatePath('/styles')

    return {
      success: true,
      data: { isFavorite, count },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'toggleFavorite',
      styleId,
    })
    return { success: false, error: '操作失败，请重试' }
  }
}

/**
 * 获取用户的收藏列表
 */
export async function getMyFavorites(
  page = 1,
  limit = 12
): Promise<{
  success: boolean
  data?: {
    styles: Array<{
      id: string
      title: string
      description: string | null
      category_id: string
      status: string
      favorite_count: number
      like_count: number
      view_count: number
      created_at: string
      category?: { name: string; name_en: string; icon: string | null }
      tags?: string[]
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('favorites')
      .select(
        `
        style:styles(
          id,
          title,
          description,
          category_id,
          status,
          favorite_count,
          like_count,
          view_count,
          created_at,
          category:categories(id, name, name_en, icon),
          style_tags:style_tags(tag:tags(name))
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false, foreignTable: 'favorites' })
      .range(from, to)

    if (error) {
      throw error
    }

    // 类型定义
    type FavoriteStyle = {
      id: string
      title: string
      description: string | null
      category_id: string
      status: string
      favorite_count: number
      like_count: number
      view_count: number
      created_at: string
      category?: { name: string; name_en: string; icon: string | null }
      tags?: string[]
    }

    const styles: FavoriteStyle[] =
      (data as unknown as Array<{
        style: {
          id: string
          title: string
          description: string | null
          category_id: string
          status: string
          favorite_count: number
          like_count: number
          view_count: number
          created_at: string
          category?: { name: string; name_en: string; icon: string | null } | Array<{ name: string; name_en: string; icon: string | null }>
          style_tags?: Array<Array<{ tag: { name: string } }>>
        }
      }>).map((item) => {
        const style = item.style
        // 处理 category 可能是数组的情况（Supabase 外键关联）
        const category = Array.isArray(style.category) ? style.category[0] : style.category
        // 处理 style_tags 可能是嵌套数组的情况
        let styleTagsData: Array<{ tag: { name: string } }> = []
        if (style.style_tags) {
          if (Array.isArray(style.style_tags)) {
            styleTagsData = style.style_tags.flat() as Array<{ tag: { name: string } }>
          }
        }
        return {
          id: style.id,
          title: style.title,
          description: style.description,
          category_id: style.category_id,
          status: style.status,
          favorite_count: style.favorite_count,
          like_count: style.like_count,
          view_count: style.view_count,
          created_at: style.created_at,
          category,
          tags: styleTagsData.map((st) => st.tag.name),
        }
      }) ?? []

    return {
      success: true,
      data: {
        styles,
        total: count ?? 0,
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getMyFavorites',
      page,
    })
    return { success: false, error: '获取收藏列表失败' }
  }
}

/**
 * 检查用户是否收藏了某个风格
 */
export async function checkIsFavorite(
  styleId: string
): Promise<{ success: boolean; data?: { isFavorite: boolean }; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('style_id', styleId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return {
      success: true,
      data: { isFavorite: !!data },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'checkIsFavorite',
      styleId,
    })
    return { success: false, error: '检查收藏状态失败' }
  }
}
