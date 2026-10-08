import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"
import { glossary } from "@/lib/content"

const GROUPS = {
  база: {
    label: "Базовые термины",
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300",
  },
  атаки: {
    label: "Атаки и угрозы",
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  защита: {
    label: "Средства защиты",
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  },
} as const

type GroupKey = keyof typeof GROUPS

/**
 * СЕКЦИЯ «СЛОВАРИК» (#glossary).
 *
 * Новичку мешает не сама информация, а неизвестные термины, поэтому
 * каждый термин раскрывается одной короткой фразой.
 *
 * Раньше термины шли группой на весь экран, и боксы уезжали за правый
 * край — на экране оставался только заголовок и пустое чёрное поле.
 * Теперь всё ужато: карточки мелкие, в четыре колонки, и на первом
 * экране сразу видны десять штук вместе с заголовком. Раздел занимает
 * два экрана и раскрывается вправо, как и весь сайт.
 */
export function Glossary() {
  // Первый экран — «база» и «атаки», второй — «защита».
  const screens: GroupKey[][] = [["база", "атаки"], ["защита"]]

  return (
    <Section id="glossary" label="Словарик" screens={screens.length}>
      <div className="flex h-full w-full gap-8">
        {screens.map((keys, screenIndex) => (
          <div
            key={screenIndex}
            className="flex h-full w-[calc(100vw-3rem)] shrink-0 flex-col justify-center gap-6"
          >
            {/* Заголовок только на первом экране и компактный: он не должен
                съедать половину панели, оставляя пустое поле. */}
            {screenIndex === 0 ? (
              <header className="flex flex-col gap-1.5">
                <Badge
                  variant="outline"
                  className="w-fit font-mono text-[0.7rem] uppercase"
                >
                  05 — Словарик
                </Badge>
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  Что значат все эти сокращения
                </h2>
                <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
                  Коротко и без технического образования. Листайте вправо.
                </p>
              </header>
            ) : null}

            {keys.map((key) => {
              const items = glossary.filter((entry) => entry.category === key)
              const group = GROUPS[key]
              return (
                <div key={key} className="flex flex-col gap-2.5">
                  <Badge
                    variant="outline"
                    className={cn("w-fit font-normal", group.tone)}
                  >
                    {group.label} · {items.length}
                  </Badge>

                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((entry) => (
                      <Card
                        key={entry.term}
                        className="gap-1 border-border/70 bg-card/50 py-2.5 transition-colors hover:border-primary/40"
                      >
                        <CardHeader className="px-3">
                          <CardTitle className="font-mono text-xs">
                            {entry.term}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-3">
                          <CardDescription className="text-xs text-pretty leading-snug text-muted-foreground">
                            {entry.plain}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}

            {screenIndex < screens.length - 1 ? (
              <p className="font-mono text-xs text-muted-foreground">
                {screenIndex + 1} / {screens.length}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  )
}
