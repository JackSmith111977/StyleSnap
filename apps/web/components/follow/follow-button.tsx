'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { UserPlus, UserCheck } from 'lucide-react'
import { toggleFollow } from '@/actions/follow'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

type FollowButtonProps = Omit<ComponentProps<typeof Button>, 'onClick'> & {
  userId: string
  initialIsFollowing?: boolean
  initialFollowerCount?: number
}

/**
 * 关注按钮组件
 * - 未登录用户点击跳转登录页
 * - 不能关注自己
 * - 乐观更新 UI，失败时回滚
 */
export function FollowButton({
  userId,
  initialIsFollowing = false,
  initialFollowerCount = 0,
  size = 'default',
  variant = 'default',
  className,
  ...props
}: FollowButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)

  const handleClick = () => {
    if (isPending) return

    startTransition(async () => {
      // 乐观更新
      const newIsFollowing = !isFollowing
      const newFollowerCount = newIsFollowing ? followerCount + 1 : followerCount - 1
      setIsFollowing(newIsFollowing)
      setFollowerCount(newFollowerCount)

      // 调用 Server Action
      const result = await toggleFollow(userId)

      // 如果失败，回滚
      if (!result.success) {
        setIsFollowing(!newIsFollowing)
        setFollowerCount(newIsFollowing ? followerCount - 1 : followerCount + 1)

        // 未登录用户跳转登录页
        if (result.error === '请先登录') {
          router.push(`/login?returnTo=/profile/${userId}`)
          return
        }

        // 不能关注自己
        if (result.error === '不能关注自己') {
          toast.error(result.error)
          return
        }

        toast.error(result.error || '操作失败，请重试')
      } else if (result.data) {
        // 使用服务器返回的准确值
        setIsFollowing(result.data.isFollowing)
        setFollowerCount(result.data.followerCount)
        toast.success(result.data.isFollowing ? '关注成功' : '已取消关注')
      }
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isPending}
      onClick={handleClick}
      aria-label={isFollowing ? '取消关注' : '关注'}
      className={cn(
        'transition-colors',
        isFollowing
          ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          : 'bg-primary text-primary-foreground hover:bg-primary/90',
        className
      )}
      title={isFollowing ? '取消关注' : '关注'}
      {...props}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-2" />
          已关注
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          关注
        </>
      )}
      {size !== 'icon' && size !== 'sm' && (
        <span className="ml-1 text-xs opacity-80">{followerCount} 粉丝</span>
      )}
    </Button>
  )
}
