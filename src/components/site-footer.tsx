import Link from "next/link"
import { ExternalLinkIcon, ShieldCheckIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { extraResources, frameworks, navItems, site } from "@/lib/content"
import { getCurrentYear } from "@/lib/current-year"

/**
 * ПОДВАЛ САЙТА.
 *
 * Компоновка повторяет референсный: слева логотип, в центре длинный
 * поясняющий текст со ссылками на источники, справа — строка моноширинных
 * ссылок. Отступ снизу оставляет место под нижнюю полосу прогресса.
 */
export async function SiteFooter() {
  const year = getCurrentYear()

  return (
    <footer className="relative z-10 h-full w-screen shrink-0 overflow-y-auto bg-background/70 pb-28 backdrop-blur-sm">
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
            <Link href="#top" className="flex w-fit items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheckIcon className="size-4" />
              </span>
              <span className="font-heading text-base font-semibold tracking-tight">
                {site.name}
              </span>
            </Link>

            <nav className="flex flex-col gap-2" aria-label="Разделы">
              <p className="font-heading text-sm font-medium">Разделы</p>
              <ul className="flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Пояснительный текст и список ресурсов. */}
          <div className="flex flex-col gap-6 lg:max-w-2xl">
            <div className="flex flex-col gap-2">
              <p className="font-heading text-sm font-medium">Ресурсы</p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {frameworks.map((framework) => (
                  <li key={framework.title}>
                    <a
                      href={framework.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {framework.title}
                      <ExternalLinkIcon className="size-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <p className="text-xs text-pretty leading-relaxed text-muted-foreground">
              Учебный материал по информационной безопасности. Сайт{" "}
              {site.description.toLowerCase()} Разбор тем опирается на{" "}
              {frameworks.slice(0, 2).map((f, i) => (
                <span key={f.title}>
                  {i > 0 ? " и " : ""}
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    {f.title}
                  </a>
                </span>
              ))}
              . Иконки —{" "}
              <a
                href="https://lucide.dev"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                Lucide
              </a>
              , сборка — Next.js и Tailwind CSS.
            </p>

            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-xs">
              {extraResources.slice(0, 4).map((resource) => (
                <li
                  key={resource.title}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <resource.icon className="size-3" />
                  {resource.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Материалы носят справочный характер.
          </p>
          <p>
            Сделано без внешних изображений — только SVG и CSS-градиенты.
          </p>
        </div>

        <p className="pb-8 text-xs text-pretty leading-relaxed text-muted-foreground">
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
          . Код сайта написан с нуля и распространяется отдельно от него.
        </p>
        </div>
      </div>
    </footer>
  )
}