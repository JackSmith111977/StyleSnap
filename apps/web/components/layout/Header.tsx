'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

/**
 * Header - 头部导航组件
 * 鹰角机能风设计：斜切角、科技感、深色半透明
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative flex items-center">
            {/* 鹰角风格 Logo - 斜切角设计 */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                StyleSnap
              </span>
            </div>
            {/* 装饰性斜角 */}
            <div className="ml-2 h-4 w-1 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
          </div>
        </Link>

        {/* 导航链接 */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/styles"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            风格库
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            分类
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            关于
          </Link>
        </nav>

        {/* 右侧操作区 */}
        <div className="flex items-center gap-2">
          {/* 主题切换 */}
          <ThemeToggle />

          {/* 登录/注册按钮 - 鹰角风格 */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">登录</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="hypergryph-btn">注册</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
