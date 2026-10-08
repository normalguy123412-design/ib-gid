"use client"

import * as React from "react"
import {
  BadgeCheckIcon,
  EyeIcon,
  FileKeyIcon,
  KeyRoundIcon,
  RadarIcon,
  SirenIcon,
} from "lucide-react"
import { Section, SectionHeader } from "@/components/section"

/**
 * СЕКЦИЯ «КАК ЭТО ЗАЩИЩЕНО» (#how).
 *
 * Слева — схема пути запроса, справа — пять пронумерованных шагов:
 * как запрос проходит через защиту.
 *
 * Раньше схема была липкой, а активный шаг подсвечивался по мере
 * вертикальной прокрутки. Теперь сайт листается только вправо, и такая
 * связка стала бессмысленной: прокручивать внутри раздела нельзя. Поэтому
 * схема занимает свой экран, а шаги вынесены в соседний и показываются
 * сразу все пять.
 *
 * Схема нарисована инлайновым SVG без внешних картинок.
 */

type StepId = "check" | "limit" | "encrypt" | "watch" | "recover"

const STEPS: {
  id: StepId
  n: string
  title: string
  text: string
  icon: React.ElementType
}[] = [
  {
    id: "check",
    n: "01",
    title: "Проверка",
    text: "Система выясняет, что перед ней именно вы. Один пароль легко украсть, поэтому добавляют второй признак: код из телефона, отпечаток или ключ.",
    icon: KeyRoundIcon,
  },
  {
    id: "limit",
    n: "02",
    title: "Ограничение",
    text: "Даже после входа человеку дают только нужное: посмотреть свой заказ — да, выгрузить базу клиентов — нет. Взломанный пароль здесь останавливается.",
    icon: BadgeCheckIcon,
  },
  {
    id: "encrypt",
    n: "03",
    title: "Защита канала",
    text: "Данные шифруются прямо во время передачи. Перехватить их посреди сети можно, но прочитать — уже нет. Это и есть замок в адресной строке.",
    icon: FileKeyIcon,
  },
  {
    id: "watch",
    n: "04",
    title: "Слежение",
    text: "Система записывает, кто и что делал. Если ночью кто-то вошёл и скачал архив, это заметят по журналу — часто раньше, чем заметит сам злоумышленник.",
    icon: RadarIcon,
  },
  {
    id: "recover",
    n: "05",
    title: "Восстановление",
    text: "Последний рубег. Если данные всё-таки испортили, их возвращают из резервной копии. Без неё восстановление невозможно — поэтому её делают заранее.",
    icon: SirenIcon,
  },
]

export function HowItWorks() {
  return (
    <Section id="how" label="Как это работает" screens={2}>
      <div className="flex h-full w-full gap-10">
        <div className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center gap-8">
          <SectionHeader
            eyebrow="05 — Как это работает"
            title="Что происходит между вами и сервером"
            description="Пять шагов, через которые проходит почти любой запрос. Ни один из них не спасает в одиночку — но вместе они закрывают почти всё. Листайте вправо, чтобы увидеть шаги."
          />
          <Pipeline />
        </div>

        {/* Пять шагов сразу — дочитывать вниз больше не нужно. */}
        <ol className="grid h-full w-[calc(100vw-4rem)] shrink-0 content-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.id}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-5 transition-all duration-500 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted font-mono text-xs font-semibold text-muted-foreground">
                  {step.n}
                </span>

                <div className="flex flex-col gap-1.5">
                  <h3 className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
                    <step.icon className="size-4 text-primary" />
                    {step.title}
                  </h3>
                  <p className="text-pretty text-sm text-muted-foreground">
                    {step.text}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

/**
 * Схема пути запроса: пять «врат», между ними — линия маршрута.
 * Раньше текущий шаг подсвечивался при прокрутке; теперь показан весь
 * путь целиком, а порядок читается по номерам.
 */
function Pipeline() {
  return (
    <figure className="rounded-2xl border bg-card/60 p-5 backdrop-blur-sm">
      <svg
        viewBox="0 0 420 460"
        className="h-auto w-full"
        role="img"
        aria-label="Схема: запрос проходит через пять врат защиты — проверка, ограничение, шифрование, слежение и восстановление"
      >
        <defs>
          <linearGradient id="route" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Вертикальная линия маршрута. */}
        <line
          x1="60"
          y1="40"
          x2="60"
          y2="420"
          stroke="url(#route)"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {STEPS.map((step, i) => {
          const y = 40 + i * 95
          return (
            <g key={step.id}>
              <rect
                x="92"
                y={y - 26}
                width="300"
                height="52"
                rx="12"
                className="fill-muted/50 stroke-border"
                strokeWidth="1"
              />
              <text
                x="112"
                y={y - 4}
                className="font-mono text-[11px] fill-muted-foreground"
              >
                {step.n}
              </text>
              <text x="140" y={y - 4} className="text-[13px] fill-foreground">
                {step.title}
              </text>

              <circle
                cx="60"
                cy={y}
                r="5"
                className="fill-muted-foreground"
              />
            </g>
          )
        })}

        {/* Начало и конец пути. */}
        <g>
          <rect x="20" y="14" width="40" height="24" rx="8" className="fill-muted stroke-border" />
          <text x="40" y="30" textAnchor="middle" className="fill-muted-foreground text-[10px]">
            вы
          </text>
          <rect x="20" y="422" width="40" height="24" rx="8" className="fill-muted stroke-border" />
          <text x="40" y="438" textAnchor="middle" className="fill-muted-foreground text-[10px]">
            данные
          </text>
        </g>
      </svg>

      <figcaption className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4 font-mono text-[0.7rem] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          ворота защиты
        </span>
        <span className="flex items-center gap-1.5">
          <EyeIcon className="size-3" />
          порядок — по номерам
        </span>
      </figcaption>
    </figure>
  )
}
