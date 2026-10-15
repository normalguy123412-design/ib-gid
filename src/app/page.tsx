import { AuroraHero } from "@/components/aurora-hero"
import { Checklist } from "@/components/checklist"
import { CommonMistakes } from "@/components/common-mistakes"
import { CoreFeatures } from "@/components/core-features"
import { DefenseMethods } from "@/components/defense-methods"
import { FeaturesBento } from "@/components/features-bento"
import { DockNav } from "@/components/dock-nav"
import { Glossary } from "@/components/glossary"
import { HorizontalScroll } from "@/components/horizontal-scroll"
import { HowItWorks } from "@/components/how-it-works"
import { IfItHappens } from "@/components/if-it-happens"
import { NumbersStrip } from "@/components/numbers-strip"
import { SecurityDemos } from "@/components/security-demos"
import { SiteFooter } from "@/components/site-footer"
import { SiteBackground } from "@/components/site-background"
import { SiteCrosshair } from "@/components/site-crosshair"
import { StartHere } from "@/components/start-here"

/**
 * Одностраничный сайт «ИБ-Гид».
 *
 * Порядок секций — это порядок защиты: сначала объясняем, что защищать,
 * потом от чего, потом как, и только потом даём справочник и итог.
 * Рассказ идёт без остановок: старт → понятия → угрозы → защита →
 * как это работает → демо → чек-лист → ошибки → если произошло →
 * словарик → цифры.
 *
 * Служебные разделы стоят в конце намеренно. Словарик раньше был третьим
 * и разрывал рассказ: из двадцати одного термина одиннадцать описывают
 * защиту, а раздел о защите идёт только четвёртым, — читатель получал
 * определения SIEM, DLP и Zero Trust за несколько экранов до того, как
 * узнавал, зачем они нужны. Теперь это справочник в конце, и попасть в
 * него можно кнопкой первого экрана и ссылкой из текста.
 *
 * Верхней навигационной панели нет: разделы переключаются кнопками дока
 * внизу экрана (см. DockNav), а `id` секций должны совпадать
 * с `href` в `navItems` (см. src/lib/content.ts).
 *
 * ВАЖНО: `navItems` должны идти ровно в том же порядке, что и панели
 * здесь. Док ищет активный раздел, перебирая `navItems`, и берёт последний,
 * чей левый край прошёл линию обзора, — при расхождении порядка подсветка
 * останавливается не на том разделе.
 */
export default function Home() {
  return (
    <>
      {/* Прицел вместо системной стрелки. Стоит снаружи ленты: он один на
          весь сайт, а не по одному на панель, и его холст растянут на
          окно. Настройки и объяснения — в site-crosshair.tsx. */}
      <SiteCrosshair />
      {/* Лента разделов: прокрутка вниз двигает её вправо.
          Док передаётся внутрь — иначе он не видит прогресс прокрутки и
          считает активный раздел по вертикали, где у всех панелей
          одинаковый верх. */}
      {/* Фон — один на всю ленту, а не по одному на раздел: тринадцать
          холстов во весь экран съели бы около восьмидесяти мегабайт
          видеопамяти. Липкий слой перекрывает все панели сразу. */}
      <HorizontalScroll background={<SiteBackground />} overlay={<DockNav />}>
        {/* main остаётся landmark'ом и растягивается вдоль всей ленты,
            чтобы разделы были его прямыми флекс-потомками. */}
        <main className="relative z-10 flex h-full w-max">
          {/* Первый экран (hero): цель, актуальность и кнопка → #start */}
          <AuroraHero />
          {/* 01 #start — три шага для тех, кто совсем новичок */}
          <StartHere />
          {/* 02 #concepts — что такое ИБ и три главных свойства */}
          <CoreFeatures />
          {/* 03 #threats — бенто-сетка типов угроз и их классификация */}
          <FeaturesBento />
          {/* 04 #defense — методы защиты и фреймворки */}
          <DefenseMethods />
          {/* 05 #how — схема пути запроса и пять шагов */}
          <HowItWorks />
          {/* 06 #demos — 2FA и настройка безопасности аккаунта */}
          <SecurityDemos />
          {/* 07 #checklist — три конкретных действия на сегодня */}
          <Checklist />
          {/* 08 #mistakes — памятка: частые ошибки и что делать вместо них */}
          <CommonMistakes />
          {/* 09 #emergency — первые шаги, если неприятность уже случилась */}
          <IfItHappens />
          {/* 10 #glossary — справочник терминов. Стоит после рассказа, а не
              внутри него: сюда заглядывают, когда забыли слово */}
          <Glossary />
          {/* 11 #numbers — итог работы в цифрах, последняя панель ленты */}
          <NumbersStrip stats={numbers} />
        </main>

        {/* Подвал: разделы, ресурсы и копирайт. Последняя панель ленты. */}
        <SiteFooter />
      </HorizontalScroll>
    </>
  )
}

/**
 * Числа для полосы «в цифрах». Считаются из данных сайта, чтобы не
 * выдумывать статистику: сколько шагов в схеме, сколько терминов
 * в словарике, сколько знаков в коде подтверждения.
 */
const numbers = [
  { value: 5, label: "шагов проходит запрос через защиту" },
  { value: 21, label: "термина расшифровано в словарике" },
  { value: 6, suffix: " цифр", label: "в коде подтверждения входа" },
  { value: 3, label: "действия, которые закроют почти всё" },
]