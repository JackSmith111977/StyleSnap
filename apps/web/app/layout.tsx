import type { Metadata, Viewport } from 'next';
import { Inter, Geist } from 'next/font/google';
import '@/styles/globals.css';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/error-boundary';
import { initializeTheme } from '@/stores/theme-store';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'StyleSnap - 网页设计风格参考平台',
    template: '%s',
  },
  description: '帮助前端开发者快速选择、理解和应用网页开发的视觉风格',
  keywords: ['网页设计', '视觉风格', '前端开发', '设计系统', 'UI 设计', 'CSS', 'React', 'Tailwind'],
  authors: [{ name: 'StyleSnap Team' }],
  creator: 'StyleSnap',
  publisher: 'StyleSnap',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://stylesnap.com'),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'StyleSnap',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stylesnap',
    creator: '@stylesnap',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
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
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold text-red-600 mb-2">出错了</h1>
              <p className="text-gray-600">请刷新页面重试</p>
            </div>
          </div>
        }>
          <Layout>{children}</Layout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
