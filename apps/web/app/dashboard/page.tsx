import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  // 要求登录
  const user = await requireAuth()

  // 获取用户资料
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: { id: string; username: string; role: string; avatar_url?: string; favorites_count?: number; comments_count?: number } | null; error: Error | null }

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">仪表板</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 用户信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>你的个人资料信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">用户名</span>
              <p className="font-medium">{profile.username}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">邮箱</span>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">角色</span>
              <p className="font-medium capitalize">{profile.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <Card>
          <CardHeader>
            <CardTitle>统计</CardTitle>
            <CardDescription>你的活动数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">收藏风格</span>
              <p className="text-2xl font-bold">{profile.favorites_count ?? 0}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">评论</span>
              <p className="text-2xl font-bold">{profile.comments_count ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>常用功能入口</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/styles"
              className="block text-sm text-primary hover:underline"
            >
              浏览风格库
            </a>
            <a
              href="/favorites"
              className="block text-sm text-primary hover:underline"
            >
              查看收藏
            </a>
            <a
              href="/profile"
              className="block text-sm text-primary hover:underline"
            >
              编辑资料
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
