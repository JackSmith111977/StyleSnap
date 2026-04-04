'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  console.log('[UserMenu] render:', { user: user?.email, loading, hasUser: !!user })

  if (!user) {
    return (
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="ghost" size="sm">登录</Button>
        </Link>
        <Link href="/register">
          <Button size="sm">注册</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <User className="h-5 w-5" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg z-20 border">
            <div className="p-2 border-b">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
            <div className="p-2 space-y-1">
              <Link
                href="/dashboard"
                className="block px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => setOpen(false)}
              >
                仪表板
              </Link>
              <Link
                href="/"
                className="block px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => setOpen(false)}
              >
                首页
              </Link>
              <Link
                href="/profile"
                className="block px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => setOpen(false)}
              >
                个人资料
              </Link>
              <Link
                href="/user/favorites"
                className="block px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => setOpen(false)}
              >
                我的收藏
              </Link>
              <Link
                href="/collections"
                className="block px-2 py-1.5 text-sm hover:bg-accent rounded"
                onClick={() => setOpen(false)}
              >
                我的合集
              </Link>
              <button
                onClick={async () => {
                  await signOut()
                  setOpen(false)
                }}
                className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                登出
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
