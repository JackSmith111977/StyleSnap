'use server'

import { createClient } from '@/lib/supabase/server'
import { DesignTokens } from '@/stores/preview-editor-store'

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

    // 将数据库格式转换为 DesignTokens 格式
    const tokens: DesignTokens = {
      colors: {
        primary: style.color_palette?.primary || '#3B82F6',
        secondary: style.color_palette?.secondary || '#10B981',
        background: style.color_palette?.background || '#FFFFFF',
        surface: style.color_palette?.surface || '#F3F4F6',
        text: style.color_palette?.text || '#1F2937',
        textMuted: style.color_palette?.textMuted || '#6B7280',
      },
      fonts: {
        heading: style.fonts?.heading || 'Inter, system-ui, sans-serif',
        body: style.fonts?.body || 'Inter, system-ui, sans-serif',
        mono: 'Fira Code, monospace',
      },
      spacing: {
        xs: style.spacing?.xs || 4,
        sm: style.spacing?.sm || 8,
        md: style.spacing?.md || 16,
        lg: style.spacing?.lg || 24,
        xl: style.spacing?.xl || 32,
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
