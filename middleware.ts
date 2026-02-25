/**
 * Avery 路由保护中间件
 * 保护 (dashboard) 路由组，确保只有登录用户可以访问
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 定义需要保护的路由
const protectedRoutes = ['/generate', '/history']

// 定义公开路由（登录后不应该访问）
const publicRoutes = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查用户是否已登录（通过localStorage在客户端无法直接访问）
  // 这里使用cookie来检查登录状态
  const isAuthenticated = request.cookies.get('avery-authenticated')?.value === 'true'

  // 如果访问受保护的路由但未登录，重定向到登录页
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      // 添加登录后的重定向地址
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  // 如果已登录用户访问登录/注册页，重定向到generate页面
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/generate'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有路径，除了 API 路由、静态文件等
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
