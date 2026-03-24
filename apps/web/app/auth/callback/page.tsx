import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * 认证回调处理
 * 处理邮箱验证和密码重置后的重定向
 */
export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  // 处理 hash 参数（Supabase Auth 使用 hash 路由）
  const {
    type,
    token_hash,
    next,
    error,
  } = await searchParams

  if (error) {
    console.error('Auth callback error:', error)
    redirect(`/login?error=${encodeURIComponent('认证失败，请重试')}`)
  }

  // 处理邮箱验证
  if (type === 'email' && token_hash) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: token_hash as string,
    })

    if (verifyError) {
      redirect(`/login?error=${encodeURIComponent('验证失败，链接可能已过期')}`)
    }

    // 验证成功，重定向到首页
    redirect('/?success=' + encodeURIComponent('邮箱验证成功，请登录'))
  }

  // 处理密码重置
  if (type === 'recovery' && token_hash) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: token_hash as string,
    })

    if (verifyError) {
      redirect(`/reset-password?error=${encodeURIComponent('重置链接已过期')}`)
    }

    // 验证成功，重定向到密码重置页面
    redirect('/update-password')
  }

  // 默认重定向
  redirect(next as string || '/')
}
