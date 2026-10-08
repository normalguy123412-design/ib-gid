import { CheckIcon } from "lucide-react"
import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { defenseCategories, defenseMechanisms } from "@/lib/content"

/**
 * СЕКЦИЯ «ЗАЩИТА» (#defense).
 *
 * Два блока в один экран:
 * 1) четыре категории методов защиты (физические, криптографические,
 *    программные, организационные);
 * 2) ключевые механизмы — шифрование, вход по нескольким признакам,
 *    слежение, файрвол.
 *
 * Раньше блоки шли один за другим на отдельных экранах, и заголовок
 * «Как защитить себя» оказывался далеко слева — приходилось листать
 * назад, чтобы вспомнить, о чём вообще этот раздел. Теперь всё
 * помещается на одном экране, и заголовок всегда перед глазами.
 */
export function DefenseMethods() {
  return (
    <Section id="defense" label="Защита" screens={1}>
      <div className="flex h-full flex-col justify-center gap-5">
        <header className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className="w-fit font-mono text-[0.7rem] uppercase"
          >
            05 — Защита
          </Badge>
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Как защитить себя
          </h2>
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
            Защита бывает четырёх видов: от воровства вещей, от
            подглядывания в данные, от вирусов и от человеческой ошибки.
            Работает только то, что есть все четыре сразу.
          </p>
        </header>

        {/* Четыре вида защиты. */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Четыре вида защиты
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {defenseCategories.map((category, index) => (
              <Card
                key={category.title}
                className="flex flex-col gap-2 border-border/70 bg-card/50 py-3 transition-colors hover:border-primary/40"
              >
                <CardHeader className="px-3">
                  <div className="flex items-center justify-between">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                      <category.icon className="size-4" />
                    </span>
                    <span className="font-mono text-[0.7rem] text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <CardTitle className="mt-1.5 text-sm leading-tight">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-pretty leading-snug text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3">
                  <ul className="flex flex-col gap-1">
                    {category.examples.map((example) => (
                      <li
                        key={example}
                        className="flex items-start gap-1.5 text-[0.7rem] text-muted-foreground"
                      >
                        <CheckIcon className="mt-0.5 size-3 shrink-0 text-primary" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Ключевые механизмы. */}
        <div className="flex flex-col gap-2.5">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-muted-foreground uppercase">
            Ключевые механизмы
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {defenseMechanisms.map((mechanism) => (
              <Card
                key={mechanism.title}
                className="flex flex-col border-border/70 bg-card/50 py-3"
              >
                <CardHeader className="px-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-muted text-foreground">
                    <mechanism.icon className="size-4" />
                  </span>
                  <CardTitle className="mt-1.5 text-sm leading-tight">
                    {mechanism.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-pretty leading-snug text-muted-foreground">
                    {mechanism.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto border-t-0 bg-transparent px-3 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {mechanism.stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="font-mono text-[0.65rem]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
