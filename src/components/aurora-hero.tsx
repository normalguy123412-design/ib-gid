import { ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Counter } from "@/components/counter"
import { DecryptedText } from "@/components/decrypted-text"
import { Enter } from "@/components/reveal"
import { HeroTitle } from "@/components/hero-title"
import { heroStats, projectGoal, projectTasks, relevance } from "@/lib/content"

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
      data-panel=""
      className="relative isolate h-full w-screen shrink-0 overflow-hidden pt-14 pb-20 sm:pt-16 sm:pb-24"
    >
      {/* Затемнение фона теперь общее для всего сайта — см. SiteBackground. */}

      {/* Крупная подпись фона: едет вместе с панелью и раскрывается
          из случайных символов при первом появлении на экране. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <DecryptedText
          text="ИБ-Гид"
          className="font-heading text-[16vw] leading-none font-bold tracking-tight text-foreground/[0.055]"
        />
      </span>

      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Каскад появления: каждый следующий блок стартует с задержкой. */}
        {/* Надпись на canvas и её запасной текстовый вариант — см. HeroTitle. */}
        <Enter index={0} className="w-full">
          <HeroTitle />
        </Enter>

        <Enter index={1} className="mt-6 w-full">
          {/*
            Три вводных блока стоят рядом: цель, задачи работы и
            актуальность. Раньше их было два, и задачи жили только в
            тексте самой работы — а на защите цель и задачи читают
            вместе, первым делом. В третьей колонке текст актуальности
            остался мелким кеглем: она отвечает на отдельный вопрос
            («почему тема не устарела»), и вчитываться в неё с первого
            экрана не нужно.
          */}
          <div className="mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-xl border bg-card/55 px-5 py-4 text-left backdrop-blur-sm">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {projectGoal.label}
              </span>
              <p className="font-heading text-lg font-medium tracking-tight text-balance sm:text-xl">
                {projectGoal.text}
              </p>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border bg-card/55 px-5 py-4 text-left backdrop-blur-sm">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {projectTasks.label}
              </span>
              {/* Нумерованный список, а не абзац: задачи читают по
                  пунктам, и на защите по нему удобно отвечать. */}
              <ol className="flex flex-col gap-1.5">
                {projectTasks.items.map((item, i) => (
                  <li key={item} className="flex gap-2">
                    <span className="font-mono text-xs leading-5 tabular-nums text-primary">
                      {i + 1}.
                    </span>
                    <span className="text-sm text-pretty text-foreground/85">
                      {item}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-2 rounded-xl border bg-card/55 px-5 py-4 text-left backdrop-blur-sm sm:col-span-2 lg:col-span-1">
              <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {relevance.label}
              </span>
              <p className="font-heading text-base font-medium tracking-tight text-balance sm:text-lg">
                {relevance.text}
              </p>
            </div>
          </div>
        </Enter>

        <Enter index={3} className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {/*
            Ссылки внутри — обычные якоря, а не next/link. Разделы стоят
            в горизонтальной ленте, и переход к ним делает обработчик
            на самой ленте (см. HorizontalScroll.handleClick): он считает
            положение панели и переводит его в вертикальную прокрутку.
            next/link поверх этого запускал собственную навигацию и
            доводил страницу до якоря штатным scrollIntoView, который про
            трансформированный трек считает позицию неверно — и открывал
            соседний раздел вместо нужного.
          */}
          <Button asChild size="lg" className="group w-full sm:w-auto">
            <a href="#start">
              Начать изучение
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <a href="#glossary">Словарик терминов</a>
          </Button>
        </Enter>

        <Enter index={4} className="mt-10 w-full">
          <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border bg-card/55 px-4 py-5 backdrop-blur-sm"
              >
                {/* Цифры доезжают до значения тем же счётчиком, что и в
                    разделе «В цифрах», — одна реализация на весь сайт. */}
                <dt className="font-heading text-3xl font-semibold">
                  <Counter value={stat.value} className="tabular-nums" />
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>

          {/*
            Мета-строка «Читается за 10 минут · без регистрации» убрана.
            Обещание наподобие — из разряда рекламных: ни времени чтения,
            ни регистрации на сайте нет, и проверяющему они не подтверждают
            ничего. Цифры в статистике выше остались: они считаются из
            содержимого сайта и потому правдивы.
          */}
        </Enter>
      </div>

      {/*
        Якорь «вниз» со стрелочкой убран: он предлагал листать вниз, хотя
        сайт листается вправо, — подсказка сбивала с толку. Нижний отступ
        секции остался: под первым экраном проезжает док с полосой
        прогресса, и без запаса он наполовину закрывал бы подпись.
      */}
    </section>
  )
}