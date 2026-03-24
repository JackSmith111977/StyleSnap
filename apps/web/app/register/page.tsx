import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = {
  title: '注册 - StyleSnap',
  description: '创建 StyleSnap 账户，收藏、评论和提交风格',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RegisterForm />
    </div>
  )
}
