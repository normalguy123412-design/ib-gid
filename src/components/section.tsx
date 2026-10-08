import { Badge } from "@/components/ui/badge"
import { Parallax } from "@/components/parallax"
import { Reveal } from "@/components/reveal"
import { cn } from "cn"

/**
 * Обёртка секции: якорь для навигации (#concepts, #threats и т.д.),
 * вертикальный отступ и появление контента при прокрутке.
 *
 * В горизонтальном режиме секция — это панель шириной в экран: она не
 * растёт по вертикали, а прокручивается внутри себя, если контента
 * больше одного экрана. Внутренние поля и `overflow-y-auto` в связке с
 * обычным поведением overscroll дают то, что нужно: колесо сначала
 * дочитывает панель, а потом, на её краю, перехватывает страницу и
 * двигает ленту дальше.
 *
 * Полоса прокрутки внутри панели спрятана: иначе у каждой из
 * четырнадцати панелей торчал бы свой системный скроллбар. Сама
 * прокрутка работает — колесо и свайп по панели.
 *
 * Центрирование сделано на `my-auto`, а не на `justify-center`: при
 * переполнении `justify-center` обрезает верх панели и до него
 * нельзя доскроллить, а автоматические поля в таком случае просто
 * превращаются в отступ.
 */
export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative h-full w-screen shrink-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
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

      <div className="flex min-h-full w-full flex-col px-4 py-10 sm:px-6">
        <div className="mx-auto my-auto w-full max-w-6xl">
          <Reveal>{children}</Reveal>
        </div>
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