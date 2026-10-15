import { Section, SectionRule } from "@/components/section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"
import { glossary } from "@/lib/content"

type Category = (typeof glossary)[number]["category"]

/**
 * Группы терминов. Порядок — от «что это» к «от чего» и «чем».
 *
 * Цвет рамки и цвет кружка разведены намеренно: рамкой помечены сами
 * боксы, кружком — группа, чтобы подпись читалась как часть словаря,
 * а не как элемент управления.
 */
const GROUPS: {
  key: Category
  title: string
  hint: string
  dot: string
}[] = [
  {
    key: "база",
    title: "Основы",
    hint: "что это такое",
    dot: "border-sky-500",
  },
  {
    key: "атаки",
    title: "Атаки",
    hint: "от чего беречься",
    dot: "border-destructive",
  },
  {
    key: "защита",
    title: "Защита",
    hint: "чем закрываются",
    dot: "border-emerald-500",
  },
]

/**
 * Цвет бокса по группе.
 *
 * Раньше цвет группы был только на рамке, а сам бокс оставался нейтральным
 * стеклом: полоса из полутора десятков одинаковых серых прямоугольников
 * читалась издалека как таблица без разбивки, и цвет рамки доходил до
 * зрителя раньше, чем название группы. Теперь заливка тоже принадлежит
 * группе — видно, где кончается одна полоса и начинается другая, ещё до
 * того, как прочитаешь подпись.
 *
 * Насыщенность заливки 15%, а не 30%. Под боксом живой фон сайта, и
 * плотная заливка гасила бы его; к тому же карточки в разделе стоят в
 * четыре ряда — между ними не осталось бы тёмных промежутков, и полосы
 * слиплись бы в одно пятно. Стекло при этом сохраняется: `backdrop-blur`
 * задаётся в самой карточке и отмены заливкой не имеет, поэтому нити
 * видны сквозь окрашенное стекло.
 */
const TONES: Record<Category, string> = {
  база: "border-sky-500/50 bg-sky-500/15 hover:bg-sky-500/25",
  атаки: "border-destructive/50 bg-destructive/15 hover:bg-destructive/25",
  защита: "border-emerald-500/50 bg-emerald-500/15 hover:bg-emerald-500/25",
}

/**
 * Сколько колонок у группы. Задано явно, а не по числу терминов:
 * иначе группа из одного-двух слов растягивала боксы на всю полосу, и
 * раздел переставал влезать в экран. Защита — одиннадцать терминов,
 * поэтому у неё две строки.
 */
const COLUMNS: Record<Category, string> = {
  база: "grid-cols-2 sm:grid-cols-4",
  атаки: "grid-cols-3 sm:grid-cols-6",
  защита: "grid-cols-4 sm:grid-cols-6",
}

/**
 * СЕКЦИЯ «СЛОВАРИК» (#glossary).
 *
 * Термины разложены по группам, а не свалены в одну сетку: сначала
 * идёт то, без чего остальное не понять (Основы), потом от чего
 * защищаются (Атаки) и чем (Защита). Раньше подпись групп была одна
 * над общей таблицей, и приходилось держать в голове цветовую легенду,
 * чтобы понять, к чему относится термин.
 *
 * Подпись группы стоит слева от её боксов и заменяет бывшую легенду:
 * заголовок с цветным кружком и пояснением видно прямо на месте.
 *
 * Боксы подстраиваются под текст, а не под квадрат. Раньше высота
 * задавалась как aspect-square, и короткая расшифровка («Хеш» — две
 * строки) держала за собой пустое место размером в пол-экрана: чем
 * больше колонок, тем меньше ширина бокса и тем больше в нём воздуха.
 * Теперь высоту задаёт содержимое, а ровные строки даёт сама сетка —
 * элементы в ряду выравниваются по самому длинному тексту.
 */
export function Glossary() {
  return (
    <Section id="glossary" veil="strong" label="Словарик" screens={1}>
      <div className="flex h-full flex-col justify-center gap-4">
        {/* Рубрика и заголовок стоят в одну строку: три полосы групп важнее
            отдельной шапки, а места по высоте в разделе не хватает. */}
        <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <SectionRule label="03 — Словарик" className="w-56 shrink-0" />
          <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
            Что значат все эти сокращения
          </h2>
        </header>

        {/* Три полосы сверху вниз: подпись группы и её термины рядом. */}
        <div className="flex flex-col gap-3">
          {GROUPS.map((group) => {
            const terms = glossary.filter(
              (entry) => entry.category === group.key
            )

            return (
              <section
                key={group.key}
                className="flex flex-col gap-2 sm:flex-row sm:gap-5"
                aria-label={group.title}
              >
                <div className="flex shrink-0 flex-col gap-0.5 sm:w-40 sm:justify-center">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-3 shrink-0 rounded-sm border-2",
                        group.dot
                      )}
                    />
                    <span className="font-heading text-sm font-semibold tracking-tight">
                      {group.title}
                    </span>
                  </span>
                  <span className="pl-5 text-[0.7rem] text-muted-foreground sm:pl-0">
                    {group.hint} · {terms.length}
                  </span>
                </div>

                <div
                  className={cn("grid flex-1 items-stretch gap-3", COLUMNS[group.key])}
                >
                  {terms.map((entry) => (
                    <Card
                      key={entry.term}
                      className={cn(
                        // Высота — по содержимому: у коротких расшифровок
                        // не остаётся пустого места, а высокий сосед по
                        // ряду задаёт общую высоту через align-items: stretch.
                        // Фона здесь нет: он приходит из TONES вместе с
                        // цветом группы, а общее `hover:bg-card/70`
                        // перебивало бы его серым.
                        "min-h-24 gap-1.5 px-3 py-3.5 transition-colors",
                        TONES[entry.category]
                      )}
                    >
                      <CardHeader className="px-0">
                        <CardTitle className="font-mono text-[0.75rem] leading-tight">
                          {entry.term}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-0">
                        <CardDescription className="text-[0.72rem] leading-snug text-pretty text-muted-foreground">
                          {entry.plain}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </Section>
  )
}