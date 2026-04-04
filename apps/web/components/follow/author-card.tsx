'use client'

import Link from 'next/link'
import { User, Calendar } from 'lucide-react'
import { FollowButton } from './follow-button'
import { FollowStats } from './follow-stats'
import { cn } from '@/lib/utils'

interface AuthorCardProps {
  authorId: string
  authorName: string | null
  authorAvatar: string | null
  authorBio: string | null
  followerCount: number
  followingCount: number
  styleCount: number
  isFollowing: boolean
  createdAt: string
  className?: string
}

/**
 * 作者信息卡片组件
 * 显示在风格详情页，展示作者信息并支持关注操作
 */
export function AuthorCard({
  authorId,
  authorName,
  authorAvatar,
  authorBio,
  followerCount,
  followingCount,
  styleCount,
  isFollowing,
  createdAt,
  className,
}: AuthorCardProps) {
  const displayName = authorName || '匿名用户'

  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      {/* 头部：头像和基本信息 */}
      <div className="flex items-start gap-4">
        {/* 头像 */}
        <Link href={`/profile/${authorId}`} className="flex-shrink-0">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </Link>

        {/* 作者信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <Link
                href={`/profile/${authorId}`}
                className="font-semibold text-lg hover:underline"
              >
                {displayName}
              </Link>
              {authorBio && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {authorBio}
                </p>
              )}
            </div>

            {/* 关注按钮 */}
            <FollowButton
              userId={authorId}
              initialIsFollowing={isFollowing}
              initialFollowerCount={followerCount}
              size="default"
            />
          </div>

          {/* 加入时间 */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <Calendar className="h-3 w-3" />
            加入于 {new Date(createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-6 mt-4 pt-4 border-t">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">作品</span>
          <span className="font-semibold">{styleCount}</span>
        </div>
        <FollowStats
          followerCount={followerCount}
          followingCount={followingCount}
          userId={authorId}
        />
      </div>
    </div>
  )
}
