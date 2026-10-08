import Link from "next/link"
import { ArrowUpRightIcon, CheckIcon } from "lucide-react"
import { Section, SectionHeader } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { defenseCategories, defenseMechanisms, frameworks } from "@/lib/content"

/**
 * СЕКЦИЯ «ЗАЩИТА» (#defense).
 *
 * Состоит из трёх блоков:
 * 1) четыре категории методов защиты (физические, криптографические,
 *    программные, организационные);
 * 2) ключевые механизмы — шифрование, аутентификация, мониторинг, firewall;
 * 3) фреймворки и базы знаний (NIST, OWASP, MITRE ATT&CK, CISA).
 */
export function DefenseMethods() {
  return (
    <Section id="defense" label="Защита">
      <SectionHeader
        eyebrow="04 — Защита"
        title="Как защитить себя"
        description="Защита бывает четырёх видов: от воровства вещей, от подглядывания в данные, от вирусов и от человеческой ошибки. Работает только то, что есть все четыре сразу."
      />

      {/* Категории методов защиты. */}
      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {defenseCategories.map((category, index) => (
          <Card
            key={category.title}
            className="group flex transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader>
              <div className="mb-1 flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <category.icon className="size-5" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  0{index + 1}
                </span>
              </div>
              <CardTitle>{category.title}</CardTitle>
              <CardDescription className="text-pretty">
                {category.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2">
                {category.examples.map((example) => (
                  <li
                    key={example}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    {example}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            Ключевые механизмы защиты
          </h3>
          <p className="max-w-md text-sm text-pretty text-muted-foreground">
            Технологии, которые встречаются в каждом работающем проекте
            безопасности.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {defenseMechanisms.map((mechanism) => (
            <Card key={mechanism.title}>
              <CardHeader>
                <span className="mb-1 grid size-11 place-items-center rounded-xl bg-muted text-foreground">
                  <mechanism.icon className="size-5" />
                </span>
                <CardTitle>{mechanism.title}</CardTitle>
                <CardDescription className="text-pretty">
                  {mechanism.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t-0 bg-transparent pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {mechanism.stack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="font-mono">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="font-heading text-2xl font-semibold tracking-tight">
          Фреймворки и базы знаний
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {frameworks.map((framework) => (
            <Card
              key={framework.title}
              className="group relative overflow-hidden"
            >
              <CardHeader>
                <span className="mb-1 grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                  <framework.icon className="size-4.5" />
                </span>
                <CardTitle className="text-sm">{framework.title}</CardTitle>
                <CardDescription className="text-xs text-pretty">
                  {framework.text}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t-0 bg-transparent pt-0">
                <Link
                  href={framework.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Открыть
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}