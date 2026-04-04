'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { addStyleToCollection } from '@/actions/collections'
import { toast } from 'sonner'
import { Search, Check } from 'lucide-react'
import { getStyles } from '@/actions/styles'

interface AddStyleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  collectionId: string
  onSuccess?: () => void
}

interface Style {
  id: string
  title: string
  description: string | null
  preview_image_light: string | null
}

/**
 * 添加风格到合集弹窗组件
 */
export function AddStyleModal({
  open,
  onOpenChange,
  collectionId,
  onSuccess,
}: AddStyleModalProps) {
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [styles, setStyles] = useState<Style[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null)

  // 搜索风格
  const handleSearch = async () => {
    if (search.length < 2) return

    setLoading(true)
    try {
      const result = await getStyles({ search, limit: 20 })
      setStyles(result.styles)
    } catch (error) {
      console.error('搜索风格失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加风格到合集
  const handleAdd = () => {
    if (!selectedStyleId) return

    startTransition(async () => {
      const result = await addStyleToCollection(collectionId, selectedStyleId)

      if (result.success) {
        toast.success('风格已添加到合集')
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(result.error || '添加失败')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>添加风格到合集</DialogTitle>
          <DialogDescription>
            搜索并选择要添加到合集的风格
          </DialogDescription>
        </DialogHeader>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索风格名称或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
          <Button
            size="sm"
            className="absolute right-0 top-0"
            onClick={handleSearch}
            disabled={loading || search.length < 2}
          >
            {loading ? '搜索中...' : '搜索'}
          </Button>
        </div>

        {/* 风格列表 */}
        <div className="max-h-80 overflow-y-auto space-y-2">
          {styles.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {search ? '未找到相关风格' : '输入关键词搜索风格'}
            </div>
          ) : (
            styles.map((style) => (
              <div
                key={style.id}
                className={`flex items-center gap-4 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selectedStyleId === style.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedStyleId(style.id)}
              >
                {/* 预览图 */}
                <div className="h-16 w-24 overflow-hidden rounded bg-muted flex-shrink-0">
                  {style.preview_image_light ? (
                    <img
                      src={style.preview_image_light}
                      alt={style.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      无预览
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-1">{style.title}</h4>
                  {style.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {style.description}
                    </p>
                  )}
                </div>

                {/* 选中指示器 */}
                {selectedStyleId === style.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            ))
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isPending || !selectedStyleId}
          >
            {isPending ? '添加中...' : '添加'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
