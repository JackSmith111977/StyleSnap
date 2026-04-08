'use server';

import { createClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/env';
import { generateCSS, generateHTML, generateREADME } from '@/lib/code-generators';
import { type DesignTokens, type ColorTokens, type FontTokens, type SpacingTokens, type BorderRadiusTokens, type ShadowTokens } from '@/stores/workspace-store';

/**
 * 批量代码生成结果
 */
export interface BatchCodeGenerationResult {
  success: boolean;
  updatedCount?: number;
  failedCount?: number;
  errors?: Array<{ styleId: string; styleName: string; error: string }>;
  message?: string;
  error?: string;  // 用于单条错误消息
}

/**
 * 将数据库中的设计变量格式转换为 DesignTokens 格式
 */
function convertDBTokensToDesignTokens(
  colorPalette: any,
  fonts: any,
  spacing: any,
  borderRadius: any,
  shadows: any
): DesignTokens {
  // 解析颜色（8 色完整色板）
  const colors: ColorTokens = {
    primary: colorPalette?.primary || '#000000',
    secondary: colorPalette?.secondary || '#666666',
    background: colorPalette?.background || '#FFFFFF',
    surface: colorPalette?.surface || '#F5F5F5',
    text: colorPalette?.text || '#1A1A1A',
    textMuted: colorPalette?.textMuted || '#666666',
    border: colorPalette?.border || '#E0E0E0',
    accent: colorPalette?.accent || '#0066FF',
  };

  // 解析字体
  const fontTokens: FontTokens = {
    heading: fonts?.heading || 'Inter, system-ui, sans-serif',
    body: fonts?.body || 'Inter, system-ui, sans-serif',
    mono: fonts?.mono || 'JetBrains Mono, monospace',
    headingWeight: fonts?.headingWeight || 700,
    bodyWeight: fonts?.bodyWeight || 400,
    headingLineHeight: fonts?.headingLineHeight || 1.2,
    bodyLineHeight: fonts?.bodyLineHeight || 1.6,
  };

  // 解析间距（转换为数字）
  const spacingTokens: SpacingTokens = {
    xs: parseSpacingValue(spacing?.xs) || 4,
    sm: parseSpacingValue(spacing?.sm) || 8,
    md: parseSpacingValue(spacing?.md) || 16,
    lg: parseSpacingValue(spacing?.lg) || 24,
    xl: parseSpacingValue(spacing?.xl) || 32,
  };

  // 解析圆角
  const radiusTokens: BorderRadiusTokens = {
    small: borderRadius?.small || '4px',
    medium: borderRadius?.medium || '8px',
    large: borderRadius?.large || '16px',
  };

  // 解析阴影
  const shadowTokens: ShadowTokens = {
    light: shadows?.light || '0 1px 2px rgba(0,0,0,0.05)',
    medium: shadows?.medium || '0 4px 12px rgba(0,0,0,0.1)',
    heavy: shadows?.heavy || '0 16px 48px rgba(0,0,0,0.15)',
  };

  return {
    colorPalette: colors,
    fonts: fontTokens,
    spacing: spacingTokens,
    borderRadius: radiusTokens,
    shadows: shadowTokens,
  };
}

/**
 * 解析间距值（支持 "8px" -> 8 或直接数字）
 */
function parseSpacingValue(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseInt(value.replace(/[^\d]/g, ''), 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * 创建 Service Role 客户端（绕过 RLS，仅用于管理员操作）
 */
async function createServiceRoleClient() {
  const cookieStore = await cookies();
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component, ignore
          }
        },
      },
    }
  );
}

/**
 * 为单个风格生成代码并保存（使用 RPC 函数绕过 RLS）
 */
async function generateStyleCode(
  supabase: any,
  styleId: string,
  styleName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 获取风格的设计变量
    const { data: style, error: fetchError } = await supabase
      .from('styles')
      .select('color_palette, fonts, spacing, border_radius, shadows')
      .eq('id', styleId)
      .single();

    if (fetchError || !style) {
      return { success: false, error: `获取风格数据失败：${fetchError?.message}` };
    }

    // 转换为 DesignTokens 格式
    const tokens = convertDBTokensToDesignTokens(
      style.color_palette,
      style.fonts,
      style.spacing,
      style.border_radius,
      style.shadows
    );

    // 生成代码（与工作台导出格式一致）
    const css = generateCSS(tokens);
    const html = generateHTML(tokens, styleName);
    const readme = generateREADME({ styleName, tokens });

    // 使用 RPC 函数更新数据库（绕过 RLS）
    const { data: updateResult, error: updateError } = await supabase
      .rpc('update_style_codes', {
        p_style_id: styleId,
        p_code_css: css.variables,
        p_code_css_modules: css.modules,
        p_code_html: html.index,
        p_code_readme: readme,
      });

    if (updateError) {
      return { success: false, error: `更新数据库失败：${updateError.message}` };
    }

    if (!updateResult) {
      return { success: false, error: `风格 ${styleId} 不存在，未更新` };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 批量生成所有预设风格的代码
 */
export async function batchGeneratePresetStyleCodes(): Promise<BatchCodeGenerationResult> {
  try {
    // 使用 Service Role 客户端绕过 RLS 限制（管理员操作）
    const supabase = await createServiceRoleClient();

    // 获取所有预设风格（10 个分类各一个）
    const { data: styles, error: fetchError } = await supabase
      .from('styles')
      .select('id, title, category_id')
      .eq('status', 'published')
      .limit(10);

    if (fetchError) {
      return {
        success: false,
        error: `获取风格列表失败：${fetchError.message}`,
      };
    }

    if (!styles || styles.length === 0) {
      return {
        success: false,
        error: '未找到已发布的风格',
      };
    }

    const errors: Array<{ styleId: string; styleName: string; error: string }> = [];
    let updatedCount = 0;

    // 为每个风格生成代码
    for (const style of styles) {
      const result = await generateStyleCode(supabase, style.id, style.title);
      if (result.success) {
        updatedCount++;
      } else {
        errors.push({
          styleId: style.id,
          styleName: style.title,
          error: result.error || '未知错误',
        });
      }
    }

    return {
      success: true,
      updatedCount,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `成功生成 ${updatedCount}/${styles.length} 个风格的代码`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}

/**
 * 为单个风格生成代码（手动触发）
 */
export async function generateCodeForStyle(styleId: string): Promise<BatchCodeGenerationResult> {
  try {
    // 使用 Service Role 客户端绕过 RLS 限制（管理员操作）
    const supabase = await createServiceRoleClient();

    // 获取风格信息
    const { data: style, error: fetchError } = await supabase
      .from('styles')
      .select('id, title')
      .eq('id', styleId)
      .single();

    if (fetchError || !style) {
      return {
        success: false,
        error: `获取风格信息失败：${fetchError?.message}`,
      };
    }

    const result = await generateStyleCode(supabase, style.id, style.title);

    if (result.success) {
      return {
        success: true,
        updatedCount: 1,
        message: `成功生成风格"${style.title}"的代码`,
      };
    } else {
      return {
        success: false,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    };
  }
}
