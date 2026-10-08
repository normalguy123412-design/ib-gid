import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Enter } from "@/components/reveal"
import { heroStats } from "@/lib/content"

/**
 * HERO-секция: первый экран сайта — первая панель горизонтальной ленты.
 *
 * Фон всего сайта сплошной чёрный; на нём первая панель несёт крупную
 * полупрозрачную подпись «ИБ-Гид». Здесь — лёгкое затемнение, чтобы
 * заголовок читался поверх неё.
 */
export function AuroraHero() {
  return (
    <section
      id="top"
      className="relative isolate h-full w-screen shrink-0 overflow-y-auto pt-14 pb-20 sm:pt-16 sm:pb-24"
    >
      {/* Затемнение для читаемости текста. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/25 to-transparent"
      />

      {/* Крупная подпись фона: едет вместе с панелью. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span className="font-heading text-[16vw] leading-none font-bold tracking-tight text-foreground/[0.055]">
          ИБ-Гид
        </span>
      </span>

      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Каскад появления: каждый следующий блок стартует с задержкой. */}
        <Enter index={0}>
              <Badge variant="secondary" className="anim-bob gap-1.5">
            <SparklesIcon className="size-3" />
            Простым языком · без технического образования
          </Badge>
        </Enter>

        <Enter index={1} className="mt-6 w-full">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Информационная безопасность
          </h1>
        </Enter>

        <Enter index={2} className="mt-6 w-full">
          {/* Акцентная строка — как на референсном сайте. */}
          <p className="mx-auto mb-4 font-heading text-lg font-medium tracking-tight text-foreground/90 sm:text-xl">
            Три шага, которые закроют почти все риски
          </p>
          <p className="mx-auto max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Что такое информационная безопасность, от кого надо защищаться и
            что сделать прямо сейчас — без сложных терминов и технического
            образования.
          </p>
        </Enter>

        <Enter index={3} className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/* Основной CTA ведёт к блоку «С чего начать». */}
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link href="#start">
              Начать изучение
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="#glossary">Словарик терминов</Link>
          </Button>
        </Enter>

        <Enter index={4} className="mt-14 w-full">
          <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border bg-card/60 px-4 py-5 backdrop-blur-sm"
              >
                <dt className="font-heading text-3xl font-semibold">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          {/* Мета-строка и подсказка «листайте ниже». */}
          <p className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
            <ShieldCheckIcon className="size-3.5" />
            Читается за 10 минут · без регистрации
          </p>
        </Enter>
      </div>

      {/* Якорь «листайте ниже» с анимацией. */}
        {/* Подсказка «листайте ниже». Отступ снизу задан с запасом на нижнюю
            полосу прогресса, иначе значок наполовину уходил под неё. */}
        <a
          href="#start"
          aria-label="Листать ниже"
          className="group absolute inset-x-0 bottom-20 z-10 mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
        <span className="font-mono text-[0.65rem] uppercase tracking-widest">
          вниз
        </span>
        <span className="grid size-8 place-items-center rounded-full border transition-colors group-hover:border-primary">
          <ChevronDownIcon className="size-4 animate-bounce" />
        </span>
      </a>
    </section>
  )
}