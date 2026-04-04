'use client'

import { Type, Ruler, Square, Circle, Hash } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorPalette } from '@/components/style-color-palette'

interface DesignTokens {
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
    mono: string
    headingWeight: number
    bodyWeight: number
    headingLineHeight: number
    bodyLineHeight: number
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
  shadows: {
    light: string
    medium: string
    heavy: string
  }
}

interface StyleDetailProps {
  designTokens: DesignTokens
}

/**
 * 设计变量详情展示组件
 * 展示风格的完整设计变量系统：配色、字体、间距、圆角、阴影
 */
export function StyleDetail({ designTokens }: StyleDetailProps) {
  return (
    <div className="space-y-6">
      {/* 配色方案 */}
      <ColorPalette colors={designTokens.colors} />

      {/* 字体设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            字体系统
          </CardTitle>
          <CardDescription>字体系、字重、行高完整规范</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 标题字体 */}
            <div className="rounded border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">标题字体</span>
                <span className="text-muted-foreground text-sm">
                  字重：{designTokens.fonts.headingWeight} | 行高：{designTokens.fonts.headingLineHeight}
                </span>
              </div>
              <p
                className="text-muted-foreground text-sm"
                style={{
                  fontFamily: designTokens.fonts.heading,
                  fontWeight: designTokens.fonts.headingWeight,
                  lineHeight: designTokens.fonts.headingLineHeight,
                }}
              >
                The quick brown fox jumps over the lazy dog. 标题字体示例文本
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {designTokens.fonts.heading}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigator.clipboard.writeText(designTokens.fonts.heading)}
                  type="button"
                >
                  <Hash className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* 正文字体 */}
            <div className="rounded border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">正文字体</span>
                <span className="text-muted-foreground text-sm">
                  字重：{designTokens.fonts.bodyWeight} | 行高：{designTokens.fonts.bodyLineHeight}
                </span>
              </div>
              <p
                className="text-muted-foreground text-sm"
                style={{
                  fontFamily: designTokens.fonts.body,
                  fontWeight: designTokens.fonts.bodyWeight,
                  lineHeight: designTokens.fonts.bodyLineHeight,
                }}
              >
                The quick brown fox jumps over the lazy dog. 正文字体示例文本，用于展示阅读效果
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {designTokens.fonts.body}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigator.clipboard.writeText(designTokens.fonts.body)}
                  type="button"
                >
                  <Hash className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* 等宽字体 */}
            <div className="rounded border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">等宽字体 (代码)</span>
              </div>
              <pre
                className="text-muted-foreground text-sm overflow-x-auto"
                style={{ fontFamily: designTokens.fonts.mono }}
              >
                <code>{`// 代码示例
const Button = ({ children }) => (
  <button className="btn">{children}</button>
);`}</code>
              </pre>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">
                  {designTokens.fonts.mono}
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigator.clipboard.writeText(designTokens.fonts.mono)}
                  type="button"
                >
                  <Hash className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 间距系统 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            间距系统
          </CardTitle>
          <CardDescription>统一的间距规范（基于 4px 基准）</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SpacingItem name="XS" value={designTokens.spacing.xs} description="小组件内部" />
            <SpacingItem name="SM" value={designTokens.spacing.sm} description="组件内边距" />
            <SpacingItem name="MD" value={designTokens.spacing.md} description="卡片内边距" />
            <SpacingItem name="LG" value={designTokens.spacing.lg} description="组件间距" />
            <SpacingItem name="XL" value={designTokens.spacing.xl} description="大区域间隔" />
          </div>
        </CardContent>
      </Card>

      {/* 圆角设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5" />
            圆角规范
          </CardTitle>
          <CardDescription>边角圆润程度</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <BorderRadiusItem name="Small" value={designTokens.borderRadius.small} description="按钮、小元素" />
            <BorderRadiusItem name="Medium" value={designTokens.borderRadius.medium} description="卡片、输入框" />
            <BorderRadiusItem name="Large" value={designTokens.borderRadius.large} description="大容器、头像" />
          </div>
        </CardContent>
      </Card>

      {/* 阴影效果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Circle className="h-5 w-5" />
            阴影效果
          </CardTitle>
          <CardDescription>深度及层次感</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <ShadowItem name="Light" value={designTokens.shadows.light} description="轻微悬浮" />
            <ShadowItem name="Medium" value={designTokens.shadows.medium} description="卡片默认" />
            <ShadowItem name="Heavy" value={designTokens.shadows.heavy} description="模态框、弹出层" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 间距展示子组件
function SpacingItem({ name, value, description }: { name: string; value: number; description: string }) {
  return (
    <div className="rounded border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground font-mono text-sm">{value}px</span>
      </div>
      <div className="mb-2 h-8 w-full bg-primary/20 rounded" style={{ height: `${Math.min(value, 32)}px` }} />
      <p className="text-muted-foreground text-xs">{description}</p>
    </div>
  )
}

// 圆角展示子组件
function BorderRadiusItem({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <div className="flex items-center gap-4 rounded border p-4">
      <div
        className="h-16 w-16 bg-primary/50"
        style={{ borderRadius: value }}
      />
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-muted-foreground font-mono text-sm">{value}</div>
        <div className="text-muted-foreground text-xs">{description}</div>
      </div>
    </div>
  )
}

// 阴影展示子组件
function ShadowItem({ name, value, description }: { name: string; value: string; description: string }) {
  return (
    <div className="rounded border p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{name}</span>
        <span className="text-muted-foreground font-mono text-xs">{value}</span>
      </div>
      <div
        className="h-12 w-full bg-background rounded"
        style={{ boxShadow: value }}
      />
      <p className="text-muted-foreground text-xs mt-2">{description}</p>
    </div>
  )
}
