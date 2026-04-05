'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, styleIdSchema, getFavoritesSchema, addStyleToCollectionSchema, toggleFavoriteSchema } from '@/lib/schemas'

// 导入 collections 的函数用于重新导出
import {
  createCollection as _createCollection,
  updateCollection as _updateCollection,
  deleteCollection as _deleteCollection,
  getCollectionDetail as _getCollectionDetail,
  getUserCollections as _getUserCollections,
  getMyCollections as _getMyCollections,
  isStyleInCollection as _isStyleInCollection,
} from '../collections'

export interface ToggleFavoriteResult {
  isFavorite: boolean
  count: number
}

/**
 * 切换收藏状态（原子操作）
 * 返回：是否已收藏、收藏计数
 *
 * @param styleId - 风格 ID
 * @param collectionId - 可选：收藏时直接添加到指定合集
 */
export async function toggleFavorite(
  styleId: string,
  collectionId?: string
): Promise<{ success: boolean; data?: ToggleFavoriteResult; error?: string }> {
  let validatedData: { styleId: string } | undefined

  try {
    console.log('[toggleFavorite] 开始执行:', { styleId, collectionId })
    validatedData = validateOrThrow(toggleFavoriteSchema, { styleId })

    const supabase = await createClient()
    const user = await getCurrentUser()

    console.log('[toggleFavorite] 当前用户:', user?.id ?? 'null')

    if (!user) {
      console.log('[toggleFavorite] 用户未登录，返回错误')
      return { success: false, error: '请先登录' }
    }

    await setSentryUser({
      id: user.id,
      email: user.email ?? undefined,
    })

    console.log('[toggleFavorite] 调用 RPC toggle_favorite_atomic')
    const { data, error } = await supabase.rpc('toggle_favorite_atomic', {
      p_style_id: validatedData.styleId,
      p_user_id: user.id,
    })

    if (error) {
      console.error('[toggleFavorite] RPC 错误:', error)
      throw error
    }

    console.log('[toggleFavorite] RPC 返回结果:', data, 'type:', Array.isArray(data) ? 'array' : typeof data)

    // RPC 返回的是数组 [{ is_favorite, count }]，取第一个元素
    const rpcResult = Array.isArray(data) && data.length > 0 ? data[0] : null
    if (!rpcResult) {
      console.error('[toggleFavorite] RPC 返回空结果')
      throw new Error('RPC 返回空结果')
    }

    const result = {
      is_favorite: rpcResult.is_favorite as boolean,
      count: Number(rpcResult.count) as number,
    }
    console.log('[toggleFavorite] 解析后的结果:', result)

    // 如果指定了合集 ID 且收藏成功，同时添加到合集
    if (collectionId && result.is_favorite) {
      console.log('[toggleFavorite] 添加到合集:', collectionId)
      const { error: collectionError } = await supabase
        .from('style_collection_tags')
        .insert({
          user_id: user.id,
          style_id: validatedData.styleId,
          collection_id: collectionId,
        })

      // 忽略合集相关的错误（如合集不存在、已在合集中等）
      // 不影响收藏操作本身的成功
      if (collectionError && collectionError.code !== '23505') {
        console.log('[toggleFavorite] 添加到合集错误:', collectionError)
        // 记录错误但不影响返回结果
        await captureActionError(collectionError, {
          action: 'toggleFavorite.addCollection',
          styleId,
          collectionId,
        })
      }
    }

    console.log('[toggleFavorite] revalidate 路径')
    revalidateTag(`style-${validatedData.styleId}`, 'max')
    revalidatePath(`/styles/${validatedData.styleId}`, 'page')
    revalidatePath('/styles', 'page')
    revalidatePath('/favorites', 'page')

    console.log('[toggleFavorite] 返回成功结果')
    return {
      success: true,
      data: { isFavorite: result.is_favorite, count: result.count },
    }
  } catch (error) {
    console.error('[toggleFavorite] 捕获异常:', error)
    if (error instanceof Error) {
      console.error('[toggleFavorite] 异常详情:', {
        message: error.message,
        stack: error.stack
      })
    }
    await captureActionError(error, {
      action: 'toggleFavorite',
      styleId: validatedData?.styleId ?? styleId,
    })
    return { success: false, error: '操作失败，请重试' }
  }
}

