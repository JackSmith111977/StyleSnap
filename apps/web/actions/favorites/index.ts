'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, toggleFavoriteSchema, styleIdSchema } from '@/lib/schemas'

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
  let validatedData: { styleId: string } | undefined

  try {
    // 验证输入参数
    validatedData = validateOrThrow(toggleFavoriteSchema, { styleId })

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

    // 使用数据库 RPC 函数实现原子更新
    const { data, error } = await supabase.rpc('toggle_favorite_atomic', {
      p_style_id: validatedData.styleId,
      p_user_id: user.id,
    })

    if (error) {
      throw error
    }

    const result = data as { is_favorite: boolean; count: number }

    // 清除缓存 - 使用精确的 tag 而非全局 revalidate
    revalidateTag(`style-${validatedData.styleId}`, 'max')
    revalidatePath(`/styles/${validatedData.styleId}`, 'page')
    revalidatePath('/styles', 'page')

    return {
      success: true,
      data: { isFavorite: result.is_favorite, count: result.count },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'toggleFavorite',
      styleId: validatedData?.styleId ?? styleId,
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

    // 步骤 1: 先获取 favorites 表中的 style_id 列表（避免嵌套查询的 RLS 问题）
    const { data: favoritesData, error: favoritesError, count } = await supabase
      .from('favorites')
      .select('style_id, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (favoritesError) {
      throw favoritesError
    }

    // 如果没有收藏，直接返回空结果
    if (!favoritesData || favoritesData.length === 0) {
      return {
        success: true,
        data: {
          styles: [],
          total: count ?? 0,
          page,
          limit,
          totalPages: Math.ceil((count ?? 0) / limit),
        },
      }
    }

    // 提取 style_id 列表
    const styleIds = favoritesData.map(fav => fav.style_id)

    // 步骤 2: 根据 style_id 列表查询完整的风格信息
    const { data: stylesData, error: stylesError } = await supabase
      .from('styles')
      .select(`
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
      `)
      .in('id', styleIds)

    if (stylesError) {
      throw stylesError
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

    // 按 favorites 的顺序排序（因为 stylesData 可能顺序不同）
    const stylesMap = new Map(stylesData?.map(style => [style.id, style]) ?? [])
    const styles: FavoriteStyle[] = styleIds.map(id => {
      const style = stylesMap.get(id)
      if (!style) return null

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
    }).filter((s): s is FavoriteStyle => s !== null)

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
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('style_id', validatedData)
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
      styleId: validatedData ?? styleId,
    })
    return { success: false, error: '检查收藏状态失败' }
  }
}
