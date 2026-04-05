/**
 * 预览工具函数
 */

import type { DesignTokens } from '@/types/design-tokens'

/**
 * 生成设计变量摘要文本
 */
export function generateTokensSummary(tokens: DesignTokens): string {
  const colors = Object.values(tokens.colorPalette).join(', ')
  return `配色：${colors} | 字体：${tokens.fonts.heading} | 间距：${Object.values(tokens.spacing).join('/')}`
}

/**
 * 生成代码摘要
 */
export function generateCodeSnippet(code: string, maxLength: number = 150): string {
  if (code.length <= maxLength) {
    return code
  }
  return code.slice(0, maxLength) + '...'
}

/**
 * 获取预览模式标签
 */
export function getPreviewModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    'card-drop': '卡片下拉',
    'detail-tabs': '三按钮 Tab',
    fullscreen: '全屏预览',
  }
  return labels[mode] || '预览模式'
}
