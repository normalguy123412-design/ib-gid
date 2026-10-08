import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  InfoIcon,
  KeyRoundIcon,
  ListChecksIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { Section } from "@/components/section"
import { Parallax } from "@/components/parallax"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/**
 * СЕКЦИЯ «ЧЕК-ЛИСТ» (#checklist).
 *
 * Финальный призыв к действию: три конкретных шага, которые можно выполнить
 * за один вечер, и они закрывают большинство типовых рисков.
 * Наследует композицию финального блока референсного сайта: крупный
 * призыв слева, нумерованные шаги и врезка с пояснением справа.
 */

const STEPS = [
  {
    n: "1",
    title: "Включите вход по двум признакам",
    text: "Почта, банк, GitHub. Лучше приложение-аутентификатор, а не SMS.",
  },
  {
    n: "2",
    title: "Поставьте менеджер паролей",
    text: "Один надёжный пароль на всё, уникальный для каждого сайта.",
  },
  {
    n: "3",
    title: "Сделайте резервную копию",
    text: "Хотя бы фотографий и документов, в отдельном месте и не на том же диске.",
  },
]

export function Checklist() {
  return (
    <Section id="checklist" label="Три действия">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        {/* Основной призыв. */}
        <Parallax speed={0.14} className="flex flex-col items-start gap-5">
          <Badge variant="outline" className="font-mono text-[0.7rem] uppercase">
            09 — Чек-лист
          </Badge>

          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Три действия на сегодня
          </h2>

          <p className="max-w-xl text-base text-pretty text-muted-foreground">
            Всё, что было на сайте выше, сводится к этим трём пунктам. Они не
            требуют специальных знаний и занимают вечер. Начните с почты и банка —
            это закрывает худший сценарий: взлом почты равен взлому всего
            остального.
          </p>

          <Button asChild size="lg" className="group">
            <Link href="#demos">
              Попробовать 2FA прямо сейчас
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>

          <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-3.5" />
            Занимает 15–20 минут · бесплатно
          </p>
        </Parallax>

        {/* Шаги и пояснение. */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium">
                <ListChecksIcon className="size-4 text-primary" />
                Порядок не важен, но полезно
              </div>

              <ol className="flex flex-col gap-3">
                {STEPS.map((step) => (
                  <li
                    key={step.n}
                    className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary font-mono text-xs font-semibold text-primary-foreground">
                      {step.n}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{step.title}</span>
                      <span className="text-xs text-pretty text-muted-foreground">
                        {step.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Врезка-пояснение. */}
          <Card className="border-dashed">
            <CardContent className="flex items-start gap-3 pt-6">
              <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs text-pretty text-muted-foreground">
                Если какой-то пункт вы уже выполнили — отметьте его у себя и
                переходите к следующему. Ни один из трёх шагов не требует
                специального образования, а вместе они закрывают большинство
                типовых рисков для обычного человека.
              </p>
            </CardContent>
          </Card>

          {/* Подсказка про менеджер паролей и 2FA. */}
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <KeyRoundIcon className="size-4 shrink-0 text-primary" />
              <p className="text-xs text-muted-foreground">
                Начните с{" "}
                <Link
                  href="#glossary"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  словарика
                </Link>
                <CheckCircle2Icon className="mx-1.5 inline size-3" />
                — там объяснено, чем 2FA отличается от SMS и зачем нужен хеш.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}