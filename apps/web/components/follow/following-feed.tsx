'use client'

import { useEffect, useState } from 'react'
import { getFollowingFeed } from '@/actions/follow'
import { StyleCard } from '@/components/style-card'
import { EmptyState } from '@/components/empty-state'
import { Loader2 } from 'lucide-react'

interface FollowingFeedProps {
  className?: string
}

/**
 * 关注动态组件
 * 展示关注作者提交的风格列表
 */
export function FollowingFeed({ className }: FollowingFeedProps) {
  const [loading, setLoading] = useState(true)
  const [feed, setFeed] = useState<Array<{
    id: string
    name: string
    description: string | null
    preview_image_light: string | null
    preview_image_dark: string | null
    category_id: string
    category_name: string
    author_id: string
    author_name: string | null
    author_avatar: string | null
    like_count: number
    favorite_count: number
    view_count: number
    created_at: string
  }>>([])

  useEffect(() => {
    async function loadFeed() {
      try {
        const result = await getFollowingFeed(1, 20)
        if (result.success && result.data) {
          setFeed(result.data.styles)
        }
      } catch (error) {
        console.error('Failed to load following feed:', error)
      } finally {
        setLoading(false)
      }
    }

    void loadFeed()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (feed.length === 0) {
    return (
      <EmptyState
        title="暂无关注动态"
        description="关注你喜欢的创作者，他们的作品会出现在这里"
        actionLabel="去浏览风格"
        actionHref="/styles"
      />
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feed.map((style) => (
          <StyleCard
            key={style.id}
            id={style.id}
            title={style.name}
            description={style.description}
            previewImageLight={style.preview_image_light}
            previewImageDark={style.preview_image_dark}
            categoryId={style.category_id}
            categoryName={style.category_name}
            authorId={style.author_id}
            authorName={style.author_name}
            authorAvatar={style.author_avatar}
            likeCount={style.like_count}
            favoriteCount={style.favorite_count}
            viewCount={style.view_count}
            createdAt={style.created_at}
          />
        ))}
      </div>
    </div>
  )
}
