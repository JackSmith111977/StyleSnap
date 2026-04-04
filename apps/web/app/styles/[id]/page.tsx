import { notFound } from 'next/navigation'
import { getStyle, incrementViewCount, getRelatedStyles } from '@/actions/styles'
import { getComments } from '@/actions/comments'
import { checkIsLiked } from '@/actions/likes'
import { checkIsFavorite } from '@/actions/favorites'
import { StyleDetail } from '@/components/style-detail'
import { CodeSnippetDisplay } from '@/components/style-code-snippet'
import { LikeButton } from '@/components/like-button'
import { FavoriteButton } from '@/components/favorite-button'
import { CommentList } from '@/components/comment-list'
import { CommentForm } from '@/components/comment-form'
import { RelatedStyles } from '@/components/related-styles'
import { LivePreviewEditor } from '@/components/preview'
import { ShareButton } from '@/components/share'
import Link from 'next/link'
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react'
import { type Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'

interface StyleDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: StyleDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const style = await getStyle(id)

  if (!style) {
    return {
      title: '风格不存在 - StyleSnap',
    }
  }

  return {
    title: `${style.title} - StyleSnap`,
    description: style.description ?? `查看${style.title}的设计风格案例和代码示例`,
    openGraph: {
      title: style.title,
      description: style.description ?? '查看设计风格案例和代码示例',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: style.title,
      description: style.description ?? '查看设计风格案例和代码示例',
    },
  }
}

// 此页面动态获取风格数据

export default async function StyleDetailPage({ params }: StyleDetailPageProps) {
  const { id } = await params
  const style = await getStyle(id)
  const user = await getCurrentUser()
  const commentsResult = await getComments(id)
  const relatedStyles = await getRelatedStyles(id)

  if (!style) {
    notFound()
  }

  // 异步增加浏览次数（不阻塞渲染）
  incrementViewCount(id).catch(console.error)

  // 获取用户点赞状态（仅已登录用户）
  let isLiked = false
  if (user) {
    const likeStatus = await checkIsLiked(id)
    isLiked = likeStatus.success ? likeStatus.data?.isLiked ?? false : false
  }

  // 获取用户收藏状态（仅已登录用户）
  let isFavorite = false
  if (user) {
    const favoriteStatus = await checkIsFavorite(id)
    isFavorite = favoriteStatus.success ? favoriteStatus.data?.isFavorite ?? false : false
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 - 面包屑 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground"
            >
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/styles"
              className="text-muted-foreground hover:text-foreground"
            >
              风格列表
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{style.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 标题区 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{style.title}</h1>
          <p className="mt-2 text-muted-foreground">{style.description ?? '暂无描述'}</p>

          {/* 元数据 */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {style.view_count} 次浏览
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {style.like_count} 次点赞
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {commentsResult.data?.length ?? 0} 条评论
            </span>
            {/* 点赞、收藏和分享按钮 */}
            <div className="flex items-center gap-2">
              <LikeButton
                styleId={style.id}
                initialIsLiked={isLiked}
                initialCount={style.like_count ?? 0}
                size="sm"
                variant="outline"
              />
              <FavoriteButton
                styleId={style.id}
                initialIsFavorite={isFavorite}
                initialCount={style.favorite_count ?? 0}
                size="sm"
                variant="outline"
              />
              <ShareButton
                styleId={style.id}
                styleTitle={style.title}
                styleDescription={style.description}
                previewImageUrl={style.preview_images?.light}
              />
            </div>
          </div>
        </div>

        {/* 设计变量展示 */}
        <StyleDetail style={style} />

        {/* 代码示例 - Tabs 切换 */}
        <div className="mt-8">
          <CodeSnippetDisplay
            snippets={[
              { language: 'html', title: 'HTML', code: style.code_html },
              { language: 'css', title: 'CSS', code: style.code_css },
              { language: 'tsx', title: 'React', code: style.code_react },
              { language: 'html', title: 'Tailwind', code: style.code_tailwind },
            ]}
          />
        </div>

        {/* 实时预览编辑器 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">实时预览编辑器</h2>
          <LivePreviewEditor styleName={style.title} />
        </div>

        {/* 评论区域 */}
        <div className="mt-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-6">
            <MessageCircle className="h-6 w-6" />
            评论
          </h2>

          {/* 评论表单 */}
          {user ? (
            <div className="mb-6">
              <CommentForm styleId={style.id} />
            </div>
          ) : (
            <div className="mb-6 p-4 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                请 <Link href="/login" className="text-primary hover:underline">登录</Link> 后发表评论
              </p>
            </div>
          )}

          {/* 评论列表 */}
          <CommentList
            styleId={style.id}
            initialComments={commentsResult.data ?? []}
            isLoggedIn={!!user}
            currentUserId={user?.id}
          />
        </div>

        {/* 相关推荐 */}
        <div className="mt-12">
          <RelatedStyles relatedStyles={relatedStyles} />
        </div>
      </div>
    </div>
  )
}
