import Link from 'next/link'
import { ArrowRight, Palette } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Style } from '@/actions/styles'

interface RelatedStylesProps {
  relatedStyles: Style[]
}

export function RelatedStyles({ relatedStyles }: RelatedStylesProps) {
  // 无相关推荐
  if (relatedStyles.length === 0) {
    return (
      <div className="rounded-lg border bg-muted p-8 text-center">
        <Palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">暂无相关推荐</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          该风格暂时没有相似的风格推荐
        </p>
        <Link
          href="/styles"
          className="inline-flex items-center text-primary hover:underline"
        >
          查看更多风格
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">相关推荐</h2>
        <Link
          href="/styles"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          查看更多
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {relatedStyles.map((style) => (
          <RelatedStyleCard key={style.id} style={style} />
        ))}
      </div>
    </div>
  )
}

interface RelatedStyleCardProps {
  style: Style
}

function RelatedStyleCard({ style }: RelatedStyleCardProps) {
  const primaryColor = style.color_palette?.primary ?? '#666666'

  return (
    <Link href={`/styles/${style.id}`}>
      <Card className="hypergryph-card group overflow-hidden transition-all duration-300 hover:shadow-md relative h-full">
        {/* 预览区域 */}
        <div
          className="relative aspect-video overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
          }}
        >
          {/* 分类标签 */}
          <div className="absolute left-2 top-2">
            <span className="bg-primary/90 text-primary-foreground rounded px-2 py-1 text-xs font-medium">
              {style.category?.name ?? '未分类'}
            </span>
          </div>

          {/* 预览图占位 */}
          <div className="flex h-full items-center justify-center">
            <Palette className="text-muted-foreground/50 h-10 w-10" />
          </div>

          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-white text-sm font-medium">查看详情</span>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <CardContent className="p-3">
          <h3 className="font-medium text-sm line-clamp-1 mb-1">
            {style.title}
          </h3>
          <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
            {style.description ?? '暂无描述'}
          </p>

          {/* 标签 */}
          {style.tags && style.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {style.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
                >
                  {tag}
                </span>
              ))}
              {style.tags.length > 2 && (
                <span className="text-muted-foreground text-[10px]">
                  +{style.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        {/* 整个卡片可点击 */}
        <span className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />
      </Card>
    </Link>
  )
}
