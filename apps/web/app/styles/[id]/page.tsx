import { notFound } from 'next/navigation'
import { getStyle } from '@/actions/styles'
import { getComments } from '@/actions/comments'
import { checkIsLiked } from '@/actions/likes'
import { StyleDetail } from '@/components/style-detail'
import { CodeBlock } from '@/components/code-block'
import { LikeButton } from '@/components/like-button'
import { CommentList } from '@/components/comment-list'
import { CommentForm } from '@/components/comment-form'
import Link from 'next/link'
import { ArrowLeft, Code, Eye, Heart, Calendar, MessageCircle } from 'lucide-react'
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

  if (!style) {
    notFound()
  }

  // 获取用户点赞状态（仅已登录用户）
  let isLiked = false
  if (user) {
    const likeStatus = await checkIsLiked(id)
    isLiked = likeStatus.success ? likeStatus.data?.isLiked ?? false : false
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/styles"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
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
              <Calendar className="h-4 w-4" />
              {new Date(style.created_at).toLocaleDateString('zh-CN')}
            </span>
            {/* 点赞按钮 */}
            <LikeButton
              styleId={style.id}
              initialIsLiked={isLiked}
              initialCount={style.like_count ?? 0}
              size="sm"
              variant="outline"
            />
          </div>
        </div>

        {/* 设计变量展示 */}
        <StyleDetail style={style} />

        {/* 代码示例 */}
        <div className="mt-8 space-y-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Code className="h-6 w-6" />
            代码示例
          </h2>

          {/* HTML 代码 */}
          {style.code_html && (
            <CodeBlock
              code={style.code_html}
              language="html"
              title="HTML"
            />
          )}

          {/* CSS 代码 */}
          {style.code_css && (
            <CodeBlock
              code={style.code_css}
              language="css"
              title="CSS"
            />
          )}

          {/* React 代码 */}
          {style.code_react && (
            <CodeBlock
              code={style.code_react}
              language="tsx"
              title="React Component"
            />
          )}

          {/* Tailwind 代码 */}
          {style.code_tailwind && (
            <CodeBlock
              code={style.code_tailwind}
              language="html"
              title="Tailwind CSS"
            />
          )}
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
          />
        </div>
      </div>
    </div>
  )
}
