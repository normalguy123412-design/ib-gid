import { Badge } from "@/components/ui/badge"
import { Parallax } from "@/components/parallax"
import { Reveal } from "@/components/reveal"
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
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      style={{ width: `${screens * 100}vw` }}
      className={cn("relative h-full shrink-0 overflow-hidden", className)}
    >
      {label ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
        >
          <span className="font-heading text-[16vw] leading-none font-bold tracking-tight text-foreground/[0.055]">
            {label}
          </span>
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

      <div className="relative h-full w-full px-4 py-10 sm:px-6">
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
 * Заголовок секции: рубрика (eyebrow), заголовок и описание.
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
        <Badge variant="outline" className="font-mono text-[0.7rem] uppercase">
          {eyebrow}
        </Badge>
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