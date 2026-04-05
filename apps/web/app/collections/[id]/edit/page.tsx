import { notFound, redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getCollectionDetail } from '@/actions/collections'
import { CollectionForm } from '@/components/collection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { type Metadata } from 'next'

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCollectionPageProps): Promise<Metadata> {
  await params
  return {
    title: `编辑合集 - StyleSnap`,
  }
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params
  await requireAuth()

  // 获取合集详情
  const result = await getCollectionDetail(id)

  if (!result.success) {
    if (result.error === '无权访问此合集' || result.error === '合集不存在') {
      notFound()
    }
    redirect('/collections')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <Link href={`/collections/${id}`}>
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
          <h1 className="text-3xl font-bold">编辑合集</h1>
          <p className="text-muted-foreground mt-1">
            修改合集信息和设置
          </p>
        </div>

        {/* 最大宽度容器 */}
        <div className="max-w-2xl">
          <CollectionForm collection={result.data} />
        </div>
      </div>
    </div>
  )
}
