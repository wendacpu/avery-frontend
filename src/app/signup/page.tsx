"use client"

import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { mockSignIn } from "@/lib/mock-auth"

export default function SignUpPage() {
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Google sign-in error:", error)
      // 如果 Google OAuth 失败，使用模拟登录
      mockSignIn()
      router.push("/dashboard")
    }
  }

  const handleMockSignIn = () => {
    // 直接使用模拟登录
    mockSignIn()
    router.push("/dashboard")
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 使用模拟登录
    mockSignIn()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="w-full max-w-md">
        {/* Top right theme toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-2xl">
            Avery
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border bg-card p-8">
          <h1 className="text-2xl font-bold mb-2">Get started</h1>
          <p className="text-muted-foreground mb-8">Start your free trial today</p>

          {/* Sign up with Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full border border-border px-4 py-3 rounded text-sm font-medium hover:bg-accent transition-colors mb-4 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04-2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full px-4 py-3 rounded bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background px-4 py-3 rounded text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Create Account
            </button>
          </form>

          {/* Quick demo button */}
          <button
            onClick={handleMockSignIn}
            className="w-full mt-3 border-2 border-primary px-4 py-3 rounded text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            🚀 Quick Demo
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
