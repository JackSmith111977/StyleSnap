import { redirect } from 'next/navigation'

// 重定向到新的收藏管理页面
export default function CollectionsRedirect() {
  redirect('/favorites')
}
