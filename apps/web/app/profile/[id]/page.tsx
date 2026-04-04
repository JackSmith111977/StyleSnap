import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getUserProfile } from '@/actions/follow'
import { getUserStyles } from '@/actions/styles'
import { FollowButton } from '@/components/follow/follow-button'
import { FollowStats } from '@/components/follow/follow-stats'
import { StyleCard } from '@/components/style-card'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Calendar, Mail } from 'lucide-react'
import { type Metadata } from 'next'
import { FollowingFeed } from '@/components/follow/following-feed'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const user = await getCurrentUser()

  // 如果是当前用户，显示自己的名字
  if (user && user.id === id) {
    return {
      title: '个人主页 - StyleSnap',
    }
  }

  // 获取用户信息
  try {
    const result = await getUserProfile(id)
    const displayName = result.data?.display_name || '用户'
    return {
      title: `${displayName} 的个人主页 - StyleSnap`,
      description: result.data?.bio || undefined,
    }
  } catch {
    return {
      title: '用户主页 - StyleSnap',
    }
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id: userId } = await params
  const currentUser = await getCurrentUser()

  // 获取用户资料
  const profileResult = await getUserProfile(userId)

  if (!profileResult.success || !profileResult.data) {
    notFound()
  }

  const profile = profileResult.data

  // 获取用户提交的风格
  const stylesResult = await getUserStyles(userId, 1, 12)
  const styles = stylesResult.success && stylesResult.data ? stylesResult.data.styles : []

  // 判断是否是当前用户自己的主页
  const isOwnProfile = currentUser?.id === userId

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* 用户信息头部 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || '用户'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-muted-foreground" />
                )}
              </div>

              {/* 用户信息 */}
              <div>
                <h1 className="text-2xl font-bold">{profile.display_name || '匿名用户'}</h1>
                {profile.bio && (
                  <p className="text-muted-foreground text-sm mt-1">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              {!isOwnProfile && currentUser && (
                <FollowButton
                  userId={userId}
                  initialIsFollowing={profile.is_following}
                  initialFollowerCount={profile.follower_count}
                  size="lg"
                />
              )}
              {isOwnProfile && (
                <Link href="/profile">
                  <Button size="lg">编辑资料</Button>
                </Link>
              )}
            </div>
          </div>

          {/* 关注统计 */}
          <div className="mt-6 pt-6 border-t">
            <FollowStats
              followerCount={profile.follower_count}
              followingCount={profile.following_count}
              userId={userId}
            />
          </div>
        </div>

        {/* 内容区域 */}
        <Tabs defaultValue="styles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="styles">
              风格作品 ({profile.style_count})
            </TabsTrigger>
            {!isOwnProfile && (
              <TabsTrigger value="feed">
                关注动态
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="styles">
            {styles.length === 0 ? (
              <EmptyState
                title="暂无作品"
                description={isOwnProfile ? '快去提交你的第一个风格吧' : '该用户还没有提交任何风格'}
                actionLabel={isOwnProfile ? '提交风格' : '浏览风格'}
                actionHref={isOwnProfile ? '/submit' : '/styles'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {styles.map((style) => (
                  <StyleCard
                    key={style.id}
                    id={style.id}
                    title={style.name}
                    description={style.description}
                    previewImageLight={style.preview_image_light}
                    previewImageDark={style.preview_image_dark}
                    categoryId={style.category_id}
                    categoryName={style.category_name}
                    authorId={style.user_id}
                    authorName={style.author_name}
                    authorAvatar={style.author_avatar}
                    likeCount={style.like_count}
                    favoriteCount={style.favorite_count}
                    viewCount={style.view_count}
                    createdAt={style.created_at}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feed">
            <FollowingFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
