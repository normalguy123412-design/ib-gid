"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CopyIcon,
  CornerDownLeftIcon,
  DeleteIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TerminalIcon,
} from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "cn"

const LENGTH = 6

/**
 * Что делает сервер с введённым кодом.
 *
 * Раньше это был отдельный блок под карточкой, и раздел 07 не влезал в
 * один экран. Код относится именно к проверке TOTP, поэтому переехал
 * внутрь же карточки — и заодно стал короче.
 */
const snippet = `// Сервер проверяет код
const ok = await totp.verify({
  token: code,           // 6 цифр из телефона
  secret: user.totpSecret,
  window: 1,             // допуск ±30 секунд
})

if (!ok) {
  await rateLimit("2fa:" + user.id)   // защита от перебора
  throw new UnauthorizedError()
}` as const

function randomCode() {
  return Array.from({ length: LENGTH }, () =>
    Math.floor(Math.random() * 10)
  ).join("")
}

/**
 * ДЕМО 2: «Двухфакторная аутентификация».
 *
 * Поле ввода 6-значного кода с имитацией проверки. Ожидаемый код
 * генерируется локально, «серверная» проверка имитируется сравнением
 * строк с задержкой в несколько сотен миллисекунд.
 * Поддерживаются стрелки, Backspace/Delete, вставка из буфера и Enter.
 */
export function PinInputDemo() {
  const hydrated = useHydrated()
  // Версия кода: увеличивается по кнопке «Обновить код» и пересчитывает его.
  const [version, setVersion] = React.useState(0)
  // На сервере код неизвестен, поэтому рендерим заглушку и получаем
  // настоящее значение уже на клиенте — так SSR и гидрация совпадают.
  // `version` — счётчик, который заставляет пересчитать код по кнопке
  // «Обновить код»: он не читается в теле мемо, но служит его причиной.
  const secret = React.useMemo(() => {
    void version
    return hydrated ? randomCode() : null
  }, [hydrated, version])
  const [digits, setDigits] = React.useState<string[]>(() =>
    Array.from({ length: LENGTH }, () => "")
  )
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  )
  const refs = React.useRef<Array<HTMLInputElement | null>>([])

  const value = digits.join("")
  const filled = digits.filter(Boolean).length

  const reset = React.useCallback(() => {
    setDigits(Array.from({ length: LENGTH }, () => ""))
    setStatus("idle")
  }, [])

  const setDigit = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "").slice(-1)
    setStatus("idle")
    setDigits((prev) => {
      const next = [...prev]
      if (cleaned) {
        next[index] = cleaned
      } else {
        next[index] = ""
      }
      return next
    })
    if (cleaned && index < LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      if (digits[index]) {
        setDigit(index, "")
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        setDigit(index - 1, "")
      }
      return
    }
    if (e.key === "Delete") {
      e.preventDefault()
      setDigit(index, "")
      return
    }
    if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus()
    }
    if (e.key === "Enter") {
      verify()
    }
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "")
    if (!text) return
    e.preventDefault()
    const next = Array.from({ length: LENGTH }, (_, i) => text[i] ?? "")
    setStatus("idle")
    setDigits(next)
    const last = Math.min(text.length, LENGTH) - 1
    refs.current[Math.max(last, 0)]?.focus()
  }

  const verify = React.useCallback(() => {
    if (filled !== LENGTH) {
      setStatus("idle")
      toast.warning("Введите все шесть цифр", {
        description: `Заполнено ${filled} из ${LENGTH}.`,
      })
      return
    }
    if (secret && value === secret) {
      setStatus("success")
      toast.success("Вход разрешён", {
        description:
          "Второй фактор подтверждён. Сессия помечена как доверенная.",
      })
      return
    }
    setStatus("error")
    toast.error("Неверный код", {
      description: "Код не совпал с тем, что показал аутентификатор.",
    })
  }, [filled, secret, value])

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <SmartphoneIcon className="size-4" />
          </span>
          <Badge variant="outline" className="shrink-0 font-mono text-[0.7rem]">
            TOTP · RFC 6238
          </Badge>
        </div>
        <CardTitle className="mt-2 text-base">
          Двухфакторная аутентификация
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Второй фактор — то, что не утечёт вместе с базой паролей. Код
          обновляется каждые 30 секунд, вставка из буфера и стрелки работают.
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border bg-muted/40 p-3">
          <span className="text-[0.7rem] uppercase text-muted-foreground">
            Ожидаемый код
          </span>
          <code
            className={cn(
              "font-mono text-2xl font-semibold tracking-[0.4em]",
              secret ? "" : "opacity-40",
              status === "success" && "text-emerald-500",
              status === "error" && "text-destructive"
            )}
            aria-live="polite"
          >
            {secret ? `${secret.slice(0, 3)} ${secret.slice(3)}` : "••• •••"}
          </code>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="gap-1 font-mono"
            onClick={() => {
              setVersion((v) => v + 1)
              reset()
              toast.info("Код обновлён", {
                description: "Новый код действует следующие 30 секунд.",
              })
            }}
          >
            <RefreshCwIcon className="size-3" />
            Обновить код
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            verify()
          }}
          className="flex flex-col gap-2"
        >
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs font-medium">
              Введите 6-значный код
            </legend>
            <div className="flex justify-center gap-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    refs.current[index] = el
                  }}
                  value={digit}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  pattern="\d"
                  maxLength={1}
                  aria-label={`Цифра ${index + 1} из ${LENGTH}`}
                  onChange={(e) => setDigit(index, e.target.value)}
                  onKeyDown={(e) => onKeyDown(index, e)}
                  onPaste={onPaste}
                  onFocus={(e) => e.currentTarget.select()}
                  className={cn(
                    "size-10 rounded-lg border border-input bg-transparent text-center font-mono text-lg font-semibold transition-all outline-none",
                    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    digit && "border-primary bg-primary/5 text-foreground",
                    status === "success" && "border-emerald-500",
                    status === "error" && "border-destructive"
                  )}
                />
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button type="submit" size="sm" disabled={filled !== LENGTH}>
              <CornerDownLeftIcon data-icon="inline-start" />
              Подтвердить
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={reset}
              disabled={filled === 0}
            >
              <DeleteIcon data-icon="inline-start" />
              Очистить
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={!secret}
              onClick={async () => {
                if (!secret) return
                try {
                  await navigator.clipboard.writeText(secret)
                  toast.success("Код скопирован")
                } catch {
                  toast.error("Буфер обмена недоступен")
                }
              }}
            >
              <CopyIcon data-icon="inline-start" />
              Скопировать
            </Button>
          </div>

          <p
            className="text-center font-mono text-xs text-muted-foreground"
            aria-live="polite"
          >
            {status === "success"
              ? "Совпадение подтверждено — фактор принят."
              : status === "error"
                ? "Код отклонён: попытки считаются в журнал безопасности."
                : `Введено ${filled} из ${LENGTH}`}
          </p>
        </form>

        <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-2">
          <span className="flex items-center gap-1.5 text-xs font-medium">
            <TerminalIcon className="size-3.5 text-primary" />
            Что делает сервер
          </span>
          <pre className="overflow-x-auto rounded-md bg-muted/60 p-2 font-mono text-[0.65rem] leading-relaxed">
            <code>{snippet}</code>
          </pre>
          <p className="text-xs text-pretty text-muted-foreground">
            Секрет хранится только на сервере: утечка базы паролей не даёт
            войти. Перебор шестизначного кода упирается в счётчик попыток.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}