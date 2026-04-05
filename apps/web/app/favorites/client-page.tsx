'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FavoritesGrid } from '@/components/favorites/favorites-grid'
import { FavoritesSidebar } from '@/components/favorites/favorites-sidebar'
import { AddToCollectionModal } from '@/components/favorites/add-to-collection-modal'
import { CreateCollectionModal } from '@/components/favorites/create-collection-modal'
import { toast } from 'sonner'

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

interface Collection {
  id: string
  name: string
  style_count: number
}

interface ClientFavoritesPageProps {
  styles: Style[]
  total: number
  page: number
  totalPages: number
  collectionId: string | null
  collections?: Collection[]
  totalUncategorized?: number
}

export function ClientFavoritesPage({
  styles,
  total,
  page,
  totalPages,
  collectionId,
  collections = [],
  totalUncategorized = 0,
}: ClientFavoritesPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [moveModalOpen, setMoveModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<{
    id: string
    title: string
    collections: Array<{ collection_id: string; collection_name: string }>
  } | null>(null)

  const handleMoveToCollection = (styleId: string) => {
    const style = styles.find((s) => s.id === styleId)
    if (style) {
      setSelectedStyle({
        id: style.id,
        title: style.title,
        collections: style.collections ?? [],
      })
      setMoveModalOpen(true)
    }
  }

  const handleRemoveFromFavorites = async (styleId: string) => {
    if (!confirm('确定要取消收藏该风格吗？')) return

    const { toggleFavorite } = await import('@/actions/favorites')
    const result = await toggleFavorite(styleId)

    if (result.success) {
      router.refresh()
      toast.success('已取消收藏')
    } else {
      toast.error(result.error ?? '操作失败')
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    if (collectionId) {
      params.set('collectionId', collectionId)
    }
    router.push(`/favorites?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* 侧边栏和主内容区布局 */}
      <div className="flex gap-6">
        {/* 侧边栏 */}
        <FavoritesSidebar
          collections={collections ?? []}
          totalUncategorized={totalUncategorized ?? 0}
          onRequestCreate={() => {
            setCreateModalOpen(true)
          }}
        />

        {/* 主内容区 */}
        <div className="flex-1">
          {/* 收藏网格 */}
          <FavoritesGrid
            styles={styles}
            onMoveToCollection={handleMoveToCollection}
            onRemoveFromFavorites={handleRemoveFromFavorites}
          />

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>

              <span className="px-4 text-sm text-muted-foreground">
                第 {page} 页，共 {totalPages} 页，共 {total} 项
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 移动到合集弹窗 */}
      {selectedStyle && (
        <AddToCollectionModal
          open={moveModalOpen}
          onOpenChange={setMoveModalOpen}
          styleId={selectedStyle.id}
          styleTitle={selectedStyle.title}
          currentCollections={selectedStyle.collections}
          onSuccess={() => {
            router.refresh()
            toast.success('已移动到合集')
          }}
        />
      )}

      {/* 创建合集弹窗 */}
      <CreateCollectionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          router.refresh()
          toast.success('合集已创建')
        }}
      />
    </div>
  )
}
