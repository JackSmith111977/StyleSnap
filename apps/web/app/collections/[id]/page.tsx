import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getCollectionDetail } from '@/actions/collections'
import { CollectionDetailComponent } from '@/components/collection'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { type Metadata } from 'next'

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getCollectionDetail(id)

  if (result.success && result.data) {
    return {
      title: `${result.data.name} - StyleSnap`,
      description: result.data.description ?? undefined,
    }
  }

  return {
    title: '合集详情 - StyleSnap',
  }
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  // 获取合集详情
  const result = await getCollectionDetail(id)

  if (!result.success) {
    if (result.error === '无权访问此合集' || result.error === '合集不存在') {
      notFound()
    }
    return <div>加载失败</div>
  }

  const collection = result.data
  if (!collection) {
    notFound()
  }
  const isOwner = user?.id === collection.user_id

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/collections">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </Link>
            {!isOwner && (
              <Link href={`/profile/${collection.user_id}`}>
                <Button variant="ghost" size="sm">
                  查看作者
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <CollectionDetailComponent
          collection={collection}
          isOwner={isOwner}
        />
      </div>
    </div>
  )
}
