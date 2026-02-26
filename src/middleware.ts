import { auth } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 需要认证的路由
const protectedRoutes = ["/history", "/generate"]
// 公开路由（已登录用户不应该访问）
const authRoutes = ["/login", "/signup"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuthenticated = !!req.auth

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // 检查是否是认证路由
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // 如果访问受保护路由但未登录，重定向到登录页
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // 如果已登录用户访问登录/注册页，重定向到 generate 页面
  if (isAuthRoute && isAuthenticated) {
    const generateUrl = new URL("/generate", req.url)
    return NextResponse.redirect(generateUrl)
  }

  return NextResponse.next()
})

// 配置哪些路由需要运行 middleware
export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
