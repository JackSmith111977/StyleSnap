import { Metadata } from 'next'
import { UpdatePasswordForm } from '@/components/auth/update-password-form'

export const metadata: Metadata = {
  title: '更新密码 - StyleSnap',
  description: '设置你的新密码',
}

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <UpdatePasswordForm />
    </div>
  )
}
