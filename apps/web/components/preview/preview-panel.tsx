'use client';

/**
 * Preview Panel - 实时预览面板
 * 展示应用自定义设计变量后的风格效果
 */

import React from 'react';
import { usePreviewEditorStore } from '@/stores/preview-editor-store';
import styles from './preview-panel.module.css';

interface PreviewPanelProps {
  styleName?: string;
}

export function PreviewPanel({ styleName = 'Custom Style' }: PreviewPanelProps) {
  const tokens = usePreviewEditorStore((state) => state.tokens);

  // 生成内联样式
  const containerStyle: React.CSSProperties = {
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-background': tokens.colors.background,
    '--color-surface': tokens.colors.surface,
    '--color-text': tokens.colors.text,
    '--color-text-muted': tokens.colors.textMuted,
    '--font-heading': tokens.fonts.heading,
    '--font-body': tokens.fonts.body,
    '--font-mono': tokens.fonts.mono,
    '--spacing-xs': `${tokens.spacing.xs}px`,
    '--spacing-sm': `${tokens.spacing.sm}px`,
    '--spacing-md': `${tokens.spacing.md}px`,
    '--spacing-lg': `${tokens.spacing.lg}px`,
    '--spacing-xl': `${tokens.spacing.xl}px`,
  } as React.CSSProperties;

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.previewContent}>
        {/* 排版预览 */}
        <section className={styles.section}>
          <h2 className={styles.heading} style={{ fontFamily: 'var(--font-heading)' }}>
            {styleName}
          </h2>
          <p className={styles.bodyText} style={{ fontFamily: 'var(--font-body)' }}>
            This is an example of how your custom design tokens will look in a real application.
            Adjust the controls to see changes in real-time.
          </p>
        </section>

        {/* 按钮预览 */}
        <section className={styles.section}>
          <h3
            className={styles.subheading}
            style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--spacing-md)' }}
          >
            Buttons
          </h3>
          <div className={styles.buttonGroup}>
            <button
              className={styles.buttonPrimary}
              style={{
                backgroundColor: 'var(--color-primary)',
                fontFamily: 'var(--font-body)',
                padding: `var(--spacing-sm) var(--spacing-md)`,
              }}
            >
              Primary Button
            </button>
            <button
              className={styles.buttonSecondary}
              style={{
                backgroundColor: 'var(--color-secondary)',
                fontFamily: 'var(--font-body)',
                padding: `var(--spacing-sm) var(--spacing-md)`,
              }}
            >
              Secondary Button
            </button>
          </div>
        </section>

        {/* 卡片预览 */}
        <section className={styles.section}>
          <h3
            className={styles.subheading}
            style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--spacing-md)' }}
          >
            Cards
          </h3>
          <div
            className={styles.card}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              padding: 'var(--spacing-lg)',
            }}
          >
            <h4
              style={{
                fontFamily: 'var(--font-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--spacing-sm)',
              }}
            >
              Card Title
            </h4>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--spacing-md)',
              }}
            >
              This is a card component with custom design tokens applied.
            </p>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  padding: `var(--spacing-xs) var(--spacing-sm)`,
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  borderRadius: '4px',
                }}
              >
                Tag
              </span>
            </div>
          </div>
        </section>

        {/* 代码块预览 */}
        <section className={styles.section}>
          <h3
            className={styles.subheading}
            style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--spacing-md)' }}
          >
            Code
          </h3>
          <pre
            className={styles.codeBlock}
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              padding: 'var(--spacing-md)',
            }}
          >
            <code>
              {`.button {
  background: var(--color-primary);
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
}`}
            </code>
          </pre>
        </section>

        {/* 间距预览 */}
        <section className={styles.section}>
          <h3
            className={styles.subheading}
            style={{ fontFamily: 'var(--font-heading)', marginBottom: 'var(--spacing-md)' }}
          >
            Spacing Scale
          </h3>
          <div className={styles.spacingShowcase}>
            <div
              style={{
                height: `${tokens.spacing.xs}px`,
                backgroundColor: 'var(--color-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              XS: {tokens.spacing.xs}px
            </span>

            <div
              style={{
                height: `${tokens.spacing.sm}px`,
                backgroundColor: 'var(--color-secondary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              SM: {tokens.spacing.sm}px
            </span>

            <div
              style={{
                height: `${tokens.spacing.md}px`,
                backgroundColor: 'var(--color-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              MD: {tokens.spacing.md}px
            </span>

            <div
              style={{
                height: `${tokens.spacing.lg}px`,
                backgroundColor: 'var(--color-secondary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              LG: {tokens.spacing.lg}px
            </span>

            <div
              style={{
                height: `${tokens.spacing.xl}px`,
                backgroundColor: 'var(--color-primary)',
                marginBottom: 'var(--spacing-sm)',
              }}
            />
            <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              XL: {tokens.spacing.xl}px
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
