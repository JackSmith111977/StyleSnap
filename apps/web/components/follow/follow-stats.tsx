'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface FollowStatsProps {
  followerCount: number
  followingCount: number
  userId?: string
  className?: string
}

/**
 * 关注统计组件
 * 显示粉丝数和关注数
 */
export function FollowStats({
  followerCount,
  followingCount,
  userId,
  className,
}: FollowStatsProps) {
  // 格式化数字（超过 1000 显示 k）
  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const handleClick = (type: 'followers' | 'following') => {
    if (!userId) return
    // TODO: 打开粉丝列表或关注列表弹窗
    console.log(`Click ${type} for user ${userId}`)
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <button
        type="button"
        onClick={() => handleClick('followers')}
        className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-lg font-semibold tabular-nums">
          {formatCount(followerCount)}
        </span>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          粉丝
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleClick('following')}
        className="group flex items-center gap-1.5 hover:opacity-80 transition-opacity"
      >
        <span className="text-lg font-semibold tabular-nums">
          {formatCount(followingCount)}
        </span>
        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
          关注
        </span>
      </button>
    </div>
  )
}
