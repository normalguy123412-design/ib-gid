"use client"

import * as React from "react"
import {
  BookMarkedIcon,
  BookOpenIcon,
  FlaskConicalIcon,
  HomeIcon,
  LifeBuoyIcon,
  MoonIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SunIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { navItems } from "@/lib/content"
import { useHorizontalScroll } from "@/components/horizontal-scroll"
import { useHydrated } from "@/hooks/use-hydrated"
import { MacOsDock, type DockEntry } from "@/components/ui/mac-os-dock"

/**
 * Иконка раздела. Подобрана по смыслу, а не по порядку: словарик — книга
 * с закладками, угрозы и защита — щиты разного цвета, демо — колба.
 */
const ICONS: Record<string, LucideIcon> = {
  "#concepts": BookOpenIcon,
  "#glossary": BookMarkedIcon,
  "#threats": ShieldAlertIcon,
  "#defense": ShieldCheckIcon,
  "#demos": FlaskConicalIcon,
  "#mistakes": TriangleAlertIcon,
  "#emergency": LifeBuoyIcon,
}

/**
 * НИЖНЯЯ НАВИГАЦИЯ — док в стиле macOS.
 *
 * Прячется за нижней кромкой окна и выезжает, когда курсор подходит к низу
 * экрана: постоянно висящая панель закрывала бы содержимое последнего
 * раздела. Разделы, переход к началу и переключатель темы — кнопки дока,
 * полоса прогресса под ним по-прежнему перематывается мышью.
 */
export function DockNav() {
  const [progress, setProgress] = React.useState(0)
  const [active, setActive] = React.useState<string>(navItems[0].href)
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  // В горизонтальном режиме раздел «находится» по горизонтали, поэтому
  // и переходы, и подсветка кнопки считаются иначе.
  const horizontal = useHorizontalScroll()

  /** Обновление прогресса и активного раздела по позиции прокрутки. */
  React.useEffect(() => {
    // Пока ширина ленты не измерена, панели ещё не выстроены и левые края у
    // них совпадают. Определять активный раздел в этот момент нельзя: цикл
    // проходит по всем пунктам и ошибочно останавливается на последнем.
    // Поэтому ждём первого замера и только тогда считаем.
    if (horizontal && horizontal.maxX === 0) return

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

  /** Перемотка страницы по позиции указателя на полосе прогресса. */
  const scrubTo = React.useCallback(
    (ratio: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      window.scrollTo({ top: ratio * max })
    },
    []
  )

  const entries = React.useMemo<DockEntry[]>(() => {
    const list: DockEntry[] = [
      { key: "home", label: "ИБ-Гид — наверх", icon: HomeIcon, onSelect: goHome },
    ]

    for (const item of navItems) {
      const Icon = ICONS[item.href]
      if (!Icon) continue
      list.push({
        key: item.href,
        label: item.title,
        icon: Icon,
        onSelect: () => goTo(item.href),
        active: active === item.href,
      })
    }

    list.push({ key: "divider", separator: true })

    // До гидрации тема неизвестна — рисуем только одну иконку, чтобы
    // серверная разметка и клиентская совпали.
    list.push({
      key: "theme",
      label: "Переключить тему",
      icon: hydrated && resolvedTheme === "dark" ? SunIcon : MoonIcon,
      onSelect: () => setTheme(resolvedTheme === "dark" ? "light" : "dark"),
    })

    return list
  }, [active, goHome, goTo, hydrated, resolvedTheme, setTheme])

  return <MacOsDock entries={entries} progress={progress} onScrub={scrubTo} />
}
