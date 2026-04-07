'use client'

import { useState, useTransition, useRef, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { LayoutGrid, List, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StyleCard } from '@/components/style-card'
import { EmptyState } from '@/components/empty-state'
import { SearchBox } from '@/components/search-box'
import type { Style } from '@/actions/styles'

interface StyleGridProps {
  initialStyles: Style[]
  totalPages: number
  categories: Array<{ id: string; name: string; name_en: string }>
  initialFilters?: {
    colors?: string[]
    industries?: string[]
    complexities?: string[]
  }
}

export function StyleGrid({ initialStyles, totalPages, categories, initialFilters }: StyleGridProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [_isPending, startTransition] = useTransition()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [styles, setStyles] = useState<Style[]>(initialStyles)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(page < totalPages)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 高级筛选状态
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedColors, setSelectedColors] = useState<string[]>(initialFilters?.colors ?? [])
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(initialFilters?.industries ?? [])
  const [selectedComplexities, setSelectedComplexities] = useState<string[]>(initialFilters?.complexities ?? [])

  const currentCategory = searchParams.get('category') ?? ''
  const currentSearch = searchParams.get('search') ?? ''
  const sortBy = searchParams.get('sort') ?? 'newest'
  const currentColors = useMemo(() => searchParams.get('colors')?.split(',').filter(Boolean) ?? [], [searchParams])
  const currentIndustries = useMemo(() => searchParams.get('industries')?.split(',').filter(Boolean) ?? [], [searchParams])
  const currentComplexities = useMemo(() => searchParams.get('complexities')?.split(',').filter(Boolean) ?? [], [searchParams])

  // 当筛选条件变化时，重置状态
  useEffect(() => {
    setStyles(initialStyles)
    setPage(1)
    setHasMore(1 < totalPages)
  }, [currentCategory, currentSearch, sortBy, currentColors, currentIndustries, currentComplexities, initialStyles, totalPages])

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

  // 高级筛选处理函数
  const handleColorToggle = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    )
  }

  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry) ? prev.filter(i => i !== industry) : [...prev, industry]
    )
  }

  const handleComplexityToggle = (complexity: string) => {
    setSelectedComplexities(prev =>
      prev.includes(complexity) ? prev.filter(c => c !== complexity) : [...prev, complexity]
    )
  }

  const handleApplyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())

      // 设置或删除颜色参数
      if (selectedColors.length > 0) {
        params.set('colors', selectedColors.join(','))
      } else {
        params.delete('colors')
      }

      // 设置或删除行业参数
      if (selectedIndustries.length > 0) {
        params.set('industries', selectedIndustries.join(','))
      } else {
        params.delete('industries')
      }

      // 设置或删除复杂度参数
      if (selectedComplexities.length > 0) {
        params.set('complexities', selectedComplexities.join(','))
      } else {
        params.delete('complexities')
      }

      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
      setShowAdvancedFilters(false)
    })
  }

  const handleClearFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('colors')
      params.delete('industries')
      params.delete('complexities')
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const handleRemoveFilterTag = (type: 'colors' | 'industries' | 'complexities', value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get(type)
      if (current) {
        const values = current.split(',').filter(v => v !== value)
        if (values.length > 0) {
          params.set(type, values.join(','))
        } else {
          params.delete(type)
        }
      }
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
      <div className="sticky top-0 z-[var(--z-sticky)] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

              {/* 右侧：排序 + 视图切换 + 高级筛选 */}
              <div className="flex items-center gap-2">
                {/* 高级筛选按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="relative"
                >
                  高级筛选
                  {(currentColors.length > 0 || currentIndustries.length > 0 || currentComplexities.length > 0) && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>

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

          {/* 高级筛选面板 */}
          {showAdvancedFilters && (
            <div className="border-t pt-4">
              <div className="flex flex-col gap-6">
                {/* 颜色选择器 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">颜色</h4>
                  <div className="flex flex-wrap gap-2">
                    {['#dark', '#light', '#colorful', '#monochrome', '#gradient', '#neon'].map((color) => {
                      const colorName = color.replace('#', '')
                      const isSelected = selectedColors.includes(colorName)
                      return (
                        <Button
                          key={color}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleColorToggle(colorName)}
                          className="capitalize"
                        >
                          {colorName}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 行业标签 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">行业</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'saas', name: 'SaaS' },
                      { id: 'ecommerce', name: '电商' },
                      { id: 'portfolio', name: '作品集' },
                      { id: 'blog', name: '博客' },
                      { id: 'enterprise', name: '企业' },
                      { id: 'web3', name: 'Web3' },
                      { id: 'developer-tools', name: '开发者工具' },
                    ].map((industry) => {
                      const isSelected = selectedIndustries.includes(industry.id)
                      return (
                        <Button
                          key={industry.id}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleIndustryToggle(industry.id)}
                        >
                          {industry.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 复杂度选择器 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">复杂度</h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'simple', name: '简单' },
                      { id: 'moderate', name: '中等' },
                      { id: 'complex', name: '复杂' },
                    ].map((complexity) => {
                      const isSelected = selectedComplexities.includes(complexity.id)
                      return (
                        <Button
                          key={complexity.id}
                          variant={isSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleComplexityToggle(complexity.id)}
                        >
                          {complexity.name}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button onClick={handleApplyFilters}>
                    应用筛选
                  </Button>
                  <Button variant="outline" onClick={handleClearFilters}>
                    清除筛选
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 筛选条件标签 */}
          {(currentColors.length > 0 || currentIndustries.length > 0 || currentComplexities.length > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">筛选条件：</span>
              {currentColors.map((color) => (
                <Button
                  key={`color-${color}`}
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => handleRemoveFilterTag('colors', color)}
                >
                  颜色：{color}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
              {currentIndustries.map((industry) => (
                <Button
                  key={`industry-${industry}`}
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => handleRemoveFilterTag('industries', industry)}
                >
                  行业：{industry === 'developer-tools' ? '开发者工具' : industry}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
              {currentComplexities.map((complexity) => (
                <Button
                  key={`complexity-${complexity}`}
                  variant="secondary"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => handleRemoveFilterTag('complexities', complexity)}
                >
                  复杂度：{complexity === 'simple' ? '简单' : complexity === 'moderate' ? '中等' : '复杂'}
                  <X className="ml-1 h-3 w-3" />
                </Button>
              ))}
            </div>
          )}
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
