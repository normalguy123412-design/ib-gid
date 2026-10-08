import { AuroraHero } from "@/components/aurora-hero"
import { Checklist } from "@/components/checklist"
import { CommonMistakes } from "@/components/common-mistakes"
import { CoreFeatures } from "@/components/core-features"
import { DefenseMethods } from "@/components/defense-methods"
import { FaqWithCategories } from "@/components/faq-with-categories"
import { FeaturesBento } from "@/components/features-bento"
import { Glossary } from "@/components/glossary"
import { HorizontalScroll } from "@/components/horizontal-scroll"
import { HowItWorks } from "@/components/how-it-works"
import { IfItHappens } from "@/components/if-it-happens"
import { NumbersStrip } from "@/components/numbers-strip"
import { ProjectGoal } from "@/components/project-goal"
import { ScrollRail } from "@/components/scroll-rail"
import { SecurityDemos } from "@/components/security-demos"
import { SecurityWorld } from "@/components/security-world"
import { SiteFooter } from "@/components/site-footer"
import { StartHere } from "@/components/start-here"

/**
 * Одностраничный сайт «ИБ-Гид».
 *
 * Порядок секций повторяет учебный путь читателя:
 * старт → понятия → угрозы → защита → как это работает → демо →
 * словарик → цифры → чек-лист → FAQ.
 * Верхней навигационной панели нет: разделы переключаются точками в нижней
 * полосе прогресса (см. ScrollRail), а `id` секций должны совпадать
 * с `href` в `navItems` (см. src/lib/content.ts).
 */
export default function Home() {
  return (
    <>
      {/* Анимированный фон на весь экран передаётся в ленту как background. */}

      {/* Лента разделов: прокрутка вниз двигает её вправо. Фон передан
          внутрь, чтобы он двигался вместе с содержимым, а не стоял. */}
      <HorizontalScroll background={<SecurityWorld />}>
        {/* main остаётся landmark'ом и растягивается вдоль всей ленты,
            чтобы разделы были его прямыми флекс-потомками. */}
        <main className="relative z-10 flex h-full w-max">
          {/* 0. Первый экран (hero) с CTA «Начать изучение» → #start */}
          <AuroraHero />
          {/* 1. #about — цель, задачи, автор и источники работы */}
          <ProjectGoal />
          {/* 2. #start — три шага для тех, кто совсем новичок */}
          <StartHere />
          {/* 3. #concepts — что такое ИБ и три главных свойства */}
          <CoreFeatures />
          {/* 4. #threats — бенто-сетка типов угроз и их классификация */}
          <FeaturesBento />
          {/* 5. #defense — методы защиты и фреймворки */}
          <DefenseMethods />
          {/* 6. #how — липкая схема пути запроса и пять шагов */}
          <HowItWorks />
          {/* 7. #demos — 2FA и настройка безопасности аккаунта */}
          <SecurityDemos />
          {/* 8. #glossary — расшифровка терминов простым языком */}
          <Glossary />
          {/* 9. #numbers — коротко о главном в цифрах */}
          <NumbersStrip stats={numbers} />
          {/* 10. #checklist — три конкретных действия на сегодня */}
          <Checklist />
          {/* 11. #mistakes — памятка: частые ошибки и что делать вместо них */}
          <CommonMistakes />
          {/* 12. #emergency — первые шаги, если неприятность уже случилась */}
          <IfItHappens />
          {/* 13. #faq — вопросы по темам */}
          <FaqWithCategories />
        </main>

        {/* Подвал: разделы, ресурсы и копирайт. Последняя панель ленты. */}
        <SiteFooter />
      </HorizontalScroll>

      {/* Нижняя полоса прогресса с точками разделов и переключателем темы. */}
      <ScrollRail />
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