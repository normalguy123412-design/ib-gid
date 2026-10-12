"use client"

import * as React from "react"

/**
 * DECRYPTED TEXT — надпись собирается из случайных символов.
 *
 * Взято из React Bits и сильно урезано. Оригинал умеет пять режимов:
 * по наведению, по клику, с реверсом, с раскрытием от края или от
 * центра. Здесь нужен ровно один — «раскрывается слева направо, когда
 * панель доехала до экрана», — поэтому и клик, и ховер, и реверс
 * вырезаны вместе с их состояниями. Для фоновых подписей они всё равно
 * не сработали бы: подписи помечены `pointer-events-none`, чтобы не
 * мешать прокрутке.
 *
 * Алфавит — русский, а не латинский, как в оригинале. Подписи разделов
 * написаны по-русски, и подстановка latin-символов выглядела бы не
 * «шифром», а опечаткой.
 *
 * До гидратации и при выключенном «уменьшить движение» показывается
 * обычный текст: надпись декоративная, и мигать символами без причины
 * незачем.
 */
const GLYPHS =
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789!@#$%&*<>{}[]/\\=+"

export function DecryptedText({
  text,
  /** Задержка между раскрытием следующей буквы, мс. */
  speed = 70,
  className,
}: {
  text: string
  speed?: number
  className?: string
}) {
  const chars = React.useMemo(() => Array.from(text), [text])
  const [shown, setShown] = React.useState(text)
  const ref = React.useRef<HTMLSpanElement | null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    // Каждая подпись раскрывается один раз: панель едет мимо экрана
    // туда-обратно, и повторять эффект при каждом проходе было бы
    // раздражающе.
    let done = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const scramble = (revealed: number) =>
      chars
        .map((char, i) => {
          if (char === " ") return " "
          if (i < revealed) return char
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join("")

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return
        done = true
        observer.disconnect()

        let revealed = 0
        setShown(scramble(revealed))

        const step = () => {
          revealed += 1
          setShown(scramble(revealed))
          if (revealed < chars.length) timer = setTimeout(step, speed)
        }
        timer = setTimeout(step, speed)
      },
      // Порог низкий: подпись занимает всю панель и на краю экрана
      // перекрывается лентой почти целиком.
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [chars, speed])

  return (
    <span ref={ref} className={className} aria-hidden>
      {shown}
    </span>
  )
}