'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 只在非游客模式下检查登录状态
    if (!loading && !user && !isGuest) {
      setShowLoginDialog(true);
    }
  }, [loading, user, isGuest]);

  const handleLogin = () => {
    router.push('/login?redirect=/workspace');
  };

  const handleRegister = () => {
    router.push('/register?redirect=/workspace');
  };

  const handleMaybeLater = () => {
    setIsGuest(true);
    setShowLoginDialog(false);
  };

  // 加载中显示骨架屏
  if (loading && !isGuest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-muted rounded mx-auto"></div>
            <div className="h-3 w-48 bg-muted rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // 未登录且非游客模式，显示登录提示对话框
  if (!user && !isGuest) {
    return (
      <>
        <main className="min-h-screen bg-background opacity-50 pointer-events-none">
          {children}
        </main>
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>欢迎来到工作台</DialogTitle>
              <DialogDescription>
                工作台是 StyleSnap 的创作空间，您可以在这里创建和编辑设计风格。
                请先登录或注册账号以继续使用。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleMaybeLater}
                className="sm:flex-1"
              >
                稍后再说
              </Button>
              <Button
                variant="secondary"
                onClick={handleRegister}
                className="sm:flex-1"
              >
                注册
              </Button>
              <Button onClick={handleLogin} className="sm:flex-1">
                登录
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 已登录或游客模式，直接渲染内容
  return <main className="min-h-screen bg-background">{children}</main>;
}
