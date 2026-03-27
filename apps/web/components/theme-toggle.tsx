'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore, initializeTheme } from '@/stores/theme-store';

/**
 * 主题切换按钮
 * 支持深色/浅色模式切换
 */
export function ThemeToggle() {
  const { theme, toggleTheme, initialized } = useThemeStore();

  // 初始化主题
  useEffect(() => {
    initializeTheme();
  }, []);

  if (!initialized) {
    return (
      <Button variant="ghost" size="icon" aria-label="切换主题" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      className="relative overflow-hidden"
    >
      {/* 太阳图标 - 浅色模式显示 */}
      <Sun
        className={`h-5 w-5 transition-transform duration-300 ${
          theme === 'dark' ? 'rotate-90 scale-0 absolute' : 'rotate-0 scale-100 relative'
        }`}
      />
      {/* 月亮图标 - 深色模式显示 */}
      <Moon
        className={`h-5 w-5 transition-transform duration-300 ${
          theme === 'light' ? '-rotate-90 scale-0 absolute' : 'rotate-0 scale-100 relative'
        }`}
      />
    </Button>
  );
}
