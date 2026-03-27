import Link from 'next/link'
import { Palette, Code, Heart, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/favorite-button'
import type { Style } from '@/actions/styles'

interface StyleCardProps {
  style: Style
  viewMode: 'grid' | 'list'
}

export function StyleCard({ style, viewMode }: StyleCardProps) {
  // 获取主色
  const primaryColor = style.color_palette?.primary ?? '#666666'

  // 网格视图
  if (viewMode === 'grid') {
    return (
      <Card className="hypergryph-card group overflow-hidden transition-all duration-300 hover:shadow-lg">
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
            <Palette className="text-muted-foreground/50 h-16 w-16" />
          </div>

          {/* 悬停遮罩 */}
          <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex h-full items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Link href={`/styles/${style.id}`}>
                <Button size="sm" variant="secondary">
                  查看详情
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg">{style.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {style.description ?? '暂无描述'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 标签 */}
          {style.tags && style.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {style.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                >
                  {tag}
                </span>
              ))}
              {style.tags.length > 3 && (
                <span className="text-muted-foreground text-xs">
                  +{style.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 元数据 */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {style.view_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {style.favorite_count ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton
                styleId={style.id}
                initialIsFavorite={false}
                initialCount={style.favorite_count ?? 0}
                size="icon"
                variant="ghost"
              />
              <Link href={`/styles/${style.id}`}>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Code className="mr-1 h-3 w-3" />
                  查看代码
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>

        {/* 整个卡片可点击 */}
        <Link
          href={`/styles/${style.id}`}
          className="absolute inset-0 z-0"
          aria-label={`查看 ${style.title} 详情`}
        />
      </Card>
    )
  }

  // 列表视图
  return (
    <Card className="hypergryph-card group overflow-hidden transition-all duration-300 hover:shadow-md relative">
      <div className="flex flex-col md:flex-row">
        {/* 预览区域 */}
        <div
          className="relative aspect-video md:aspect-auto md:w-48"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 100%)`,
          }}
        >
          <div className="absolute left-2 top-2">
            <span className="bg-primary/90 text-primary-foreground rounded px-2 py-1 text-xs font-medium">
              {style.category?.name ?? '未分类'}
            </span>
          </div>
          <div className="flex h-full items-center justify-center">
            <Palette className="text-muted-foreground/50 h-12 w-12" />
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{style.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {style.category?.name ?? '未分类'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <FavoriteButton
                  styleId={style.id}
                  initialIsFavorite={false}
                  initialCount={style.favorite_count ?? 0}
                  size="icon"
                  variant="ghost"
                />
                <Link href={`/styles/${style.id}`}>
                  <Button size="sm">查看代码</Button>
                </Link>
              </div>
            </div>
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {style.description ?? '暂无描述'}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            {/* 标签 */}
            {style.tags && style.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {style.tags.slice(0, 5).map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 元数据 */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {style.view_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {style.favorite_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 整个卡片可点击 */}
      <Link
        href={`/styles/${style.id}`}
        className="absolute inset-0 z-0"
        aria-label={`查看 ${style.title} 详情`}
      />
    </Card>
  )
}
