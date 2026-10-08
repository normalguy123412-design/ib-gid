"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion"
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
 * Путь к файлу из public/.
 *
 * Сайт собирается статикой и публикуется в подкаталоге GitHub Pages
 * (`/<имя-репозитория>/`), поэтому к ролику нужно прибавить базовый путь.
 * Локально он пустой, в CI передаётся через NEXT_PUBLIC_BASE_PATH
 * (см. next.config.ts). Без этого префикса видео не найдётся на Pages.
 */
const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`

/**
 * ПЕРВЫЙ ЭКРАН: ролик, который раскрывается при прокрутке.
 *
 * Приём «заблокированного» героя: высокий контейнер (h-[220vh]) с
 * приклеенным к экрану слоем. Пока пользователь прокручивает, ролик
 * плавно растёт с четверти экрана до полного размера, а текст поверх
 * него угасает. Приём взят из компонента 21st.dev «Video Scroll Hero»,
 * но текст вынесен из масштабируемого блока наружу: иначе заголовок
 * растягивался бы вместе с роликом и стал нечитаемым.
 *
 * Прогресс берётся из useScroll, а не из обработчика scroll: значение
 * обновляется движком анимаций, поэтому лишних перерисовок React нет.
 *
 * Ролик и заставка сгенерированы скриптом scripts/make-hero-video.py.
 */
export function VideoScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [0.25, 1])
  const textOpacity = useTransform(scrollYProgress, [0.08, 0.42], [1, 0])
  const textShift = useTransform(scrollYProgress, [0, 1], [0, -60])

  // При выключенной анимации в системе ролик сразу показан целиком,
  // а текст не исчезает — иначе содержимое было бы недоступно.
  const mediaScale = reduceMotion ? 1 : scale
  const heroTextOpacity = reduceMotion ? 1 : textOpacity
  const heroTextShift = reduceMotion ? 0 : textShift

  return (
    <section id="top" className="relative border-b">
      <div ref={containerRef} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
          {/* Ролик: растёт от 25% до во весь экран. */}
          <motion.div
            style={{ scale: mediaScale }}
            className="absolute inset-0 will-change-transform"
          >
            <video
              className="h-full w-full object-cover"
              poster={asset("/media/hero-poster.jpg")}
              autoPlay={!reduceMotion}
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden
            >
              <source src={asset("/media/hero.mp4")} type="video/mp4" />
            </video>
          </motion.div>

          {/* Затемнение сверху и снизу, чтобы текст читался поверх ролика. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/45 to-background/90"
          />

          <motion.div
            style={{ opacity: heroTextOpacity, y: heroTextShift }}
            className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6"
          >
            <Enter index={0}>
              <Badge variant="secondary" className="animate-float gap-1.5">
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
              <p className="mx-auto mb-4 font-heading text-lg font-medium tracking-tight text-foreground/90 sm:text-xl">
                Три шага, которые закроют почти все риски
              </p>
              <p className="mx-auto max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
                Что такое информационная безопасность, от кого надо
                защищаться и что сделать прямо сейчас — без сложных терминов
                и технического образования.
              </p>
            </Enter>

            <Enter
              index={3}
              className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Button asChild size="lg" className="group w-full sm:w-auto">
                <Link href="#start">
                  Начать изучение
                  <ArrowRightIcon
                    data-icon="inline-end"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="#glossary">Словарик терминов</Link>
              </Button>
            </Enter>

            <Enter index={4} className="mt-14 w-full">
              <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border bg-card/70 px-4 py-5 backdrop-blur-sm"
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

              <p className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
                <ShieldCheckIcon className="size-3.5" />
                Читается за 10 минут · без регистрации
              </p>
            </Enter>
          </motion.div>

          {/* Подсказка «листайте ниже»: исчезает вместе с текстом. */}
          <motion.a
            href="#start"
            aria-label="Листать ниже"
            style={{ opacity: heroTextOpacity }}
            className="absolute inset-x-0 bottom-6 z-10 mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="font-mono text-[0.65rem] uppercase tracking-widest">
              вниз
            </span>
            <span className="grid size-8 place-items-center rounded-full border transition-colors group-hover:border-primary">
              <ChevronDownIcon className="size-4 animate-bounce" />
            </span>
          </motion.a>
        </div>
      </div>
    </section>
  )
}
