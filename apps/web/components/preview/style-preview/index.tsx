'use client'

import React, { useState } from 'react'
import { DesignTokens } from '@/stores/preview-editor-store'
import styles from './styles.module.css'
import { PreviewHeader } from './preview-header'
import { PreviewSidebar } from './preview-sidebar'
import { PreviewContent } from './preview-content'
import { PreviewFooter } from './preview-footer'

interface StylePreviewProps {
  tokens: DesignTokens
  className?: string
}

/**
 * 预览部分类型
 */
type PreviewSection = 'all' | 'typography' | 'colors' | 'spacing' | 'borderRadius' | 'shadows' | 'fonts' | 'components'

/**
 * 风格预览组件主组件
 * 固定尺寸、响应式布局，展示风格应用效果
 */
export function StylePreview({ tokens, className }: StylePreviewProps) {
  const [activeSection, setActiveSection] = useState<PreviewSection>('all')

  // 生成内联样式
  const previewStyles: React.CSSProperties = {
    // 颜色变量（8 色）
    '--preview-primary': tokens.colors.primary,
    '--preview-secondary': tokens.colors.secondary,
    '--preview-background': tokens.colors.background,
    '--preview-surface': tokens.colors.surface,
    '--preview-text': tokens.colors.text,
    '--preview-text-muted': tokens.colors.textMuted,
    '--preview-border': tokens.colors.border,
    '--preview-accent': tokens.colors.accent,
    // 字体变量
    '--preview-font-heading': tokens.fonts.heading,
    '--preview-font-body': tokens.fonts.body,
    '--preview-font-weight-heading': tokens.fonts.headingWeight.toString(),
    '--preview-font-weight-body': tokens.fonts.bodyWeight.toString(),
    '--preview-font-line-height-heading': tokens.fonts.headingLineHeight.toString(),
    '--preview-font-line-height-body': tokens.fonts.bodyLineHeight.toString(),
    // 间距变量
    '--preview-spacing-xs': `${tokens.spacing.xs}px`,
    '--preview-spacing-sm': `${tokens.spacing.sm}px`,
    '--preview-spacing-md': `${tokens.spacing.md}px`,
    '--preview-spacing-lg': `${tokens.spacing.lg}px`,
    '--preview-spacing-xl': `${tokens.spacing.xl}px`,
    // 圆角变量
    '--preview-border-radius-small': tokens.borderRadius.small,
    '--preview-border-radius-medium': tokens.borderRadius.medium,
    '--preview-border-radius-large': tokens.borderRadius.large,
    // 阴影变量
    '--preview-shadow-light': tokens.shadows.light,
    '--preview-shadow-medium': tokens.shadows.medium,
    '--preview-shadow-heavy': tokens.shadows.heavy,
  } as React.CSSProperties

  return (
    <div
      className={`${styles.previewContainer} ${className || ''}`}
      style={previewStyles}
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
