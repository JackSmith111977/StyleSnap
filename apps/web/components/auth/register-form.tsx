'use client'

import { useState } from 'react'
import Link from 'next/link'
import { register } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'

export function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setFieldErrors({})

    // 验证是否同意条款
    if (!agreeToTerms) {
      setError('请先同意服务条款和隐私政策')
      return
    }

    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const username = formData.get('username') as string

    // 验证
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('密码长度至少 8 位')
      setLoading(false)
      return
    }

    try {
      const result = await register(email, password, username)
      if (result.error) {
        setError(result.error)
        // 设置字段级错误
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
      } else if (result.success) {
        setSuccess(true)
      }
    } catch {
      setError('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>注册成功</CardTitle>
          <CardDescription>
            我们已发送验证邮件到你的邮箱，请点击邮件中的链接验证账户
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            验证完成后，你可以{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              登录
            </Link>
          </p>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>注册</CardTitle>
        <CardDescription>创建账户以收藏、评论和提交风格</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="username"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors?.email && (
              <p className="text-sm text-red-500">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(Boolean(checked))}
              disabled={loading}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="agreeToTerms"
                className="text-sm font-normal cursor-pointer"
              >
                我已阅读并同意{' '}
                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  服务条款
                </Link>
                {' '}和{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                  隐私政策
                </Link>
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </Button>
          <p className="text-sm text-muted-foreground">
            已有账户？{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              立即登录
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
