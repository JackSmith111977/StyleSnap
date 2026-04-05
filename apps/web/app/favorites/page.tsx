import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFavorites, getUserCollectionsSimple, getUncategorizedFavoritesCount } from '@/actions/favorites'
import { ClientFavoritesPage } from './client-page'

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; collectionId?: string }>
}) {
  const user = await getCurrentUser()

  console.log('[FavoritesPage] Current user:', user?.id ?? 'null')

  if (!user) {
    console.log('[FavoritesPage] No user found, redirecting to login')
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page ?? '1', 10)
  const collectionId = resolvedSearchParams.collectionId ?? null

  console.log('[FavoritesPage] Search params:', {
    page,
    collectionId,
    collectionIdType: typeof collectionId,
    rawCollectionId: resolvedSearchParams.collectionId
  })

  const limit = 12

  // 并行加载收藏列表、合集列表和未分类数量
  console.log('[FavoritesPage] Calling getFavorites with collectionId:', collectionId)
  const [favoritesResult, collectionsResult, uncategorizedResult] = await Promise.all([
    getFavorites(collectionId, page, limit),
    getUserCollectionsSimple(),
    getUncategorizedFavoritesCount(),
  ])

  console.log('[FavoritesPage] getFavorites result:', {
    success: favoritesResult.success,
    error: favoritesResult.error,
    dataCount: favoritesResult.data?.styles?.length
  })

  if (!favoritesResult.success) {
    console.log('[FavoritesPage] getFavorites failed, redirecting to login:', favoritesResult.error)
    redirect('/login')
  }

  const favoritesData = favoritesResult.data
  const collections = collectionsResult.success ? collectionsResult.data ?? [] : []
  const uncategorizedCount = uncategorizedResult.success ? uncategorizedResult.data?.count ?? 0 : 0

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部标题栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">收藏管理</h1>
          <p className="text-muted-foreground mt-1">
            {collectionId === 'uncategorized'
              ? `未分类收藏 (${uncategorizedCount} 个)`
              : collectionId
              ? `合集收藏`
              : `全部收藏 (${favoritesData?.total ?? 0} 个)`}
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {/* 主内容区 */}
        <ClientFavoritesPage
          styles={favoritesData?.styles ?? []}
          total={favoritesData?.total ?? 0}
          page={page}
          totalPages={favoritesData?.totalPages ?? 0}
          collectionId={collectionId}
          collections={collections}
          totalUncategorized={uncategorizedCount}
        />
      </div>
    </div>
  )
}
