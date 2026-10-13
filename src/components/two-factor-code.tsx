"use client"

import * as React from "react"
import { useHydrated } from "@/hooks/use-hydrated"

/** Длина кода. Единственный источник: обе карточки берут число отсюда. */
export const CODE_LENGTH = 6

function randomCode() {
  return Array.from({ length: CODE_LENGTH }, () =>
    Math.floor(Math.random() * 10)
  ).join("")
}

interface TwoFactorCode {
  /**
   * Настоящий код. До гидрации он неизвестен — на сервере пришлось бы
   * отдавать заглушку и подставлять реальное значение уже на клиенте,
   * иначе HTML и первый рендер не совпали бы.
   */
  secret: string | null
  /** Пересчитать код — кнопка «Обновить код». */
  refresh: () => void
}

const TwoFactorCodeContext = React.createContext<TwoFactorCode>({
  secret: null,
  refresh: () => {},
})

/**
 * Код шестизначного входа живёт здесь, а не в карточке 2FA.
 *
 * Письмо с кодом отправляется из соседней карточки — из строки «Email для
 * восстановления», где человек и вводит адрес, которым владеет. Отправлять
 * надо ровно тот код, который сейчас нарисован во второй карточке, иначе
 * демонстрация рассыпается: письмо пришло бы с одним кодом, а сверяться
 * пришлось бы с другим.
 */
export function TwoFactorCodeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const hydrated = useHydrated()
  // Счётчик, который заставляет пересчитать код по кнопке «Обновить код».
  // Он не читается в теле мемо, но служит его причиной.
  const [version, setVersion] = React.useState(0)

  const secret = React.useMemo(() => {
    void version
    return hydrated ? randomCode() : null
  }, [hydrated, version])

  const refresh = React.useCallback(() => {
    setVersion((v) => v + 1)
  }, [])

  const value = React.useMemo(
    () => ({ secret, refresh }),
    [secret, refresh]
  )

  return (
    <TwoFactorCodeContext.Provider value={value}>
      {children}
    </TwoFactorCodeContext.Provider>
  )
}

/** Текущий код и способ его обновить. */
export function useTwoFactorCode() {
  return React.useContext(TwoFactorCodeContext)
}