/**
 * 获取用户的收藏列表（支持按合集筛选）
 */
export async function getFavorites(
  collectionId?: string | null,
  page = 1,
  limit = 20
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
      collections?: Array<{ collection_id: string; collection_name: string }>
    }>
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
}> {
  try {
    console.log('[getFavorites] Called with:', { collectionId, page, limit })

    const supabase = await createClient()
    const user = await getCurrentUser()

    console.log('[getFavorites] Current user:', user?.id ?? 'null')

    if (!user) {
      console.log('[getFavorites] No user found, returning error')
      return { success: false, error: '请先登录' }
    }

    // 验证参数
    const validatedData = validateOrThrow(getFavoritesSchema, { collectionId, page, limit })
    console.log('[getFavorites] Validated data:', validatedData)
    const from = (validatedData.page - 1) * validatedData.limit

    // 步骤 1: 获取 favorites 表中的 style_id 列表
    let favoritesQuery = supabase
      .from('favorites')
      .select('style_id, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    console.log('[getFavorites] Collection filter:', {
      collectionId: validatedData.collectionId,
      isUncategorized: validatedData.collectionId === 'uncategorized'
    })

    if (validatedData.collectionId) {
      if (validatedData.collectionId === 'uncategorized') {
        // 特殊处理：获取未分类的收藏（不在任何合集中的 style_id）
        console.log('[getFavorites] Fetching uncategorized favorites')

        // 先获取所有收藏的 style_id
        const { data: allFavoritesData, error: allFavoritesError } = await supabase
          .from('favorites')
          .select('style_id')
          .eq('user_id', user.id)

        if (allFavoritesError) throw allFavoritesError

        if (!allFavoritesData || allFavoritesData.length === 0) {
          console.log('[getFavorites] No favorites found')
          return {
            success: true,
            data: { styles: [], total: 0, page: validatedData.page, limit: validatedData.limit, totalPages: 0 },
          }
        }

        const allStyleIds = allFavoritesData.map(f => f.style_id)

        // 获取已关联合集的 style_id
        const { data: taggedData, error: taggedError } = await supabase
          .from('style_collection_tags')
          .select('style_id')
          .eq('user_id', user.id)
          .in('style_id', allStyleIds)

        if (taggedError) throw taggedError

        const taggedStyleIds = new Set(taggedData?.map(t => t.style_id) || [])
        const uncategorizedStyleIds = allStyleIds.filter(id => !taggedStyleIds.has(id))

        console.log('[getFavorites] Uncategorized style IDs:', uncategorizedStyleIds.length)

        if (uncategorizedStyleIds.length === 0) {
          return {
            success: true,
            data: { styles: [], total: 0, page: validatedData.page, limit: validatedData.limit, totalPages: 0 },
          }
        }

        // 使用过滤后的 style_id 列表查询
        favoritesQuery = favoritesQuery.in('style_id', uncategorizedStyleIds)
      } else {
        // 如果指定了合集 ID（UUID），先筛选 style_collection_tags
        console.log('[getFavorites] Fetching collection:', validatedData.collectionId)
        const { data: tagData, error: tagError } = await supabase
          .from('style_collection_tags')
          .select('style_id')
          .eq('user_id', user.id)
          .eq('collection_id', validatedData.collectionId)

        if (tagError) throw tagError

        if (!tagData || tagData.length === 0) {
          console.log('[getFavorites] No styles in collection')
          return {
            success: true,
            data: { styles: [], total: 0, page: validatedData.page, limit: validatedData.limit, totalPages: 0 },
          }
        }

        const styleIds = tagData.map(t => t.style_id)
        favoritesQuery = favoritesQuery.in('style_id', styleIds)
      }
    }

    favoritesQuery = favoritesQuery.range(from, from + validatedData.limit - 1)

    const { data: favoritesData, error: favoritesError, count } = await favoritesQuery

    if (favoritesError) {
      throw favoritesError
    }

    if (!favoritesData || favoritesData.length === 0) {
      return {
        success: true,
        data: {
          styles: [],
          total: count ?? 0,
          page: validatedData.page,
          limit: validatedData.limit,
          totalPages: Math.ceil((count ?? 0) / validatedData.limit),
        },
      }
    }

    const styleIds = favoritesData.map(fav => fav.style_id)

    // 步骤 2: 查询完整的风格信息
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

    // 如果需要获取每个风格关联的合集信息
    let collectionTags: Array<{ style_id: string; collection_id: string; collection_name: string }> = []
    if (!validatedData.collectionId) {
      const { data: tagsData } = await supabase
        .from('style_collection_tags')
        .select('style_id, collection_id, collections(name)')
        .in('style_id', styleIds)
        .eq('user_id', user.id)

      if (tagsData) {
        collectionTags = tagsData.map(t => ({
          style_id: t.style_id,
          collection_id: t.collection_id,
          collection_name: (t.collections as { name: string } | null)?.name ?? '',
        }))
      }
    }

    const stylesMap = new Map(stylesData?.map(style => [style.id, style]) ?? [])
    const styles: Array<{
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
      collections?: Array<{ collection_id: string; collection_name: string }>
    }> = []

    for (const id of styleIds) {
      const style = stylesMap.get(id)
      if (!style) continue

      const category = Array.isArray(style.category) ? style.category[0] : style.category
      let styleTagsData: Array<{ tag: { name: string } }> = []
      if (style.style_tags) {
        if (Array.isArray(style.style_tags)) {
          const flatTags = style.style_tags.flat()
          styleTagsData = flatTags.map((t: { tag?: { name: string }; name?: string }) => ({ tag: { name: t.tag?.name ?? t.name ?? '' } }))
        }
      }

      // 获取该风格关联的所有合集
      const styleCollections = collectionTags
        .filter(t => t.style_id === id)
        .map(t => ({ collection_id: t.collection_id, collection_name: t.collection_name }))

      styles.push({
        id: style.id,
        title: style.title,
        description: style.description ?? null,
        category_id: style.category_id,
        status: style.status,
        favorite_count: style.favorite_count,
        like_count: style.like_count,
        view_count: style.view_count,
        created_at: style.created_at,
        category: category ? { name: category.name, name_en: category.name_en, icon: category.icon } : undefined,
        tags: styleTagsData.map((st) => st.tag.name),
        collections: styleCollections,
      })
    }

    return {
      success: true,
      data: {
        styles,
        total: count ?? 0,
        page: validatedData.page,
        limit: validatedData.limit,
        totalPages: Math.ceil((count ?? 0) / validatedData.limit),
      },
    }
  } catch (error) {
    console.error('[getFavorites] Error:', error)
    if (error instanceof Error) {
      console.error('[getFavorites] Error details:', {
        message: error.message,
        stack: error.stack,
        cause: error.cause
      })
    }
    await captureActionError(error, {
      action: 'getFavorites',
      collectionId,
      page,
    })
    return { success: false, error: '获取收藏列表失败' }
  }
}

