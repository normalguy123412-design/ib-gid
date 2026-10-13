"use client"

import * as React from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  CopyIcon,
  RefreshCwIcon,
  SmartphoneIcon,
} from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CodeSlots, type CodeSlotsPalette } from "@/components/code-slots"
import { cn } from "cn"

const LENGTH = 6

/**
 * Адрес почтовой функции.
 *
 * Сайт собирается статикой, поэтому адрес известен только на момент
 * сборки и вшивается в код. Если переменной нет — блок отправки вообще
 * не рисуется, и демонстрация остаётся ровно такой, какой была до
 * появления сервера: пустой блок с кнопкой, которая никуда не ведёт,
 * выглядел бы как поломка.
 */
const CODE_API = process.env.NEXT_PUBLIC_CODE_API ?? ""

/** Что сказать при каждом отказе сервера. Тексты сервера намеренно обезличены. */
const MAIL_ERRORS: Record<string, string> = {
  "bad-email": "Похоже, в адресе опечатка.",
  "too-many-from-you":
    "С этого компьютера ушло слишком много запросов. Попробуйте через час.",
  "too-many-to-email":
    "На этот адрес уже уходило несколько писем. Попробуйте другой.",
  "mail-failed": "Почтовый сервис не ответил. Попробуйте позже.",
  forbidden: "Запрос отклонён: сайт не разрешён к отправке.",
}

function randomCode() {
  return Array.from({ length: LENGTH }, () =>
    Math.floor(Math.random() * 10)
  ).join("")
}

/**
 * Цвета ячеек под тему.
 *
 * Акцент и цифра — противоположной светлоты: цифра рисуется поверх
 * заливки ячейки, и при одинаковой светлоте её не прочитать. Остальное
 * взято из палитры сайта: пустая ячейка чуть темнее фона, курсор —
 * цвет основного текста.
 *
 * До гидрарации тема неизвестна — рисуем тёмную, она и так первая.
 */
const DARK_PALETTE: CodeSlotsPalette = {
  accentColor: "#0ea5e9",
  inkColor: "#e4e4e7",
  slotColor: "#1c1c21",
  digitColor: "#082f49",
  dangerColor: "#ef4444",
}

const LIGHT_PALETTE: CodeSlotsPalette = {
  accentColor: "#0284c7",
  inkColor: "#18181b",
  slotColor: "#e4e4e7",
  digitColor: "#f0f9ff",
  dangerColor: "#dc2626",
}

/**
 * ДЕМО 2: «Двухфакторная аутентификация».
 *
 * Поле ввода 6-значного кода с имитацией проверки. Ожидаемый код
 * генерируется локально, «серверная» проверка имитируется сравнением
 * строк.
 *
 * Поле ввода — Code Slots из React Bits: одно невидимое поле держит
 * фокус, а шесть ячеек лишь показывают результат. Раньше здесь стояли
 * шесть отдельных полей ввода, и из-за этого вставка кода целиком из
 * буфера и подстановка кода из СМС раскладывались только по одной
 * цифре. Сейчас работают и то, и другое, плюс Backspace, Delete,
 * стрелки, Home/End и клик по любой ячейке.
 */
