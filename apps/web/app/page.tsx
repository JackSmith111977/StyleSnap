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
          <div className="flex flex-col items-center text-center space-y-8">
            {/* 主标题 - 鹰角风格 */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  StyleSnap
                </span>
              </h1>
              <div className="h-1 w-24 mx-auto bg-primary" style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%)' }} />
            </div>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
              网页设计风格参考平台
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              帮助前端开发者快速选择、理解和应用视觉风格
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/styles">
                <Button size="lg" className="hypergryph-btn text-base px-8">
                  浏览风格库
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="text-base px-8">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 特性 1: 风格分类 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>丰富风格分类</CardTitle>
                <CardDescription>
                  涵盖 10+ 种主流网页设计风格，从极简主义到赛博朋克
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  每种风格都包含详细的设计变量解析，包括色板、字体、间距等
                </p>
              </CardContent>
            </Card>

            {/* 特性 2: 代码示例 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>即拿即用代码</CardTitle>
                <CardDescription>
                  一键复制 HTML/CSS/React 代码片段
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  所有代码都经过优化，可直接用于生产环境
                </p>
              </CardContent>
            </Card>

            {/* 特性 3: 快速搜索 */}
            <Card className="hypergryph-card bg-card/50 backdrop-blur">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-success" />
                </div>
                <CardTitle>智能搜索筛选</CardTitle>
                <CardDescription>
                  通过颜色、标签、行业快速定位目标风格
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  支持多条件组合筛选，精准匹配设计需求
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 风格预览区 */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">热门风格</h2>
            <p className="text-muted-foreground">探索最受欢迎的设计风格</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {['极简主义', '赛博朋克', '新拟态', '玻璃拟物'].map((style) => (
              <Link key={style} href={`/styles?category=${style}`} className="group">
                <Card className="hypergryph-card h-48 overflow-hidden transition-all duration-300 group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20">
                  <CardContent className="p-0 h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <span className="text-lg font-medium">{style}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
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
