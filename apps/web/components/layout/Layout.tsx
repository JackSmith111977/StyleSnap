import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout - 主布局组件
 * 包含 Header、内容区和 Footer
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* 顶部导航 */}
      <Header />

      {/* 主内容区 */}
      <main className="flex-1">{children}</main>

      {/* 页脚 */}
      <Footer />
    </div>
  );
}