/**
 * 添加风格到合集
 *
 * 注意：使用数据库外键约束确保引用完整性
 * - style_collection_tags.style_id 外键关联 favorites(user_id, style_id)
 * - 如果收藏不存在，数据库约束会拒绝插入
 */
export async function addStyleToCollection(
  styleId: string,
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = validateOrThrow(addStyleToCollectionSchema, { styleId, collectionId })

    const supabase = await createClient()
    const user = await requireAuth()

    // 验证合集是否属于当前用户
    const { data: collection, error: collectionError } = await supabase
      .from('collections')
      .select('id, user_id')
      .eq('id', validatedData.collectionId)
      .eq('user_id', user.id)
      .single()

    if (collectionError || !collection) {
      return { success: false, error: '合集不存在或无权操作' }
    }

    // 添加合集标签
    // 注意：数据库外键约束会自动验证 (user_id, style_id) 是否存在于 favorites 表
    const { error: insertError } = await supabase
      .from('style_collection_tags')
      .insert({
        user_id: user.id,
        style_id: validatedData.styleId,
        collection_id: validatedData.collectionId,
      })

    if (insertError) {
      // 23503 = foreign_key_violation
      if (insertError.code === '23503') {
        return { success: false, error: '请先收藏该风格' }
      }
      // 23505 = unique_violation
      if (insertError.code === '23505') {
        return { success: false, error: '风格已在该合集中' }
      }
      throw insertError
    }

    revalidatePath(`/favorites`, 'page')
    revalidatePath(`/collections/${validatedData.collectionId}`, 'page')
    revalidateTag(`collections-${user.id}`, 'max')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'addStyleToCollection',
      styleId,
      collectionId,
    })
    return { success: false, error: '添加失败，请重试' }
  }
}

