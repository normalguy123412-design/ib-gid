"use client"

import * as React from "react"
import { Parallax } from "@/components/parallax"
import { Section } from "@/components/section"

/**
 * ПОЛОСА «В ЦИФРАХ» (#numbers).
 *
 * Числа, которые помогают понять масштаб: сколько терминов расшифровано
 * в словарике, сколько шагов в схеме защиты, сколько знаков в коде 2FA.
 * Значения вычисляются из данных сайта, а не выдуманы, поэтому не вводят
 * в заблуждение.
 *
 * Счётчик доезжает до цели, когда полоса попадает в экран.
 */

type Stat = {
  value: number
  suffix?: string
  prefix?: string
  label: string
}

export function NumbersStrip({ stats }: { stats: Stat[] }) {
  return (
    <Section id="numbers" label="В цифрах">
      <Parallax speed={0.1}>
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Коротко о главном в цифрах
        </h2>
      </Parallax>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-2xl border bg-card/60 p-5"
          >
            <dt className="order-2 text-sm text-pretty text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="order-1">
              <Counter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

/**
 * Счётчик, который анимирует значение при появлении в экран.
 * При prefers-reduced-motion сразу показывает конечное число.
 */
function Counter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number
  prefix?: string
  suffix?: string
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = React.useState(0)
  const done = React.useRef(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    // При включённом «меньше движения» длительность нулевая: значение
    // всё равно выставится, но внутри rAF-колбэка, а не синхронно.
    const duration = reduceMotion ? 0 : 1100

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || done.current) continue
          done.current = true
          observer.disconnect()

          const start = performance.now()

          const tick = (now: number) => {
            const t =
              duration === 0 ? 1 : Math.min(1, (now - start) / duration)
            // Плавное замедление к концу, как у easeOutCubic.
            const eased = 1 - Math.pow(1 - t, 3)
            setDisplay(Math.round(value * eased))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      // 0.6 — счётчик стартует, когда элемент на 60% виден.
      { threshold: 0.6 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  return (
    <span
      ref={ref}
      className="font-heading text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl"
    >
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
