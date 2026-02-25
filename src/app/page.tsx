"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/contexts/LanguageContext"

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation - fin.ai 风格 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/" className="font-bold text-xl">
                Avery
              </Link>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.features")}
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.pricing")}
                </Link>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t("nav.about")}
                </Link>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LanguageToggle />
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/signup"
                className="bg-foreground text-background px-5 py-2 rounded text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                {t("nav.signUp")}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - fin.ai 风格 */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border mb-8 bg-card">
            <span className="text-sm font-medium">{t("hero.badge")}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6">
            {t("hero.title")}<br />
            <span className="text-muted-foreground">{t("hero.subtitle")}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
            {t("hero.description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-foreground text-background px-8 py-4 rounded text-base font-medium hover:bg-foreground/90 transition-colors"
            >
              {t("hero.startTrial")}
            </Link>
            <button className="w-full sm:w-auto border border-border px-8 py-4 rounded text-base font-medium hover:bg-accent transition-colors">
              {t("hero.viewDemo")}
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>{t("hero.noCreditCard")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>{t("hero.freeGenerations")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>✓</span>
              <span>{t("hero.cancelAnytime")}</span>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-24 max-w-6xl mx-auto">
          <div className="rounded-lg border bg-card p-8">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
              <div className="h-24 bg-muted/50 rounded-lg mt-6"></div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("features.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-16 max-w-2xl">
              {t("features.subtitle")}
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-lg border bg-card">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-3">{t("features.industryTrends.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("features.industryTrends.description")}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-lg border bg-card">
                <div className="text-3xl mb-4">💼</div>
                <h3 className="text-xl font-semibold mb-3">{t("features.positionInsights.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("features.positionInsights.description")}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-lg border bg-card">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-3">{t("features.customContent.title")}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t("features.customContent.description")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 max-w-5xl mx-auto">
          <div className="rounded-lg p-12 text-center bg-card border">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {t("cta.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t("cta.description")}
            </p>
            <Link
              href="/signup"
              className="inline-block bg-foreground text-background px-8 py-4 rounded text-base font-medium hover:bg-foreground/90 transition-colors"
            >
              {t("hero.startTrial")}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
