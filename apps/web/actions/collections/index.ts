'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser, requireAuth } from '@/lib/auth'
import { captureActionError, setSentryUser } from '@/lib/sentry-capture'
import { revalidatePath, revalidateTag } from 'next/cache'
import { validateOrThrow, styleIdSchema } from '@/lib/schemas'
import type { z } from 'zod'
import type { Collection, CollectionDetail } from './types'
import type { createCollectionSchema, updateCollectionSchema } from './types'

/**
 * 创建合集
 */
export async function createCollection(
  data: z.infer<typeof createCollectionSchema>
): Promise<{ success: boolean; data?: { id: string }; error?: string }> {
  try {
    // 验证输入
    const validatedData = validateOrThrow(createCollectionSchema, data)

    const supabase = await createClient()
    const user = await requireAuth()

    // 设置 Sentry 用户上下文
    await setSentryUser({
      id: user.id,
      email: user.email ?? undefined,
    })

    // 创建合集
    const { data: collection, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description,
        cover_style_id: validatedData.coverStyleId,
        is_public: validatedData.isPublic,
      })
      .select('id')
      .single()

    if (error) {
      // 处理重名错误
      if (error.code === '23505') { // unique_violation
        return { success: false, error: '合集名称已存在' }
      }
      // 处理数量限制错误
      if (error.message?.includes('最多创建 20 个合集')) {
        return { success: false, error: '每个用户最多创建 20 个合集' }
      }
      throw error
    }

    // 清除缓存
    revalidatePath('/collections', 'page')
    revalidateTag(`collections-${user.id}`, 'max')

    return {
      success: true,
      data: { id: (collection as { id: string }).id },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'createCollection',
      data,
    })
    return { success: false, error: '创建合集失败，请重试' }
  }
}

/**
 * 更新合集
 */
export async function updateCollection(
  data: z.infer<typeof updateCollectionSchema>
): Promise<{ success: boolean; error?: string }> {
  try {
    // 验证输入
    const validatedData = validateOrThrow(updateCollectionSchema, data)

    const supabase = await createClient()
    await requireAuth()

    // 更新合集
    const { error } = await supabase
      .from('collections')
      .update({
        name: validatedData.name,
        description: validatedData.description,
        cover_style_id: validatedData.coverStyleId,
        is_public: validatedData.isPublic,
      })
      .eq('id', validatedData.id)
      .eq('user_id', (await getCurrentUser())?.id)

    if (error) {
      // 处理重名错误
      if (error.code === '23505') {
        return { success: false, error: '合集名称已存在' }
      }
      throw error
    }

    // 清除缓存
    revalidatePath('/collections', 'page')
    revalidatePath(`/collections/${validatedData.id}`, 'page')
    revalidateTag(`collection-${validatedData.id}`, 'max')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'updateCollection',
      data,
    })
    return { success: false, error: '更新合集失败，请重试' }
  }
}

/**
 * 删除合集
 */
export async function deleteCollection(
  collectionId: string
): Promise<{ success: boolean; error?: string }> {
  let validatedData: string | undefined

  try {
    // 验证输入
    validatedData = validateOrThrow(styleIdSchema, collectionId)

    const supabase = await createClient()
    const user = await requireAuth()

    // 删除合集（级联删除 collection_styles）
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', validatedData)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    // 清除缓存
    revalidatePath('/collections', 'page')
    revalidateTag(`collections-${user.id}`, 'max')
    revalidateTag(`collection-${validatedData}`, 'max')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'deleteCollection',
      collectionId: validatedData ?? collectionId,
    })
    return { success: false, error: '删除合集失败，请重试' }
  }
}

/**
 * 获取合集详情
 */
