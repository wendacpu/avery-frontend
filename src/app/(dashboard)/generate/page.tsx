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
import {
  config,
  jobTitles,
  contentQualities,
  outputFormats,
  generationSteps
} from "@/lib/config"
import {
  JobTitle,
  ContentQuality,
  OutputFormat,
  TopicRecommendation,
  LinkedInProfile,
  CompanyInfo
} from "@/lib/types"

type Step = 'input' | 'recommend' | 'generating' | 'result'

export default function GeneratePage() {
  const router = useRouter()
  const { isChecking: isAuthChecking } = useAuth()

  // 所有 hooks 必须在条件判断之前调用
  const [step, setStep] = useState<Step>('input')

  // Step 1: 基础信息字段
  const [jobTitle, setJobTitle] = useState<JobTitle>(JobTitle.CEO_FOUNDER)
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [companyUrl, setCompanyUrl] = useState("")
  const [contentQuality, setContentQuality] = useState<ContentQuality>(ContentQuality.NORMAL)

  // Step 2: 主题推荐和输出格式
  const [extractedData, setExtractedData] = useState<{
    linkedinProfile: LinkedInProfile | null
    companyInfo: CompanyInfo | null
  }>({
    linkedinProfile: null,
    companyInfo: null,
  })

  const [topicRecommendations, setTopicRecommendations] = useState<TopicRecommendation[]>([])
  const [selectedTopic, setSelectedTopic] = useState("")
  const [customTopic, setCustomTopic] = useState("")
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(OutputFormat.WITH_IMAGE)
  const [additionalContext, setAdditionalContext] = useState("")

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [generationId, setGenerationId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // Results
  const [generatedContent, setGeneratedContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [contentStructure, setContentStructure] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [error, setError] = useState("")

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

  // Step 1 → Step 2: 提取数据和推荐主题
  const handleExtractAndRecommend = async () => {
    if (!linkedinUrl.trim()) {
      setError("Please enter LinkedIn URL")
      return
    }

    setIsExtracting(true)
    setError("")

    try {
      // 调用后端API提取数据和推荐主题
      const response = await api.extractAndRecommend({
        linkedin_url: linkedinUrl,
        company_url: companyUrl || undefined,
        job_title: jobTitle,
        content_quality: contentQuality,
        output_format: outputFormat,
        selected_topic: "",  // 临时空值
        language: "en",  // 默认使用英文
      })

      setExtractedData({
        linkedinProfile: response.linkedin_profile || null,
        companyInfo: response.company_info || null,
      })

      setTopicRecommendations(response.topic_recommendations || [])
      setStep('recommend')
    } catch (err: any) {
      console.error('Extract error:', err)
      setError(err.message || "Failed to extract data. Please check if the LinkedIn URL is correct")
    } finally {
      setIsExtracting(false)
    }
  }

  // Step 2 → Step 3: 生成内容
  const handleGenerate = async () => {
    const finalTopic = customTopic || selectedTopic

    if (!finalTopic.trim()) {
      setError("Please select or enter a topic")
      return
    }

    setIsGenerating(true)
    setStep('generating')
    setProgress(0)
    setCompletedSteps([])
    setError("")

    try {
      console.log("Generating with:", {
        linkedin_url: linkedinUrl,
        company_url: companyUrl || undefined,
        job_title: jobTitle,
        content_quality: contentQuality,
        output_format: outputFormat,
        selected_topic: finalTopic,
        additional_context: additionalContext || undefined,
      })

      // 触发内容生成
      const response = await api.generateContent({
        linkedin_url: linkedinUrl,
        company_url: companyUrl || undefined,
        job_title: jobTitle,
        content_quality: contentQuality,
        output_format: outputFormat,
        selected_topic: finalTopic,
        additional_context: additionalContext || undefined,
        language: "en",  // 默认使用英文
      })

      if (response.id) {
        setGenerationId(response.id)

        // 轮询进度
        const checkProgress = setInterval(async () => {
          try {
            const content = await api.getContent(response.id)

            if (content.status === 'completed') {
              clearInterval(checkProgress)
              setGeneratedContent(content.generated_content || "")
              setImageUrl(content.image_url || "")
              setContentStructure(content.content_structure || "")
              setTargetAudience(content.target_audience || "")
              setProgress(100)
              setIsGenerating(false)
              setStep('result')
            } else if (content.status === 'failed') {
              clearInterval(checkProgress)
              setError("Generation failed. Please try again")
              setIsGenerating(false)
              setStep('input')
            } else {
              // 更新进度
              const newProgress = Math.min(progress + 10, 90)
              setProgress(newProgress)

              // 更新当前步骤
              const stepIndex = Math.floor(newProgress / 12)
              if (stepIndex < generationSteps.length) {
                const step = generationSteps[stepIndex]
                setCurrentStep(step.label)
                if (!completedSteps.includes(step.key)) {
                  setCompletedSteps([...completedSteps, step.key])
                }
              }
            }
          } catch (err) {
            clearInterval(checkProgress)
            console.error('Progress check error:', err)
          }
        }, 2000)
      }
    } catch (err: any) {
      console.error("Generation error:", err)
      setError(err.message || "Generation failed")
      setIsGenerating(false)
      setStep('input')
    }
  }

  const resetForm = () => {
    setStep('input')
    setJobTitle(JobTitle.CEO_FOUNDER)
    setLinkedinUrl('')
    setCompanyUrl('')
    setContentQuality(ContentQuality.NORMAL)
    setSelectedTopic('')
    setCustomTopic('')
    setOutputFormat(OutputFormat.WITH_IMAGE)
    setAdditionalContext('')
    setGeneratedContent('')
    setImageUrl('')
    setContentStructure('')
    setTargetAudience('')
    setTopicRecommendations([])
    setExtractedData({ linkedinProfile: null, companyInfo: null })
    setCompletedSteps([])
    setProgress(0)
    setError('')
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

  const downloadImage = async (url: string, e?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const button = e?.target as HTMLButtonElement
      if (button) {
        button.textContent = 'Downloading...'
        button.disabled = true
      }

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
      window.open(url, '_blank')
      const button = e?.target as HTMLButtonElement
      if (button) {
        button.textContent = 'Download Image'
        button.disabled = false
      }
    }
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
                <Link href="/generate" className="text-sm font-medium">
                  Generate
                </Link>
                <Link href="/history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center ${step === 'input' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'input' || ['recommend', 'generating', 'result'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                1
              </div>
              <span className="ml-2">Basic Info</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${['recommend', 'generating', 'result'].includes(step) ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${['recommend', 'generating', 'result'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${['generating', 'result'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                2
              </div>
              <span className="ml-2">Topics</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${['generating', 'result'].includes(step) ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${['generating', 'result'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'result' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                3
              </div>
              <span className="ml-2">Generate</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
            {error}
          </div>
        )}

        {/* Step 1: 基础信息 */}
        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Create Content</h1>
              <p className="text-muted-foreground">
                Tell us your role and LinkedIn information, and AI will help you generate high-quality content
              </p>
            </div>

            {/* Job Title Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Your Role *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {jobTitles.map((job) => {
                  const isSelected = jobTitle === job.value
                  return (
                    <button
                      key={job.value}
                      type="button"
                      onClick={() => setJobTitle(job.value as JobTitle)}
                      className={`relative p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-xl mb-1">{job.icon}</div>
                      <div className={`text-xs font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {job.label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LinkedIn URL */}
            <div>
              <label className="block text-sm font-medium mb-2">
                LinkedIn URL *
              </label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            {/* Company Website URL (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Company Website URL <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://www.yourcompany.com"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            {/* Content Quality */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Content Quality *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {contentQualities.map((quality) => {
                  const isSelected = contentQuality === quality.value
                  return (
                    <button
                      key={quality.value}
                      type="button"
                      onClick={() => setContentQuality(quality.value as ContentQuality)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-2xl mb-2">{quality.icon}</div>
                      <div className={`font-medium text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {quality.label}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                        {quality.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Extract Button */}
            <button
              onClick={handleExtractAndRecommend}
              disabled={!linkedinUrl.trim() || isExtracting}
              className="w-full bg-foreground text-background px-6 py-4 rounded-lg text-base font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? 'Analyzing...' : 'Next: Recommended Topics'}
            </button>
          </div>
        )}

        {/* Step 2: Recommended Topics and Output Format */}
        {step === 'recommend' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Recommended Topics</h2>
              <p className="text-muted-foreground">
                Based on your role and LinkedIn profile, AI recommends the following topics
              </p>
            </div>

            {/* Extracted Data Display */}
            {(extractedData.linkedinProfile || extractedData.companyInfo) && (
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">Extracted Information</h3>
                {extractedData.linkedinProfile && (
                  <div className="mb-2 text-sm">
                    <span className="font-medium">Name: </span>{extractedData.linkedinProfile.name}
                    <span className="ml-4 font-medium">Title: </span>{extractedData.linkedinProfile.title}
                    {extractedData.linkedinProfile.company && (
                      <span className="ml-4 font-medium">Company: </span>
                    )}
                    {extractedData.linkedinProfile.company}
                  </div>
                )}
                {extractedData.companyInfo && (
                  <div className="text-sm">
                    <span className="font-medium">Company: </span>{extractedData.companyInfo.name}
                  </div>
                )}
              </div>
            )}

            {/* Topic Recommendations */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Select a topic or enter manually
              </label>
              <div className="space-y-3 mb-4">
                {topicRecommendations.map((rec, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setSelectedTopic(rec.topic)
                      setCustomTopic('')
                    }}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      selectedTopic === rec.topic && !customTopic
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">
                          {rec.topic}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rec.reason}
                        </div>
                      </div>
                      <div className="ml-2 flex items-center space-x-2">
                        {rec.estimated_engagement && (
                          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            Est. Engagement: {rec.estimated_engagement}
                          </span>
                        )}
                        {selectedTopic === rec.topic && !customTopic && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Manual Topic Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Or enter topic manually
                </label>
                <input
                  type="text"
                  placeholder="e.g., How to build an efficient remote team"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value)
                    setSelectedTopic('')
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>

            {/* Output Format */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Output Format *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {outputFormats.map((format) => {
                  const isSelected = outputFormat === format.value
                  return (
                    <button
                      key={format.value}
                      type="button"
                      onClick={() => setOutputFormat(format.value as OutputFormat)}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                          : 'border-border hover:border-primary/50 bg-card hover:bg-accent'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="text-xl mb-2">{format.icon}</div>
                      <div className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {format.label}
                      </div>
                      <div className={`text-xs mt-1 ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                        {format.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Additional Context */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Additional Context <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                placeholder="e.g., Prefer content focused on technical practices, or include specific examples..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring resize-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('input')}
                className="flex-1 border border-border px-6 py-3 rounded-lg text-base font-medium hover:bg-accent transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-foreground text-background px-6 py-3 rounded-lg text-base font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                Start Generating
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generating */}
        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto mb-8">
              <div className="mb-8">
                <div className="w-16 h-16 border-4 border-t-foreground/20 rounded-full animate-spin mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">AI is generating content...</h2>
              <p className="text-muted-foreground mb-8">
                Estimated time: 1-2 minutes
              </p>
              <div className="w-full bg-card rounded-lg border p-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                {currentStep && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    {currentStep}
                  </div>
                )}
              </div>

              {/* Steps List */}
              <div className="max-w-md mx-auto text-left space-y-3 mt-6">
                {generationSteps.map((stepItem) => {
                  const isCompleted = completedSteps.includes(stepItem.key)
                  const isCurrent = currentStep === stepItem.label

                  return (
                    <div
                      key={stepItem.key}
                      className={`flex items-center gap-3 text-sm ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <span className="w-6 h-6 rounded flex items-center justify-center border bg-card">
                        {isCompleted ? '✓' : isCurrent ? '⟳' : stepItem.key === 'validate' ? '1' : stepItem.key === 'extract' ? '2' : stepItem.key === 'recommend' ? '3' : stepItem.key === 'analyze' ? '4' : stepItem.key === 'retrieve' ? '5' : stepItem.key === 'generate' ? '6' : stepItem.key === 'design' ? '7' : stepItem.key === 'image' ? '8' : '9'}
                      </span>
                      <span className={isCompleted ? 'line-through' : ''}>
                        {stepItem.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 结果展示 */}
        {step === 'result' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Generation Complete!</h1>
                <p className="text-muted-foreground">
                  AI has generated professional content
                  {contentStructure && ` · Structure: ${contentStructure}`}
                  {targetAudience && ` · Target Audience: ${targetAudience}`}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Generate More
              </button>
            </div>

            {/* Content and Image Display */}
            <div className="space-y-8">
              {/* Generated Image */}
              {outputFormat === 'with_image' && imageUrl && (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Generated Image</h2>
                  </div>
                  <div className="p-6">
                    <img
                      src={imageUrl}
                      alt="Generated content"
                      className="w-full rounded-lg"
                    />
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <button
                      onClick={(e) => downloadImage(imageUrl, e)}
                      className="flex-1 border border-border px-4 py-2 rounded text-sm font-medium hover:bg-accent transition-colors"
                    >
                      Download Image
                    </button>
                  </div>
                </div>
              )}

              {/* Generated Text Content */}
              {generatedContent && (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Generated Content</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(generatedContent)
                          alert('Copied to clipboard!')
                        }}
                        className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([generatedContent], { type: 'text/markdown' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `avery-content-${Date.now()}.md`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                        className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                      >
                        Download Markdown
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="prose max-w-none whitespace-pre-wrap">
                      {generatedContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
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
