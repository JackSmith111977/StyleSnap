'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ThumbsUp } from 'lucide-react'
import { toggleLike } from '@/actions/likes'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [count, setCount] = useState(initialCount)

  const handleClick = () => {
    // 防止快速连续点击
    if (isPending) {
      console.log('[LikeButton] 忽略点击，因为 isPending=true', { isLiked, count })
      return
    }

    console.log('[LikeButton] 点击前', { isLiked, count, styleId })

    startTransition(async () => {
      // 乐观更新
      const newIsLiked = !isLiked
      const newCount = newIsLiked ? count + 1 : count - 1
      console.log('[LikeButton] 乐观更新后', { newIsLiked, newCount })
      setIsLiked(newIsLiked)
      setCount(newCount)

      // 调用 Server Action
      console.log('[LikeButton] 调用 toggleLike', { styleId })
      const result = await toggleLike(styleId)
      console.log('[LikeButton] toggleLike 返回', result)

      // 如果失败，回滚到点击前的状态
      if (!result.success) {
        console.log('[LikeButton] 失败，回滚', result.error)
        setIsLiked(!newIsLiked)
        setCount(newIsLiked ? count - 1 : count + 1)

        // 未登录用户跳转登录页
        if (result.error === '请先登录') {
          router.push(`/login?returnTo=/styles/${styleId}`)
          return
        }

        toast.error(result.error || '操作失败，请重试')
      } else if (result.data) {
        // 始终信任服务器返回的准确值
        // 服务器返回的计数是数据库的真实状态
        console.log('[LikeButton] 使用服务器返回值', result.data)
        setIsLiked(result.data.isLiked)
        setCount(result.data.count)
        toast.success(result.data.isLiked ? '已点赞' : '已取消点赞')
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      aria-label={isLiked ? '取消点赞' : '点赞'}
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
        <span data-testid="like-count" className="ml-1">{count}</span>
      )}
    </Button>
  )
}
