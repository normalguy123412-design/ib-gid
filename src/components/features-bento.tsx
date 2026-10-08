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
import { threatClassification, threats, type Severity } from "@/lib/content"

const severityStyles: Record<Severity, string> = {
  Критическая: "bg-destructive/10 text-destructive",
  Высокая: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Средняя: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
}

/**
 * СЕКЦИЯ «УГРОЗЫ» (#threats).
 *
 * Бенто-сетка карточек с типами угроз: у каждой свой цветовой индикатор
 * уровня опасности, ожидаемый ущерб и базовые контрмеры.
 * Внизу — классификация угроз по источнику и характеру воздействия.
 */
export function FeaturesBento() {
  return (
    <Section id="threats" label="Угрозы">
      <SectionHeader
        eyebrow="03 — Угрозы"
        title="От чего стоит беречься"
        description="Пять ситуаций ниже закрывают почти все реальные случаи. Для каждой написано, что именно может пропасть и что делать, чтобы этого не случилось."
      />

      {/* Карточки угроз. Вымогатели выделены: широкий блок с подсветкой. */}
      <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-2 lg:grid-cols-3">
        {threats.map((threat) => (
          <Card
            key={threat.title}
            className={cn(
              "group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
              threat.featured && "lg:col-span-2"
            )}
          >
            {threat.featured ? (
              <div
                aria-hidden
                className="absolute -top-16 -right-16 size-48 rounded-full bg-destructive/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
              />
            ) : null}

            <CardHeader>
              <span className="mb-1 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <threat.icon className="size-5" />
              </span>
              <CardTitle className="pr-20">{threat.title}</CardTitle>
              <CardDescription className="text-pretty">
                {threat.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-auto flex flex-col gap-3">
              <Badge
                className={cn(
                  "w-fit",
                  severityStyles[threat.severity]
                )}
              >
                Опасность: {threat.severity}
              </Badge>
              <dl className="grid gap-2 border-t pt-3 text-xs">
                <div className="flex flex-col gap-0.5">
                  <dt className="font-medium">Ущерб</dt>
                  <dd className="text-muted-foreground">{threat.impact}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="font-medium">Защита</dt>
                  <dd className="text-muted-foreground">{threat.defense}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}

        {/* Пояснение: внешние/внутренние и активные/пассивные угрозы. */}
        <Card className="flex flex-col gap-4 md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Классификация угроз</CardTitle>
            <CardDescription>
              Любую угрозу можно описать по двум осям — источнику и характеру
              воздействия.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {threatClassification.map((group) => (
              <div
                key={group.label}
                className="rounded-xl border bg-muted/40 p-4"
              >
                <p className="mb-3 font-mono text-xs uppercase text-muted-foreground">
                  {group.label}
                </p>
                <ul className="flex flex-col gap-3">
                  {group.items.map((item) => (
                    <li key={item.name} className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-pretty text-muted-foreground">
                        {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}