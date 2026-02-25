"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = 'en' | 'zh'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  en: {
    // Navigation
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.signIn": "Sign in",
    "nav.signUp": "Start free trial",
    "nav.generate": "Generate",
    "nav.history": "History",

    // Hero
    "hero.badge": "AI-Powered LinkedIn Content",
    "hero.title": "The #1 AI Agent for",
    "hero.subtitle": "LinkedIn content creation",
    "hero.description": "Generate professional, engaging LinkedIn content in minutes. Built for CEOs, executives, and industry leaders who want to build their personal brand.",
    "hero.startTrial": "Start free trial",
    "hero.viewDemo": "View demo",
    "hero.noCreditCard": "No credit card required",
    "hero.freeGenerations": "5 free generations",
    "hero.cancelAnytime": "Cancel anytime",

    // Features
    "features.title": "Generate content that resonates",
    "features.subtitle": "Three powerful content types, one AI platform",
    "features.industryTrends.title": "Industry Trends",
    "features.industryTrends.description": "Generate content based on the latest industry research and market data",
    "features.positionInsights.title": "Position Insights",
    "features.positionInsights.description": "Content tailored to your role, company, and industry expertise",
    "features.customContent.title": "Custom Content",
    "features.customContent.description": "Fully personalized content based on your specific topics and keywords",

    // CTA
    "cta.title": "Get started today",
    "cta.description": "Join thousands of executives building their personal brand with AI",

    // Generate Page
    "generate.title": "Create Content",
    "generate.description": "Enter a topic and AI will generate professional content",
    "generate.topic.label": "Topic",
    "generate.topic.placeholder": "e.g., AI in healthcare, Digital Transformation",
    "generate.topic.hint": "(e.g., AI in healthcare, Digital Transformation)",
    "generate.contentType.label": "Content Type",
    "generate.linkedinUrl.label": "LinkedIn URL",
    "generate.linkedinUrl.hint": "(Optional, for data extraction)",
    "generate.companyUrl.label": "Company URL",
    "generate.companyUrl.hint": "(Optional, for data extraction)",
    "generate.next": "Next: Extract Data",
    "generate.back": "Back",
    "generate.startGeneration": "Start Generation",

    // Footer
    "footer.copyright": "© 2025 Avery. All rights reserved.",
  },
  zh: {
    // Navigation
    "nav.features": "功能",
    "nav.pricing": "定价",
    "nav.about": "关于",
    "nav.signIn": "登录",
    "nav.signUp": "免费试用",
    "nav.generate": "生成内容",
    "nav.history": "历史记录",

    // Hero
    "hero.badge": "AI 驱动的 LinkedIn 内容生成",
    "hero.title": "领先的 AI 代理",
    "hero.subtitle": "LinkedIn 内容创作",
    "hero.description": "在几分钟内生成专业、引人入胜的 LinkedIn 内容。专为希望建立个人品牌的 CEO、高管和行业领袖打造。",
    "hero.startTrial": "免费试用",
    "hero.viewDemo": "查看演示",
    "hero.noCreditCard": "无需信用卡",
    "hero.freeGenerations": "5 次免费生成",
    "hero.cancelAnytime": "随时取消",

    // Features
    "features.title": "生成共鸣内容",
    "features.subtitle": "三种强大的内容类型，一个 AI 平台",
    "features.industryTrends.title": "行业趋势",
    "features.industryTrends.description": "基于最新行业研究和市场数据生成内容",
    "features.positionInsights.title": "岗位洞察",
    "features.positionInsights.description": "根据您的角色、公司和专业知识量身定制内容",
    "features.customContent.title": "定制内容",
    "features.customContent.description": "基于您的特定主题和关键词完全个性化内容",

    // CTA
    "cta.title": "今天就开始",
    "cta.description": "加入数千名使用 AI 建立个人品牌的高管",

    // Generate Page
    "generate.title": "创建内容",
    "generate.description": "输入主题，AI 将生成专业内容",
    "generate.topic.label": "主题",
    "generate.topic.placeholder": "例如：AI 在医疗保健中的应用，数字化转型",
    "generate.topic.hint": "（例如：AI 在医疗保健中的应用，数字化转型）",
    "generate.contentType.label": "内容类型",
    "generate.linkedinUrl.label": "LinkedIn URL",
    "generate.linkedinUrl.hint": "（可选，用于数据提取）",
    "generate.companyUrl.label": "公司 URL",
    "generate.companyUrl.hint": "（可选，用于数据提取）",
    "generate.next": "下一步：提取数据",
    "generate.back": "返回",
    "generate.startGeneration": "开始生成",

    // Footer
    "footer.copyright": "© 2025 Avery. 保留所有权利。",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Load saved language from localStorage
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
