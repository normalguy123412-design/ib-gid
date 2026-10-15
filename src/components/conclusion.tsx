import {
  ArrowRightIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Section, SectionRule } from "@/components/section"
import { Parallax } from "@/components/parallax"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * РАЗДЕЛ «ВЫВОД» (#conclusion).
 *
 * Закрывает рассказ: что показала работа и что с этим делать дальше.
 * Стоит после «В цифрах», перед подвалом, — как последняя глава отчёта.
 * Читатель к этому месту уже прошёл понятия, угрозы, защиту,
 * демонстрации и чек-лист, и здесь ему нужна короткая сводка, а не новая
 * информация: если вывод начнёт пересказывать разделы заново, его
 * перестанут читать.
 *
 * Кнопка возвращает к чек-листу. Ссылки вперёд нет намеренно — за этим
 * разделом идёт только подвал.
 */

const POINTS = [
  {
    icon: TriangleAlertIcon,
    title: "Опасность начинается с привычки",
    text: "Почти все истории с угнанными аккаунтами начинаются одинаково: одно письмо, один и тот же пароль на разных сайтах, один переход по ссылке. Техника в них почти ни при чём — решение принимает человек.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Простое защищает лучше сложного",
    text: "Длинный пароль, второй фактор и резервная копия закрывают большинство типовых случаев. Сложные системы нужны крупным компаниям, а личный аккаунт защищают эти три вещи.",
  },
  {
    icon: ListChecksIcon,
    title: "Начать можно за один вечер",
    text: "Три действия из чек-листа: включить вход по двум признакам, поставить менеджер паролей и сделать резервную копию. Дальше это уже привычка, а не работа.",
  },
]

export function Conclusion() {
  return (
    <Section id="conclusion" label="Вывод">
      <Parallax speed={0.1} className="flex flex-col gap-3">
        {/* Рубрика продолжает общую нумерацию: «В цифрах» — 11-я. */}
        <SectionRule label="12 — Вывод" />
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Что показала работа
        </h2>
        <p className="max-w-2xl text-base text-pretty text-muted-foreground">
          Коротко и без новых терминов: главное, к чему сводится всё, что
          было выше.
        </p>
      </Parallax>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {POINTS.map((point, i) => (
          // Тот же встроенный в ленту параллакс, что и в других разделах.
          <Parallax key={point.title} speed={0.12 - i * 0.09}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <point.icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{point.title}</CardTitle>
                </div>
                <CardDescription className="text-pretty">
                  {point.text}
                </CardDescription>
              </CardHeader>
            </Card>
          </Parallax>
        ))}
      </div>

      <Card
        variant="inset"
        className="mt-4 border border-dashed border-border/50"
      >
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-pretty text-muted-foreground">
            <span className="font-medium text-foreground">
              Дальше — по чек-листу.
            </span>{" "}
            Три действия из него закрывают почти всё, о чём рассказывает сайт.
          </p>
          <Button asChild className="group shrink-0">
            <a href="#checklist">
              Открыть чек-лист
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </Button>
        </CardContent>
      </Card>
    </Section>
  )
}
