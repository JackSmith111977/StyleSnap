'use client'

import Link from 'next/link'
import { Heart, ExternalLink, FolderPlus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Style {
  id: string
  title: string
  description: string | null
  category?: { name: string; name_en: string; icon: string | null }
  tags?: string[]
  collections?: Array<{ collection_id: string; collection_name: string }>
  like_count: number
  view_count: number
}

interface FavoritesGridProps {
  styles: Style[]
  onMoveToCollection: (styleId: string) => void
  onRemoveFromFavorites: (styleId: string) => void
}

export function FavoritesGrid({ styles, onMoveToCollection, onRemoveFromFavorites }: FavoritesGridProps): JSX.Element {
  if (styles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">暂无收藏</h3>
        <p className="text-muted-foreground mb-4">去风格库探索更多设计风格吧</p>
        <Link href="/styles">
          <Button>
            <ExternalLink className="mr-2 h-4 w-4" />
            浏览风格库
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {styles.map((style) => (
        <Card
          key={style.id}
          className="group overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="line-clamp-1">{style.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {style.description ?? '暂无描述'}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onMoveToCollection(style.id)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    移动到合集
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRemoveFromFavorites(style.id)}
                    className="text-destructive"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    取消收藏
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {/* 分类标签 */}
            {style.category && (
              <div className="mb-3">
                <span className="bg-primary/90 text-primary-foreground rounded px-2 py-1 text-xs font-medium">
                  {style.category.name ?? style.category.name_en ?? '未分类'}
                </span>
              </div>
            )}

            {/* 标签 */}
            {style.tags && style.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
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

            {/* 所属合集 */}
            {style.collections && style.collections.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1">
                {style.collections.map((c) => (
                  <span
                    key={c.collection_id}
                    className="bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded px-2 py-0.5 text-xs"
                  >
                    <FolderPlus className="inline h-3 w-3 mr-0.5" />
                    {c.collection_name}
                  </span>
                ))}
              </div>
            )}

            {/* 元数据 */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{style.view_count} 次浏览</span>
                <span>{style.like_count} 次点赞</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 flex gap-2">
              <Link href={`/styles/${style.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  查看详情
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
