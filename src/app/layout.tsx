import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { site } from "@/lib/content"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: [
    "информационная безопасность",
    "ИБ",
    "триада CIA",
    "конфиденциальность",
    "целостность",
    "доступность",
    "фишинг",
    "MFA",
  ],
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "ru_RU",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Секции появляются с анимацией Framer Motion, поэтому в исходной
          разметке они прозрачны. Если JavaScript отключён, принудительно
          показываем их содержимое — иначе страница останется пустой.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ThemeProvider>
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}