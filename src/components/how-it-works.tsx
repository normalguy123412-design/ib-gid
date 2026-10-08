"use client"

import {
  BadgeCheckIcon,
  FileKeyIcon,
  KeyRoundIcon,
  RadarIcon,
  SirenIcon,
} from "lucide-react"
import { Section } from "@/components/section"
import { Badge } from "@/components/ui/badge"

/**
 * СЕКЦИЯ «КАК ЭТО ЗАЩИЩЕНО» (#how).
 *
 * Пять шагов, через которые проходит почти любой запрос: проверка,
 * ограничение, шифрование, следение, восстановление.
 *
 * Раньше здесь была липкая схема с подсветкой текущего шага и шаги были
 * вынесены на соседний экран. Оба решения отпали: схема работала только
 * при прокрутке вниз, которой на сайте больше нет, а заголовок из-за
 * соседнего экрана оказывался далеко. Теперь это один экран — заголовок
 * и все пять шагов видны сразу.
 */

const STEPS: {
  n: string
  title: string
  text: string
  icon: React.ElementType
}[] = [
  {
    n: "01",
    title: "Проверка",
    text: "Система выясняет, что перед ней именно вы. Один пароль легко украсть, поэтому добавляют второй признак: код из телефона, отпечаток или ключ.",
    icon: KeyRoundIcon,
  },
  {
    n: "02",
    title: "Ограничение",
    text: "Даже после входа человеку дают только нужное: посмотреть свой заказ — да, выгрузить базу клиентов — нет.",
    icon: BadgeCheckIcon,
  },
  {
    n: "03",
    title: "Защита канала",
    text: "Данные шифруются прямо во время передачи. Перехватить можно, прочитать — уже нет. Это замок в адресной строке.",
    icon: FileKeyIcon,
  },
  {
    n: "04",
    title: "Слежение",
    text: "Система записывает, кто и что делал. Ночной вход со скачиванием архива заметят по журналу.",
    icon: RadarIcon,
  },
  {
    n: "05",
    title: "Восстановление",
    text: "Если данные испортили, их возвращают из резервной копии. Без неё восстановление невозможно.",
    icon: SirenIcon,
  },
]

export function HowItWorks() {
  return (
    <Section id="how" label="Как это работает" screens={1}>
      <div className="flex h-full flex-col justify-center gap-5">
        <header className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className="w-fit font-mono text-[0.7rem] uppercase"
          >
            06 — Как это работает
          </Badge>
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Что происходит между вами и сервером
          </h2>
          <p className="max-w-3xl text-sm text-pretty text-muted-foreground">
            Пять шагов, через которые проходит почти любой запрос. Ни один
            не спасает в одиночку — но вместе они закрывают почти всё.
          </p>
        </header>

        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-card/50 p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-muted font-mono text-xs font-semibold text-muted-foreground">
                  {step.n}
                </span>
                <step.icon className="size-4 text-primary" />
              </div>

              <h3 className="font-heading text-sm font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-xs text-pretty leading-snug text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
