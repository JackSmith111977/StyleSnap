import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

/**
 * Footer - 页脚组件
 * 鹰角机能风设计：几何装饰、科技感线条
 */
export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 品牌信息 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                StyleSnap
              </span>
              {/* 装饰性斜角 */}
              <div className="h-3 w-0.5 bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            </div>
            <p className="text-sm text-muted-foreground">
              帮助前端开发者快速选择、理解和应用网页开发的视觉风格
            </p>
            {/* 装饰线条 */}
            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent" />
          </div>

          {/* 快速链接 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">快速链接</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/styles" className="text-muted-foreground hover:text-foreground transition-colors">
                  风格库
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                  分类
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  关于
                </Link>
              </li>
            </ul>
          </div>

          {/* 资源链接 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">资源</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                  文档
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  博客
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">
                  更新日志
                </Link>
              </li>
            </ul>
          </div>

          {/* 社交链接 */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">关注我们</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StyleSnap. Made with <span className="inline-block text-red-500">♥</span> by StyleSnap Team
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              服务条款
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
