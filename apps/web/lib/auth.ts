import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * 获取当前认证用户（Server Component 中使用）
 * 如果未登录，返回 null
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
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
