import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '隐私政策 - StyleSnap',
  description: 'StyleSnap 隐私政策',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">隐私政策</h1>
          <p className="text-muted-foreground">最后更新：2026-03-27</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. 收集的信息</h2>
            <p className="text-muted-foreground">
              我们收集以下类型的信息：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>账户信息：邮箱地址、用户名、密码</li>
              <li>使用数据：浏览记录、收藏记录</li>
              <li>设备信息：浏览器类型、IP 地址</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. 信息使用</h2>
            <p className="text-muted-foreground">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>提供和维护服务</li>
              <li>改进用户体验</li>
              <li>发送服务相关通知</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. 数据安全</h2>
            <p className="text-muted-foreground">
              我们采取适当的安全措施保护您的数据，包括：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>数据加密传输（HTTPS）</li>
              <li>密码加密存储</li>
              <li>定期安全审计</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. 联系我们</h2>
            <p className="text-muted-foreground">
              如有任何问题，请联系：privacy@stylesnap.com
            </p>
          </section>
        </div>

        <div className="pt-8">
          <Link href="/">
            <Button variant="outline">返回首页</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