/**
 * 从合集移除风格
 */
export async function removeStyleFromCollection(
  styleId: string,
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = validateOrThrow(addStyleToCollectionSchema, { styleId, collectionId })

    const supabase = await createClient()
    const user = await requireAuth()

    // 删除合集标签
    const { error } = await supabase
      .from('style_collection_tags')
      .delete()
      .eq('user_id', user.id)
      .eq('style_id', validatedData.styleId)
      .eq('collection_id', validatedData.collectionId)

    if (error) {
      throw error
    }

    revalidatePath(`/favorites`, 'page')
    revalidatePath(`/collections/${validatedData.collectionId}`, 'page')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'removeStyleFromCollection',
      styleId,
      collectionId,
    })
    return { success: false, error: '移除失败，请重试' }
  }
}

/**
 * 检查风格是否在指定合集中
 */
export async function checkIsFavorite(
  styleId: string
): Promise<{ success: boolean; data?: { isFavorite: boolean }; error?: string }> {
  try {
    const validatedData = validateOrThrow(styleIdSchema, styleId)

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
      styleId,
    })
    return { success: false, error: '检查失败' }
  }
}

/**
 * 获取用户的合集列表（用于下拉选择）
 */
export async function getUserCollectionsSimple(): Promise<{
  success: boolean
  data?: Array<{ id: string; name: string; style_count: number }>
  error?: string
}> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()

    const { data, error } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        style_count:style_collection_tags(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const collections = (data || []).map(c => ({
      id: c.id,
      name: c.name,
      style_count: Array.isArray(c.style_count) ? (c.style_count[0] as { count?: number })?.count ?? 0 : 0,
    }))

    return {
      success: true,
      data: collections,
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getUserCollectionsSimple',
    })
    return { success: false, error: '获取合集列表失败' }
  }
}

/**
 * 获取用户未分类的收藏数量
 */
export async function getUncategorizedFavoritesCount(): Promise<{
  success: boolean
  data?: { count: number }
  error?: string
}> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()

    // 获取所有收藏的 style_id
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('style_id')
      .eq('user_id', user.id)

    if (favoritesError) {
      throw favoritesError
    }

    if (!favoritesData || favoritesData.length === 0) {
      return { success: true, data: { count: 0 } }
    }

    const styleIds = favoritesData.map(f => f.style_id)

    // 获取已关联合集的 style_id（去重）
    const { data: taggedData, error: taggedError } = await supabase
      .from('style_collection_tags')
      .select('style_id')
      .eq('user_id', user.id)
      .in('style_id', styleIds)

    if (taggedError) {
      throw taggedError
    }

    const taggedStyleIds = new Set(taggedData?.map(t => t.style_id) || [])
    const uncategorizedCount = styleIds.filter(id => !taggedStyleIds.has(id)).length

    return {
      success: true,
      data: { count: uncategorizedCount },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getUncategorizedFavoritesCount',
    })
    return { success: false, error: '获取未分类数量失败' }
  }
}

// 重新导出 collections 相关的 CRUD 操作
export const createCollection = _createCollection
export const updateCollection = _updateCollection
export const deleteCollection = _deleteCollection
export const getCollectionDetail = _getCollectionDetail
export const getUserCollections = _getUserCollections
export const getMyCollections = _getMyCollections
export const isStyleInCollection = _isStyleInCollection
