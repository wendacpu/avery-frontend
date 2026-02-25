"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { api } from "@/lib/api-client"

export default function ContentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    loadContent()
  }, [params.id])

  const loadContent = async () => {
    try {
      const data = await api.getContent(params.id as string)
      setContent(data)
      setEditedContent(data.generated_content || "")
    } catch (err: any) {
      setError(err.message || "Failed to load content")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const updated = await api.updateContent(params.id as string, editedContent)
      setContent(updated)
      setIsEditing(false)
      alert("Content saved successfully!")
    } catch (err: any) {
      alert("Failed to save content")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this content?")) return

    try {
      await api.deleteContent(params.id as string)
      router.push("/history")
    } catch (err: any) {
      alert("Failed to delete content")
    }
  }

  const handleToggleFavorite = async () => {
    try {
      const updated = await api.toggleFavorite(params.id as string)
      setContent(updated)
    } catch (err: any) {
      alert("Failed to update favorite")
    }
  }

  const handleRegenerate = async () => {
    if (!confirm("使用相同参数重新生成内容？这将创建一条新记录。")) return

    setIsRegenerating(true)
    try {
      const response = await api.regenerateContent(params.id as string)
      alert("重新生成已开始！即将跳转到新内容...")
      // 延迟跳转，给用户时间看到提示
      setTimeout(() => {
        router.push(`/history/${response.id}`)
      }, 1500)
    } catch (err: any) {
      alert("重新生成失败: " + (err.message || "未知错误"))
    } finally {
      setIsRegenerating(false)
    }
  }

  const downloadImage = async (url: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      // Show loading state
      const button = e?.target as HTMLButtonElement
      if (button) {
        button.textContent = 'Downloading...'
        button.disabled = true
      }

      // Fetch with CORS mode
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `avery-image-${Date.now()}.jpg`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
        if (button) {
          button.textContent = 'Download Image'
          button.disabled = false
        }
      }, 100)
    } catch (err) {
      console.error('Download failed:', err)
      alert('Download failed. Opening image in new tab instead...')
      // Fallback: open in new tab
      window.open(url, '_blank')
      const button = e?.target as HTMLButtonElement
      if (button) {
        button.textContent = 'Download Image'
        button.disabled = false
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-bold text-xl">Avery</Link>
              <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">← Back to History</Link>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-foreground/20 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="font-bold text-xl">Avery</Link>
              <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground">← Back to History</Link>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center py-12">
            <p className="text-destructive">{error || "Content not found"}</p>
          </div>
        </div>
      </div>
    )
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
              <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to History
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                content.status === 'completed' ? 'bg-green-500/10 text-green-600' :
                content.status === 'failed' ? 'bg-red-500/10 text-red-600' :
                'bg-yellow-500/10 text-yellow-600'
              }`}>
                {content.status === 'completed' ? 'Completed' :
                 content.status === 'failed' ? 'Failed' :
                 'Processing'}
              </span>
              <span className="text-sm text-muted-foreground">
                {new Date(content.created_at).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold">
              {content.content_type === 'industry_trends' ? 'Industry Trends' :
               content.content_type === 'position_insight' ? 'Position Insights' :
               'Custom Content'}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded hover:bg-accent transition-colors ${
                content.is_favorited ? 'text-yellow-500' : 'text-muted-foreground'
              }`}
              title="Toggle favorite"
            >
              {content.is_favorited ? '★' : '☆'}
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Regenerate with same settings"
            >
              {isRegenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                  Regenerating...
                </>
              ) : (
                <>
                  🔄 Regenerate
                </>
              )}
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded border border-border hover:bg-accent transition-colors text-sm font-medium"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Image Display */}
        {content.image_url && (
          <div className="rounded-lg border bg-card overflow-hidden mb-6">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Generated Image</h2>
            </div>
            <div className="p-6">
              <img
                src={content.image_url}
                alt="Generated content"
                className="w-full rounded-lg"
              />
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={(e) => downloadImage(content.image_url, e)}
                className="flex-1 border border-border px-4 py-2 rounded text-sm font-medium hover:bg-accent transition-colors"
              >
                Download Image
              </button>
              <button
                onClick={() => window.open(content.image_url, '_blank')}
                className="flex-1 border border-border px-4 py-2 rounded text-sm font-medium hover:bg-accent transition-colors"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        )}

        {/* Content Display */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {isEditing ? 'Edit Content' : 'Generated Content'}
            </h2>
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const success = await api.copyToClipboard(content.generated_content || "")
                    alert(success ? 'Copied to clipboard!' : 'Copy failed')
                  }}
                  className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={() => api.downloadContent(content.generated_content || "")}
                  className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                >
                  Download Markdown
                </button>
              </div>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                  setEditedContent(content.generated_content || "")
                }}
                  className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="p-6">
            {isEditing ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground focus:outline-none focus:border-ring resize-none transition-colors font-mono text-sm"
              />
            ) : (
              <div className="prose max-w-none whitespace-pre-wrap">
                {content.generated_content}
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 p-4 rounded-lg border bg-card">
          <h3 className="text-sm font-medium mb-3">Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Content ID:</span>
              <div className="font-mono text-xs mt-1">{content.id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Content Type:</span>
              <div className="mt-1">{content.content_type}</div>
            </div>
            {content.linkedin_url && (
              <div>
                <span className="text-muted-foreground">LinkedIn URL:</span>
                <div className="mt-1 break-all">{content.linkedin_url}</div>
              </div>
            )}
            {content.company_url && (
              <div>
                <span className="text-muted-foreground">Company URL:</span>
                <div className="mt-1 break-all">{content.company_url}</div>
              </div>
            )}
            {content.completed_at && (
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <div className="mt-1">{new Date(content.completed_at).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
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
