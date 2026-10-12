"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import TechText, { TECH_TEXT_PRESET } from "@/components/tech-text"
import { useHydrated } from "@/hooks/use-hydrated"

/**
 * ЗАГОЛОВОК ПЕРВОГО ЭКРАНА.
 *
 * Текст нарисован на canvas — надпись рассыпается на пунктир под курсором.
 * У компонента две особенности, из-за которых он не годится напрямую:
 *
 *   1. Canvas не понимает currentColor: цвет приходится передавать
 *      строкой. На тёмной теме буквы почти белые, на светлой — почти
 *      чёрные, поэтому цвет выбирается здесь, через next-themes. Проп
 *      обновляется на каждом рендере, и компонент перерисовывает надпись
 *      сам.
 *   2. На узком экране надпись из 27 букв в одну строку не помещается и
 *      ужимается до нечитаемого кегля. Там показывается обычный текст с
 *      переносом на две строки.
 *
 * Настоящий <h1> есть в обоих случаях: на широком экране он скрыт от
 * глаз, но остаётся для читалок и поиска.
 */
export function HeroTitle() {
  const { resolvedTheme } = useTheme()
  const hydrated = useHydrated()

  // До гидрации тема неизвестна — рисуем текст, чтобы не мигнуло.
  if (!hydrated || !resolvedTheme) {
    return (
      <h1 className="text-center font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
        {TECH_TEXT_PRESET.text}
      </h1>
    )
  }

  const dark = resolvedTheme === "dark"

  return (
    <>
      {/*
        Заголовок один и тот же в обоих случаях: на узком экране он
        видим и переносится на две строки, на широком — скрыт от глаз, но
        остаётся в дереве для читалок и поиска. Второго заголовка
        специально не делаем: иначе на телефоне страница начиналась бы с
        h2, которого на странице нигде больше нет.
      */}
      <h1 className="text-center font-heading text-4xl font-semibold tracking-tight text-balance lg:sr-only">
        {TECH_TEXT_PRESET.text}
      </h1>

      <div aria-hidden className="hidden lg:block">
        {/* Высота контейнера задаёт кегль: компонент вписывает надпись
            и по ширине, и по высоте. 104 px дают около 55 px текста —
            столько же, сколько давал обычный sm:text-6xl. */}
        <div className="h-[104px] w-full">
          <TechText
            {...TECH_TEXT_PRESET}
            color={dark ? "#fafafa" : "#09090b"}
            accentColor={dark ? "#38bdf8" : "#0369a1"}
          />
        </div>
      </div>
    </>
  )
}