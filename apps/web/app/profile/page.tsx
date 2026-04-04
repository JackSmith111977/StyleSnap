import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { getCurrentProfile } from '@/actions/profiles'
import { ProfileForm } from '@/components/profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Mail, Calendar } from 'lucide-react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '个人资料 - StyleSnap',
}

export default async function ProfilePage() {
  const user = await requireAuth()
  const profileResult = await getCurrentProfile()

  if (!profileResult.success || !profileResult.data) {
    redirect('/login')
  }

  const profile = profileResult.data

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
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">个人资料</h1>
          <p className="text-muted-foreground">管理和编辑你的个人信息</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* 左侧：用户信息卡片 */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  账户信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 头像 */}
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <p className="font-medium text-lg">{profile.username}</p>
                  {profile.full_name && (
                    <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                  )}
                </div>

                {/* 邮箱 */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>

                {/* 注册时间 */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    加入于 {new Date(profile.created_at).toLocaleDateString('zh-CN')}
                  </span>
                </div>

                {/* 用户角色 */}
                <div className="pt-3 border-t">
                  <span className="text-xs text-muted-foreground">角色</span>
                  <div className="mt-1">
                    <span className="bg-primary/10 text-primary rounded px-2 py-1 text-xs font-medium">
                      {profile.role === 'admin' ? '管理员' :
                       profile.role === 'super_admin' ? '超级管理员' : '普通用户'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：编辑表单 */}
          <div className="md:col-span-2">
            <ProfileForm initialProfile={profile} />
          </div>
        </div>
      </div>
    </div>
  )
}
