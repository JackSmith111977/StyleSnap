'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Folder, FolderPlus, FolderOpen, Star, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Collection {
  id: string
  name: string
  style_count: number
}

interface FavoritesSidebarProps {
  collections: Collection[]
  totalUncategorized: number
}

export function FavoritesSidebar({ collections, totalUncategorized }: FavoritesSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCreating, setIsCreating] = useState(false)
  const [activeMenu, setActiveMenu] = useState<'all' | 'uncategorized' | string>('all')

  const currentCollectionId = searchParams.get('collectionId')

  const handleNavigate = (collectionId?: string | null) => {
    if (collectionId === 'uncategorized') {
      router.push('/favorites?collectionId=uncategorized')
      setActiveMenu('uncategorized')
    } else if (!collectionId) {
      router.push('/favorites')
      setActiveMenu('all')
    } else {
      router.push(`/favorites?collectionId=${collectionId}`)
      setActiveMenu(collectionId)
    }
  }

  const handleCreateCollection = () => {
    setIsCreating(true)
  }

  const handleDeleteCollection = async (e: React.MouseEvent, collectionId: string, collectionName: string) => {
    e.stopPropagation()
    if (!confirm(`确定要删除合集"${collectionName}"吗？删除后其中的收藏会回到"未分类"池。`)) {
      return
    }

    const { deleteCollection } = await import('@/actions/favorites')
    const result = await deleteCollection(collectionId)

    if (result.success) {
      router.push('/favorites')
      router.refresh()
    } else {
      alert(result.error ?? '删除失败')
    }
  }

  return (
    <div className="w-64 flex-shrink-0">
      <div className="sticky top-4 space-y-4">
        {/* 创建合集按钮 */}
        <Button
          onClick={handleCreateCollection}
          className="w-full"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          新建合集
        </Button>

        {/* 导航列表 */}
        <nav className="space-y-1">
          {/* 全部 */}
          <button
            onClick={() => handleNavigate(null)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
              !currentCollectionId
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              <span>全部收藏</span>
            </div>
          </button>

          {/* 未分类 */}
          <button
            onClick={() => handleNavigate('uncategorized')}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
              currentCollectionId === 'uncategorized'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span>未分类</span>
            </div>
            {totalUncategorized > 0 && (
              <span className="bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {totalUncategorized}
              </span>
            )}
          </button>
        </nav>

        {/* 合集列表 */}
        {collections.length > 0 && (
          <div>
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase">
              我的合集
            </h3>
            <nav className="space-y-1">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className="group flex items-center gap-1"
                >
                  <button
                    onClick={() => handleNavigate(collection.id)}
                    className={cn(
                      'flex-1 flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      currentCollectionId === collection.id
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span className="truncate max-w-[120px]">{collection.name}</span>
                    </div>
                    {collection.style_count > 0 && (
                      <span className="bg-muted-foreground/20 text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                        {collection.style_count}
                      </span>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteCollection(e, collection.id, collection.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
