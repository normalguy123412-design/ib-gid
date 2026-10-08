import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"
import { threatClassification, threats, type Severity } from "@/lib/content"

const severityStyles: Record<Severity, string> = {
  Критическая: "bg-destructive/10 text-destructive",
  Высокая: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Средняя: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
}

/**
 * СЕКЦИЯ «УГРОЗЫ» (#threats).
 *
 * Пять типов угроз с индикатором опасности, ожидаемым ущербом и
 * защитой — плюс короткая классификация по источнику и характеру.
 *
 * Раздел пережат до одного экрана: раньше пять карточек и блок
 * классификации шли друг под другом и требовали прокрутки вниз, которой
 * на сайте больше нет. Теперь карточки стоят в один ряд, описания
 * сокращены, а классификация свёрнута в две короткие строки.
 */
export function FeaturesBento() {
  return (
    <Section id="threats" label="Угрозы" screens={1}>
      <div className="flex h-full flex-col justify-center gap-5">
        <header className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className="w-fit font-mono text-[0.7rem] uppercase"
          >
            04 — Угрозы
          </Badge>
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            От чего стоит беречься
          </h2>
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
            Пять ситуаций закрывают почти все реальные случаи. Для каждой —
            что может пропасть и что делать.
          </p>
        </header>

        {/* Пять карточек в один ряд. */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {threats.map((threat) => (
            <Card
              key={threat.title}
              className="flex flex-col gap-2 border-border/70 bg-card/50 py-3 transition-colors hover:border-primary/40"
            >
              <CardHeader className="px-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <threat.icon className="size-4" />
                </span>
                <CardTitle className="mt-1.5 text-sm leading-tight">
                  {threat.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-2 px-3">
                <CardDescription className="text-xs text-pretty leading-snug text-muted-foreground">
                  {threat.description}
                </CardDescription>

                <Badge
                  className={cn("w-fit", severityStyles[threat.severity])}
                >
                  {threat.severity}
                </Badge>

                <dl className="grid gap-1 border-t pt-2 text-[0.7rem]">
                  <div className="flex flex-col">
                    <dt className="font-medium">Ущерб</dt>
                    <dd className="text-muted-foreground">{threat.impact}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-medium">Защита</dt>
                    <dd className="text-muted-foreground">{threat.defense}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Классификация — двумя короткими строками, без карточек. */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
          {threatClassification.flatMap((group) =>
            group.items.map((item) => (
              <span key={item.name} className="flex items-baseline gap-1.5">
                <span className="font-medium text-foreground">{item.name}</span>
                {item.text}
              </span>
            ))
          )}
        </div>
      </div>
    </Section>
  )
}
