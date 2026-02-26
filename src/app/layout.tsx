import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Avery - AI-Powered LinkedIn Content Generation",
  description: "Transform your LinkedIn presence with AI-generated professional content",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider defaultTheme="dark" storageKey="avery-theme">
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
