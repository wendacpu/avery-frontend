"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { api } from "@/lib/api-client"
import { mockSignOut } from "@/lib/mock-auth"
import { useAuth } from "@/lib/use-auth"

export default function HistoryPage() {
  // 所有 hooks 必须在条件判断之前调用
  const router = useRouter()
  const { isChecking: isAuthChecking } = useAuth()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  // 在所有 hooks 之后才进行条件渲染
  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-foreground/20 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const data = await api.getHistory()
      console.log("History data:", data)
      setHistory(data)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      await api.deleteContent(id)
      setHistory(history.filter(item => item.id !== id))
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await api.toggleFavorite(id)
      setHistory(history.map(item =>
        item.id === id ? updated : item
      ))
    } catch (err) {
      alert('Failed to update favorite')
    }
  }

  const handleRegenerate = async (id: string) => {
    if (!confirm("使用相同参数重新生成内容？这将创建一条新记录。")) return

    setRegeneratingId(id)
    try {
      const response = await api.regenerateContent(id)
      alert("重新生成已开始！即将跳转...")
      setTimeout(() => {
        router.push(`/history/${response.id}`)
      }, 1000)
    } catch (err: any) {
      alert("重新生成失败: " + (err.message || "未知错误"))
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleSignOut = async () => {
    // 优先使用 NextAuth 登出，如果失败则使用 mock 登出
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error("NextAuth sign out error:", error)
      // Fallback to mock sign out
      mockSignOut()
    }
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-bold text-xl">
                Avery
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Generate
                </Link>
                <Link href="/history" className="text-sm font-medium">
                  History
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generation History</h1>
          <p className="text-muted-foreground">
            View and manage all your generated content
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-foreground/20 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No content generated yet</p>
            <Link
              href="/generate"
              className="inline-block bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Start Generating
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <div key={item.id} className="rounded-lg border bg-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                          item.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {item.status === 'completed' ? 'Completed' :
                           item.status === 'failed' ? 'Failed' :
                           'Processing'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                      <h3 className="font-medium mb-2 line-clamp-2">
                        {item.generated_content?.substring(0, 150)}...
                      </h3>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(item.id)}
                      className={`p-2 rounded hover:bg-accent transition-colors ${
                        item.is_favorited ? 'text-yellow-500' : 'text-muted-foreground'
                      }`}
                    >
                      {item.is_favorited ? '★' : '☆'}
                    </button>
                  </div>

                  {item.image_url && (
                    <div className="mb-4">
                      <img
                        src={item.image_url}
                        alt="Generated content"
                        className="w-full max-w-md rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      href={`/history/${item.id}`}
                      className="flex-1 border border-border px-4 py-2 rounded text-sm font-medium hover:bg-accent transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleRegenerate(item.id)}
                      disabled={regeneratingId === item.id}
                      className="px-4 py-2 rounded text-sm font-medium border border-primary text-primary hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Regenerate with same settings"
                    >
                      {regeneratingId === item.id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"></div>
                          ...
                        </span>
                      ) : (
                        "🔄 Regenerate"
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 rounded text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 Avery. Powered by AI
          </p>
        </div>
      </footer>
    </div>
  )
}
