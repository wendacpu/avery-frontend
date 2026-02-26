/**
 * 认证 Hook - 用于客户端路由保护
 * 只检查 NextAuth session，不检查 mock auth
 * Mock auth 只作为登录失败时的开发环境 fallback
 */

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  // 认证状态：只使用 NextAuth session
  const isAuthenticated = !!session

  // 加载状态：NextAuth 正在加载时返回 true
  const isChecking = status === 'loading'

  return {
    isAuthenticated,
    isChecking,
    session, // NextAuth session
  }
}
