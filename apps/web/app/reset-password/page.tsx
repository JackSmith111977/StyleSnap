import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: '重置密码 - StyleSnap',
  description: '重置你的 StyleSnap 账户密码',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ResetPasswordForm />
    </div>
  )
}
