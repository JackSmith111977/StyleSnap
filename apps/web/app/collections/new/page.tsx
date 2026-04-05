import { requireAuth } from '@/lib/auth'
import { CollectionForm } from '@/components/collection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { type Metadata } from 'next'

export const metadata: Metadata = {
  title: '创建合集 - StyleSnap',
}

export default async function NewCollectionPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link href="/collections">
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
          <h1 className="text-3xl font-bold">创建合集</h1>
          <p className="text-muted-foreground mt-1">
            创建一个新的风格合集来组织你喜欢的案例
          </p>
        </div>

        {/* 最大宽度容器 */}
        <div className="max-w-2xl">
          <CollectionForm />
        </div>
      </div>
    </div>
  )
}
