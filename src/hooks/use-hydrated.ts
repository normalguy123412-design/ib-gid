"use client"

import { useSyncExternalStore } from "react"

/** Подписка не нужна: значение зависит только от того, где мы рендерим. */
const noopSubscribe = () => () => {}

/**
 * `false` во время серверного рендера и гидрации, `true` — на клиенте.
 *
 * Нужен там, где значение нельзя получить одинаково на сервере и в браузере
 * (случайный код, время, дата) или где элемент не должен мигать при гидрации.
 * Реализация через useSyncExternalStore обходится без setState в эффекте.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}