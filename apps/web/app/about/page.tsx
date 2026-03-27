import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '关于 - StyleSnap',
  description: '了解 StyleSnap - 网页设计风格参考平台',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">关于 StyleSnap</h1>
          <p className="text-lg text-muted-foreground">
            StyleSnap 是一个面向前端开发者的网页设计风格参考平台，帮助开发者快速选择、理解和应用网页开发的视觉风格。
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">平台特色</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>丰富的风格分类 - 涵盖 10+ 种主流网页设计风格</li>
            <li>详细的设计变量解析 - 包括色板、字体、间距、圆角、阴影等</li>
            <li>即拿即用的代码 - 所有代码都经过优化，可直接用于生产环境</li>
            <li>智能搜索筛选 - 通过颜色、标签、行业快速定位目标风格</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">技术栈</h2>
          <p className="text-muted-foreground">
            StyleSnap 使用现代化的技术栈构建：
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Next.js 16 - React 全栈框架</li>
            <li>TypeScript - 类型安全</li>
            <li>Tailwind CSS 4.x - 实用类优先的 CSS 框架</li>
            <li>Shadcn UI - 高质量 UI 组件库</li>
            <li>Supabase - 后端即服务（数据库、认证、存储）</li>
            <li>Zustand - 轻量级状态管理</li>
          </ul>
        </div>

        <div className="pt-8">
          <Link href="/styles">
            <Button>浏览风格库</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
