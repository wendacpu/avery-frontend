/**
 * 认证 Hook - 用于客户端路由保护
 */

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isMockAuthenticated } from './mock-auth'

// 需要认证的路由
const PROTECTED_ROUTES = ['/generate', '/history']

// 公开路由（已登录用户不应该访问）
const PUBLIC_ROUTES = ['/login', '/signup']

export function useAuth() {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 检查登录状态
    const authenticated = isMockAuthenticated()
    setIsAuthenticated(authenticated)
    setIsChecking(false)

    // 如果访问受保护路由但未登录，重定向到登录页
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      if (!authenticated) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
      }
    }

    // 如果已登录用户访问公开路由，重定向到 generate 页面
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      if (authenticated) {
        router.push('/generate')
      }
    }
  }, [pathname, router])

  return { isAuthenticated, isChecking }
}
