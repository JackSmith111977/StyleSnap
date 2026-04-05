'use server'

import { createClient } from '@/lib/supabase/server'
import type { DesignTokens } from '@/stores/preview-editor-store'

/**
 * 获取风格设计变量 Server Action
 * 从 styles 表直接读取设计变量数据
 */

export interface GetDesignTokensResult {
  success: boolean
  data?: DesignTokens
  error?: string
}

export async function getStyleDesignTokens(
  styleId: string
): Promise<GetDesignTokensResult> {
  try {
    const supabase = await createClient()

    // 从 styles 表获取设计变量
    const { data: style, error } = await supabase
      .from('styles')
      .select('color_palette, fonts, spacing, border_radius, shadows')
      .eq('id', styleId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return {
          success: false,
          error: '该风格不存在',
        }
      }
      console.error('获取设计变量失败:', error)
      return {
        success: false,
        error: `获取设计变量失败：${error.message}`,
      }
    }

    // 将数据库格式转换为 DesignTokens 格式（完整版）
    const tokens: DesignTokens = {
      colors: {
        primary: (style.color_palette?.primary as string) ?? '#3B82F6',
        secondary: (style.color_palette?.secondary as string) ?? '#10B981',
        background: (style.color_palette?.background as string) ?? '#FFFFFF',
        surface: (style.color_palette?.surface as string) ?? '#F3F4F6',
        text: (style.color_palette?.text as string) ?? '#1F2937',
        textMuted: (style.color_palette?.textMuted as string) ?? '#6B7280',
        border: (style.color_palette?.border as string) ?? '#E5E7EB',
        accent: (style.color_palette?.accent as string) ?? '#60A5FA',
      },
      fonts: {
        heading: (style.fonts?.heading as string) ?? 'Inter, system-ui, sans-serif',
        body: (style.fonts?.body as string) ?? 'Inter, system-ui, sans-serif',
        mono: (style.fonts?.mono as string) ?? 'Fira Code, monospace',
        headingWeight: (style.fonts?.headingWeight as number) ?? 700,
        bodyWeight: (style.fonts?.bodyWeight as number) ?? 400,
        headingLineHeight: (style.fonts?.headingLineHeight as number) ?? 1.2,
        bodyLineHeight: (style.fonts?.bodyLineHeight as number) ?? 1.5,
      },
      spacing: {
        xs: (style.spacing?.xs as number) ?? 4,
        sm: (style.spacing?.sm as number) ?? 8,
        md: (style.spacing?.md as number) ?? 16,
        lg: (style.spacing?.lg as number) ?? 24,
        xl: (style.spacing?.xl as number) ?? 32,
      },
      borderRadius: {
        small: (style.border_radius?.small as string) ?? '4px',
        medium: (style.border_radius?.medium as string) ?? '8px',
        large: (style.border_radius?.large as string) ?? '16px',
      },
      shadows: {
        light: (style.shadows?.light as string) ?? '0 1px 2px rgba(0,0,0,0.05)',
        medium: (style.shadows?.medium as string) ?? '0 4px 6px rgba(0,0,0,0.1)',
        heavy: (style.shadows?.heavy as string) ?? '0 10px 15px rgba(0,0,0,0.15)',
      },
    }

    return {
      success: true,
      data: tokens,
    }
  } catch (err) {
    console.error('获取设计变量异常:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : '获取设计变量失败，请重试',
    }
  }
}
