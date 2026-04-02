'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StyleCard } from '@/components/style-card'
import { EmptyState } from '@/components/empty-state'
import { SearchBox } from '@/components/search-box'
import type { Style } from '@/actions/styles'

interface StyleGridProps {
  initialStyles: Style[]
  totalPages: number
  categories: Array<{ id: string; name: string; name_en: string }>
}

export function StyleGrid({ initialStyles, totalPages, categories }: StyleGridProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [styles, setStyles] = useState<Style[]>(initialStyles)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(page < totalPages)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const currentCategory = searchParams.get('category') ?? ''
  const currentSearch = searchParams.get('search') ?? ''
  const sortBy = searchParams.get('sort') ?? 'newest'

  // 当筛选条件变化时，重置状态
  useEffect(() => {
    setStyles(initialStyles)
    setPage(1)
    setHasMore(1 < totalPages)
  }, [currentCategory, currentSearch, sortBy, initialStyles, totalPages])

  const handleCategoryChange = (categoryId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (categoryId) {
        params.set('category', categoryId)
      } else {
        params.delete('category')
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleSortChange = (sort: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', sort)
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // 无限滚动加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first && first.isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' }
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [hasMore, isLoadingMore, currentCategory, currentSearch, sortBy, page])

  const loadMore = () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1

    const params = new URLSearchParams({
      page: String(nextPage),
      ...(currentCategory && { category: currentCategory }),
      ...(currentSearch && { search: currentSearch }),
      sort: sortBy,
    })

    router.push(`${pathname}?${params.toString()}`)
    setPage(nextPage)
  }

  // 当页面数据变化时追加新数据
  useEffect(() => {
    if (page > 1) {
      // 这里需要从服务器获取新数据并追加
      // 由于 Next.js Server Component 的限制，我们需要使用 TanStack Query 或类似方案
      // 简化方案：当页面变化时，让路由器处理，用户看到新页面
      setIsLoadingMore(false)
    }
  }, [page])

  return (
    <div className="min-h-screen">
      {/* 工具栏：分类筛选、视图切换、排序、搜索 */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {/* 第一行：搜索框 */}
            <div className="flex items-center">
              <SearchBox />
            </div>

            {/* 第二行：分类筛选 + 排序/视图切换 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!currentCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleCategoryChange('')}
                >
                  全部
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={currentCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* 右侧：排序 + 视图切换 */}
              <div className="flex items-center gap-2">
                {/* 排序下拉 */}
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="border-muted-foreground/20 bg-background text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-md border px-3 py-1.5"
                >
                  <option value="newest">最新发布</option>
                  <option value="popular">最受欢迎</option>
                  <option value="oldest">最早发布</option>
                </select>

                {/* 视图切换 */}
                <div className="border-muted-foreground/20 flex rounded-md border">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none rounded-l-md"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="rounded-none rounded-r-md"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="container mx-auto px-4 py-8">
        {styles.length === 0 && !isLoadingMore ? (
          <EmptyState
            title="暂无风格案例"
            description={
              currentSearch
                ? `没有找到与"${currentSearch}"相关的风格`
                : currentCategory
                  ? '该分类下暂无内容'
                  : '还没有添加任何风格案例'
            }
          />
        ) : (
          <>
            {/* 风格列表/网格 */}
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-4'
              }
            >
              {styles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* 加载更多指示器 */}
            {isLoadingMore && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>加载中...</span>
                </div>
              </div>
            )}

            {/* 加载触发器 */}
            {hasMore && <div ref={loadMoreRef} className="h-1" />}

            {/* 无更多数据提示 */}
            {!hasMore && styles.length > 0 && (
              <div className="mt-12 text-center text-sm text-muted-foreground">
                已加载全部风格
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
