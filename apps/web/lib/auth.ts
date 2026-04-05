import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 获取当前认证用户（Server Component 中使用）
 * 如果未登录，返回 null
 */
export async function getCurrentUser() {
  console.log('[getCurrentUser] 开始执行')
  const supabase = await createClient()
  console.log('[getCurrentUser] Supabase 客户端已创建')

  const result = await supabase.auth.getUser()
  console.log('[getCurrentUser] getUser() 返回:', {
    hasUser: !!result.data.user,
    userId: result.data.user?.id,
    email: result.data.user?.email,
    error: result.error ? {
      message: result.error.message,
      code: result.error.code,
      status: result.error.status,
    } : null,
  })

  return result.data.user
}

/**
 * 获取当前认证用户，如果未登录则重定向到登录页
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

/**
 * 检查用户是否是管理员
 */
export async function requireAdmin() {
  const user = await requireAuth()

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * 检查用户是否是超级管理员
 */
export async function requireSuperAdmin() {
  const user = await requireAdmin()

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    redirect('/unauthorized')
  }

  return user
}
