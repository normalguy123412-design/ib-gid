"use client"

import * as React from "react"
import {
  motion,
  useInView,
  useReducedMotion,
  type Transition,
  type Variant,
} from "motion/react"

/** Плавное замедление в конце — стандарт для «появления» контента. */
const EASE: Transition["ease"] = [0.22, 1, 0.36, 1]

/** Общие варианты: скрытое состояние и конечное. */
function buildVariants(y: number, reduceMotion: boolean | null) {
  return {
    hidden: { opacity: 0, y: reduceMotion ? 0 : y },
    visible: { opacity: 1, y: 0 },
  } satisfies { hidden: Variant; visible: Variant }
}

export type RevealProps = {
  children: React.ReactNode
  className?: string
  /** Задержка в секундах — используется для каскада внутри группы. */
  delay?: number
  /** Насколько элемент смещён вниз до появления. */
  y?: number
  /** Анимировать только при первом попадании в экран. */
  once?: boolean
  /** Доля элемента, которая должна быть видна для запуска анимации (0–1). */
  amount?: number
}

/**
 * Появление контента при прокрутке (Framer Motion).
 *
 * Оборачивает любой блок: пока он не попал во вьюпорт — прозрачный и сдвинут,
 * после появления — плавно проявляется. Уважает системную настройку
 * «уменьшить движение»: в этом случае анимация отключается.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  once = true,
  amount = 0.15,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const inView = useInView(ref, { once, amount })
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      // data-reveal нужен для <noscript>-стиля в layout: без JS элемент
      // остался бы навсегда прозрачным.
      data-reveal=""
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={buildVariants(y, reduceMotion)}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.55, delay, ease: EASE }
      }
    >
      {children}
    </motion.div>
  )
}

export type EnterProps = {
  children: React.ReactNode
  className?: string
  /** Позиция в каскаде: 0, 1, 2… Каждый следующий шаг стартует позже. */
  index?: number
  /** Шаг задержки между элементами каскада. */
  step?: number
  y?: number
}

/**
 * Появление контента сразу при монтировании (без ожидания прокрутки).
 * Используется в hero-секции, где анимация стартует сразу после загрузки.
 */
export function Enter({
  children,
  className,
  index = 0,
  step = 0.08,
  y = 18,
}: EnterProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={buildVariants(y, reduceMotion)}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.6, delay: 0.1 + index * step, ease: EASE }
      }
    >
      {children}
    </motion.div>
  )
}