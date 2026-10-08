"use client"

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react"

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
  const ref = React.useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion()

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

  if (reduceMotion || speed === 0) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  )
}