import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getFavorites, getUserCollectionsSimple, removeStyleFromCollection } from '@/actions/favorites'
import { FavoritesSidebar } from '@/components/favorites/favorites-sidebar'
import { FavoritesGrid } from '@/components/favorites/favorites-grid'
import { ClientFavoritesPage } from './client-page'

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; collectionId?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page ?? '1', 10)
  const collectionId = resolvedSearchParams.collectionId ?? null
  const limit = 12

  // 并行加载收藏列表和合集列表
  const [favoritesResult, collectionsResult] = await Promise.all([
    getFavorites(collectionId, page, limit),
    getUserCollectionsSimple(),
  ])

  if (!favoritesResult.success) {
    redirect('/login')
  }

  const favoritesData = favoritesResult.data
  const collections = collectionsResult.success ? collectionsResult.data ?? [] : []

  // 计算未分类数量（需要获取所有收藏然后过滤）
  const allFavoritesResult = await getFavorites(null, 1, 100)
  const allFavorites = allFavoritesResult.data?.styles ?? []

  const uncategorizedCount = allFavorites.filter(
    (style) => !style.collections || style.collections.length === 0
  ).length

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
        <div className="flex gap-6">
          {/* 侧边栏 */}
          <FavoritesSidebar
            collections={collections}
            totalUncategorized={uncategorizedCount}
          />

          {/* 主内容区 */}
          <div className="flex-1">
            <ClientFavoritesPage
              styles={favoritesData?.styles ?? []}
              total={favoritesData?.total ?? 0}
              page={page}
              totalPages={favoritesData?.totalPages ?? 0}
              collectionId={collectionId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
