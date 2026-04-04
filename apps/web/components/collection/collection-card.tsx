import Link from 'next/link'
import { Image as ImageIcon, Lock, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Collection } from '@/actions/collections/types'

interface CollectionCardProps {
  collection: Collection
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

/**
 * 合集卡片组件
 * 展示合集封面、名称、描述、风格数量等信息
 */
export function CollectionCard({
  collection,
  showActions = false,
  onEdit,
  onDelete,
  className,
}: CollectionCardProps) {
  const { id, name, description, cover_preview, style_count, is_public } = collection

  return (
    <div className={cn('group relative overflow-hidden rounded-lg border bg-card', className)}>
      <Link href={`/collections/${id}`} className="block">
        {/* 封面图 */}
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {cover_preview ? (
            <img
              src={cover_preview}
              alt={name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}

          {/* 公开/私密标识 */}
          {!is_public && (
            <div className="absolute left-2 top-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
              <Lock className="mr-1 inline h-3 w-3" />
              私密
            </div>
          )}

          {/* 风格数量 */}
          <div className="absolute right-2 top-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
            {style_count} 个风格
          </div>
        </div>

        {/* 信息区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </Link>

      {/* 操作按钮 */}
      {showActions && (
        <div className="absolute right-2 top-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/50 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {/* 操作菜单 - 需要时可以添加下拉菜单 */}
          <div className="absolute right-0 top-8 hidden group-hover:block rounded-md border bg-background shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onEdit?.()
              }}
            >
              编辑
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete?.()
              }}
            >
              删除
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
