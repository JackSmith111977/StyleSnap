'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from './check-admin-role'

const VALID_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * 待审风格详情（完整版，用于审核预览）
 */
export interface PendingStyleDetail {
  id: string
  title: string
  description: string | null
  preview_light: string | null
  preview_dark: string | null
  preview_images: Record<string, string> | null
  submitted_at: string | null
  design_tokens: Record<string, unknown> | null
  code_html: string | null
  code_css: string | null
  code_react: string | null
  code_tailwind: string | null
  status: string
  category_id: string
  category_name: string | null
  category_icon: string | null
  author_username: string | null
  author_avatar_url: string | null
  author_bio: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

/**
 * 获取单个待审风格详情（管理员专用）
 * 用于审核面板中展示完整风格信息
 */
export async function getPendingStyleDetail(
  styleId: string
): Promise<{
  success: boolean
  data?: PendingStyleDetail
  error?: string
}> {
  try {
    // 管理员权限校验
    await requireAdmin()

    // 输入校验
    if (!styleId || !VALID_UUID_REGEX.test(styleId)) {
      return { success: false, error: '风格 ID 格式无效' }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('styles')
      .select(
        `
        id,
        title,
        description,
        preview_light,
        preview_dark,
        preview_images,
        submitted_at,
        design_tokens,
        code_html,
        code_css,
        code_react,
        code_tailwind,
        status,
        category_id,
        created_at,
        updated_at,
        category:categories(
          name,
          icon
        ),
        author:profiles!styles_author_id_fkey(
          username,
          avatar_url,
          bio
        ),
        style_tags:style_tags(
          tag:tags(
            name
          )
        )
      `
      )
      .eq('id', styleId)
      .eq('status', 'pending_review')
      .single()

    if (error) {
      // PGRST116 = 没有找到记录（风格不存在或不是待审状态）
      if ((error as Error & { code?: string }).code === 'PGRST116') {
        return { success: false, error: '风格不存在或不是待审状态' }
      }
      console.error('获取风格详情失败:', error)
      return { success: false, error: '获取风格详情失败' }
    }

    // 转换数据格式
    const typedItem = data as Record<string, unknown>
    const categoryData = typedItem.category as { name: string; icon: string | null } | null
    const authorData = typedItem.author as {
      username: string
      avatar_url: string | null
      bio: string | null
    } | null
    const styleTags = typedItem.style_tags as Array<{ tag: { name: string } | null }> | undefined

    const detail: PendingStyleDetail = {
      id: typedItem.id as string,
      title: (typedItem.title as string) || '未命名风格',
      description: typedItem.description as string | null,
      preview_light: typedItem.preview_light as string | null,
      preview_dark: typedItem.preview_dark as string | null,
      preview_images: typedItem.preview_images as Record<string, string> | null,
      submitted_at: typedItem.submitted_at as string | null,
      design_tokens: typedItem.design_tokens as Record<string, unknown> | null,
      code_html: typedItem.code_html as string | null,
      code_css: typedItem.code_css as string | null,
      code_react: typedItem.code_react as string | null,
      code_tailwind: typedItem.code_tailwind as string | null,
      status: typedItem.status as string,
      category_id: typedItem.category_id as string,
      category_name: categoryData?.name ?? null,
      category_icon: categoryData?.icon ?? null,
      author_username: authorData?.username ?? null,
      author_avatar_url: authorData?.avatar_url ?? null,
      author_bio: authorData?.bio ?? null,
      tags: styleTags?.filter(st => st?.tag?.name).map(st => st!.tag!.name) ?? [],
      created_at: typedItem.created_at as string,
      updated_at: typedItem.updated_at as string,
    }

    return { success: true, data: detail }
  } catch (err) {
    if (err instanceof Error && err.message.includes('PERMISSION_DENIED')) {
      return { success: false, error: '需要管理员权限' }
    }
    console.error('获取风格详情异常:', err)
    return { success: false, error: '获取风格详情失败' }
  }
}
