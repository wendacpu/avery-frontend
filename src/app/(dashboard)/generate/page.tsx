"use client"

import { useState } from "react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { api } from "@/lib/api-client"
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

  // Step 1 → Step 2: 提取数据和推荐主题
  const handleExtractAndRecommend = async () => {
    if (!linkedinUrl.trim()) {
      setError("请输入LinkedIn URL")
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
      })

      setExtractedData({
        linkedinProfile: response.linkedin_profile || null,
        companyInfo: response.company_info || null,
      })

      setTopicRecommendations(response.topic_recommendations || [])
      setStep('recommend')
    } catch (err: any) {
      console.error('Extract error:', err)
      setError(err.message || "数据提取失败，请检查LinkedIn URL是否正确")
    } finally {
      setIsExtracting(false)
    }
  }

  // Step 2 → Step 3: 生成内容
  const handleGenerate = async () => {
    const finalTopic = customTopic || selectedTopic

    if (!finalTopic.trim()) {
      setError("请选择或输入主题")
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
              setError("生成失败，请重试")
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
      setError(err.message || "生成失败")
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
              <span className="ml-2">基础信息</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${['recommend', 'generating', 'result'].includes(step) ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${['recommend', 'generating', 'result'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${['generating', 'result'].includes(step) ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                2
              </div>
              <span className="ml-2">推荐主题</span>
            </div>
            <div className={`flex-1 h-0.5 mx-4 ${['generating', 'result'].includes(step) ? 'bg-primary' : 'bg-muted'}`}></div>
            <div className={`flex items-center ${['generating', 'result'].includes(step) ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'result' ? 'border-primary bg-primary text-primary-foreground' : 'border-muted'}`}>
                3
              </div>
              <span className="ml-2">生成</span>
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
              <h1 className="text-3xl font-bold mb-2">创建内容</h1>
              <p className="text-muted-foreground">
                告诉我们您的职位和LinkedIn信息，AI会帮您生成优质内容
              </p>
            </div>

            {/* 职位选择 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                您的职位 *
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

            {/* 公司网站 URL（可选） */}
            <div>
              <label className="block text-sm font-medium mb-2">
                公司网站 URL <span className="text-muted-foreground font-normal">(可选)</span>
              </label>
              <input
                type="url"
                placeholder="https://www.yourcompany.com"
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
              />
            </div>

            {/* 内容质量 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                内容质量 *
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

            {/* 提取按钮 */}
            <button
              onClick={handleExtractAndRecommend}
              disabled={!linkedinUrl.trim() || isExtracting}
              className="w-full bg-foreground text-background px-6 py-4 rounded-lg text-base font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExtracting ? '分析中...' : '下一步：推荐主题'}
            </button>
          </div>
        )}

        {/* Step 2: 推荐主题和输出格式 */}
        {step === 'recommend' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">推荐主题</h2>
              <p className="text-muted-foreground">
                基于您的职位和LinkedIn资料，AI为您推荐以下主题
              </p>
            </div>

            {/* 提取的数据展示 */}
            {(extractedData.linkedinProfile || extractedData.companyInfo) && (
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-medium mb-2">已提取的信息</h3>
                {extractedData.linkedinProfile && (
                  <div className="mb-2 text-sm">
                    <span className="font-medium">姓名：</span>{extractedData.linkedinProfile.name}
                    <span className="ml-4 font-medium">职位：</span>{extractedData.linkedinProfile.title}
                    {extractedData.linkedinProfile.company && (
                      <span className="ml-4 font-medium">公司：</span>
                    )}
                    {extractedData.linkedinProfile.company}
                  </div>
                )}
                {extractedData.companyInfo && (
                  <div className="text-sm">
                    <span className="font-medium">公司：</span>{extractedData.companyInfo.name}
                  </div>
                )}
              </div>
            )}

            {/* 主题推荐 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                选择一个主题，或手动输入
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
                            预估互动: {rec.estimated_engagement}
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

              {/* 手动输入主题 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  或手动输入主题
                </label>
                <input
                  type="text"
                  placeholder="例如：如何建立高效的远程团队"
                  value={customTopic}
                  onChange={(e) => {
                    setCustomTopic(e.target.value)
                    setSelectedTopic('')
                  }}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>

            {/* 输出格式 */}
            <div>
              <label className="block text-sm font-medium mb-3">
                输出格式 *
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

            {/* 额外补充信息 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                额外补充信息 <span className="text-muted-foreground font-normal">(可选)</span>
              </label>
              <textarea
                placeholder="例如：希望内容偏向技术实践，或者包含具体案例..."
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
                返回
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-foreground text-background px-6 py-3 rounded-lg text-base font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                开始生成
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 生成中 */}
        {step === 'generating' && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto mb-8">
              <div className="mb-8">
                <div className="w-16 h-16 border-4 border-t-foreground/20 rounded-full animate-spin mx-auto"></div>
              </div>
              <h2 className="text-2xl font-bold mb-2">AI 正在生成内容...</h2>
              <p className="text-muted-foreground mb-8">
                预计需要1-2分钟，请稍候
              </p>
              <div className="w-full bg-card rounded-lg border p-4">
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-muted-foreground">进度</span>
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
                <h1 className="text-3xl font-bold mb-2">生成完成！</h1>
                <p className="text-muted-foreground">
                  AI已为您生成专业内容
                  {contentStructure && ` · 使用结构：${contentStructure}`}
                  {targetAudience && ` · 目标受众：${targetAudience}`}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← 生成更多
              </button>
            </div>

            {/* Content and Image Display */}
            <div className="space-y-8">
              {/* Generated Image */}
              {outputFormat === 'with_image' && imageUrl && (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">生成的图片</h2>
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
                      下载图片
                    </button>
                  </div>
                </div>
              )}

              {/* Generated Text Content */}
              {generatedContent && (
                <div className="rounded-lg border bg-card overflow-hidden">
                  <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold">生成的内容</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(generatedContent)
                          alert('已复制到剪贴板！')
                        }}
                        className="border border-border px-3 py-1.5 rounded text-sm font-medium hover:bg-accent transition-colors"
                      >
                        复制
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
                        下载 Markdown
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
