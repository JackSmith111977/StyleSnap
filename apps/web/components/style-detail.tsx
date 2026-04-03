import { Type, Ruler, Square, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ColorPalette } from '@/components/style-color-palette'

interface StyleDetailProps {
  style: {
    title: string
    description: string | null
    category?: {
      name: string
    }
    tags?: string[]
    color_palette: Record<string, string> | null
    fonts: Record<string, string> | null
    spacing: Record<string, string> | null
    border_radius: Record<string, string> | null
    shadows: Record<string, string> | null
  }
}

export function StyleDetail({ style }: StyleDetailProps) {
  return (
    <div className="space-y-6">
      {/* 基础信息 */}
      <Card>
        <CardHeader>
          <CardTitle>{style.title}</CardTitle>
          <CardDescription>{style.description ?? '暂无描述'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="bg-primary/10 text-primary rounded px-3 py-1 text-sm font-medium">
              {style.category?.name ?? '未分类'}
            </span>
            {style.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-muted text-muted-foreground rounded px-3 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 配色方案 */}
      {style.color_palette && Object.keys(style.color_palette).length > 0 && (
        <ColorPalette colors={style.color_palette} />
      )}

      {/* 字体设置 */}
      {style.fonts && Object.keys(style.fonts).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              字体设置
            </CardTitle>
            <CardDescription>字体家族及字号规范</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(style.fonts).map(([name, value]) => (
                <div key={name} className="rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium capitalize">{name}</span>
                    <span className="text-muted-foreground text-sm">{value}</span>
                  </div>
                  <p className="text-muted-foreground text-sm" style={{ fontFamily: value }}>
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 间距系统 */}
      {style.spacing && Object.keys(style.spacing).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              间距系统
            </CardTitle>
            <CardDescription>统一的间距规范</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(style.spacing).map(([name, value]) => (
                <div key={name} className="rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium capitalize">{name}</span>
                    <span className="text-muted-foreground font-mono text-sm">{value}</span>
                  </div>
                  <div
                    className="bg-primary/20"
                    style={{
                      height: '20px',
                      width: value.replace(/rem|px|em/, '') || '16px',
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 圆角设置 */}
      {style.border_radius && Object.keys(style.border_radius).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              圆角规范
            </CardTitle>
            <CardDescription>边角圆润程度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(style.border_radius).map(([name, value]) => (
                <div key={name} className="flex items-center gap-4 rounded border p-4">
                  <div
                    className="h-12 w-12 bg-primary/50"
                    style={{ borderRadius: value }}
                  />
                  <div>
                    <div className="font-medium capitalize">{name}</div>
                    <div className="text-muted-foreground font-mono text-sm">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 阴影设置 */}
      {style.shadows && Object.keys(style.shadows).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5" />
              阴影效果
            </CardTitle>
            <CardDescription>深度及层次感</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(style.shadows).map(([name, value]) => (
                <div key={name} className="rounded border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium capitalize">{name}</span>
                    <span className="text-muted-foreground font-mono text-xs">{value}</span>
                  </div>
                  <div
                    className="h-16 w-full bg-background"
                    style={{ boxShadow: value }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
