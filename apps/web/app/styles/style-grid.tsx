'use client'

import { useState, useTransition } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StyleCard } from '@/components/style-card'
import { EmptyState } from '@/components/empty-state'
import { Pagination } from '@/components/pagination'
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

  const currentPage = Number(searchParams.get('page')) || 1
  const currentCategory = searchParams.get('category') ?? ''
  const currentSearch = searchParams.get('search') ?? ''
  const sortBy = searchParams.get('sort') ?? 'newest'

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

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page))
      router.push(`${pathname}?${params.toString()}`)
    })
  }

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
        {initialStyles.length === 0 ? (
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
              {initialStyles.map((style) => (
                <StyleCard
                  key={style.id}
                  style={style}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* 加载状态 */}
        {isPending && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    </div>
  )
}
