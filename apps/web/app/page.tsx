import Link from 'next/link';
import { ArrowRight, Palette, Code, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="relative">
      {/* 网格背景装饰 */}
      <div className="grid-bg absolute inset-0 opacity-50" />

      {/* 英雄区域 */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-8 text-center">
            {/* 主标题 - 鹰角风格 */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                <span className="from-primary via-primary/80 to-accent bg-gradient-to-r bg-clip-text text-transparent">
                  StyleSnap
                </span>
              </h1>
              <div
                className="bg-primary mx-auto h-1 w-24"
                style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }}
              />
            </div>

            {/* 副标题 */}
            <p className="text-muted-foreground max-w-3xl text-xl md:text-2xl">
              网页设计风格参考平台
            </p>
            <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
              帮助前端开发者快速选择、理解和应用视觉风格
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <Link href="/styles">
                <Button size="lg" className="hypergryph-btn px-8 text-base">
                  浏览风格库
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  了解更多
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 特性卡片 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* 特性 1: 风格分类 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Palette className="text-primary h-6 w-6" />
                </div>
                <CardTitle>丰富风格分类</CardTitle>
                <CardDescription>涵盖 10+ 种主流网页设计风格，从极简主义到赛博朋克</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  每种风格都包含详细的设计变量解析，包括色板、字体、间距等
                </p>
              </CardContent>
            </Card>

            {/* 特性 2: 代码示例 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="bg-accent/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Code className="text-accent h-6 w-6" />
                </div>
                <CardTitle>即拿即用代码</CardTitle>
                <CardDescription>一键复制 HTML/CSS/React 代码片段</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  所有代码都经过优化，可直接用于生产环境
                </p>
              </CardContent>
            </Card>

            {/* 特性 3: 快速搜索 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="bg-success/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Zap className="text-success h-6 w-6" />
                </div>
                <CardTitle>智能搜索筛选</CardTitle>
                <CardDescription>通过颜色、标签、行业快速定位目标风格</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  支持多条件组合筛选，精准匹配设计需求
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 风格预览区 */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">热门风格</h2>
            <p className="text-muted-foreground">探索最受欢迎的设计风格</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['极简主义', '赛博朋克', '新拟态', '玻璃拟物'].map((style) => (
              <Link key={style} href={`/styles?category=${style}`} className="group">
                <Card className="hypergryph-card group-hover:border-primary group-hover:shadow-primary/20 h-48 overflow-hidden transition-all duration-300 group-hover:shadow-lg">
                  <CardContent className="from-primary/10 to-accent/10 flex h-full items-center justify-center bg-gradient-to-br p-0">
                    <span className="text-lg font-medium">{style}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/styles">
              <Button variant="ghost">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
