'use client'

import React from 'react'
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
 * 风格预览组件主组件
 * 固定尺寸、响应式布局，展示风格应用效果
 */
export function StylePreview({ tokens, className }: StylePreviewProps) {
  // 生成 CSS 变量样式
  const previewStyles: React.CSSProperties = {
    '--preview-primary': tokens.colors.primary,
    '--preview-secondary': tokens.colors.secondary,
    '--preview-background': tokens.colors.background,
    '--preview-surface': tokens.colors.surface,
    '--preview-text': tokens.colors.text,
    '--preview-text-muted': tokens.colors.textMuted,
    '--preview-font-heading': tokens.fonts.heading,
    '--preview-font-body': tokens.fonts.body,
    '--preview-spacing-xs': `${tokens.spacing.xs}px`,
    '--preview-spacing-sm': `${tokens.spacing.sm}px`,
    '--preview-spacing-md': `${tokens.spacing.md}px`,
    '--preview-spacing-lg': `${tokens.spacing.lg}px`,
    '--preview-spacing-xl': `${tokens.spacing.xl}px`,
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
        {/* 侧边栏 */}
        <PreviewSidebar />

        {/* 内容区域 */}
        <PreviewContent />
      </div>

      {/* 页脚 */}
      <PreviewFooter />
    </div>
  )
}

export default StylePreview
