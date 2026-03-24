'use client'

import { useState } from 'react'
import { resetPassword } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    try {
      const result = await resetPassword(email)
      if (result.error) {
        setError(result.error)
      } else if (result.success) {
        setSuccess(true)
      }
    } catch {
      setError('发送失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>邮件已发送</CardTitle>
          <CardDescription>
            如果该邮箱已注册，你会收到一封包含重置密码链接的邮件
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="text-blue-600 hover:underline text-sm">
            返回登录
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>重置密码</CardTitle>
        <CardDescription>输入你的邮箱地址，我们将发送密码重置链接</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '发送中...' : '发送重置链接'}
          </Button>
          <Link href="/login" className="text-blue-600 hover:underline text-sm">
            返回登录
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
