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

    // Pricing
    "pricing.title": "Avery Pricing: From Personal Output to Enterprise Trust Systems",
    "pricing.subtitle": "Choose the plan that fits your content needs",
    "pricing.tier.solo.name": "SOLO — The Creator Launchpad",
    "pricing.tier.solo.price": "$29",
    "pricing.tier.solo.period": "/month",
    "pricing.tier.solo.feature1": "Optimized for individuals needing lightweight, self-serve content for personal brand testing",
    "pricing.tier.solo.feature2": "5 LinkedIn Posts / Month",
    "pricing.tier.solo.feature3": "Infographic-style content generated instantly through a self-serve portal",
    "pricing.tier.solo.feature4": "Best for Personal Brand \"Trial\"",
    "pricing.tier.solo.feature5": "Ideal for job seekers or independent consultants validating their content style",
    "pricing.tier.solo.button": "Get Started",
    "pricing.tier.pro.name": "PRO — The Business Standard",
    "pricing.tier.pro.price": "$299",
    "pricing.tier.pro.period": "/month",
    "pricing.tier.pro.feature1": "A comprehensive system for founder-led teams and startups building B2B credibility",
    "pricing.tier.pro.feature2": "15 High-Quality Posts / Month",
    "pricing.tier.pro.feature3": "Enough volume to maintain a consistent weekly narrative and drive inbound leads",
    "pricing.tier.pro.feature4": "Team Governance & Compliance",
    "pricing.tier.pro.feature5": "Features multi-user collaboration, approval workflows, and \"Brand Voiceprint\" for company-grade accuracy",
    "pricing.tier.pro.button": "Start Free Trial",
    "pricing.tier.pro.badge": "Recommended",
    "pricing.tier.enterprise.name": "ENTERPRISE — The Strategic Engine",
    "pricing.tier.enterprise.price": "$1,999",
    "pricing.tier.enterprise.period": "/month",
    "pricing.tier.enterprise.feature1": "A managed content engine for CEOs and spokespeople requiring strategic authority",
    "pricing.tier.enterprise.feature2": "30 Posts + 2 Video Assets",
    "pricing.tier.enterprise.feature3": "Higher frequency production including short-form video to maximize market impact",
    "pricing.tier.enterprise.feature4": "Executive Premium Pack",
    "pricing.tier.enterprise.feature5": "Includes 1:1 strategic consulting, LinkedIn account upgrades, and a fully managed monthly post plan",
    "pricing.tier.enterprise.button": "Contact Sales",

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

    // Pricing
    "pricing.title": "Avery 定价：从个人输出到企业信任系统",
    "pricing.subtitle": "选择适合您内容需求的计划",
    "pricing.tier.solo.name": "SOLO — 创作者启动台",
    "pricing.tier.solo.price": "$29",
    "pricing.tier.solo.period": "/月",
    "pricing.tier.solo.feature1": "为需要轻量级、自助式内容的个人优化，用于个人品牌测试",
    "pricing.tier.solo.feature2": "每月 5 条 LinkedIn 帖子",
    "pricing.tier.solo.feature3": "通过自助门户即时生成信息图风格的内容",
    "pricing.tier.solo.feature4": "最适合个人品牌\"试用\"",
    "pricing.tier.solo.feature5": "适合求职者或独立顾问验证其内容风格",
    "pricing.tier.solo.button": "开始使用",
    "pricing.tier.pro.name": "PRO — 商务标准",
    "pricing.tier.pro.price": "$299",
    "pricing.tier.pro.period": "/月",
    "pricing.tier.pro.feature1": "为创始人主导的团队和初创企业建立 B2B 可信度的综合系统",
    "pricing.tier.pro.feature2": "每月 15 条高质量帖子",
    "pricing.tier.pro.feature3": "足够的数量以保持一致的每周叙事并推动潜在客户开发",
    "pricing.tier.pro.feature4": "团队治理与合规",
    "pricing.tier.pro.feature5": "功能包括多用户协作、审批工作流程和\"品牌音纹\"以实现公司级准确性",
    "pricing.tier.pro.button": "开始免费试用",
    "pricing.tier.pro.badge": "推荐",
    "pricing.tier.enterprise.name": "ENTERPRISE — 战略引擎",
    "pricing.tier.enterprise.price": "$1,999",
    "pricing.tier.enterprise.period": "/月",
    "pricing.tier.enterprise.feature1": "为 CEO 和发言人提供战略权威的托管内容引擎",
    "pricing.tier.enterprise.feature2": "30 条帖子 + 2 个视频资产",
    "pricing.tier.enterprise.feature3": "更高频率的生产，包括短视频以最大化市场影响力",
    "pricing.tier.enterprise.feature4": "高管高级包",
    "pricing.tier.enterprise.feature5": "包括 1对1 战略咨询、LinkedIn 账户升级和完全托管的每月发帖计划",
    "pricing.tier.enterprise.button": "联系销售",

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
