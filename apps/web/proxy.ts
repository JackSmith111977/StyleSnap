import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 关键：必须同时设置 request 和 response 的 cookie，确保 token 刷新后 Server Component 能读取
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 关键：必须调用 getUser() 刷新 session token，否则 Server Component 无法获取用户
  await supabase.auth.getUser()

  // 应用缓存头防止 CDN 缓存认证状态
  supabaseResponse.headers.set('Cache-Control', 'private, no-store')

  // 检查是否有认证 cookie（Supabase cookie 格式：sb-*-auth-token）
  const hasAuthCookie = request.cookies.getAll().some(
    cookie => cookie.name.includes('sb-') && cookie.name.includes('auth-token')
  )

  // 受保护路由列表
  const protectedPaths = ['/user', '/settings']

  const { pathname } = request.nextUrl
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // 访问受保护页面但未登录（只检查 cookie 存在性）
  if (isProtectedPath && !hasAuthCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录用户访问登录/注册页面，重定向到首页
  if (hasAuthCookie && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 管理员路由检查在页面组件中进行

  return NextResponse.next({
    request,
  })
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon)
     * - 公共文件 (robots.txt, sitemap.xml 等)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
