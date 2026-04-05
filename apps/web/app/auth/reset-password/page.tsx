'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * 密码重置回调处理
 * 处理来自 Supabase 密码重置邮件的重定向
 *
 * Supabase PKCE flow 使用 code 参数
 */
function ResetPasswordCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      // Supabase PKCE flow 使用 code 参数
      const code = searchParams.get('code')

      if (!code) {
        console.error('[密码重置回调] 参数缺失:', { code })
        router.push(`/reset-password?error=${encodeURIComponent('重置链接无效')}`)
        return
      }

      try {
        // 调用 Server Action 验证 code
        const { verifyRecoveryToken } = await import('@/actions/auth')
        const result = await verifyRecoveryToken(code)

        if (result.error) {
          console.error('[密码重置回调] 验证失败:', result.error)
          router.push(`/reset-password?error=${encodeURIComponent('重置链接已过期')}`)
        } else if (result.success) {
          router.push('/update-password')
        }
      } catch (error) {
        console.error('[密码重置回调] 验证异常:', error)
        router.push(`/reset-password?error=${encodeURIComponent('重置链接无效')}`)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-4">正在验证重置链接...</h1>
        <p className="text-gray-600">请稍候</p>
      </div>
    </div>
  )
}

/**
 * 主组件 - 使用 Suspense 边界包裹
 */
export default function AuthResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-4">加载中...</h1>
          <p className="text-gray-600">请稍候</p>
        </div>
      </div>
    }>
      <ResetPasswordCallbackContent />
    </Suspense>
  )
}
