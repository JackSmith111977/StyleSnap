import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: '登录 - StyleSnap',
  description: '登录到你的 StyleSnap 账户',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
