'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { toggleFavorite } from '@/actions/favorites'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

type FavoriteButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  styleId: string
  initialIsFavorite?: boolean
  initialCount?: number
}

export function FavoriteButton({
  styleId,
  initialIsFavorite = false,
  initialCount = 0,
  size = 'icon',
  variant = 'ghost',
}: FavoriteButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    startTransition(async () => {
      // 乐观更新
      const newIsFavorite = !isFavorite
      const newCount = newIsFavorite ? count + 1 : count - 1
      setIsFavorite(newIsFavorite)
      setCount(newCount)

      // 调用 Server Action
      const result = await toggleFavorite(styleId)

      // 如果失败，回滚
      if (!result.success) {
        setIsFavorite(!newIsFavorite)
        setCount(newIsFavorite ? count - 1 : count + 1)

        // 未登录用户跳转登录页
        if (result.error === '请先登录') {
          router.push(`/login?returnTo=/styles/${styleId}`)
          return
        }

        toast.error(result.error || '操作失败，请重试')
      } else if (result.data) {
        // 使用服务器返回的准确值
        setIsFavorite(result.data.isFavorite)
        setCount(result.data.count)
        toast.success(result.data.isFavorite ? '已加入收藏夹' : '已取消收藏')
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      className={cn(
        'transition-colors hover:bg-accent/50',
        isFavorite && 'text-red-500 hover:text-red-600',
        !isFavorite && 'text-muted-foreground hover:text-red-400'
      )}
      title={isFavorite ? '取消收藏' : '收藏'}
    >
      <Heart
        className={cn(
          'h-5 w-5',
          isFavorite && 'fill-current animate-pulse'
        )}
      />
    </Button>
  )
}
