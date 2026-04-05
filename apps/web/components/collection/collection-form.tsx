'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createCollection, updateCollection } from '@/actions/collections'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Collection } from '@/actions/collections/types'

interface CollectionFormProps {
  collection?: Collection
  onCancel?: () => void
}

/**
 * 合集创建/编辑表单组件
 */
export function CollectionForm({ collection, onCancel }: CollectionFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(collection?.name ?? '')
  const [description, setDescription] = useState(collection?.description ?? '')
  const [isPublic, setIsPublic] = useState(collection?.is_public ?? true)

  const handleSubmit = () => {
    // 验证
    if (name.length < 2) {
      toast.error('合集名称至少 2 个字符')
      return
    }
    if (name.length > 50) {
      toast.error('合集名称不能超过 50 个字符')
      return
    }
    if (description.length > 500) {
      toast.error('描述不能超过 500 个字符')
      return
    }

    startTransition(async () => {
      const result = collection?.id
        ? await updateCollection({
            id: collection.id,
            name,
            description: description || undefined,
            isPublic,
          })
        : await createCollection({
            name,
            description: description || undefined,
            isPublic,
          })

      if (result.success) {
        toast.success(collection ? '合集已更新' : '合集已创建')
        router.push(collection ? `/collections/${collection.id}` : '/collections')
        router.refresh()
      } else {
        toast.error(result.error || '操作失败')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{collection ? '编辑合集' : '创建合集'}</CardTitle>
        <CardDescription>
          {collection ? '修改合集信息' : '创建一个新的风格合集'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 合集名称 */}
        <div className="space-y-2">
          <Label htmlFor="name">合集名称</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：极简主义风格、深色主题 UI"
            disabled={isPending}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            2-50 个字符，同一用户的合集名称不能重复
          </p>
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <Label htmlFor="description">描述</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="描述这个合集的主题或用途"
            disabled={isPending}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            可选，最多 500 个字符
          </p>
        </div>

        {/* 公开/私密设置 */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="is-public">公开合集</Label>
            <p className="text-xs text-muted-foreground">
              公开合集可被任何人查看，私密合集只有你自己可见
            </p>
          </div>
          <Switch
            id="is-public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isPending}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '保存中...' : collection ? '保存更改' : '创建合集'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isPending}>
              取消
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
