import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"
import { glossary } from "@/lib/content"

/**
 * Цвет рамки по группе. Отдельные плашки-подзаголовки съедали высоту,
 * поэтому группа обозначена цветом рамки, а расшифровка — легендой
 * в одну строку.
 */
const TONES = {
  база: "border-sky-500/30",
  атаки: "border-destructive/30",
  защита: "border-emerald-500/30",
} as const

const LEGEND: { key: keyof typeof TONES; label: string }[] = [
  { key: "база", label: "база" },
  { key: "атаки", label: "атаки" },
  { key: "защита", label: "защита" },
]

/**
 * СЕКЦИЯ «СЛОВАРИК» (#glossary).
 *
 * Все термины умещаются в один экран: три ряда квадратов по семь штук.
 * Раньше словарик занимал два экрана, и до второй половины приходилось
 * доезжать вручную; теперь это один взгляд — вся справочная таблица
 * видна целиком.
 *
 * Квадраты вместо прямоугольников — по той же причине, что и три ряда:
 * одинаковые по высоте ячейки позволяют ужать сетку и уместить всё
 * без вертикальной прокрутки, которой на сайте теперь нет.
 */
export function Glossary() {
  return (
    <Section id="glossary" label="Словарик" screens={1}>
      <div className="flex h-full flex-col justify-center gap-4">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className="w-fit font-mono text-[0.7rem] uppercase"
            >
              03 — Словарик
            </Badge>
            <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Что значат все эти сокращения
            </h2>
          </div>

          {/* Легенда групп: рамка карточки показывает, к чему относится термин. */}
          <ul className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {LEGEND.map((item) => (
              <li key={item.key} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-sm border", TONES[item.key])} />
                {item.label}
              </li>
            ))}
          </ul>
        </header>

        {/* Три ряда по семь квадратов — вся таблица сразу на экране. */}
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-7">
          {glossary.map((entry) => (
            <Card
              key={entry.term}
              className={cn(
                "aspect-square gap-1 bg-card/50 py-2 transition-colors hover:bg-card",
                TONES[entry.category]
              )}
            >
              <CardHeader className="px-2.5">
                <CardTitle className="font-mono text-[0.7rem] leading-tight">
                  {entry.term}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2.5">
                <CardDescription className="text-[0.7rem] leading-snug text-pretty text-muted-foreground">
                  {entry.plain}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}