export function PinInputDemo() {
  const hydrated = useHydrated()
  const { resolvedTheme } = useTheme()

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

  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  )

  /* Отправка кода по почте. */
  const [email, setEmail] = React.useState("")
  const [mail, setMail] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")
  const [mailNote, setMailNote] = React.useState("")

  const filled = code.replace(/\D/g, "").length
  const palette = resolvedTheme === "light" ? LIGHT_PALETTE : DARK_PALETTE

  const reset = React.useCallback(() => {
    setCode("")
    setStatus("idle")
  }, [])

  const sendCode = React.useCallback(async () => {
    if (!secret || mail === "sending") return

    setMail("sending")
    setMailNote("")

    try {
      const response = await fetch(`${CODE_API}/api/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: secret }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        reason?: string
      }

      if (response.ok && data.ok) {
        setMail("sent")
        setMailNote(`Письмо с кодом отправлено на ${email.trim()}.`)
        toast.success("Код отправлен", {
          description: "Проверьте почту — демонстрация отправки работает.",
        })
        return
      }

      setMail("error")
      setMailNote(
        MAIL_ERRORS[data.reason ?? ""] ??
          "Не удалось отправить письмо. Попробуйте позже."
      )
    } catch {
      /* Сеть недоступна или адрес функции неверный — на защите это
         просто неработающая кнопка, а не падение страницы. */
      setMail("error")
      setMailNote("Почтовый сервис недоступен.")
    }
  }, [email, mail, secret])

  const verify = React.useCallback(
    (value: string) => {
      if (secret && value === secret) {
        setStatus("success")
        toast.success("Вход разрешён", {
          description: "Второй фактор подтверждён. Сессия помечена как доверенная.",
        })
        return
      }
      setStatus("error")
      toast.error("Неверный код", {
        description: "Код не совпал с тем, что показал аутентификатор.",
      })
    },
    [secret]
  )

  return (
    <Card className="[--card-spacing:--spacing(6)]">
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

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-muted/40 p-5">
          <span className="text-[0.7rem] uppercase text-muted-foreground">
            Ожидаемый код
          </span>
          <code
            className={
              "font-mono text-2xl font-semibold tracking-[0.4em] " +
              (secret ? "" : "opacity-40 ") +
              (status === "success" ? "text-emerald-500 " : "") +
              (status === "error" ? "text-destructive" : "")
            }
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

        <div className="flex flex-col items-center gap-2">
          {/* Подпись и поле больше не склеены: раньше legend внутри
              fieldset не участвовал в раскладке flex-контейнера и
              отступ до поля схлопывался в ноль. */}
          <p className="mb-1 text-xs font-medium">Введите 6-значный код</p>

          <CodeSlots
            length={LENGTH}
            value={code}
            onChange={(next) => {
              setCode(next)
              if (status !== "idle") setStatus("idle")
            }}
            onComplete={verify}
            status={status}
            palette={palette}
            ariaLabel="Введите 6-значный код"
          />

          {/*
            Отправка кода по почте стоит в одном ряду с остальными
            действиями, а не отдельным блоком внизу.

            Раньше под полем для кода был отдельный огороженный блок «от
            править этот код себе» со своим заголовком и пояснением, а под
            ним — ещё и строка состояния. Получалось два «низа» подряд, и
            взгляд упирался в пустое место вместо кнопок. Теперь всё
            управление лежит в одной строке, а пояснение о том, что код
            виден на экране, ушло в само письмо — там оно и уместнее.

            Поле и кнопка рисуются только если адрес сервиса задан при
            сборке: иначе кнопка вела бы в никуда и выглядела бы как
            поломка, а демонстрация должна либо работать целиком, либо
            остаться ровно такой, какой была до появления сервера.
          */}
          <form
            className="flex flex-wrap items-center justify-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void sendCode()
            }}
          >
            {CODE_API && secret ? (
              <>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-label="Адрес для отправки кода"
                  value={email}
                  disabled={mail === "sending"}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (mail !== "idle") setMail("idle")
                  }}
                  className="h-9 w-full min-w-44 flex-1 sm:w-52"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9"
                  disabled={mail === "sending" || !email.trim()}
                >
                  {mail === "sending" ? "Отправляем…" : "Отправить код"}
                </Button>
              </>
            ) : null}

            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9"
              onClick={reset}
              disabled={filled === 0}
            >
              Очистить
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9"
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
          </form>

          {mailNote ? (
            <p
              role="status"
              className={cn(
                "max-w-[32rem] text-center text-[0.7rem]",
                mail === "error" ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {mailNote}
            </p>
          ) : null}

          {/*
            Кнопка «Подтвердить» убрана: проверка и так срабатывает сама
            при вводе шестой цифры (onComplete у CodeSlots), и кнопка была
            вторым путём к тому же самому. Строка состояния осталась — в
            ней видно, что произошло.
          */}
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
        </div>
      </CardContent>
    </Card>
  )
}