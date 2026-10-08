import Link from "next/link"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Enter } from "@/components/reveal"
import { heroStats } from "@/lib/content"

/**
 * HERO-секция: первый экран сайта.
 *
 * Фон — не CSS-градиенты, а общий анимированный canvas-слой
 * (см. SecurityWorld). Здесь только лёгкое затемнение в верхней части,
 * чтобы заголовок читался поверх сцены.
 */
export function AuroraHero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b pt-20 pb-16 sm:pt-28 sm:pb-24"
    >
      {/* Затемнение для читаемости текста. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/25 to-transparent"
      />

      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        {/* Каскад появления: каждый следующий блок стартует с задержкой. */}
        <Enter index={0}>
          <Badge variant="secondary" className="animate-float gap-1.5">
            <SparklesIcon className="size-3" />
            Учебный гид · 8 разделов · интерактивные демо
          </Badge>
        </Enter>

        <Enter index={1} className="mt-6 w-full">
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Информационная безопасность
          </h1>
        </Enter>

        <Enter index={2} className="mt-6 w-full">
          <p className="mx-auto max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            Полный гид: от базовых понятий до современных методов защиты данных.
            Разберём триаду CIA, типичные угрозы и то, что действительно работает
            на практике.
          </p>
        </Enter>

        <Enter index={3} className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/* Основной CTA ведёт к секции «Понятия». */}
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <Link href="#concepts">
              Начать изучение
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="#demos">Открыть демо защиты</Link>
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
        </Enter>
      </div>
    </section>
  )
}