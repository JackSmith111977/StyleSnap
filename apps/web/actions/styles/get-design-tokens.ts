'use server'

import { createClient } from '@/lib/supabase/server'
import { DesignTokens } from '@/stores/preview-editor-store'

/**
 * 获取风格设计变量 Server Action
 * 从 style_design_tokens 表获取指定风格的设计变量数据
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

    // 从 style_design_tokens 表获取设计变量
    const { data, error } = await supabase
      .from('style_design_tokens')
      .select('*')
      .eq('style_id', styleId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return {
          success: false,
          error: '该风格暂无设计变量数据',
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
        primary: data.colors?.primary || '#3B82F6',
        secondary: data.colors?.secondary || '#10B981',
        background: data.colors?.background || '#FFFFFF',
        surface: data.colors?.surface || '#F3F4F6',
        text: data.colors?.text || '#1F2937',
        textMuted: data.colors?.textMuted || '#6B7280',
      },
      fonts: {
        heading: data.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        body: data.typography?.fontFamily || 'Inter, system-ui, sans-serif',
        mono: 'Fira Code, monospace',
      },
      spacing: {
        xs: data.spacing?.scale?.[0] || 4,
        sm: data.spacing?.scale?.[1] || 8,
        md: data.spacing?.scale?.[2] || 16,
        lg: data.spacing?.scale?.[3] || 24,
        xl: data.spacing?.scale?.[4] || 32,
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
