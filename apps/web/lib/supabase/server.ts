import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/env'

export async function createClient() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  console.log('[createClient] 创建 Supabase SSR 客户端')
  console.log('[createClient] Cookie 数量:', allCookies.length)
  console.log('[createClient] Cookie 详情:', allCookies.map(c => ({
    name: c.name,
    valueLength: c.value?.length || 0,
    valuePreview: c.value ? c.value.substring(0, 50) + (c.value.length > 50 ? '...' : '') : 'empty',
  })))

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          const cookies = cookieStore.getAll()
          console.log('[createClient] cookies.getAll() 被调用，返回数量:', cookies.length)
          return cookies
        },
        setAll(cookiesToSet) {
          console.log('[createClient] cookies.setAll() 被调用:', cookiesToSet.length)
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch (error) {
            console.error('[createClient] setAll 失败:', error)
            // Called from Server Component, ignore
          }
        },
      },
    }
  )
}
