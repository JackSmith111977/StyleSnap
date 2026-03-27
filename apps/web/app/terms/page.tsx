import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '服务条款 - StyleSnap',
  description: 'StyleSnap 服务条款',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-4">服务条款</h1>
          <p className="text-muted-foreground">最后更新：2026-03-27</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">1. 服务说明</h2>
            <p className="text-muted-foreground">
              StyleSnap 是一个网页设计风格参考平台，提供设计风格展示、代码示例和用户收藏等功能。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">2. 用户责任</h2>
            <p className="text-muted-foreground">
              用户在使用本服务时应遵守以下规定：
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>提供真实、准确的注册信息</li>
              <li>妥善保管账户密码</li>
              <li>不利用本服务进行违法活动</li>
              <li>不侵犯他人知识产权</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">3. 知识产权</h2>
            <p className="text-muted-foreground">
              本站内容（包括但不限于代码示例、设计说明）归 StyleSnap 所有，未经许可不得用于商业用途。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">4. 免责声明</h2>
            <p className="text-muted-foreground">
              本站提供的代码示例仅供参考，用户应自行评估其适用性。对于因使用本站内容导致的任何损失，本站不承担责任。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">5. 条款修改</h2>
            <p className="text-muted-foreground">
              我们保留随时修改本条款的权利，修改后的条款将在网站上公布。
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
