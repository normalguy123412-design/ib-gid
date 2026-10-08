import { Section, SectionHeader } from "@/components/section"
import { Parallax } from "@/components/parallax"
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
 */
export function Glossary() {
  return (
    <Section id="glossary" label="Словарик">
      <SectionHeader
        eyebrow="05 — Словарик"
        title="Что значат все эти сокращения"
        description="Словарик, к которому можно вернуться в любой момент. Каждый термин объяснён так, чтобы было понятно без технического образования."
      />

      <div className="mt-10 flex flex-col gap-10 sm:mt-14">
        {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((key, gi) => {
          const items = glossary.filter((entry) => entry.category === key)
          const group = GROUPS[key]
          return (
            <div key={key}>
              <Parallax speed={0.16 - gi * 0.06}>
                <Badge
                  variant="outline"
                  className={cn("mb-4 font-normal", group.tone)}
                >
                  {group.label} · {items.length}
                </Badge>
              </Parallax>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            </div>
          )
        })}
      </div>
    </Section>
  )
}