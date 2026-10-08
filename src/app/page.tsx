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
import { StartHere } from "@/components/start-here"

/**
 * Одностраничный сайт «ИБ-Гид».
 *
 * Порядок секций повторяет учебный путь читателя:
 * старт → понятия → угрозы → защита → как это работает → демо →
 * словарик → цифры → чек-лист → FAQ.
 * Верхней навигационной панели нет: разделы переключаются кнопками дока
 * внизу экрана (см. DockNav), а `id` секций должны совпадать
 * с `href` в `navItems` (см. src/lib/content.ts).
 */
export default function Home() {
  return (
    <>
      {/* Фон — сплошной чёрный. На нём каждая панель несёт свою крупную
          полупрозрачную подпись (см. label в Section), которая проезжает
          вместе с лентой. Отдельного слоя с анимацией не требуется. */}

      {/* Лента разделов: прокрутка вниз двигает её вправо. Док передаётся
          внутрь — иначе он не видит прогресс прокрутки и считает активный
          раздел по вертикали, где у всех панелей одинаковый верх. */}
      <HorizontalScroll overlay={<DockNav />}>
        {/* main остаётся landmark'ом и растягивается вдоль всей ленты,
            чтобы разделы были его прямыми флекс-потомками. */}
        <main className="relative z-10 flex h-full w-max">
          {/* 0. Первый экран (hero) с CTA «Начать изучение» → #start */}
          <AuroraHero />
          {/* 2. #start — три шага для тех, кто совсем новичок */}
          <StartHere />
          {/* 3. #concepts — что такое ИБ и три главных свойства */}
          <CoreFeatures />
          {/* 4. #glossary — расшифровка терминов сразу за понятиями,
              чтобы новичок видел определение и разбор рядом */}
          <Glossary />
          {/* 5. #threats — бенто-сетка типов угроз и их классификация */}
          <FeaturesBento />
          {/* 6. #defense — методы защиты и фреймворки */}
          <DefenseMethods />
          {/* 7. #how — липкая схема пути запроса и пять шагов */}
          <HowItWorks />
          {/* 8. #demos — 2FA и настройка безопасности аккаунта */}
          <SecurityDemos />
          {/* 9. #numbers — коротко о главном в цифрах */}
          <NumbersStrip stats={numbers} />
          {/* 10. #checklist — три конкретных действия на сегодня */}
          <Checklist />
          {/* 11. #mistakes — памятка: частые ошибки и что делать вместо них */}
          <CommonMistakes />
          {/* 12. #emergency — первые шаги, если неприятность уже случилась */}
          <IfItHappens />        </main>

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