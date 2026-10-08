import { CheckIcon } from "lucide-react"
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
import { defenseCategories, defenseMechanisms } from "@/lib/content"

/**
 * СЕКЦИЯ «ЗАЩИТА» (#defense).
 *
 * Состоит из трёх блоков:
 * 1) четыре категории методов защиты (физические, криптографические,
 *    программные, организационные);
 * 2) ключевые механизмы — шифрование, аутентификация, мониторинг, firewall;
 * 3) фреймворки и базы знаний (NIST, OWASP, MITRE ATT&CK, CISA).
 *
 * Раньше блоки шли друг под другом, и раздел не помещался в экран —
 * его приходилось дочитывать прокруткой вниз. Теперь каждый блок
 * занимает свой экран по ширине: заголовок, потом категории, потом
 * механизмы, потом фреймворки. Листается только вправо.
 */
export function DefenseMethods() {
  return (
    <Section id="defense" label="Защита" screens={3}>
      <div className="flex h-full w-full gap-10">
        <div className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center">
          <SectionHeader
            eyebrow="04 — Защита"
            title="Как защитить себя"
            description="Защита бывает четырёх видов: от воровства вещей, от подглядывания в данные, от вирусов и от человеческой ошибки. Работает только то, что есть все четыре сразу."
          />
        </div>

        {/* Категории методов защиты. */}
        <div className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center gap-5">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            Четыре вида защиты
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        {/* Ключевые механизмы защиты. */}
        <div className="flex h-full w-[calc(100vw-3rem)] shrink-0 flex-col justify-center gap-5">
          <h3 className="font-heading text-2xl font-semibold tracking-tight">
            Ключевые механизмы защиты
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </Section>
  )
}
