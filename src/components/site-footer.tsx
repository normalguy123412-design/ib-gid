import Link from "next/link"
import { MailIcon, ShieldCheckIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { extraResources, frameworks, navItems, site } from "@/lib/content"
import { getCurrentYear } from "@/lib/current-year"

/**
 * ПОДВАЛ САЙТА.
 *
 * Колонки: логотип и контакты, «Разделы» (якорные ссылки),
 * «Ресурсы» (NIST, OWASP, MITRE ATT&CK, CISA) и справочные стандарты.
 * Год берётся на сервере, чтобы не вызывать расхождение при гидратации.
 */
export async function SiteFooter() {
  const year = getCurrentYear()

  return (
    // Отступ снизу — чтобы подвал не перекрывался нижней полосой прогресса.
    <footer className="relative z-10 border-t bg-background/70 pb-28 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-3 md:col-span-1">
            <Link href="#top" className="flex items-center gap-2 font-heading font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheckIcon className="size-4" />
              </span>
              {site.name}
            </Link>
            <p className="max-w-xs text-xs text-pretty text-muted-foreground">
              {site.description}
            </p>
            <a
              href="mailto:security@example.org"
              className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              <MailIcon className="size-3.5" />
              security@example.org
            </a>
          </div>

          <nav className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-medium">Разделы</h2>
            <ul className="flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-medium">Ресурсы</h2>
            <ul className="flex flex-col gap-2">
              {frameworks.map((framework) => (
                <li key={framework.title}>
                  <a
                    href={framework.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {framework.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-sm font-medium">Стандарты</h2>
            <ul className="flex flex-col gap-3">
              {extraResources.map((resource) => (
                <li key={resource.title} className="flex items-start gap-2">
                  <resource.icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                  <span className="flex flex-col">
                    <span className="text-xs font-medium">{resource.title}</span>
                    <span className="text-xs text-pretty text-muted-foreground">
                      {resource.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Учебный проект по информационной безопасности.
          </p>
          <p>
            Материалы носят справочный характер. Для реальных внедрений
            обращайтесь к профильным стандартам и специалистам.
          </p>
        </div>
      </div>
    </footer>
  )
}