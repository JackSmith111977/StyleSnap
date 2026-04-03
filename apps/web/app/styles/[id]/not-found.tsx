import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileQuestion, Home } from 'lucide-react'

export default function StyleNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" role="alert">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">风格不存在</CardTitle>
          <CardDescription>
            您访问的风格案例不存在或已下架
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Link href="/styles" className="w-full">
              <Button className="w-full" size="lg">
                查看风格列表
              </Button>
            </Link>
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                <Home className="mr-2 h-4 w-4" aria-hidden="true" />
                返回首页
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
