import { AuroraHero } from "@/components/aurora-hero"
import { CoreFeatures } from "@/components/core-features"
import { DefenseMethods } from "@/components/defense-methods"
import { FaqWithCategories } from "@/components/faq-with-categories"
import { FeaturesBento } from "@/components/features-bento"
import { Glossary } from "@/components/glossary"
import { ScrollRail } from "@/components/scroll-rail"
import { SecurityDemos } from "@/components/security-demos"
import { SecurityWorld } from "@/components/security-world"
import { SiteFooter } from "@/components/site-footer"
import { StartHere } from "@/components/start-here"

/**
 * Одностраничный сайт «ИБ-Гид».
 *
 * Порядок секций повторяет учебный путь читателя:
 * с чего начать → понятия → угрозы → защита → демо → словарик → FAQ.
 * Верхней навигационной панели нет: разделы переключаются точками в нижней
 * полосе прогресса (см. ScrollRail), а `id` секций должны совпадать
 * с `href` в `navItems` (см. src/lib/content.ts).
 */
export default function Home() {
  return (
    <>
      {/* Анимированный фон на весь экран: z-0, весь контент лежит выше. */}
      <SecurityWorld />

      {/* relative + z-10 — контент поверх фонового canvas. */}
      <main className="relative z-10 flex-1">
        {/* 0. Первый экран (hero) с CTA «Начать изучение» → #start */}
        <AuroraHero />
        {/* 1. #start — три шага для тех, кто совсем новичок */}
        <StartHere />
        {/* 2. #concepts — что такое ИБ и три главных свойства */}
        <CoreFeatures />
        {/* 3. #threats — бенто-сетка типов угроз и их классификация */}
        <FeaturesBento />
        {/* 4. #defense — методы защиты и фреймворки */}
        <DefenseMethods />
        {/* 5. #demos — 2FA и настройка безопасности аккаунта */}
        <SecurityDemos />
        {/* 6. #glossary — расшифровка терминов простым языком */}
        <Glossary />
        {/* 7. #faq — аккордеон с часто задаваемыми вопросами */}
        <FaqWithCategories />
      </main>

      {/* Подвал: разделы, ресурсы и копирайт. */}
      <SiteFooter />

      {/* Нижняя полоса прогресса с точками разделов и переключателем темы. */}
      <ScrollRail />
    </>
  )
}