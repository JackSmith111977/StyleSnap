'use client'

import React, { useState } from 'react'
import { type DesignTokens as PreviewDesignTokens } from '@/stores/preview-editor-store'
import { type DesignTokens as TypesDesignTokens } from '@/types/design-tokens'
import { useColorTemplateStore } from '@/stores/color-template-store'
import { applyColorTemplate } from '@/lib/color-templates'
import styles from './styles.module.css'
import { PreviewHeader } from './preview-header'
import { PreviewSidebar } from './preview-sidebar'
import { PreviewContent } from './preview-content'
import { PreviewFooter } from './preview-footer'

// 支持两种 DesignTokens 类型
type StylePreviewTokens = PreviewDesignTokens | TypesDesignTokens

interface StylePreviewProps {
  tokens?: StylePreviewTokens
  designTokens?: StylePreviewTokens
  className?: string
}

/**
 * 将 types/design-tokens 的 DesignTokens 转换为 preview-editor-store 格式
 * 主要差异：colorPalette -> colors，spacing 值类型 string -> number
 */
function normalizeTokens(input: StylePreviewTokens | undefined): PreviewDesignTokens {
  if (!input) {
    throw new Error('StylePreview requires either "tokens" or "designTokens" prop')
  }

  // 检查是否是 types/design-tokens 格式（有 colorPalette）
  if ('colorPalette' in input) {
    const t = input as TypesDesignTokens
    return {
      colors: t.colorPalette,
      fonts: t.fonts,
      spacing: {
        xs: Number(t.spacing.xs),
        sm: Number(t.spacing.sm),
        md: Number(t.spacing.md),
        lg: Number(t.spacing.lg),
        xl: Number(t.spacing.xl),
      },
      borderRadius: t.borderRadius,
      shadows: t.shadows,
    }
  }

  // 已经是 preview-editor-store 格式
  return input as PreviewDesignTokens
}

/**
 * 预览部分类型
 */
type PreviewSection = 'all' | 'typography' | 'colors' | 'spacing' | 'borderRadius' | 'shadows' | 'fonts' | 'components'

/**
 * 风格预览组件主组件
 * 固定尺寸、响应式布局，展示风格应用效果
 */
export function StylePreview({ tokens, designTokens, className }: StylePreviewProps) {
  const [activeSection, setActiveSection] = useState<PreviewSection>('all')
  const { getCurrentMapping } = useColorTemplateStore()
  const mapping = getCurrentMapping()

  // 统一处理两种 tokens 格式
  const normalizedTokens = normalizeTokens(tokens || designTokens)

  // 生成内联样式
  const previewStyles: React.CSSProperties = {
    // 颜色变量（8 色）
    '--preview-primary': normalizedTokens.colors.primary,
    '--preview-secondary': normalizedTokens.colors.secondary,
    '--preview-background': normalizedTokens.colors.background,
    '--preview-surface': normalizedTokens.colors.surface,
    '--preview-text': normalizedTokens.colors.text,
    '--preview-text-muted': normalizedTokens.colors.textMuted,
    '--preview-border': normalizedTokens.colors.border,
    '--preview-accent': normalizedTokens.colors.accent,
    // 字体变量
    '--preview-font-heading': normalizedTokens.fonts.heading,
    '--preview-font-body': normalizedTokens.fonts.body,
    '--preview-font-weight-heading': normalizedTokens.fonts.headingWeight.toString(),
    '--preview-font-weight-body': normalizedTokens.fonts.bodyWeight.toString(),
    '--preview-font-line-height-heading': normalizedTokens.fonts.headingLineHeight.toString(),
    '--preview-font-line-height-body': normalizedTokens.fonts.bodyLineHeight.toString(),
    // 间距变量
    '--preview-spacing-xs': `${normalizedTokens.spacing.xs}px`,
    '--preview-spacing-sm': `${normalizedTokens.spacing.sm}px`,
    '--preview-spacing-md': `${normalizedTokens.spacing.md}px`,
    '--preview-spacing-lg': `${normalizedTokens.spacing.lg}px`,
    '--preview-spacing-xl': `${normalizedTokens.spacing.xl}px`,
    // 圆角变量
    '--preview-border-radius-small': normalizedTokens.borderRadius.small,
    '--preview-border-radius-medium': normalizedTokens.borderRadius.medium,
    '--preview-border-radius-large': normalizedTokens.borderRadius.large,
    // 阴影变量
    '--preview-shadow-light': normalizedTokens.shadows.light,
    '--preview-shadow-medium': normalizedTokens.shadows.medium,
    '--preview-shadow-heavy': normalizedTokens.shadows.heavy,
  } as React.CSSProperties

  // 生成模板 CSS 变量
  const templateVariables = applyColorTemplate(mapping, normalizedTokens.colors, normalizedTokens.shadows)

  return (
    <div
      className={`${styles.previewContainer} ${className || ''}`}
      style={{ ...previewStyles, ...templateVariables }}
      data-preview-container
    >
      {/* 导航栏 */}
      <PreviewHeader />

      <div className={styles.previewBody}>
        {/* 侧边栏 - 带导航功能 */}
        <PreviewSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* 内容区域 - 动态显示 */}
        <PreviewContent activeSection={activeSection} />
      </div>

      {/* 页脚 */}
      <PreviewFooter />
    </div>
  )
}

export default StylePreview
