/**
 * 代码导出工具 - CSS-in-JS 格式
 * 生成 Styled Components / Emotion 代码
 */

import type { DesignTokens } from '@/types/design-tokens'
import { exportTokensJavaScript } from './tokens-export'

export interface CssInJsExportOptions {
  library?: 'styled-components' | 'emotion'
  includeComponents?: boolean
}

/**
 * 生成 Styled Components 主题配置
 */
export function exportStyledTokensTheme(tokens: DesignTokens): string {
  return `export const theme = ${exportTokensJavaScript(tokens).replace('export const designTokens = ', '')}`
}

/**
 * 生成按钮组件 (Styled Components)
 */
export function exportStyledComponentsButton(): string {
  return `import styled from 'styled-components'

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: \${({ theme }) => theme.spacing.sm} \${({ theme }) => theme.spacing.md};
  font-family: \${({ theme }) => theme.fonts.body};
  font-weight: \${({ theme }) => theme.fonts.bodyWeight};
  border-radius: \${({ theme }) => theme.borderRadius.medium};
  border: 1px solid \${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  \${({ variant, theme }) =>
    variant === 'primary'
      ? \`
    background-color: \${theme.colors.primary};
    color: \${theme.colors.background};
    border-color: \${theme.colors.primary};

    &:hover {
      opacity: 0.9;
    }
  \`
      : \`
    background-color: \${theme.colors.surface};
    color: \${theme.colors.text};
    border-color: \${theme.colors.border};

    &:hover {
      background-color: \${theme.colors.border};
    }
  \`}
\``
}

/**
 * 生成卡片组件 (Styled Components)
 */
export function exportStyledComponentsCard(): string {
  return `import styled from 'styled-components'

export const Card = styled.div\`
  background-color: \${({ theme }) => theme.colors.surface};
  border: 1px solid \${({ theme }) => theme.colors.border};
  border-radius: \${({ theme }) => theme.borderRadius.large};
  padding: \${({ theme }) => theme.spacing.lg};
  box-shadow: \${({ theme }) => theme.shadows.light};
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: \${({ theme }) => theme.shadows.medium};
  }
\`

export const CardTitle = styled.h3\`
  font-family: \${({ theme }) => theme.fonts.heading};
  font-weight: \${({ theme }) => theme.fonts.headingWeight};
  font-size: 1.25rem;
  line-height: \${({ theme }) => theme.fonts.headingLineHeight};
  color: \${({ theme }) => theme.colors.text};
  margin-bottom: \${({ theme }) => theme.spacing.sm};
\`

export const CardDescription = styled.p\`
  font-family: \${({ theme }) => theme.fonts.body};
  font-size: 0.875rem;
  line-height: \${({ theme }) => theme.fonts.bodyLineHeight};
  color: \${({ theme }) => theme.colors.textMuted};
\``
}

/**
 * 生成 Emotion 版本按钮组件
 */
export function exportEmotionButton(): string {
  return `import { css } from '@emotion/react'

export const buttonStyles = (variant: 'primary' | 'secondary' = 'primary') => css\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-body);
  font-weight: var(--font-weight-body);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;

  \${variant === 'primary'
    ? `
    background-color: var(--color-primary);
    color: var(--background);
    border-color: var(--color-primary);

    &:hover {
      opacity: 0.9;
    }
  `
    : `
    background-color: var(--surface);
    color: var(--text);
    border-color: var(--border);

    &:hover {
      background-color: var(--border);
    }
  `}
\``
}

/**
 * 生成完整 CSS-in-JS 导出
 */
export function exportFullCssInJs(
  tokens: DesignTokens,
  options: CssInJsExportOptions = {}
): { tokens: string; components: string } {
  const { library = 'styled-components', includeComponents = true } = options

  const result = {
    tokens: '',
    components: '',
  }

  // 导出 Design Tokens
  result.tokens = exportTokensJavaScript(tokens)

  if (includeComponents) {
    const components: string[] = []

    if (library === 'styled-components') {
      components.push(exportStyledComponentsButton())
      components.push('')
      components.push(exportStyledComponentsCard())
    } else {
      components.push(exportEmotionButton())
    }

    result.components = components.join('\n')
  }

  return result
}
