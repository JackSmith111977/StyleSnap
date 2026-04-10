'use server'

import { createClient } from '@/lib/supabase/server'

export interface AdminRoleCheckResult {
  isAdmin: boolean
  role: 'admin' | 'super_admin' | 'user' | null
  userId: string | null
}

/**
 * 验证当前用户是否为管理员（admin 或 super_admin）
 * 用于 Server Action 中的权限校验
 */
export async function checkAdminRole(): Promise<AdminRoleCheckResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { isAdmin: false, role: null, userId: null }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as 'admin' | 'super_admin' | 'user' | null

  if (!role || (role !== 'admin' && role !== 'super_admin')) {
    return { isAdmin: false, role: role ?? null, userId: user.id }
  }

  return { isAdmin: true, role, userId: user.id }
}

/**
 * 验证管理员权限，如果不是则抛出错误
 * 用于 Server Action 中需要阻断非管理员访问的场景
 */
export async function requireAdmin(): Promise<{
  role: 'admin' | 'super_admin'
  userId: string
}> {
  const result = await checkAdminRole()

  if (!result.isAdmin || !result.userId) {
    throw new Error('PERMISSION_DENIED: 需要管理员权限')
  }

  return {
    role: result.role as 'admin' | 'super_admin',
    userId: result.userId,
  }
}
