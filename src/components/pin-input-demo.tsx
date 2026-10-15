"use client"

import * as React from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import {
  CopyIcon,
  RefreshCwIcon,
  SmartphoneIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeSlots, type CodeSlotsPalette } from "@/components/code-slots"
import {
  CODE_LENGTH,
  useTwoFactorCode,
} from "@/components/two-factor-code"

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
  const { resolvedTheme } = useTheme()
  // Код общий: письмо с ним уходит из соседней карточки.
  const { secret, refresh } = useTwoFactorCode()

  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  )

  const filled = code.replace(/\D/g, "").length
  const palette = resolvedTheme === "light" ? LIGHT_PALETTE : DARK_PALETTE

  const reset = React.useCallback(() => {
    setCode("")
    setStatus("idle")
  }, [])

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
        {/*
          Блок «Ожидаемый код» лежит внутри карточки, поэтому его
          скругление на ступень меньше её собственного — иначе оба
          уровня читались как один.
        */}
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-5">
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
              refresh()
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
            length={CODE_LENGTH}
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
            Отправки кода здесь больше нет: адрес и кнопка «Отправить
            код» переехали в соседнюю карточку, в строку «Email для
            восстановления». Там человек вводит адрес, которым владеет,
            и письмо приходит с тем самым кодом, что нарисован выше, —
            ради этого и нужен общий код, а не локальный.

            Кнопка «Подтвердить» тоже убрана: проверка и так срабатывает
            сама при вводе шестой цифры (onComplete у CodeSlots), и
            кнопка была лишь вторым путём к тому же самому.
          */}
          <div className="flex flex-wrap items-center justify-center gap-2">
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
          </div>

          <p
            className="text-center font-mono text-xs text-muted-foreground"
            aria-live="polite"
          >
            {status === "success"
              ? "Совпадение подтверждено — фактор принят."
              : status === "error"
                ? "Код отклонён: попытки считаются в журнал безопасности."
                : `Введено ${filled} из ${CODE_LENGTH}`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}