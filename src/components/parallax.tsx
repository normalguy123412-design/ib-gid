"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"
import { useHorizontalScroll } from "@/components/horizontal-scroll"

/**
 * ПАРАЛЛАКС ПРИ ПРОКРУТКЕ.
 *
 * Элемент смещается вертикально медленнее (или быстрее) прокрутки страницы,
 * поэтому заголовки и подписи «отрываются» от сетки и создают глубину.
 * На референсном сайте то же сделано через атрибут data-parallax.
 *
 * Скорость задаётся значением speed:
 *   0.35 — двигается вместе с текстом (мягко),
 *   -0.2 — двигается навстречу прокрутке,
 *   0    — без смещения.
 *
 * Уважает prefers-reduced-motion и не анимирует, пока элемент вне экрана:
 * useScroll считает прогресс только пока цель видна.
 *
 * В горизонтальном режиме эффект отключён. Лента едет трансформом по X
 * при неподвижной прокрутке по горизонтали, поэтому вертикальный
 * scrollYProgress у панелей всегда ноль и параллакс просто не работает.
 * Глубину там создаёт появление блоков (см. Reveal).
 *
 * Сам подсчёт прогресса вынесен в отдельный компонент. Раньше useScroll
 * вызывался здесь же, а ref подставлялся в motion.div только когда
 * параллакс вообще нужен. В горизонтальном режиме ref оставался
 * неприкреплённым, и motion бросал «Target ref is defined but not
 * hydrated» прямо во время гидратации — замер ширины ленты срывался, и
 * первые пару сотен миллисекунд страница вообще не прокручивалась.
 */
export function Parallax({
  children,
  speed = 0.35,
  className,
}: {
  children: React.ReactNode
  /** Доля смещения относительно прокрутки. */
  speed?: number
  className?: string
}) {
  const reduceMotion = useReducedMotion()
  const horizontal = useHorizontalScroll()

  if (horizontal || reduceMotion || speed === 0) {
    return <div className={className}>{children}</div>
  }

  return (
    <Offset speed={speed} className={className}>
      {children}
    </Offset>
  )
}

/** Смещение по вертикали. Компонент существует только ради общего ref. */
function Offset({
  children,
  speed,
  className,
}: {
  children: React.ReactNode
  speed: number
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement | null>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Пружина сглаживает движение: без неё текст дёргается на треках.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  })

  // Диапазон смещения: speed * 120px в обе стороны от нейтрали.
  const y = useTransform(smooth, [0, 1], [speed * 120, speed * -120])

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}