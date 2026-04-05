'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Collection {
  id: string
  name: string
  style_count: number
}

interface AddToCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  styleId: string
  styleTitle: string
  currentCollections: Array<{ collection_id: string; collection_name: string }>
  onSuccess?: () => void
}

export function AddToCollectionModal({
  open,
  onOpenChange,
  styleId,
  styleTitle,
  currentCollections,
  onSuccess,
}: AddToCollectionModalProps) {
  const router = useRouter()
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    if (open) {
      void loadCollections()
    }
  }, [open])

  const loadCollections = async () => {
    setLoading(true)
    const { getUserCollectionsSimple } = await import('@/actions/favorites')
    const result = await getUserCollectionsSimple()

    if (result.success && result.data) {
      setCollections(result.data)
    }
    setLoading(false)
  }

  const handleMoveToCollection = async () => {
    if (!selectedCollectionId) return

    setIsMoving(true)

    const { addStyleToCollection } = await import('@/actions/favorites')
    const result = await addStyleToCollection(styleId, selectedCollectionId)

    if (result.success) {
      router.refresh()
      onSuccess?.()
      onOpenChange(false)
      toast.success('已移动到合集')
    } else {
      toast.error(result.error ?? '移动失败')
    }

    setIsMoving(false)
  }

  const handleRemoveFromCollection = async (collectionId: string) => {
    const { removeStyleFromCollection } = await import('@/actions/favorites')
    const result = await removeStyleFromCollection(styleId, collectionId)

    if (result.success) {
      router.refresh()
      onSuccess?.()
      toast.success('已从合集移除')
    } else {
      toast.error(result.error ?? '移除失败')
    }
  }

  const currentCollectionIds = new Set(currentCollections.map(c => c.collection_id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>移动到合集</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            将"{styleTitle}"移动到：
          </p>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              加载中...
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>暂无合集</p>
              <p className="text-xs mt-2">请先创建合集</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-auto">
              {collections.map((collection) => {
                const isInCollection = currentCollectionIds.has(collection.id)
                return (
                  <div
                    key={collection.id}
                    className={`flex items-center justify-between p-3 rounded-md border ${
                      isInCollection
                        ? 'bg-blue-500/10 border-blue-300 dark:border-blue-700'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="collection"
                        value={collection.id}
                        checked={selectedCollectionId === collection.id}
                        onChange={(e) => setSelectedCollectionId(e.target.value)}
                        disabled={isInCollection}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-medium">{collection.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {collection.style_count} 个风格
                        </p>
                      </div>
                    </div>
                    {isInCollection && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromCollection(collection.id)}
                      >
                        移除
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleMoveToCollection}
            disabled={!selectedCollectionId || isMoving}
          >
            {isMoving ? '移动中...' : '确认移动'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
