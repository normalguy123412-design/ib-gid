"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

/**
 * Переключатель темы (next-themes).
 *
 * `attribute="class"` добавляет класс .dark на <html>, поэтому тёмная тема
 * включается обычными вариантами Tailwind (`dark:`).
 * По умолчанию сайт открывается в тёмной теме; enableSystem сохраняет выбор
 * пользователя, если он переключил тему вручную.
 * `disableTransitionOnChange` отключает CSS-переходы во время смены темы,
 * иначе цвета «перетекают» и выглядят как вспышка.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}