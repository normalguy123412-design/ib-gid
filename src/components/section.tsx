"use client"

import * as React from "react"
import { motion, motionValue } from "motion/react"
import { DecryptedText } from "@/components/decrypted-text"
import { Parallax } from "@/components/parallax"
import { Reveal } from "@/components/reveal"
import { useHorizontalScroll } from "@/components/horizontal-scroll"
import { cn } from "cn"

/**
 * Обёртка секции: якорь для навигации (#concepts, #threats и т.д.),
 * вертикальный отступ и появление контента при прокрутке.
 *
 * В горизонтальном режиме секция — это панель шириной в один или несколько
 * экранов: вертикальной прокрутки внутри нет, листать нужно вправо.
 * Разделы с большим объёмом растягиваются на несколько экранов и
 * раскрываются колонка за колонкой (см. пропус screens).
 *
 * Центрирование сделано на `my-auto`, а не на `justify-center`: при
 * переполнении `justify-center` обрезает верх и до него нельзя
 * доскроллить, а автоматические поля в таком случае просто
 * превращаются в отступ.
 */
export function Section({
  id,
  label,
  screens = 1,
  className,
  contentClassName,
  veil = "default",
  children,
}: {
  id?: string
  /**
   * Крупная подпись на фоне панели.
   *
   * Она живёт внутри панели, а не отдельным слоем, поэтому едет вместе с
   * содержимым сама: при прокрутке название раздела выходит из-за края
   * и уходит в следующий. Никакой синхронизации с прокруткой не нужно —
   * движение обеспечивает общий сдвиг ленты.
   */
  label?: string
  /**
   * Ширина панели в экранах.
   *
   * Раньше вертикальная прокрутка внутри панели закрывала нехватку
   * места, но тогда сайт листался вниз, а это ломало идею: информация
   * должна раскрываться вправо. Теперь панель не прокручивается вниз
   * вовсе, а разделы с большим объёмом занимают несколько экранов по
   * ширине — их колонки просто раскрываются одна за другой.
   */
  screens?: number
  className?: string
  /**
   * Отступы вокруг содержимого — для разделов, которым нужно больше
   * воздуха, чем у остальных. Общие отступы заданы ниже и не меняются:
   * иначе каждый раздел сдвигал бы всю ленту.
   */
  contentClassName?: string
  /**
   * Плотность вуали поверх фоновых нитей.
   *
   * Общая вуаль одна на весь сайт, и текст читается везде одинаково. Но
   * содержание панелей разное: где-то строки мелким шрифтом и таблицы,
   * где-то одно крупное число. Насыщенным разделам фон шумит, а пустым
   * не хватает. Проп сдвигает плотность в ту или другую сторону.
   */
  veil?: "light" | "default" | "strong"
  children?: React.ReactNode
}) {
  return (
    <section
      id={id}
      data-panel=""
      style={{ width: `${screens * 100}vw` }}
      className={cn("relative h-full shrink-0 overflow-hidden", className)}
    >
      {label ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
        >
          {/*
            Подпись раскрывается из случайных символов, когда панель
            доезжает до экрана. Работает при полупрозрачности 5%, потому
            что меняет сами символы, а не затирает заливку — в отличие от
            TechText, которому для эффекта нужен непрозрачный цвет.

            Разрядка раньше была отрицательной — унаследована от обычных
            заголовков, где она делает текст плотнее. На буквах в 16vw
            это давало обратный эффект: соседние буквы наезжали друг на
            друга и слово расплывалось в пятно, а на стыке двух панелей
            сливались уже слова. Теперь разрядка в плюс и кегль меньше.
          */}
          <DecryptedText
            text={label}
            className="font-heading text-[13vw] leading-none font-bold tracking-[0.08em] text-foreground/[0.05]"
          />
        </span>
      ) : null}

      {/*
        Разделение панелей. Раньше здесь стояла рамка `border-r`, и при
        прокрутке её вертикальная линия проходила через весь экран —
        читалась как полоса поверх вёрстки. Теперь края плавно уходят в
        фон градиентом: границы видно, но линия не режет кадр.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
      />

      {/* Вуаль поверх фоновых нитей — см. проп `veil`. */}
      {veil !== "default" ? (
        <div
          aria-hidden
          className={
            "pointer-events-none absolute inset-0 " +
            (veil === "light" ? "bg-veil-light" : "bg-veil-strong")
          }
        />
      ) : null}

      <div
        className={cn(
          "relative h-full w-full px-4 py-10 sm:px-6",
          contentClassName
        )}
      >
        {/* В одну колонку содержимое центрируется по вертикали. В несколько —
            панель занимает всю ширину, а колонки внутри неё раскрывает
            сам раздел: так каждая следующая группа выходит справа. */}
        <Reveal
          className={cn(
            "h-full w-full",
            screens === 1 &&
              "mx-auto flex max-w-6xl flex-col justify-center"
          )}
        >
          {children}
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Насколько прочитан раздел, в котором стоит элемент. 0 — панель ещё
 * въезжает справа, 1 — её левый край дошёл до левого края экрана.
 *
 * Считается от общего прогресса ленты. Диапазон измеряется один раз и
 * дальше пересчитывается только при пересборке трека, а значение берётся
 * прямой подпиской на движок прогресса.
 *
 * Раньше здесь стоял `useTransform` с диапазоном, который менялся после
 * монтирования: полоса оставалась схлопнутой в ноль во всех разделах,
 * и это было видно только на снимке — ни типы, ни линтер не ловят
 * неверное движное значение. Здесь всё считается руками, шаг за шагом.
 */
function usePanelFill(ref: React.RefObject<HTMLElement | null>) {
  const scroll = useHorizontalScroll()
  const fill = React.useMemo(() => motionValue(0), [])

  React.useEffect(() => {
    if (!scroll) return

    // Панель ищем вверх по дереву: элемент правила стоит внутри раздела,
    // а передавать ему ссылку на панель пришлось бы через контекст.
    const panel = ref.current?.closest<HTMLElement>("[data-panel]")
    if (!panel) return

    let start = 0
    let end = 1

    const apply = (value: number) => {
      // Вырожденный диапазон бывает у раздела шириной в экран в начале
      // ленты: делить на ноль нельзя, решаем сравнением.
      if (end - start <= 0) {
        fill.set(value >= end ? 1 : 0)
        return
      }
      const t = (value - start) / (end - start)
      fill.set(t < 0 ? 0 : t > 1 ? 1 : t)
    }

    const measure = () => {
      const maxX = scroll.maxX

      if (maxX <= 0) {
        // Ленте некуда ехать — весь сайт виден целиком, читать нечего.
        start = 0
        end = 1
        return
      }

      // offsetParent панели — сам трек ленты: он помечен relative, поэтому
      // offsetLeft отсчитывается от начала трека, а не от окна.
      const left = panel.offsetLeft
      const width = window.innerWidth

      start = (left - width) / maxX
      end = left / maxX
    }

    measure()
    apply(scroll.progress.get())

    const unsubscribe = scroll.progress.on("change", apply)
    const onResize = () => {
      measure()
      apply(scroll.progress.get())
    }

    window.addEventListener("resize", onResize)
    return () => {
      unsubscribe()
      window.removeEventListener("resize", onResize)
    }
  }, [ref, scroll, fill])

  return fill
}

/**
 * Рубрика раздела как полоса-прогресса.
 *
 * Полоса остаётся: она заполняется по мере того, как панель проезжает
 * экран, и по ней видно, сколько раздела уже прочитано. Это показание
 * прибора, а не украшение.
 *
 * А вот набрана рубрика была как шаблонная плашка: мелким моноширинным,
 * капсом и с разрядкой в 0.2em — и повторена над каждым из одиннадцати
 * заголовков. Моноширинный шрифт уместен на коде и отпечатках, но не на
 * подписи раздела, а капс с разрядкой читается как обвязка, которая
 * появляется независимо от темы страницы.
 *
 * Теперь номер — самостоятельный элемент: он крупнее названия, набран
 * заголовочным шрифтом и выровнен с названием по общей базовой линии.
 * Тире между ними не нужно: разделителем работает сама полоса.
 *
 * Заполнение подписано `aria-hidden`: прогресс и так считывается по
 * самому разделу, а читать вслух линию, которая едет мимо, не нужно.
 */
export function SectionRule({
  label,
  className,
}: {
  label: string
  /**
   * Ширина полосы задаётся внешним контейнером: в разделе, где шапка
   * намеренно стоит в одну строку с заголовком и высоты не хватает,
   * полосу подрезают до нескольких сантиметров.
   */
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const fill = usePanelFill(ref)

  /*
    Строка приходит одним куском — «01 — С чего начать», — а рисуется
    двумя разными по весу частями. Разбор стоит здесь, а не в
    одиннадцати вызывающих местах: формат один на весь сайт, и менять
    его в одном месте дешевле. Придёт строка без номера — уйдёт целиком
    в название, раздел останется читаемым.
  */
  const parts = /^(\d{2})\s+—\s+(.+)$/.exec(label)
  const number = parts?.[1]
  const name = parts?.[2] ?? label

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span ref={ref} className="flex shrink-0 items-baseline gap-2">
        {number ? (
          <span className="font-heading text-base leading-none font-semibold tabular-nums text-foreground/75">
            {number}
          </span>
        ) : null}
        <span className="text-xs leading-none text-muted-foreground">
          {name}
        </span>
      </span>
      {/*
        Минимум ширины обязателен: в словарике правило подрезано, чтобы
        шапка осталась в одну строку, и без минимума линия схлопывалась
        в несколько пикселей — её было видно, что она есть, но прочитать
        заполнение по ней было нельзя.
      */}
      <div aria-hidden className="h-px min-w-10 flex-1 bg-border/50">
        <motion.div
          style={{ scaleX: fill }}
          className="h-full w-full origin-left bg-primary"
        />
      </div>
    </div>
  )
}

/**
 * Заголовок секции: рубрика-полоса (eyebrow), заголовок и описание.
 * `align="center"` используется в секциях, где шапка центрируется.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string
  title: string
  description?: string
  align?: "left" | "center"
}) {
  return (
    // Заголовок слегка «отрывается» от прокрутки — как на референсном сайте.
    <Parallax speed={0.28} className="flex flex-col gap-3">
      <div
        className={cn(
          "flex flex-col gap-3",
          align === "center" ? "items-center text-center" : "max-w-2xl"
        )}
      >
        <SectionRule label={eyebrow} />
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </Parallax>
  )
}