import { Section, SectionHeader } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "cn"
import { glossary } from "@/lib/content"

const GROUPS = {
  база: { label: "Базовые термины", tone: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300" },
  атаки: {
    label: "Атаки и угрозы",
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  защита: {
    label: "Средства защиты",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
} as const

/**
 * СЕКЦИЯ «СЛОВАРИК» (#glossary).
 *
 * Расшифровка сокращений простым языком. Новичку обычно мешает не сама
 * информация, а неизвестные термины, поэтому здесь каждое сокращение
 * раскрывается одной фразой и группируется по смыслу.
 *
 * Терминов 21, а экран один — в вертикальном виде список уходил вниз и
 * раздел приходилось дочитывать отдельной прокруткой. Поэтому панель
 * занимает четыре экрана по ширине: первый отдан заголовку и группе
 * «База», дальше идут «Атаки» и «Средства защиты». Листается только
 * вправо, по вертикали ничего не прокручивается.
 */
export function Glossary() {
  const groups = Object.keys(GROUPS) as (keyof typeof GROUPS)[]

  return (
    <Section id="glossary" label="Словарик" screens={4}>
      {/* Первый экран: заголовок и начало списка. */}
      <div className="flex h-full w-full gap-10">
        <div className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center">
          <SectionHeader
            eyebrow="05 — Словарик"
            title="Что значат все эти сокращения"
            description="Словарик, к которому можно вернуться в любой момент. Каждый термин объяснён так, чтобы было понятно без технического образования."
          />
        </div>

        {/* Дальше — по экрану на группу. */}
        {groups.map((key, index) => {
          const items = glossary.filter((entry) => entry.category === key)
          const group = GROUPS[key]
          return (
            <div
              key={key}
              className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center gap-5"
            >
              <Badge variant="outline" className={cn("w-fit font-normal", group.tone)}>
                {group.label} · {items.length}
              </Badge>

              <div className="grid gap-4 lg:grid-cols-2">
                {items.map((entry) => (
                  <Card key={entry.term} className="h-full">
                    <CardHeader>
                      <CardTitle className="font-mono text-sm">
                        {entry.term}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-pretty">
                        {entry.plain}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Номер колонки — видно, что список ещё не кончился. */}
              <p className="font-mono text-xs text-muted-foreground">
                {index + 2} / {groups.length + 1}
              </p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}