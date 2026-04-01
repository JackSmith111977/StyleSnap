'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { toggleLike } from '@/actions/likes'
import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type LikeButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  styleId: string
  initialIsLiked?: boolean
  initialCount?: number
}

export function LikeButton({
  styleId,
  initialIsLiked = false,
  initialCount = 0,
  size = 'icon',
  variant = 'ghost',
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    startTransition(async () => {
      // 乐观更新
      const newIsLiked = !isLiked
      const newCount = newIsLiked ? count + 1 : count - 1
      setIsLiked(newIsLiked)
      setCount(newCount)

      // 调用 Server Action
      const result = await toggleLike(styleId)

      // 如果失败，回滚到初始状态
      if (!result.success) {
        setIsLiked(isLiked)
        setCount(count)
      } else if (result.data) {
        // 使用服务器返回的准确值
        setIsLiked(result.data.isLiked)
        setCount(result.data.count)
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
        isLiked && 'text-blue-500 hover:text-blue-600',
        !isLiked && 'text-muted-foreground hover:text-blue-400'
      )}
      title={isLiked ? '取消点赞' : '点赞'}
    >
      <ThumbsUp
        className={cn(
          'h-5 w-5',
          isLiked && 'fill-current animate-pulse'
        )}
      />
      {size !== 'icon' && (
        <span className="ml-1">{count}</span>
      )}
    </Button>
  )
}
