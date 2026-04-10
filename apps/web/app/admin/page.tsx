import { redirect } from 'next/navigation'

/**
 * 管理后台首页
 * 重定向到审核队列（默认页面）
 */
export default function AdminPage() {
  redirect('/admin/review')
}
