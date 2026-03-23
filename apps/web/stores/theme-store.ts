/**
 * Theme Store - 主题状态管理
 * 使用 Zustand 实现深色/浅色模式切换
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/**
 * 主题 Store
 * - 持久化到 localStorage
 * - 自动同步到 data-theme 属性
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',

      setTheme: (theme: Theme) => {
        // 更新 DOM 属性
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
        set({ theme });
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
      // 仅在客户端初始化
      skipHydration: true,
    }
  )
);

/**
 * 初始化主题 - 在应用启动时调用
 * 从 localStorage 读取主题并应用到 DOM
 */
export function initializeTheme() {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('theme-storage');
  if (stored) {
    try {
      const { state } = JSON.parse(stored) as { state: { theme: Theme } };
      document.documentElement.setAttribute('data-theme', state.theme);
    } catch {
      // 解析失败，使用默认主题
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } else {
    // 检查系统偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = prefersDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', initialTheme);
  }
}
