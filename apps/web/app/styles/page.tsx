import { type Metadata } from 'next'
import { getStyles, getCategories } from '@/actions/styles'
import { StyleGrid } from './style-grid'

export const metadata: Metadata = {
  title: '浏览风格 - StyleSnap',
  description: '探索各种网页设计风格，包括极简主义、赛博朋克、玻璃拟态等',
}

interface StylesPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    sort?: string
    search?: string
  }>
}

export default async function StylesPage({ searchParams }: StylesPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const category = params.category ?? ''
  const sort = params.sort ?? 'newest'
  const search = params.search ?? ''

  // 并行获取数据和分类
  const [stylesData, categories] = await Promise.all([
    getStyles({
      page,
      limit: 12,
      category: category || undefined,
      sortBy: sort as 'newest' | 'popular' | 'oldest',
      search: search || undefined,
    }),
    getCategories(),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold md:text-5xl">
              风格库
            </h1>
            <p className="text-muted-foreground mt-4 text-lg">
              探索 {categories.length} 种网页设计风格，获取设计灵感和代码示例
            </p>
          </div>
        </div>
      </div>

      {/* 风格列表 */}
      <StyleGrid
        initialStyles={stylesData.styles}
        totalPages={stylesData.totalPages}
        categories={categories}
      />
    </div>
  )
}
