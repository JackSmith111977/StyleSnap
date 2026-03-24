import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { initializeTheme } from '@/stores/theme-store';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'StyleSnap - 网页设计风格参考平台',
  description: '帮助前端开发者快速选择、理解和应用网页开发的视觉风格',
  keywords: ['网页设计', '视觉风格', '前端开发', '设计系统', 'UI 设计'],
  authors: [{ name: 'StyleSnap Team' }],
  creator: 'StyleSnap',
  publisher: 'StyleSnap',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 初始化主题（客户端）
  initializeTheme();

  return (
    <html lang="zh-CN" suppressHydrationWarning className={cn('font-sans', geist.variable)}>
      <body className={inter.variable}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
