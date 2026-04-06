'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspaceStore, type DesignTokens } from '@/stores/workspace-store';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PreviewPanelProps {
  designTokens: DesignTokens;
  className?: string;
}

/**
 * 预览面板组件 - 右侧 75%
 * - 实时预览展示
 * - 双栏布局（25%:75%）
 */
export function PreviewPanel({ designTokens, className }: PreviewPanelProps) {
  const { currentStyle } = useWorkspaceStore();

  // 生成 CSS 变量
  const cssVariables: React.CSSProperties = {
    // 颜色
    '--primary': designTokens.colorPalette.primary,
    '--secondary': designTokens.colorPalette.secondary,
    '--background': designTokens.colorPalette.background,
    '--surface': designTokens.colorPalette.surface,
    '--text': designTokens.colorPalette.text,
    '--text-muted': designTokens.colorPalette.textMuted,
    '--border': designTokens.colorPalette.border,
    '--accent': designTokens.colorPalette.accent,
    // 字体
    '--font-heading': designTokens.fonts.heading,
    '--font-body': designTokens.fonts.body,
    '--font-mono': designTokens.fonts.mono,
    // 间距（转为 rem）
    '--spacing-xs': `${designTokens.spacing.xs / 16}rem`,
    '--spacing-sm': `${designTokens.spacing.sm / 16}rem`,
    '--spacing-md': `${designTokens.spacing.md / 16}rem`,
    '--spacing-lg': `${designTokens.spacing.lg / 16}rem`,
    '--spacing-xl': `${designTokens.spacing.xl / 16}rem`,
    // 圆角
    '--radius-small': designTokens.borderRadius.small,
    '--radius-medium': designTokens.borderRadius.medium,
    '--radius-large': designTokens.borderRadius.large,
    // 阴影
    '--shadow-light': designTokens.shadows.light,
    '--shadow-medium': designTokens.shadows.medium,
    '--shadow-heavy': designTokens.shadows.heavy,
  } as React.CSSProperties;

  return (
    <div className={cn('h-full flex flex-col overflow-hidden bg-muted/30', className)}>
      {/* 预览头部 */}
      <div className="shrink-0 sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">实时预览</h2>
            <p className="text-xs text-muted-foreground">
              {currentStyle?.name || '新建设计风格'}
            </p>
          </div>
        </div>
      </div>

      {/* 预览内容区 - 可滚动 */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="max-w-4xl mx-auto bg-background rounded-lg shadow-lg overflow-hidden"
          style={cssVariables}
        >
          {/* 模拟导航栏 */}
          <nav className="border-b px-6 py-4" style={{ backgroundColor: 'var(--surface)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                <span
                  className="font-semibold"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    color: 'var(--text)',
                  }}
                >
                  StyleSnap
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1.5 text-sm rounded hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text)',
                    backgroundColor: 'transparent',
                  }}
                >
                  风格库
                </button>
                <button
                  className="px-4 py-1.5 text-sm rounded text-white"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-small)',
                  }}
                >
                  开始使用
                </button>
              </div>
            </div>
          </nav>

          {/* 模拟内容区 */}
          <main className="p-6" style={{ backgroundColor: 'var(--background)' }}>
            {/* 标题区 */}
            <div className="mb-8">
              <h1
                className="text-3xl font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: designTokens.fonts.headingWeight,
                  lineHeight: designTokens.fonts.headingLineHeight,
                  color: 'var(--text)',
                }}
              >
                欢迎来到 StyleSnap
              </h1>
              <p
                className="text-base"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: designTokens.fonts.bodyWeight,
                  lineHeight: designTokens.fonts.bodyLineHeight,
                  color: 'var(--text-muted)',
                }}
              >
                快速选择和应用网页视觉风格
              </p>
            </div>

            {/* 卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="overflow-hidden transition-shadow hover:shadow-md"
                  style={{
                    borderRadius: 'var(--radius-medium)',
                    boxShadow: 'var(--shadow-light)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div
                    className="h-24"
                    style={{
                      backgroundColor: i === 1 ? 'var(--primary)' : i === 2 ? 'var(--secondary)' : 'var(--accent)',
                    }}
                  />
                  <CardContent className="p-4">
                    <h3
                      className="font-semibold mb-1"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        color: 'var(--text)',
                      }}
                    >
                      特性 {i}
                    </h3>
                    <p
                      className="text-sm"
                      style={{
                        fontFamily: 'var(--font-body)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      这是一个示例卡片，展示设计变量的实际效果。
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 按钮展示 */}
            <div className="mb-8">
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text)',
                }}
              >
                按钮样式
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  className="px-4 py-2 text-white transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--radius-small)',
                  }}
                >
                  主按钮
                </button>
                <button
                  className="px-4 py-2 border transition-colors hover:bg-muted"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text)',
                    borderRadius: 'var(--radius-small)',
                    borderColor: 'var(--border)',
                  }}
                >
                  次按钮
                </button>
                <button
                  className="px-4 py-2 text-white transition-opacity hover:opacity-90"
                  style={{
                    fontFamily: 'var(--font-body)',
                    backgroundColor: 'var(--accent)',
                    borderRadius: 'var(--radius-small)',
                  }}
                >
                  强调按钮
                </button>
              </div>
            </div>

            {/* 输入框展示 */}
            <div className="mb-8">
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text)',
                }}
              >
                输入框样式
              </h2>
              <div className="space-y-3 max-w-sm">
                <input
                  type="text"
                  placeholder="请输入..."
                  className="w-full px-3 py-2 border bg-background transition-colors focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    borderRadius: 'var(--radius-small)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>

            {/* 列表展示 */}
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text)',
                }}
              >
                列表样式
              </h2>
              <ul
                className="space-y-2"
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text)',
                }}
              >
                {['列表项 1 - 展示间距效果', '列表项 2 - 展示字体效果', '列表项 3 - 展示颜色效果'].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 p-3 rounded"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--radius-small)',
                    }}
                  >
                    <Check
                      className="w-4 h-4"
                      style={{ color: 'var(--primary)' }}
                    />
                    <span style={{ color: 'var(--text)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </main>

          {/* 模拟页脚 */}
          <footer
            className="border-t px-6 py-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-muted)',
                }}
              >
                © 2026 StyleSnap
              </span>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="hover:underline"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text-muted)',
                  }}
                >
                  隐私政策
                </a>
                <a
                  href="#"
                  className="hover:underline"
                  style={{
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text-muted)',
                  }}
                >
                  使用条款
                </a>
              </div>
            </div>
          </footer>
        </div>

        {/* 设计变量参考 */}
        <div className="mt-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">当前设计变量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: designTokens.colorPalette.primary }}
                  />
                  <span>Primary: {designTokens.colorPalette.primary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: designTokens.colorPalette.secondary }}
                  />
                  <span>Secondary: {designTokens.colorPalette.secondary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: designTokens.colorPalette.background }}
                  />
                  <span>Background: {designTokens.colorPalette.background}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: designTokens.colorPalette.surface }}
                  />
                  <span>Surface: {designTokens.colorPalette.surface}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
