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
  } = options

  const supabase = await createClient()

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
