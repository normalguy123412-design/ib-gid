"use client"

import * as React from "react"
import { MoonIcon, ShieldCheckIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { navItems } from "@/lib/content"
import { useHorizontalScroll } from "@/components/horizontal-scroll"
import { useHydrated } from "@/hooks/use-hydrated"

/**
 * НИЖНЯЯ ПОЛОСА ПРОГРЕССА — навигация по странице.
 *
 * Заменяет верхнюю панель: рельс внизу экрана заполняется по мере прокрутки,
 * его можно перетаскивать мышью или пальцем (быстрый «скроллинг» страницы),
 * а подписанные точки служат переходами к разделам и показывают, где вы находитесь.
 *
 * Весь слой не перехватывает клики (`pointer-events-none`) — интерактивными
 * сделаны только сам «язычок» и точки.
 */
export function ScrollRail() {
  const railRef = React.useRef<HTMLDivElement | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [active, setActive] = React.useState<string>(navItems[0].href)
  const [dragging, setDragging] = React.useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  // В горизонтальном режиме раздел «находится» по горизонтали, поэтому
  // и переходы, и подсветка точки считаются иначе.
  const horizontal = useHorizontalScroll()

  /** Обновление прогресса и активного раздела по позиции прокрутки. */
  React.useEffect(() => {
    let frame = 0

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const y = window.scrollY
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0)

      let current = navItems[0].href

      if (horizontal) {
        // Разделы стоят рядом по горизонтали, поэтому ориентируемся на
        // левый край, а не на верх: активен последний, чей левый край
        // уже прошёл линию обзора.
        const line = window.innerWidth * 0.35
        for (const item of navItems) {
          const el = document.querySelector(item.href)
          if (!el) continue
          if (el.getBoundingClientRect().left <= line) current = item.href
        }
      } else {
        const line = y + window.innerHeight * 0.35
        for (const item of navItems) {
          const el = document.querySelector(item.href)
          if (!el) continue
          const top = el.getBoundingClientRect().top + y
          if (top <= line) current = item.href
        }
      }

      setActive(current)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [horizontal])

  /** Перемотка страницы по позиции указателя на рельсе. */
  const scrubTo = React.useCallback((clientX: number) => {
    const el = railRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: ratio * max })
  }, [])

  /** Плавный переход к разделу: в горизонтали — через прокрутку ленты. */
  const goTo = React.useCallback(
    (href: string) => {
      if (horizontal) {
        horizontal.scrollToSection(href.slice(1))
        return
      }
      const el = document.querySelector(href)
      if (!el) return
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    },
    [horizontal]
  )

  /** Возврат на самый первый экран. */
  const goHome = React.useCallback(() => {
    if (horizontal) {
      horizontal.scrollToSection("top")
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [horizontal])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      {/* Строка разделов. */}
      <div className="pointer-events-auto border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-11 w-full max-w-6xl items-center gap-3 px-3 sm:px-6">
          {/* Логотип: он же ссылка наверх, раз верхней панели больше нет. */}
          <button
            type="button"
            onClick={goHome}
            className="flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 font-heading text-sm font-semibold tracking-tight"
            aria-label="ИБ-Гид — наверх"
          >
            <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheckIcon className="size-3.5" />
            </span>
            <span className="hidden sm:inline">ИБ-Гид</span>
          </button>

          {/* Точки разделов: активная подсвечена и подписана. */}
          <nav
            aria-label="Разделы"
            className="-mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {navItems.map((item) => {
              const isActive = active === item.href
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => goTo(item.href)}
                  aria-current={isActive ? "true" : undefined}
                  className="group flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors"
                >
                  <span
                    className={
                      isActive
                        ? "size-1.5 rounded-full bg-sky-400"
                        : "size-1.5 rounded-full bg-foreground/25 transition-colors group-hover:bg-foreground/50"
                    }
                  />
                  <span
                    className={
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }
                  >
                    {item.title}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Переключатель темы. */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Переключить тему"
            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {/* До гидрации тема неизвестна — не рисуем иконку, чтобы не было расхождения. */}
            {hydrated && resolvedTheme === "dark" ? (
              <SunIcon className="size-4" />
            ) : (
              <MoonIcon className="size-4" />
            )}
          </button>
        </div>
      </div>

      {/* Рельс прогресса с перетаскиваемым «язычком». */}
      <div ref={railRef} className="relative h-0.5 bg-foreground/10">
        <div
          className="h-full origin-left bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400"
          style={{ transform: `scaleX(${progress})` }}
        />

        <button
          type="button"
          aria-label="Перемотка страницы"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setDragging(true)
            scrubTo(e.clientX)
          }}
          onPointerMove={(e) => {
            if (dragging) scrubTo(e.clientX)
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            setDragging(false)
          }}
          onPointerCancel={() => setDragging(false)}
          className="pointer-events-auto absolute -top-4 grid size-8 cursor-grab touch-none place-items-center rounded-full border bg-card text-foreground shadow-lg active:cursor-grabbing"
          style={{ left: `${progress * 100}%`, x: "-50%" }}
        >
          <ShieldCheckIcon
            className="size-4 text-sky-500"
            style={{ scale: dragging ? "1.25" : "1" }}
          />
        </button>
      </div>
    </div>
  )
}