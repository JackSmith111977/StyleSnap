'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, Plus, Share2, Image as ImageIcon, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { deleteCollection, removeStyleFromCollection } from '@/actions/collections'
import { toast } from 'sonner'
import { AddStyleModal } from './add-style-modal'
import type { CollectionDetail } from '@/actions/collections/types'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CollectionDetailProps {
  collection: CollectionDetail
  isOwner: boolean
}

/**
 * 合集详情页组件
 * 展示合集信息和风格列表，支持添加/移除风格
 */
export function CollectionDetailComponent({
  collection,
  isOwner,
}: CollectionDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleDelete = () => {
    if (!confirm('确定要删除这个合集吗？此操作不可恢复。')) return

    startTransition(async () => {
      const result = await deleteCollection(collection.id)

      if (result.success) {
        toast.success('合集已删除')
        router.push('/collections')
        router.refresh()
      } else {
        toast.error(result.error || '删除失败')
      }
    })
  }

  const handleRemoveStyle = (styleId: string) => {
    startTransition(async () => {
      const result = await removeStyleFromCollection(collection.id, styleId)

      if (result.success) {
        toast.success('风格已移除')
        router.refresh()
      } else {
        toast.error(result.error || '移除失败')
      }
    })
  }

  return (
    <div>
      {/* 合集头部 */}
      <div className="mb-8 rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{collection.name}</h1>
              {!collection.is_public && (
                <Badge variant="secondary">
                  <Lock className="mr-1 h-3 w-3" />
                  私密
                </Badge>
              )}
            </div>
            {collection.description && (
              <p className="text-muted-foreground">{collection.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span>包含 {collection.style_count} 个风格</span>
              <span>更新于 {new Date(collection.updated_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          {isOwner && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                添加风格
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/collections/${collection.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const url = `${window.location.origin}/collections/${collection.id}`
                  navigator.clipboard.writeText(url)
                  toast.success('链接已复制')
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                分享
              </Button>
              <Button variant="outline" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 封面预览 */}
        {collection.cover_style_id && (
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {collection.cover_preview ? (
              <img
                src={collection.cover_preview}
                alt={collection.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* 风格列表 */}
      <div>
        <h2 className="text-2xl font-bold mb-6">合集风格</h2>

        {collection.styles.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-muted-foreground mb-4">
              {isOwner ? '这个合集还没有风格，添加一些吧' : '这个合集暂无风格'}
            </div>
            {isOwner && (
              <Button onClick={() => setAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                添加风格
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.styles.map((style) => (
              <div
                key={style.id}
                className="group relative overflow-hidden rounded-lg border bg-card"
              >
                <Link href={`/styles/${style.id}`} className="block">
                  {/* 预览图 */}
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    {style.preview_image_light ? (
                      <img
                        src={style.preview_image_light}
                        alt={style.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* 信息 */}
                  <div className="p-3">
                    <h3 className="font-medium line-clamp-1">{style.name}</h3>
                  </div>
                </Link>

                {/* 移除按钮（仅所有者可见） */}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveStyle(style.id)}
                    className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                    title="从合集移除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加风格弹窗 */}
      <AddStyleModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        collectionId={collection.id}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
