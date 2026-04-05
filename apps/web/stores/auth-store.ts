/**
 * Auth Store - 认证状态管理
 * 使用 Zustand 实现全局用户状态管理，解决登录后导航栏状态不同步问题
 */

import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

/**
 * 认证 Store
 * - 不持久化（session 由 Supabase cookie 管理）
 * - 仅用于跨组件同步认证状态
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user: User | null) => {
    console.log('[AuthStore] setUser:', { hasUser: !!user, email: user?.email });
    set({ user, loading: false });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  clearAuth: () => {
    console.log('[AuthStore] clearAuth');
    set({ user: null, loading: false });
  },
}));
