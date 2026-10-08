import { QuoteIcon, ShieldPlusIcon } from "lucide-react"
import { Section, SectionHeader } from "@/components/section"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ciaTriad } from "@/lib/content"

/**
 * СЕКЦИЯ «ПОНЯТИЯ» (#concepts).
 *
 * Определение информационной безопасности и три ключевых свойства защиты —
 * триада CIA: Конфиденциальность, Целостность, Доступность.
 */
export function CoreFeatures() {
  return (
    <Section id="concepts" label="Понятия">
      <SectionHeader
        eyebrow="02 — Основные понятия"
        title="Что такое информационная безопасность"
        description="Если совсем просто: это всё, что помогает вашим данным оставаться вашими — паролям, переписке, фотографиям и деньгам. Таких требований всего три, и они перечислены ниже."
      />

      {/* Три карточки триады CIA. */}
      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3">
        {ciaTriad.map((item) => (
          <Card
            key={item.title}
            className="group h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader>
              <span className="mb-1 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <item.icon className="size-5" />
              </span>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription className="font-mono text-xs">
                {item.latin}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-pretty text-muted-foreground">
                {item.description}
              </p>
              <ul className="flex flex-col gap-1.5 border-t pt-4">
                {item.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <ShieldPlusIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Вывод: трёх свойств мало, нужна «подушка» из нескольких защит. */}
      <Card className="mt-4">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <QuoteIcon className="size-6 shrink-0 text-primary" />
          <div className="flex flex-col gap-2">
            <p className="font-heading text-lg font-medium">
              Одна защита не спасает — помогает несколько сразу
            </p>
            <p className="max-w-3xl text-pretty text-muted-foreground">
              Три свойства из триады — это рамка, а не готовое решение. На
              практике информацию защищают сразу с нескольких сторон: шифруют,
              просят код при входе, следят за подозрительным и хранят резервную
              копию. Если одну из этих защит обойдут, остальные ещё держат.
            </p>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}