'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface CreateCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateCollectionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCollectionModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('请输入合集名称')
      return
    }

    if (name.length < 2 || name.length > 50) {
      setError('合集名称长度需在 2-50 个字符之间')
      return
    }

    setError('')
    setIsCreating(true)

    const { createCollection } = await import('@/actions/favorites')
    const result = await createCollection({
      name: name.trim(),
      description: description.trim(),
      isPublic: true,
    })

    if (result.success) {
      router.refresh()
      onSuccess?.()
      onOpenChange(false)
      setName('')
      setDescription('')
    } else {
      setError(result.error ?? '创建失败')
    }

    setIsCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>创建新合集</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">合集名称</Label>
            <Input
              id="name"
              placeholder="例如：电商项目参考、深色主题 UI"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="描述这个合集的用途..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? '创建中...' : '创建'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
