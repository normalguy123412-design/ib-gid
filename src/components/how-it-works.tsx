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
import { cn } from "cn"

/**
 * СЕКЦИЯ «КАК ЭТО ЗАЩИЩЕНО» (#how).
 *
 * Липкая схема слева и пять пронумерованных шагов справа. Пока вы
 * прокручиваете, активный шаг подсвечивается, а соответствующий участок
 * схемы загорается — так видно, как запрос проходит через защиту.
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
    text: "Последний рубеж. Если данные всё-таки испортили, их возвращают из резервной копии. Без неё восстановление невозможно — поэтому её делают заранее.",
    icon: SirenIcon,
  },
]

export function HowItWorks() {
  // Активный шаг — тот, чья карточка ближе всего к центру экрана.
  const [active, setActive] = React.useState<StepId>("check")
  const refs = React.useRef<(HTMLLIElement | null)[]>([])

  React.useEffect(() => {
    const nodes = refs.current.filter((el): el is HTMLLIElement =>
      Boolean(el)
    )
    if (!nodes.length) return

    // IntersectionObserver вместо обработчика window.scroll.
    // В горизонтальном режиме панель прокручивается внутри себя, и окно
    // об этом не знает; наблюдатель же ловит момент, когда положение
    // карточек относительно экрана изменилось, — то есть работает и там.
    const observer = new IntersectionObserver(
      () => {
        const center = window.innerHeight / 2
        let best: StepId = "check"
        let bestDist = Infinity

        for (const el of nodes) {
          const rect = el.getBoundingClientRect()
          const dist = Math.abs(rect.top + rect.height / 2 - center)
          if (dist < bestDist) {
            bestDist = dist
            best = el.dataset.step as StepId
          }
        }

        setActive(best)
      },
      {
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
        rootMargin: "-15% 0px -15% 0px",
      }
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const activeIndex = STEPS.findIndex((s) => s.id === active)

  return (
    <Section id="how" label="Как это работает">
      <SectionHeader
        eyebrow="05 — Как это работает"
        title="Что происходит между вами и сервером"
        description="Пять шагов, через которые проходит почти любой запрос. Ни один из них не спасает в одиночку — но вместе они закрывают почти всё."
      />

      <div className="mt-10 grid gap-10 sm:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        {/* Липкая схема: остаётся на экране, пока идут шаги. */}
        <div className="lg:sticky lg:top-10 lg:h-fit">
          <Pipeline active={active} />
        </div>

        {/* Шаги. */}
        <ol className="flex flex-col gap-6">
          {STEPS.map((step, i) => {
            const isActive = step.id === active
            const passed = i < activeIndex
            return (
              <li
                key={step.id}
                data-step={step.id}
                ref={(el) => {
                  refs.current[i] = el
                }}
                className={cn(
                  "rounded-2xl border p-5 transition-all duration-500 sm:p-6",
                  isActive
                    ? "border-primary/50 bg-card shadow-md"
                    : "border-border bg-card/40"
                )}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs font-semibold transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : passed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {passed ? <BadgeCheckIcon className="size-4" /> : step.n}
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <h3
                      className={cn(
                        "flex items-center gap-2 font-heading text-lg font-semibold transition-colors",
                        isActive && "text-foreground"
                      )}
                    >
                      <step.icon className="size-4 text-primary" />
                      {step.title}
                    </h3>
                    <p className="text-pretty text-sm text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}

/**
 * Схема пути запроса: пять «врат», между ними — линия маршрута.
 * Активные врата подсвечены, пройденные — зелёные.
 */
function Pipeline({ active }: { active: StepId }) {
  const activeIndex = STEPS.findIndex((s) => s.id === active)

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
          const isActive = step.id === active
          const passed = i < activeIndex
          return (
            <g key={step.id}>
              {/* Врата: рамка с номером. */}
              <rect
                x="92"
                y={y - 26}
                width="300"
                height="52"
                rx="12"
                className={cn(
                  "transition-all duration-500",
                  isActive
                    ? "fill-primary/12 stroke-primary"
                    : passed
                      ? "fill-emerald-500/8 stroke-emerald-500/40"
                      : "fill-muted/50 stroke-border"
                )}
                strokeWidth={isActive ? 2 : 1}
              />
              <text
                x="112"
                y={y - 4}
                className={cn(
                  "font-mono text-[11px] transition-colors",
                  isActive ? "fill-primary" : "fill-muted-foreground"
                )}
              >
                {step.n}
              </text>
              <text
                x="140"
                y={y - 4}
                className={cn(
                  "text-[13px] transition-colors",
                  isActive
                    ? "fill-foreground"
                    : "fill-muted-foreground"
                )}
              >
                {step.title}
              </text>

              {/* Точка на линии маршрута. */}
              <circle
                cx="60"
                cy={y}
                r={isActive ? 7 : 5}
                className={cn(
                  "transition-all duration-500",
                  isActive
                    ? "fill-primary"
                    : passed
                      ? "fill-emerald-500"
                      : "fill-muted-foreground"
                )}
              />
              {isActive ? (
                <circle cx="60" cy={y} r="13" className="fill-primary/20" />
              ) : null}
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
          текущий шаг
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" />
          пройдено
        </span>
        <span className="flex items-center gap-1.5">
          <EyeIcon className="size-3" />
          прокручивайте — схема меняется
        </span>
      </figcaption>
    </figure>
  )
}
