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

    // 将数据库格式转换为 DesignTokens 格式（完整版）
    const tokens: DesignTokens = {
      colors: {
        primary: style.color_palette?.primary || '#3B82F6',
        secondary: style.color_palette?.secondary || '#10B981',
        background: style.color_palette?.background || '#FFFFFF',
        surface: style.color_palette?.surface || '#F3F4F6',
        text: style.color_palette?.text || '#1F2937',
        textMuted: style.color_palette?.textMuted || '#6B7280',
        border: style.color_palette?.border || '#E5E7EB',
        accent: style.color_palette?.accent || '#60A5FA',
      },
      fonts: {
        heading: style.fonts?.heading || 'Inter, system-ui, sans-serif',
        body: style.fonts?.body || 'Inter, system-ui, sans-serif',
        mono: style.fonts?.mono || 'Fira Code, monospace',
        headingWeight: style.fonts?.headingWeight || 700,
        bodyWeight: style.fonts?.bodyWeight || 400,
        headingLineHeight: style.fonts?.headingLineHeight || 1.2,
        bodyLineHeight: style.fonts?.bodyLineHeight || 1.5,
      },
      spacing: {
        xs: style.spacing?.xs || 4,
        sm: style.spacing?.sm || 8,
        md: style.spacing?.md || 16,
        lg: style.spacing?.lg || 24,
        xl: style.spacing?.xl || 32,
      },
      borderRadius: {
        small: style.border_radius?.small || '4px',
        medium: style.border_radius?.medium || '8px',
        large: style.border_radius?.large || '16px',
      },
      shadows: {
        light: style.shadows?.light || '0 1px 2px rgba(0,0,0,0.05)',
        medium: style.shadows?.medium || '0 4px 6px rgba(0,0,0,0.1)',
        heavy: style.shadows?.heavy || '0 10px 15px rgba(0,0,0,0.15)',
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
