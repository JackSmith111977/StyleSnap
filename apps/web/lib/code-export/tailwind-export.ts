/**
 * 代码导出工具 - Tailwind CSS 格式
 * 生成 Tailwind CSS 类名代码
 */

export interface TailwindExportOptions {
  includeConfig?: boolean
  includeComponents?: boolean
}

/**
 * 生成 Tailwind 配置扩展
 */
export function exportTailwindConfig(tokens: DesignTokens): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${tokens.colorPalette.primary}',
        secondary: '${tokens.colorPalette.secondary}',
        background: '${tokens.colorPalette.background}',
        surface: '${tokens.colorPalette.surface}',
        text: '${tokens.colorPalette.text}',
        textMuted: '${tokens.colorPalette.textMuted}',
        border: '${tokens.colorPalette.border}',
        accent: '${tokens.colorPalette.accent}',
      },
      fontFamily: {
        heading: '${tokens.fonts.heading}',
        body: '${tokens.fonts.body}',
        mono: '${tokens.fonts.mono}',
      },
      fontWeight: {
        heading: '${tokens.fonts.headingWeight}',
        body: '${tokens.fonts.bodyWeight}',
      },
      lineHeight: {
        heading: '${tokens.fonts.headingLineHeight}',
        body: '${tokens.fonts.bodyLineHeight}',
      },
      spacing: {
        xs: '${tokens.spacing.xs}',
        sm: '${tokens.spacing.sm}',
        md: '${tokens.spacing.md}',
        lg: '${tokens.spacing.lg}',
        xl: '${tokens.spacing.xl}',
      },
      borderRadius: {
        small: '${tokens.borderRadius.small}',
        medium: '${tokens.borderRadius.medium}',
        large: '${tokens.borderRadius.large}',
      },
      boxShadow: {
        light: '${tokens.shadows.light}',
        medium: '${tokens.shadows.medium}',
        heavy: '${tokens.shadows.heavy}',
      },
    },
  },
  plugins: [],
}`
}

/**
 * 生成按钮组件 Tailwind 类名
 */
export function getButtonClasses(variant: 'primary' | 'secondary' = 'primary'): string {
  const base = 'inline-flex items-center justify-center px-4 py-2 font-body font-body rounded-medium border transition-all duration-200 cursor-pointer'

  if (variant === 'primary') {
    return `${base} bg-primary text-background border-primary hover:opacity-90`
  }

  return `${base} bg-surface text-text border-border hover:bg-border`
}

/**
 * 生成卡片组件 Tailwind 类名
 */
export function getCardClasses(): string {
  return 'bg-surface border border-border rounded-large p-lg shadow-light hover:shadow-medium transition-shadow duration-200'
}

/**
 * 生成按钮组件 HTML
 */
export function exportTailwindButton(variant: 'primary' | 'secondary' = 'primary'): string {
  const classes = getButtonClasses(variant)
  return `<button class="${classes}">
  ${variant === 'primary' ? '主要按钮' : '次要按钮'}
</button>`
}

/**
 * 生成卡片组件 HTML
 */
export function exportTailwindCard(title: string = '卡片标题', description: string = '卡片描述'): string {
  const classes = getCardClasses()
  return `<div class="${classes}">
  <h3 class="font-heading font-heading text-xl leading-heading text-text mb-sm">${title}</h3>
  <p class="font-body text-sm leading-body text-textMuted">${description}</p>
</div>`
}

/**
 * 生成完整 Tailwind CSS 导出
 */
export function exportFullTailwind(
  tokens: DesignTokens,
  options: TailwindExportOptions = {}
): { config: string; components: string } {
  const { includeConfig = true, includeComponents = true } = options

  const result = {
    config: '',
    components: '',
  }

  if (includeConfig) {
    result.config = exportTailwindConfig(tokens)
  }

  if (includeComponents) {
    const components: string[] = []
    components.push('<!-- 按钮组件 -->')
    components.push(exportTailwindButton('primary'))
    components.push(exportTailwindButton('secondary'))
    components.push('')
    components.push('<!-- 卡片组件 -->')
    components.push(exportTailwindCard())

    result.components = components.join('\n')
  }

  return result
}
