'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { validateOrThrow, submissionFormSchema } from '@/lib/schemas'
import { uploadImage, generateStoragePath, getFileExtension } from '@/lib/storage'
import { revalidateTag } from 'next/cache'

/**
 * 风格提交 Server Action
 * 允许已登录用户提交设计风格案例到平台
 */

export interface SubmitStyleInput {
  title: string
  description: string
  categoryId: string
  tags?: string[]
  designTokens: {
    colors?: {
      primary: string
      secondary: string
      background: string
      surface: string
      text: string
      textMuted: string
    }
    fonts?: {
      heading: string
      body: string
      mono: string
    }
    spacing?: {
      xs: number
      sm: number
      md: number
      lg: number
      xl: number
    }
  }
  codeSnippets: {
    html: string
    css: string
    react?: string
    tailwind?: string
  }
  lightImage?: File
  darkImage?: File
}

export async function submitStyle(
  rawData: unknown
): Promise<{ success: boolean; data?: { styleId: string }; error?: string }> {
  try {
    // 1. 检查用户登录状态
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录后再提交',
      }
    }

    // 2. 验证表单数据
    const data = validateOrThrow(submissionFormSchema, rawData)

    // 3. 创建 Supabase 客户端
    const supabase = await createClient()

    // 4. 上传图片（如果提供）
    let lightImageUrl: string | null = null
    let darkImageUrl: string | null = null

    // 注意：Server Action 中无法直接接收 File 对象，需要单独的图片上传 endpoint
    // 这里假设图片已经通过其他方式上传并获取到 URL
    // 实际实现中，图片上传会通过单独的 API route 处理

    // 5. 准备风格数据
    const styleData = {
      title: data.title,
      description: data.description,
      category_id: data.categoryId,
      author_id: user.id,
      status: 'pending_review' as const,
      design_tokens: data.designTokens,
      preview_images: {
        light: lightImageUrl,
        dark: darkImageUrl,
      },
      code_html: data.codeSnippets.html,
      code_css: data.codeSnippets.css,
      code_react: data.codeSnippets.react || null,
      code_tailwind: data.codeSnippets.tailwind || null,
      // 颜色面板（兼容旧字段）
      color_palette: data.designTokens.colors ? {
        primary: data.designTokens.colors.primary,
        secondary: data.designTokens.colors.secondary,
        background: data.designTokens.colors.background,
        surface: data.designTokens.colors.surface,
      } : null,
      // 字体（兼容旧字段）
      fonts: data.designTokens.fonts,
      // 间距（兼容旧字段）
      spacing: data.designTokens.spacing ? {
        xs: `${data.designTokens.spacing.xs}px`,
        sm: `${data.designTokens.spacing.sm}px`,
        md: `${data.designTokens.spacing.md}px`,
        lg: `${data.designTokens.spacing.lg}px`,
        xl: `${data.designTokens.spacing.xl}px`,
      } : null,
    }

    // 6. 插入数据库
    const { data: insertedStyle, error: insertError } = await supabase
      .from('styles')
      .insert(styleData)
      .select('id')
      .single()

    if (insertError) {
      console.error('风格提交失败:', insertError)
      return {
        success: false,
        error: `风格提交失败：${insertError.message}`,
      }
    }

    // 7. 添加标签（如果有）
    if (data.tags && data.tags.length > 0) {
      // 首先创建/获取标签
      const tagIds: string[] = []

      for (const tagName of data.tags) {
        // 尝试查找现有标签
        const { data: existingTag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .single()

        let tagId: string

        if (existingTag) {
          tagId = existingTag.id
        } else {
          // 创建新标签
          const { data: newTag } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select('id')
            .single()

          tagId = newTag!.id
        }

        tagIds.push(tagId)
      }

      // 关联风格与标签
      const styleTags = tagIds.map((tagId) => ({
        style_id: insertedStyle.id,
        tag_id: tagId,
      }))

      await supabase.from('style_tags').insert(styleTags)
    }

    // 8. 缓存失效
    revalidateTag('styles')

    return {
      success: true,
      data: { styleId: insertedStyle.id },
    }
  } catch (err) {
    console.error('风格提交异常:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '风格提交失败，请重试',
    }
  }
}

/**
 * 上传图片到 Storage
 * 独立的 Server Action 用于处理图片上传
 */
export async function uploadPreviewImage(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        error: '请先登录',
      }
    }

    const file = formData.get('image') as File
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: '请提供有效的图片文件',
      }
    }

    const imageType = formData.get('type') as string
    if (!['light', 'dark'].includes(imageType)) {
      return {
        success: false,
        error: '无效的图片类型',
      }
    }

    // 生成存储路径
    const extension = getFileExtension(file)
    const path = generateStoragePath(user.id, undefined, imageType as 'light' | 'dark', extension)

    // 上传图片
    return await uploadImage(file, path)
  } catch (err) {
    console.error('图片上传异常:', err)
    return {
      success: false,
      error: '图片上传失败',
    }
  }
}
