/**
 * 代码导出工具 - CSS 格式
 * 生成原生 CSS 代码，包含 CSS Variables
 */

import type { DesignTokens } from '@/types/design-tokens'

export interface CssExportOptions {
  includeVariables?: boolean
  includeComponents?: boolean
  selectorPrefix?: string
}

/**
 * 生成 CSS Variables 定义
 */
export function exportCssVariables(tokens: DesignTokens, selectorPrefix: string = ''): string {
  const cssVars: string[] = []

  // 配色方案
  Object.entries(tokens.colorPalette).forEach(([key, value]) => {
    cssVars.push(`  --color-${key}: ${value};`)
  })

  // 字体系统
  cssVars.push(`  --font-heading: ${tokens.fonts.heading};`)
  cssVars.push(`  --font-body: ${tokens.fonts.body};`)
  cssVars.push(`  --font-mono: ${tokens.fonts.mono};`)
  cssVars.push(`  --font-weight-heading: ${tokens.fonts.headingWeight};`)
  cssVars.push(`  --font-weight-body: ${tokens.fonts.bodyWeight};`)
  cssVars.push(`  --line-height-heading: ${tokens.fonts.headingLineHeight};`)
  cssVars.push(`  --line-height-body: ${tokens.fonts.bodyLineHeight};`)

  // 间距系统
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    cssVars.push(`  --spacing-${key}: ${value};`)
  })

  // 圆角系统
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    cssVars.push(`  --radius-${key}: ${value};`)
  })

  // 阴影系统
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    cssVars.push(`  --shadow-${key}: ${value};`)
  })

  return `:root${selectorPrefix} {\n${cssVars.join('\n')}\n}`
}

/**
 * 生成基础样式重置
 */
export function exportCssReset(): string {
  return `/* 基础样式重置 */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: var(--line-height-body);
  color: var(--color-text);
  background-color: var(--color-background);
}`
}

/**
 * 生成按钮组件 CSS
 */
export function exportCssButton(selectorPrefix: string = ''): string {
  const prefix = selectorPrefix ? `${selectorPrefix} ` : ''
  return `/* 按钮组件 */
${prefix}.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
  border-radius: var(--radius-medium);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all 0.2s ease;
}

${prefix}.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-background);
  border-color: var(--color-primary);
}

${prefix}.btn-primary:hover {
  opacity: 0.9;
}

${prefix}.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

${prefix}.btn-secondary:hover {
  background-color: var(--color-border);
}`
}

/**
 * 生成卡片组件 CSS
 */
export function exportCssCard(selectorPrefix: string = ''): string {
  const prefix = selectorPrefix ? `${selectorPrefix} ` : ''
  return `/* 卡片组件 */
${prefix}.card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-large);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-light);
  transition: box-shadow 0.2s ease;
}

${prefix}.card:hover {
  box-shadow: var(--shadow-medium);
}

${prefix}.card-title {
  font-family: var(--font-heading);
  font-weight: var(--font-weight-heading);
  font-size: 1.25rem;
  line-height: var(--line-height-heading);
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
}

${prefix}.card-description {
  font-family: var(--font-body);
  font-size: 0.875rem;
  line-height: var(--line-height-body);
  color: var(--color-textMuted);
}`
}

/**
 * 生成完整 CSS 导出
 */
export function exportFullCss(tokens: DesignTokens, options: CssExportOptions = {}): string {
  const { includeVariables = true, includeComponents = true, selectorPrefix = '' } = options

  const sections: string[] = []

  if (includeVariables) {
    sections.push('/* ===== 设计变量 ===== */\n')
    sections.push(exportCssVariables(tokens, selectorPrefix))
    sections.push('')
  }

  if (includeComponents) {
    sections.push('/* ===== 基础样式重置 ===== */\n')
    sections.push(exportCssReset())
    sections.push('\n')
    sections.push('/* ===== 按钮组件 ===== */\n')
    sections.push(exportCssButton(selectorPrefix))
    sections.push('\n')
    sections.push('/* ===== 卡片组件 ===== */\n')
    sections.push(exportCssCard(selectorPrefix))
  }

  return sections.join('\n')
}
