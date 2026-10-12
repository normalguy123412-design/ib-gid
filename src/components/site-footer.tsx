import { ExternalLinkIcon, ShieldCheckIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  accessedAt,
  navItems,
  normativeSources,
  projectGoal,
  site,
  sources,
} from "@/lib/content"
import { getCurrentYear } from "@/lib/current-year"

/**
 * Строка списка источников: номер, название со ссылкой, пояснение и дата
 * обращения.
 *
 * Номер и дата — не украшение, а требование к оформлению списка
 * источников: без даты обращения ссылка на внешний сайт не считается
 * источником, потому что страницу могли переписать.
 */
function SourceItem({
  index,
  title,
  note,
  href,
  showAccessedAt,
}: {
  index: number
  title: string
  note: string
  href?: string
  /** У нормативных документов даты обращения нет. */
  showAccessedAt: boolean
}) {
  return (
    <li className="flex gap-2.5 text-xs leading-snug">
      <span className="font-mono text-muted-foreground">{index}.</span>
      <span className="min-w-0">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-medium underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {title}
            <ExternalLinkIcon className="size-3 shrink-0" />
          </a>
        ) : (
          <span className="font-medium">{title}</span>
        )}{" "}
        <span className="text-muted-foreground">— {note}.</span>{" "}
        {showAccessedAt ? (
          <span className="font-mono text-[0.65rem] text-muted-foreground">
            дата обращения: {accessedAt}
          </span>
        ) : null}
      </span>
    </li>
  )
}

/**
 * ПОДВАЛ САЙТА.
 *
 * Слева логотип и разделы, справа — список источников с датами обращения.
 * Раньше источники лежали в трёх местах (рамки с ссылками, тезисы в
 * пояснительном тексте и моноширинный список без ссылок), и ни один из
 * них нельзя было показать проверяющему как список источников. Теперь
 * это один пронумерованный список; отступ снизу оставляет место под
 * нижнюю полосу прогресса.
 */
export async function SiteFooter() {
  const year = getCurrentYear()

  return (
    <footer
      id="footer"
      data-panel=""
      className="relative z-10 h-full w-screen shrink-0 overflow-hidden bg-background/70 pb-24 backdrop-blur-sm"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span className="font-heading text-[16vw] leading-none font-bold tracking-tight text-foreground/[0.055]">
          Итог
        </span>
      </span>

      <div className="relative flex min-h-full w-full flex-col px-4 sm:px-6">
        <div className="mx-auto my-auto w-full max-w-6xl">
        <div className="flex flex-col gap-8 py-12 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          {/* Логотип и разделы. */}
          <div className="flex shrink-0 flex-col gap-5">
            <a href="#top" className="flex w-fit items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheckIcon className="size-4" />
              </span>
              <span className="font-heading text-base font-semibold tracking-tight">
                {site.name}
              </span>
            </a>

            <nav className="flex flex-col gap-2" aria-label="Разделы">
              <p className="font-heading text-sm font-medium">Разделы</p>
              <ul className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    {/* Якорь, а не next/link: переход по разделам делает
                        обработчик ленты (см. HorizontalScroll.handleClick),
                        иначе штатный scrollIntoView мимо него всё равно
                        доводит страницу до неверной панели. */}
                    <a
                      href={item.href}
                      className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Список источников. */}
          <div className="flex flex-col gap-4 lg:max-w-2xl">
            <div className="flex flex-col gap-2.5">
              <p className="font-heading text-sm font-medium">Источники</p>
              <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {sources.map((source, index) => (
                  <SourceItem
                    key={source.title}
                    index={index + 1}
                    title={source.title}
                    note={source.note}
                    href={source.href}
                    showAccessedAt
                  />
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-heading text-sm font-medium">
                Нормативные документы
              </p>
              <ul className="flex flex-col gap-1.5">
                {normativeSources.map((source, index) => (
                  <SourceItem
                    key={source.title}
                    /* Нумерация продолжается: это один список источников,
                       просто разделённый на web и нормативные. */
                    index={sources.length + index + 1}
                    title={source.title}
                    note={source.note}
                    href={source.href}
                    showAccessedAt={false}
                  />
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Separator />

        {/*
          Цель проекта дублируется здесь из первого экрана. На первом
          экране она нужна, чтобы сразу было понятно, о чём работа; в
          подвале — рядом с источниками и копирайтом, где её обычно и
          ищут.
        */}
        <p className="py-4 text-xs text-pretty leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            {projectGoal.label}:
          </span>{" "}
          {projectGoal.text.charAt(0).toLowerCase() +
            projectGoal.text.slice(1)}
          . Материалы носят справочный характер. Иконки —{" "}
          <a
            href="https://lucide.dev"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Lucide
          </a>
          , сборка — Next.js и Tailwind CSS, внешних изображений нет.
        </p>

        <div className="flex flex-col gap-3 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>
            Оформление и приёмы прокрутки подсмотрены у проекта{" "}
            <a
              href="https://github.com/Wranked1/DDNet-AI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-4 transition-colors hover:text-foreground"
            >
              DDNet AI
              <ExternalLinkIcon className="size-3" />
            </a>
          </p>
        </div>
        </div>
      </div>
    </footer>
  )
}