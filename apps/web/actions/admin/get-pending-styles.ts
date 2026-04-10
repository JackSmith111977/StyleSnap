'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { requireAdmin } from './check-admin-role'

const VALID_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 待审风格列表项（精简版，用于列表展示）
 */
export interface PendingStyle {
  id: string
  title: string
  description: string | null
  preview_light: string | null
  preview_dark: string | null
  submitted_at: string | null
  design_tokens: Record<string, unknown> | null
  category_id: string
  category_name: string | null
  author_username: string | null
  author_avatar_url: string | null
}

/**
 * 待审风格列表查询结果
 */
export interface GetPendingStylesResult {
  styles: PendingStyle[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 验证输入参数
 */
function validatePendingStylesOptions(options: {
  page?: number
  limit?: number
  category?: string | null
}): string | null {
  const page = options.page ?? 1
  const limit = options.limit ?? 20

  if (!Number.isInteger(page) || page < 1) return '页码必须为正整数'
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) return '每页数量必须在 1-100 之间'
  if (options.category && !VALID_UUID_REGEX.test(options.category)) return '分类格式无效'
  return null
}

/**
 * 获取待审核风格列表（管理员专用）
 * 查询 status = 'pending_review' 的风格，按 submitted_at 降序排列
 */
export const getPendingStyles = cache(async (
  options: {
    page?: number
    limit?: number
    category?: string | null
  } = {}
): Promise<{
  success: boolean
  data?: GetPendingStylesResult
  error?: string
}> => {
  try {
    // 管理员权限校验
    await requireAdmin()

    // 输入校验
    const validationError = validatePendingStylesOptions(options)
    if (validationError) return { success: false, error: validationError }

    const { page = 1, limit = 20, category = null } = options
    const supabase = await createClient()

    // 构建基础查询
    let query = supabase
      .from('styles')
      .select(
        `
        id,
        title,
        description,
        preview_light,
        preview_dark,
        submitted_at,
        design_tokens,
        category_id,
        category:categories(
          name
        ),
        author:profiles!styles_author_id_fkey(
          username,
          avatar_url
        )
      `,
        { count: 'exact' }
      )
      .eq('status', 'pending_review')

    // 分类筛选
    if (category) {
      query = query.eq('category_id', category)
    }

    // 按 submitted_at 降序（最新提交的在最上面）
    query = query.order('submitted_at', { ascending: false, nullsFirst: false })

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('获取待审风格列表失败:', error)
      return { success: false, error: '获取待审风格列表失败' }
    }

    // 转换数据格式
    const styles: PendingStyle[] = ((data as unknown[]) ?? []).map(
      (item: unknown) => {
        const typedItem = item as Record<string, unknown>
        const categoryData = typedItem.category as { name: string } | null
        const authorData = typedItem.author as {
          username: string
          avatar_url: string | null
        } | null

        return {
          id: typedItem.id as string,
          title: (typedItem.title as string) || '未命名风格',
          description: typedItem.description as string | null,
          preview_light: typedItem.preview_light as string | null,
          preview_dark: typedItem.preview_dark as string | null,
          submitted_at: typedItem.submitted_at as string | null,
          design_tokens: typedItem.design_tokens as Record<string, unknown> | null,
          category_id: typedItem.category_id as string,
          category_name: categoryData?.name ?? null,
          author_username: authorData?.username ?? null,
          author_avatar_url: authorData?.avatar_url ?? null,
        }
      }
    )

    const totalPages = Math.ceil((count ?? 0) / limit)

    return {
      success: true,
      data: {
        styles,
        total: count ?? 0,
        page,
        limit,
        totalPages,
      },
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('PERMISSION_DENIED')) {
      return { success: false, error: '需要管理员权限' }
    }
    console.error('获取待审风格列表异常:', err)
    return { success: false, error: '获取待审风格列表失败' }
  }
})

/**
 * 获取待审风格数量（用于实时更新提示）
 */
export const getPendingCount = cache(async (): Promise<{
  success: boolean
  count?: number
  error?: string
}> => {
  try {
    await requireAdmin()

    const supabase = await createClient()

    const { count, error } = await supabase
      .from('styles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_review')

    if (error) {
      console.error('获取待审数量失败:', error)
      return { success: false, error: '获取待审数量失败' }
    }

    return { success: true, count: count ?? 0 }
  } catch (err) {
    if (err instanceof Error && err.message.includes('PERMISSION_DENIED')) {
      return { success: false, error: '需要管理员权限' }
    }
    console.error('获取待审数量异常:', err)
    return { success: false, error: '获取待审数量失败' }
  }
})
