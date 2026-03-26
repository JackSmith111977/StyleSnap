'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminRole, setAdminRole] = useState<'user' | 'admin' | 'super_admin'>('user')

  const loadUser = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)

      // 获取用户角色
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setAdminRole(profile?.role ?? 'user')
      } else {
        setAdminRole('user')
      }
    } catch (error) {
      console.error('加载用户失败:', error)
      setUser(null)
      setAdminRole('user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUser()

    // 监听认证状态变化
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void loadUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [loadUser])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setAdminRole('user')
  }, [])

  const refreshUser = useCallback(async () => {
    await loadUser()
  }, [loadUser])

  return {
    user,
    loading,
    isAdmin: adminRole === 'admin' || adminRole === 'super_admin',
    isSuperAdmin: adminRole === 'super_admin',
    signOut,
    refreshUser,
  }
}
