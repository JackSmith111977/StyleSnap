import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '未授权 - StyleSnap',
  description: '你没有权限访问此页面',
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle className="text-2xl">未授权访问</CardTitle>
          </div>
          <CardDescription>
            你没有权限访问此页面
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            如果你认为这是一个错误，请联系管理员或检查你的账户权限。
          </p>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                返回首页
              </Button>
            </Link>
            <Link href="/user/favorites" className="flex-1">
              <Button className="w-full">
                我的收藏
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
