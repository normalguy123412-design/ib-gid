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
        "h-full w-screen shrink-0 overflow-y-auto border-r",
        className
      )}
    >
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