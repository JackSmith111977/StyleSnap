/**
 * 代码导出工具 - SCSS 格式
 * 生成 SCSS 代码，包含$variables 和@mixin
 */

import type { DesignTokens } from '@/types/design-tokens'

export interface ScssExportOptions {
  includeVariables?: boolean
  includeMixins?: boolean
  includeComponents?: boolean
}

/**
 * 生成 SCSS 变量定义
 */
export function exportScssVariables(tokens: DesignTokens): string {
  const lines: string[] = []

  lines.push('// ===== 配色方案 =====')
  Object.entries(tokens.colorPalette).forEach(([key, value]) => {
    lines.push(`$color-${key}: ${value};`)
  })

  lines.push('')
  lines.push('// ===== 字体系统 =====')
  lines.push(`$font-heading: ${tokens.fonts.heading};`)
  lines.push(`$font-body: ${tokens.fonts.body};`)
  lines.push(`$font-mono: ${tokens.fonts.mono};`)
  lines.push(`$font-weight-heading: ${tokens.fonts.headingWeight};`)
  lines.push(`$font-weight-body: ${tokens.fonts.bodyWeight};`)
  lines.push(`$line-height-heading: ${tokens.fonts.headingLineHeight};`)
  lines.push(`$line-height-body: ${tokens.fonts.bodyLineHeight};`)

  lines.push('')
  lines.push('// ===== 间距系统 =====')
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    lines.push(`$spacing-${key}: ${value};`)
  })

  lines.push('')
  lines.push('// ===== 圆角系统 =====')
  Object.entries(tokens.borderRadius).forEach(([key, value]) => {
    lines.push(`$radius-${key}: ${value};`)
  })

  lines.push('')
  lines.push('// ===== 阴影系统 =====')
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    lines.push(`$shadow-${key}: ${value};`)
  })

  return lines.join('\n')
}

/**
 * 生成 SCSS Mixins
 */
export function exportScssMixins(): string {
  return `// ===== 基础 Mixins =====

// 弹性盒子居中
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式断点
@mixin sm {
  @media (min-width: 640px) {
    @content;
  }
}

@mixin md {
  @media (min-width: 768px) {
    @content;
  }
}

@mixin lg {
  @media (min-width: 1024px) {
    @content;
  }
}

@mixin xl {
  @media (min-width: 1280px) {
    @content;
  }
}

// 过渡效果
@mixin transition-base {
  transition: all 0.2s ease;
}

// 阴影效果
@mixin shadow-sm {
  box-shadow: $shadow-light;
}

@mixin shadow-md {
  box-shadow: $shadow-medium;
}

@mixin shadow-lg {
  box-shadow: $shadow-heavy;
}`
}

/**
 * 生成按钮组件 SCSS
 */
export function exportScssButton(): string {
  return `// ===== 按钮组件 =====
.btn {
  @include flex-center;
  padding: $spacing-sm $spacing-md;
  font-family: $font-body;
  font-weight: $font-weight-body;
  border-radius: $radius-medium;
  border: 1px solid $color-border;
  cursor: pointer;
  @include transition-base;

  &--primary {
    background-color: $color-primary;
    color: $color-background;
    border-color: $color-primary;

    &:hover {
      opacity: 0.9;
    }
  }

  &--secondary {
    background-color: $color-surface;
    color: $color-text;
    border-color: $color-border;

    &:hover {
      background-color: $color-border;
    }
  }
}`
}

/**
 * 生成卡片组件 SCSS
 */
export function exportScssCard(): string {
  return `// ===== 卡片组件 =====
.card {
  background-color: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius-large;
  padding: $spacing-lg;
  box-shadow: $shadow-light;
  @include transition-base;

  &:hover {
    box-shadow: $shadow-medium;
  }

  &-title {
    font-family: $font-heading;
    font-weight: $font-weight-heading;
    font-size: 1.25rem;
    line-height: $line-height-heading;
    color: $color-text;
    margin-bottom: $spacing-sm;
  }

  &-description {
    font-family: $font-body;
    font-size: 0.875rem;
    line-height: $line-height-body;
    color: $color-textMuted;
  }
}`
}

/**
 * 生成完整 SCSS 导出
 */
export function exportFullScss(
  tokens: DesignTokens,
  options: ScssExportOptions = {}
): string {
  const { includeVariables = true, includeMixins = true, includeComponents = true } = options

  const sections: string[] = []

  if (includeVariables) {
    sections.push(exportScssVariables(tokens))
    sections.push('')
  }

  if (includeMixins) {
    sections.push(exportScssMixins())
    sections.push('')
  }

  if (includeComponents) {
    sections.push(exportScssButton())
    sections.push('')
    sections.push(exportScssCard())
  }

  return sections.join('\n')
}
