import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function StyleDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* 标题区骨架屏 */}
        <div className="mb-8">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-4" />
          <Skeleton className="h-6 w-1/2 mb-4" />

          {/* 元数据骨架屏 */}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>

        {/* 设计变量展示骨架屏 */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />

          {/* 配色方案骨架屏 */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-16 w-full rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 字体设置骨架屏 */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 代码示例骨架屏 */}
        <div className="mt-8 space-y-6">
          <Skeleton className="h-8 w-32" />

          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 评论区骨架屏 */}
        <div className="mt-12">
          <Skeleton className="h-8 w-24 mb-6" />
          <Skeleton className="h-32 w-full mb-6" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full mb-4" />
          ))}
        </div>
      </div>
    </div>
  )
}
