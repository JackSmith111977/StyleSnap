import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '分类 - StyleSnap',
  description: '浏览所有风格分类',
};

// 分类数据
const categories = [
  { name: '极简主义', slug: '极简主义', description: '简约而不简单，强调功能性和清晰度' },
  { name: '科技未来', slug: '科技未来', description: '充满未来感和科技感的设计' },
  { name: '玻璃拟态', slug: '玻璃拟态', description: '半透明背景和毛玻璃效果' },
  { name: '粗野主义', slug: '粗野主义', description: '大胆、原始、反传统的视觉表达' },
  { name: '企业专业', slug: '企业专业', description: '稳重、专业、可信赖的企业风格' },
  { name: '深色优先', slug: '深色优先', description: '为深色模式优化的设计' },
  { name: '活泼多彩', slug: '活泼多彩', description: '鲜艳配色和活泼元素' },
  { name: '杂志编辑', slug: '杂志编辑', description: '精致的排版和图文混排' },
  { name: '复古网络', slug: '复古网络', description: '致敬早期互联网风格' },
  { name: '排版驱动', slug: '排版驱动', description: '以字体和文字为主要视觉元素' },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">风格分类</h1>
          <p className="text-lg text-muted-foreground">
            探索 10 种网页设计风格，获取设计灵感和代码示例
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/styles?category=${encodeURIComponent(category.name)}`}
              className="group p-6 rounded-lg border border-border hover:border-primary transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {category.name}
              </h3>
              <p className="text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>

        <div className="pt-8">
          <Link href="/styles">
            <Button>浏览全部风格</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
