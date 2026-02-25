import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// 调试：打印环境变量
console.log("=== NextAuth Debug ===")
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Set" : "NOT SET")
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Set" : "NOT SET")
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL)
console.log("NODE_ENV:", process.env.NODE_ENV)
console.log("====================")

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // 添加更多调试选项
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.id = user?.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user.id = token.id as string
      return session
    },
    async redirect({ url, baseUrl }) {
      // 确保 URL 是相对的或属于同一个域名
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // 允许回调到相同域名
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  debug: true, // 启用调试模式
  secret: process.env.NEXTAUTH_SECRET,
})

export const { GET, POST } = handlers
