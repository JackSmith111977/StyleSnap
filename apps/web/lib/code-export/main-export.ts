/**
 * 代码导出主函数
 * 统一接口，用于生成导出包
 */

import type { DesignTokens } from '@/types/design-tokens'
import type { ExportFormat, ExportRange, ExportPackage, CssInJsLibrary } from '@/types/code-export'
import {
  exportFullCss,
  exportFullTailwind,
  exportFullScss,
  exportFullCssInJs,
  exportFullDesignTokens,
} from './index'

export interface GenerateExportPackageOptions {
  tokens: DesignTokens
  format: ExportFormat
  range: ExportRange
  styleName: string
  cssInJsLibrary?: CssInJsLibrary
}

/**
 * 生成导出包
 */
export function generateExportPackage(options: GenerateExportPackageOptions): ExportPackage {
  const { tokens, range } = options

  // 生成所有格式的导出
  const cssFull = exportFullCss(tokens, {
    includeVariables: true,
    includeComponents: true,
  })
  const cssVars = range === 'variables' || range === 'full' ? exportFullCss(tokens, { includeVariables: true, includeComponents: false }) : ''
  const cssComponents = range === 'components' || range === 'full' ? exportFullCss(tokens, { includeVariables: false, includeComponents: true }) : ''

  const tailwindFull = exportFullTailwind(tokens, {
    includeConfig: true,
    includeComponents: true,
  })

  exportFullScss(tokens, {
    includeVariables: true,
    includeMixins: true,
    includeComponents: true,
  })
  const scssVars = range === 'variables' || range === 'full' ? exportFullScss(tokens, { includeVariables: true, includeMixins: false, includeComponents: false }) : ''
  const scssMixins = range === 'variables' || range === 'full' ? exportFullScss(tokens, { includeVariables: false, includeMixins: true, includeComponents: false }) : ''
  const scssComponents = range === 'components' || range === 'full' ? exportFullScss(tokens, { includeVariables: false, includeMixins: false, includeComponents: true }) : ''

  const cssInJsFull = exportFullCssInJs(tokens, {
    library: 'styled-components',
    includeComponents: true,
  })

  const tokensExport = exportFullDesignTokens(tokens, {
    format: 'json',
    includeMetadata: true,
  })

  return {
    css: {
      variables: cssVars || extractCssVariables(cssFull),
      components: cssComponents || extractCssComponents(cssFull),
    },
    tailwind: {
      config: tailwindFull.config,
      components: tailwindFull.components,
    },
    scss: {
      variables: scssVars,
      mixins: scssMixins,
      components: scssComponents,
    },
    cssInJs: {
      tokens: cssInJsFull.tokens,
      components: cssInJsFull.components,
    },
    tokens: {
      json: tokensExport.json,
      javascript: tokensExport.javascript,
      typescript: tokensExport.typescript,
    },
  }
}

/**
 * 提取 CSS 变量部分
 */
function extractCssVariables(fullCss: string): string {
  const match = fullCss.match(/:root\s*\{[^}]*\}/s)
  return match ? match[0] : ''
}

/**
 * 提取 CSS 组件部分
 */
function extractCssComponents(fullCss: string): string {
  return fullCss.replace(/:root\s*\{[^}]*\}/s, '').trim()
}
