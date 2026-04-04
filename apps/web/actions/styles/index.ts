'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface Style {
  id: string
  title: string
  description: string | null
  category_id: string
  author_id: string | null
  color_palette: Record<string, string> | null
  fonts: Record<string, string> | null
  spacing: Record<string, string> | null
  border_radius: Record<string, string> | null
  shadows: Record<string, string> | null
  code_html: string | null
  code_css: string | null
  code_react: string | null
  code_tailwind: string | null
  preview_light: string | null
  preview_dark: string | null
  preview_images: Record<string, string> | null
  status: 'draft' | 'published' | 'archived'
  view_count: number
  like_count: number
  favorite_count: number
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
    name_en: string
    icon: string | null
  }
  tags?: string[]
  style_tags?: unknown // 内部使用的中间表数据，返回前会设置为 undefined
}

export interface GetStylesOptions {
  page?: number
  limit?: number
  category?: string
  search?: string
  sortBy?: 'newest' | 'popular' | 'oldest'
  colors?: string[]      // 颜色筛选（标签名前缀 # 省略）
  industries?: string[]  // 行业筛选（标签名前缀 # 省略）
  complexities?: string[] // 复杂度筛选（标签名前缀 # 省略）
}

export interface GetStylesResult {
  styles: Style[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 获取风格列表（缓存）
 */
export const getStyles = cache(async (
  options: GetStylesOptions = {}
): Promise<GetStylesResult> => {
  const {
    page = 1,
    limit = 12,
    category,
    search,
    sortBy = 'newest',
    colors,
    industries,
    complexities,
  } = options

  const supabase = await createClient()

  // 收集所有需要筛选的标签
  const allTagFilters: string[] = []
  if (colors && colors.length > 0) {
    allTagFilters.push(...colors.map(c => c.startsWith('#') ? c : `#${c}`))
  }
  if (industries && industries.length > 0) {
    allTagFilters.push(...industries.map(i => i.startsWith('#') ? i : `#${i}`))
  }
  if (complexities && complexities.length > 0) {
    allTagFilters.push(...complexities.map(c => c.startsWith('#') ? c : `#${c}`))
  }

  // 构建查询
  let query = supabase
    .from('styles')
    .select(`
      *,
      category:categories!inner(
        id,
        name,
        name_en,
        icon
      ),
      style_tags:style_tags(
        tag:tags(
          name
        )
      )
    `, { count: 'exact' })
    .eq('status', 'published')

  // 分类筛选
  if (category) {
    query = query.eq('category_id', category)
  }

  // 搜索
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // 高级筛选：标签
  if (allTagFilters.length > 0) {
    query = query.in('style_tags.tag.name', allTagFilters)
  }

  // 排序
  switch (sortBy) {
    case 'popular':
      query = query.order('like_count', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // 分页
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('获取风格列表失败:', error)
    throw new Error('获取风格列表失败')
  }

  // 转换数据格式 - 使用类型断言避免 Supabase 类型推断问题
  const styles: Style[] = ((data as unknown[]) ?? []).map((item: unknown) => {
    const typedItem = item as Record<string, unknown>
    const styleTags = typedItem.style_tags as Array<{ tag: { name: string } }> | undefined
    return {
      ...typedItem,
      tags: styleTags?.map((st) => st.tag.name) ?? [],
      style_tags: undefined, // 移除中间表数据
    }
  }) as Style[]

  const totalPages = Math.ceil((count ?? 0) / limit)

  return {
    styles,
    total: count ?? 0,
    page,
    limit,
    totalPages,
  }
})

/**
 * 获取单个风格详情
 */
export const getStyle = cache(async (id: string): Promise<Style | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('styles')
    .select(`
      *,
      category:categories!inner(
        id,
        name,
        name_en,
        icon
      ),
      style_tags:style_tags(
        tag:tags(
          name
        )
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single() as { data: Style | null; error: Error | null }

  if (error) {
    if ((error as Error & { code?: string }).code !== 'PGRST116') { // 没有找到记录
      console.error('获取风格详情失败:', error)
    }
    return null
  }

  return {
    ...data!,
    tags:
      (data!.style_tags as unknown as Array<{ tag: { name: string } }> | undefined)
        ?.map((st) => st.tag.name) ?? [],
    style_tags: undefined,
  }
})

/**
 * 获取所有分类
 */
export const getCategories = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('获取分类失败:', error)
    throw new Error('获取分类失败')
  }

  return data || []
})

/**
 * 获取所有标签
 */
export const getTags = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name')

  if (error) {
    console.error('获取标签失败:', error)
    throw new Error('获取标签失败')
  }

  return data || []
})

/**
 * 增加浏览次数（异步，不阻塞页面渲染）
 * 使用 atomix 更新避免并发问题
 */
export async function incrementViewCount(id: string): Promise<boolean> {
  const supabase = await createClient()

  // 使用 Postgres 原子操作增加计数
  const { error } = await supabase.rpc('increment_style_view_count', {
    p_style_id: id
  })

  if (error) {
    console.error('增加浏览次数失败:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return false
  }

  return true
}

/**
 * 获取用户提交的风格列表
 */
export const getUserStyles = cache(async (
  userId: string,
  page = 1,
  limit = 12
): Promise<{
  success: boolean
  data?: {
    styles: Style[]
    total: number
    page: number
    limit: number
  }
  error?: string
}> => {
  try {
    const supabase = await createClient()

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('styles')
      .select(`
        *,
        category:categories!inner(
          id,
          name,
          name_en,
          icon
        ),
        style_tags:style_tags(
          tag:tags(
            name
          )
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    const styles: Style[] = ((data as unknown[]) ?? []).map((item: unknown) => {
      const typedItem = item as Record<string, unknown>
      const styleTags = typedItem.style_tags as Array<{ tag: { name: string } }> | undefined
      return {
        ...typedItem,
        tags: styleTags?.map((st) => st.tag.name) ?? [],
        style_tags: undefined,
        user_id: typedItem.author_id as string,
        author_name: (typedItem.author_id as string) || null,
        author_avatar: null,
      }
    }) as Style[]

    return {
      success: true,
      data: {
        styles,
        total: count ?? 0,
        page,
        limit,
      },
    }
  } catch (error) {
    console.error('获取用户风格列表失败:', error)
    return {
      success: false,
      error: '获取用户风格列表失败',
    }
  }
})

/**
 * 获取相关推荐风格（按分类或标签匹配）
 * @param styleId 当前风格 ID
 * @param limit 返回数量限制，默认 4
 */
export const getRelatedStyles = cache(async (
  styleId: string,
  limit = 4
): Promise<Style[]> => {
  const supabase = await createClient()

  // 1. 先获取当前风格的分类和标签
  const { data: currentStyle } = await supabase
    .from('styles')
    .select(`
      category_id,
      style_tags:style_tags(
        tag:tags(
          id,
          name
        )
      )
    `)
    .eq('id', styleId)
    .single()

  if (!currentStyle) {
    return []
  }

  const categoryId = currentStyle.category_id
  const tagIds = (currentStyle.style_tags as Array<{ tag: { id: string; name: string } }> | undefined)
    ?.map(st => st.tag.id) ?? []

  // 2. 查询推荐风格：优先同分类，其次同标签
  // 使用 UNION 组合两个查询
  const { data, error } = await supabase.rpc('get_related_styles', {
    target_style_id: styleId,
    target_category_id: categoryId,
    target_tag_ids: tagIds.length > 0 ? tagIds : [],
    result_limit: limit
  })

  if (error) {
    console.error('获取相关推荐失败:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    return []
  }

  // 3. 如果 RPC 函数不存在，使用备用方案：直接查询同分类的风格
  if ((error as Error & { code?: string })?.code === '42883') { // undefined_function
    console.log('get_related_styles RPC 不存在，使用备用查询方案')

    let query = supabase
      .from('styles')
      .select(`
        *,
        category:categories!inner(
          id,
          name,
          name_en,
          icon
        ),
        style_tags:style_tags(
          tag:tags(
            name
          )
        )
      `)
      .eq('status', 'published')
      .neq('id', styleId)

    // 优先筛选同分类
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    query = query.order('like_count', { ascending: false }).limit(limit)

    const { data: fallbackData, error: fallbackError } = await query

    if (fallbackError) {
      console.error('备用查询失败:', fallbackError)
      return []
    }

    return ((fallbackData as unknown[]) ?? []).map((item: unknown) => {
      const typedItem = item as Record<string, unknown>
      const styleTags = typedItem.style_tags as Array<{ tag: { name: string } }> | undefined
      return {
        ...typedItem,
        tags: styleTags?.map((st) => st.tag.name) ?? [],
        style_tags: undefined,
      }
    }) as Style[]
  }

  // 4. 转换 RPC 返回的数据格式
  return ((data as unknown[]) ?? []).map((item: unknown) => {
    const typedItem = item as Record<string, unknown>
    const styleTags = typedItem.style_tags as Array<{ tag: { name: string } }> | undefined
    return {
      ...typedItem,
      tags: styleTags?.map((st) => st.tag.name) ?? [],
      style_tags: undefined,
    }
  }) as Style[]
})
