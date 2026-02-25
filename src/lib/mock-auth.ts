// 临时模拟登录 - 用于无法访问 Google OAuth 的环境
export function mockSignIn() {
  // 设置模拟的用户信息到 localStorage
  const mockUser = {
    id: "mock-user-123",
    name: "Demo User",
    email: "demo@averycmo.com",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Avery",
  }

  localStorage.setItem("avery-user", JSON.stringify(mockUser))
  localStorage.setItem("avery-authenticated", "true")

  return mockUser
}

export function mockSignOut() {
  localStorage.removeItem("avery-user")
  localStorage.removeItem("avery-authenticated")
}

export function getMockUser() {
  const userStr = localStorage.getItem("avery-user")
  return userStr ? JSON.parse(userStr) : null
}

export function isMockAuthenticated() {
  return localStorage.getItem("avery-authenticated") === "true"
}
