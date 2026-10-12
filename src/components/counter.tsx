"use client"

import * as React from "react"

/**
 * СЧЁТЧИК, КОТОРЫЙ ДОЕЗЖАЕТ ДО ЦИФРЫ.
 *
 * Писался вручную под этот сайт и уже стоит в разделе «В цифрах».
 * Вынесен отдельным файлом, потому что те же числа стоят на первом
 * экране, и две копии одного счётчика разъехались бы по настройкам.
 *
 * Почему не компонент Count Up из React Bits: там пружина, а пружина
 * на целых числах проскакивает мимо цели и возвращается — счётчик
 * показывает «22» прежде чем встать на «21». Здесь easeOutCubic: значение
 * только растёт, монотонно, и всегда точно попадает в цель.
 *
 * Числа считаются из содержимого сайта, а не выдуманы, поэтому доезд
 * до значения ничего не обещает сверх того, что уже написано рядом.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number
  prefix?: string
  suffix?: string
  /** Оформление задаёт вызывающий: на первом экране и в полосе разный кегль. */
  className?: string
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
            // Метка времени кадра rAF бывает на пару десятков
            // миллисекунд раньше того момента, когда start сняли через
            // performance.now(). Без нижней границы на первом кадре ease
            // уходил в минус, и счётчик показывал «-1» на двадцати одной.
            const t =
              duration === 0
                ? 1
                : Math.min(1, Math.max(0, (now - start) / duration))
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
      className={className ?? "tabular-nums"}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  )
}