export async function getCollectionDetail(
  collectionId: string
): Promise<{ success: boolean; data?: CollectionDetail; error?: string }> {
  let validatedData: string | undefined

  try {
    // 验证输入
    validatedData = validateOrThrow(styleIdSchema, collectionId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    // 使用 RPC 函数获取合集详情
    const { data, error } = await supabase.rpc('get_collection_detail', {
      p_collection_id: validatedData,
      p_viewer_id: user?.id ?? null,
    })

    if (error) {
      if (error.message?.includes('无权访问')) {
        return { success: false, error: '无权访问此合集' }
      }
      throw error
    }

    const collection = (data?.[0] as unknown) as {
      id: string
      user_id: string
      name: string
      description: string
      cover_style_id: string | null
      is_public: boolean
      created_at: string
      updated_at: string
      style_count: number
      owner_name: string | null
      owner_avatar: string | null
      styles: unknown[]
    }

    if (!collection) {
      return { success: false, error: '合集不存在' }
    }

    return {
      success: true,
      data: {
        id: collection.id,
        user_id: collection.user_id,
        name: collection.name,
        description: collection.description,
        cover_style_id: collection.cover_style_id,
        is_public: collection.is_public,
        created_at: collection.created_at,
        updated_at: collection.updated_at,
        style_count: Number(collection.style_count),
        owner_name: collection.owner_name,
        owner_avatar: collection.owner_avatar,
        styles: collection.styles ?? [],
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getCollectionDetail',
      collectionId: validatedData ?? collectionId,
    })
    return { success: false, error: '获取合集详情失败' }
  }
}

/**
 * 获取用户的合集列表
 */
export async function getUserCollections(
  userId: string,
  page = 1,
  limit = 20
): Promise<{
  success: boolean
  data?: { collections: Collection[]; total: number }
  error?: string
}> {
  let validatedData: string | undefined

  try {
    // 验证输入
    validatedData = validateOrThrow(styleIdSchema, userId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    const offset = (page - 1) * limit

    // 使用 RPC 函数获取合集列表
    const { data: rawData, error } = await supabase.rpc('get_user_collections', {
      p_user_id: validatedData,
      p_viewer_id: user?.id ?? null,
      p_limit: limit,
      p_offset: offset,
    })

    if (error) {
      throw error
    }

    const collections: Collection[] = ((rawData as unknown[]) ?? []).map((item: unknown) => {
      const typedItem = item as Record<string, unknown>
      return {
        id: typedItem.id as string,
        user_id: typedItem.user_id as string,
        name: typedItem.name as string,
        description: typedItem.description as string,
        cover_style_id: typedItem.cover_style_id as string | null,
        is_public: typedItem.is_public as boolean,
        created_at: typedItem.created_at as string,
        updated_at: typedItem.updated_at as string,
        style_count: Number(typedItem.style_count),
        cover_preview: typedItem.cover_preview as string | null,
      }
    })

    return {
      success: true,
      data: {
        collections,
        total: collections.length,
      },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'getUserCollections',
      userId: validatedData ?? userId,
      page,
    })
    return { success: false, error: '获取合集列表失败' }
  }
}

/**
 * 获取当前用户的合集列表（用于用户菜单）
 */
export async function getMyCollections(
  page = 1,
  limit = 20
): Promise<{
  success: boolean
  data?: { collections: Collection[]; total: number }
  error?: string
}> {
  try {
    const user = await requireAuth()
    return await getUserCollections(user.id, page, limit)
  } catch (error) {
    if (error instanceof Error && error.message === '请先登录') {
      return { success: false, error: '请先登录' }
    }
    await captureActionError(error, {
      action: 'getMyCollections',
      page,
    })
    return { success: false, error: '获取合集列表失败' }
  }
}

/**
 * 添加风格到合集
 */
export async function addStyleToCollection(
  collectionId: string,
  styleId: string
): Promise<{ success: boolean; error?: string }> {
  let validatedCollectionId: string | undefined
  let validatedStyleId: string | undefined

  try {
    // 验证输入
    validatedCollectionId = validateOrThrow(styleIdSchema, collectionId)
    validatedStyleId = validateOrThrow(styleIdSchema, styleId)

    const supabase = await createClient()
    await requireAuth()

    // 使用 RPC 函数添加风格
    const { error } = await supabase.rpc('add_style_to_collection', {
      p_collection_id: validatedCollectionId,
      p_style_id: validatedStyleId,
    })

    if (error) {
      if (error.message?.includes('已在合集中')) {
        return { success: false, error: '风格已在合集中' }
      }
      if (error.message?.includes('最多添加 50 个风格')) {
        return { success: false, error: '每个合集最多添加 50 个风格' }
      }
      throw error
    }

    // 清除缓存
    revalidatePath(`/collections/${validatedCollectionId}`, 'page')
    revalidateTag(`collection-${validatedCollectionId}`, 'max')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'addStyleToCollection',
      collectionId: validatedCollectionId ?? collectionId,
      styleId: validatedStyleId ?? styleId,
    })
    return { success: false, error: '添加风格失败，请重试' }
  }
}

/**
 * 从合集移除风格
 */
export async function removeStyleFromCollection(
  collectionId: string,
  styleId: string
): Promise<{ success: boolean; error?: string }> {
  let validatedCollectionId: string | undefined
  let validatedStyleId: string | undefined

  try {
    // 验证输入
    validatedCollectionId = validateOrThrow(styleIdSchema, collectionId)
    validatedStyleId = validateOrThrow(styleIdSchema, styleId)

    const supabase = await createClient()
    await requireAuth()

    // 使用 RPC 函数移除风格
    const { error } = await supabase.rpc('remove_style_from_collection', {
      p_collection_id: validatedCollectionId,
      p_style_id: validatedStyleId,
    })

    if (error) {
      throw error
    }

    // 清除缓存
    revalidatePath(`/collections/${validatedCollectionId}`, 'page')
    revalidateTag(`collection-${validatedCollectionId}`, 'max')

    return { success: true }
  } catch (error) {
    await captureActionError(error, {
      action: 'removeStyleFromCollection',
      collectionId: validatedCollectionId ?? collectionId,
      styleId: validatedStyleId ?? styleId,
    })
    return { success: false, error: '移除风格失败，请重试' }
  }
}

/**
 * 检查风格是否在合集中
 */
export async function isStyleInCollection(
  collectionId: string,
  styleId: string
): Promise<{ success: boolean; data?: { isInCollection: boolean }; error?: string }> {
  let validatedCollectionId: string | undefined
  let validatedStyleId: string | undefined

  try {
    // 验证输入
    validatedCollectionId = validateOrThrow(styleIdSchema, collectionId)
    validatedStyleId = validateOrThrow(styleIdSchema, styleId)

    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return { success: false, error: '请先登录' }
    }

    const { data, error } = await supabase
      .from('style_collection_tags')
      .select('id')
      .eq('collection_id', validatedCollectionId)
      .eq('style_id', validatedStyleId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return {
      success: true,
      data: { isInCollection: !!data },
    }
  } catch (error) {
    await captureActionError(error, {
      action: 'isStyleInCollection',
      collectionId: validatedCollectionId ?? collectionId,
      styleId: validatedStyleId ?? styleId,
    })
    return { success: false, error: '检查失败' }
  }
}
