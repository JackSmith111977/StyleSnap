import { redirect } from 'next/navigation'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth'
import { getMyFavorites } from '@/actions/favorites'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Palette, ArrowLeft } from 'lucide-react'

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<React.JSX.Element> {
  // 要求登录
  await requireAuth()

  const resolvedSearchParams = await searchParams
  const page = parseInt(resolvedSearchParams.page ?? '1', 10)
  const limit = 12

  const result = await getMyFavorites(page, limit)

  if (!result.success || !result.data) {
    redirect('/login')
  }

  const { styles, total, totalPages } = result.data

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 页面头部 */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">我的收藏</h1>
          <p className="text-muted-foreground">
  共收藏 {total} 个风格
          </p>
        </div>
      </div>

      {/* 空状态 */}
      {styles.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              暂无收藏
            </CardTitle>
            <CardDescription>
              去风格库探索更多设计风格吧
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/styles">
              <Button>
                <Palette className="mr-2 h-4 w-4" />
                浏览风格库
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 风格列表 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {styles.map((style) => (
              <Card
                key={style.id}
                className="hypergryph-card group overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="line-clamp-1">{style.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {style.description ?? '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* 分类标签 */}
                  {style.category && (
                    <div className="mb-4">
                      <span className="bg-primary/90 text-primary-foreground rounded px-2 py-1 text-xs font-medium">
                        {style.category.name ?? style.category.name_en ?? '未分类'}
                      </span>
                    </div>
                  )}

                  {/* 标签 */}
                  {style.tags && style.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1">
                      {style.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {style.tags.length > 3 && (
                        <span className="text-muted-foreground text-xs">
                          +{style.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 元数据 */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span>{style.view_count ?? 0} 次浏览</span>
                      <span>{style.like_count ?? 0} 次点赞</span>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-4 flex gap-2">
                    <Link href={`/styles/${style.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        查看详情
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}`}>
                  <Button variant="outline" size="sm">上一页</Button>
                </Link>
              )}

              <span className="flex items-center px-4 text-sm text-muted-foreground">
                第 {page} 页，共 {totalPages} 页
              </span>

              {page < totalPages && (
                <Link href={`?page=${page + 1}`}>
                  <Button variant="outline" size="sm">下一页</Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
