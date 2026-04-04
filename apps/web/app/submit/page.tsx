import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { StyleSubmissionForm } from '@/components/submit/style-submission-form'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: '提交风格 - StyleSnap',
  description: '提交你的设计风格案例到 StyleSnap，与社区分享你的设计成果',
}

export default async function SubmitPage() {
  const user = await getCurrentUser()

  // 未登录用户重定向到登录页
  if (!user) {
    redirect('/login?redirect=/submit')
  }

  // 获取分类列表
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

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
            <span className="text-foreground font-medium">提交风格</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <Link
            href="/styles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            返回风格列表
          </Link>
          <h1 className="text-3xl font-bold">提交风格</h1>
          <p className="mt-2 text-muted-foreground">
            分享你的设计风格案例到 StyleSnap，与社区一起学习和成长
          </p>
        </div>

        {/* 提交说明 */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            提交须知
          </h2>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 所有提交的风格需要经过管理员审核后才能公开显示</li>
            <li>• 请确保原创或有权分享代码内容</li>
            <li>• 预览图支持 PNG、JPG、WEBP 格式，单个文件不超过 5MB</li>
            <li>• 审核通常在 1-3 个工作日内完成</li>
            <li>• 你可以在「我的提交」页面查看审核状态</li>
          </ul>
        </div>

        {/* 提交表单 */}
        <StyleSubmissionForm
          categories={categories || []}
          onSuccess={() => {
            // 成功后的回调（可选）
          }}
        />
      </div>
    </div>
  )
}
