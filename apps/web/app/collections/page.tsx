import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getMyCollections } from '@/actions/collections'
import { CollectionList } from '@/components/collection'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的合集 - StyleSnap',
}

export default async function CollectionsPage() {
  const user = await requireAuth()

  // 获取用户的合集列表
  const result = await getMyCollections(1, 50)

  if (!result.success) {
    if (result.error === '请先登录') {
      redirect('/login')
    }
  }

  const collections = result.data?.collections ?? []

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              首页
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">我的合集</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* 页面头部 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">我的合集</h1>
            <p className="text-muted-foreground mt-1">
              管理和组织你喜欢的风格案例
            </p>
          </div>

          <Button asChild>
            <Link href="/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              创建合集
            </Link>
          </Button>
        </div>

        {/* 合集列表 */}
        <CollectionList collections={collections} />
      </div>
    </div>
  )
}
