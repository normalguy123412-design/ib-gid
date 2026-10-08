import { Badge } from "@/components/ui/badge"
import { Reveal } from "@/components/reveal"
import { cn } from "cn"

/**
 * Обёртка секции: якорь для навигации (#concepts, #threats и т.д.),
 * вертикальный отступ и появление контента при прокрутке.
 *
 * Небольшой `scroll-mt-4` нужен, чтобы при переходе по якорю заголовок
 * не прилипал к самому краю окна: верхней фиксированной панели у сайта нет.
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
      className={cn("scroll-mt-4 border-b py-16 sm:py-24", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>{children}</Reveal>
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
  )
}