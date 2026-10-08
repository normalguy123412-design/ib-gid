import Link from "next/link"
import { BookOpenIcon, ExternalLinkIcon, TargetIcon, UserIcon } from "lucide-react"
import { Section } from "@/components/section"
import { Parallax } from "@/components/parallax"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

/**
 * СЕКЦИЯ «О ПРОЕКТЕ» (#about).
 *
 * Оформление учебной работы: цель, задачи, автор и источники.
 * Задачи перечислены в том же порядке, в котором разделы идут на сайте,
 * поэтому работа выглядит как результат, а не как набор страниц.
 */

/** Цель работы — формулировка автора проекта. */
const GOAL =
  "Узнать, что такое информационная безопасность, и научиться защищать себя"

/** Задачи проекта. */
const TASKS = [
  {
    n: "1",
    text: "Разобраться, какие свойства должна иметь любая защищённая информация.",
  },
  {
    n: "2",
    text: "Изучить основные типы угроз и понять, что именно может пропасть в каждом случае.",
  },
  {
    n: "3",
    text: "Систематизировать способы защиты: что помогает, а что нет.",
  },
  {
    n: "4",
    text: "Составить памятку с конкретными действиями, которые может выполнить любой человек.",
  },
]

/** Источники, использованные при подготовке. */
const SOURCES = [
  { title: "NIST Cybersecurity Framework", href: "https://www.nist.gov/cyberframework" },
  { title: "OWASP Top 10", href: "https://owasp.org/www-project-top-ten/" },
  { title: "MITRE ATT&CK", href: "https://attack.mitre.org/" },
  { title: "CISA Secure Our World", href: "https://www.cisa.gov/secure-our-world" },
]

export function ProjectGoal() {
  return (
    <Section id="about">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
        {/* Цель и задачи. */}
        <div className="flex flex-col gap-6">
          <Parallax speed={0.14} className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit gap-1.5 font-normal">
              <TargetIcon className="size-3.5" />
              О проекте
            </Badge>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Цель и задачи работы
            </h2>
          </Parallax>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Цель работы
              </p>
              <p className="mt-2 font-heading text-lg font-medium text-pretty">
                {GOAL}
              </p>
            </CardContent>
          </Card>

          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Задачи
            </p>
            <ol className="flex flex-col gap-2.5">
              {TASKS.map((task, i) => (
                <li key={task.n}>
                  <Parallax speed={0.12 - i * 0.04}>
                    <div className="flex items-start gap-3 rounded-xl border bg-card/50 p-4">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary font-mono text-xs font-semibold text-primary-foreground">
                        {task.n}
                      </span>
                      <p className="text-pretty text-sm text-muted-foreground">
                        {task.text}
                      </p>
                    </div>
                  </Parallax>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Автор и источники. */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <UserIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Автор работы</p>
                {/* Заполните перед сдачей. */}
                <p className="text-xs text-muted-foreground">
                  Фамилия Имя, класс
                </p>
                <p className="text-xs text-muted-foreground">
                  Учебный год: 2025–2026
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <BookOpenIcon className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Источники</p>
                <ul className="flex flex-col gap-1.5">
                  {SOURCES.map((source) => (
                    <li key={source.href}>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                      >
                        {source.title}
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="pt-6">
              <p className="text-xs text-pretty text-muted-foreground">
                Все схемы, иконки и графика нарисованы средствами CSS и SVG.
                Внешние изображения не используются.
              </p>
              <Link
                href="#start"
                className="mt-3 inline-block text-xs font-medium text-primary underline underline-offset-4"
              >
                Перейти к содержанию
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}