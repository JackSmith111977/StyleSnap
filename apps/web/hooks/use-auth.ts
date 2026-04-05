'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, loading, setUser, setLoading, clearAuth } = useAuthStore();
  const [adminRole, setAdminRole] = useState<'user' | 'admin' | 'super_admin'>('user');

  const loadUser = useCallback(async () => {
    try {
      console.log('[useAuth] loadUser 开始执行，当前 document.cookie 长度:', document.cookie.length);
      const supabase = createClient();

      // 使用 getSession() 从 cookie 同步 session
      console.log('[useAuth] 调用 getSession() 从 cookie 读取 session');
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      console.log('[useAuth] getSession() 返回:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error,
      });

      // 同步到 Zustand store
      setUser(session?.user ?? null);
      console.log('[useAuth] setUser 完成:', { hasUser: !!session?.user });

      // 获取用户角色
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setAdminRole(profile?.role ?? 'user');
      } else {
        setAdminRole('user');
      }
    } catch (error) {
      setUser(null);
      setAdminRole('user');
      setLoading(false);
    }
  }, [setUser, setLoading]);

  useEffect(() => {
    console.log('[useAuth] useEffect 执行，开始加载用户');
    void loadUser();

    // 监听认证状态变化
    const supabase = createClient();
    console.log('[useAuth] 注册 onAuthStateChange 监听器');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[useAuth] onAuthStateChange 触发:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
      });
      void loadUser();
    });

    return () => {
      console.log('[useAuth] 清理监听器');
      subscription.unsubscribe();
    };
  }, [loadUser]);

  const signOut = useCallback(async () => {
    console.log('[useAuth] signOut 开始执行');
    const supabase = createClient();
    await supabase.auth.signOut();
    console.log('[useAuth] signOut 完成，清除本地状态');
    clearAuth();
    setAdminRole('user');
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    isAdmin: adminRole === 'admin' || adminRole === 'super_admin',
    isSuperAdmin: adminRole === 'super_admin',
    signOut,
    refreshUser,
  };
}
