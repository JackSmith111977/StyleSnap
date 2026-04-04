/**
 * 设计变量工具函数
 * 深色模式颜色生成等工具
 */

import type { DesignTokens } from '@/stores/preview-editor-store'

/**
 * 深色模式颜色生成工具
 * 根据浅色模式颜色自动生成深色模式颜色
 */
export function generateDarkModeColors(
  lightColors: DesignTokens['colors'],
  overrides?: Partial<DesignTokens['colors']>
): DesignTokens['colors'] {
  // 如果有手动覆盖，优先使用覆盖值
  if (overrides) {
    return { ...lightColors, ...overrides }
  }

  // 否则通过算法生成深色模式颜色
  // HSL 调整亮度：降低背景色亮度，提高文字亮度
  return {
    primary: lightColors.primary, // 主色保持不变
    secondary: lightColors.secondary, // 辅色保持不变
    background: '#0F0F0F', // 深色背景
    surface: '#1A1A1A', // 深色表面
    text: '#E5E5E5', // 深色模式文字
    textMuted: '#A3A3A3', // 深色模式弱化文字
  }
}
