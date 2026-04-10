import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const metadata: Metadata = {
  title: '管理后台 - StyleSnap',
  description: 'StyleSnap 管理后台',
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未登录 → 重定向到登录页
  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // 获取用户角色
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.warn('[admin/layout] Failed to fetch profile', { userId: user.id })
    redirect('/admin/unauthorized')
  }

  const role = profile?.role

  // 非管理员 → 重定向到未授权页面
  if (role !== 'admin' && role !== 'super_admin') {
    redirect('/unauthorized-admin')
  }

  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
}
