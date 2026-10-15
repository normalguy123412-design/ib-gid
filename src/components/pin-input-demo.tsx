"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CopyIcon,
  MailIcon,
  RefreshCwIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeSlots } from "@/components/code-slots"
import {
  CODE_LENGTH,
  useTwoFactorCode,
} from "@/components/two-factor-code"

/**
 * ДЕМО 2: «Двухфакторная аутентификация».
 *
 * Второй фактор здесь — код из письма. Сайт отправляет настоящее письмо
 * с тем самым кодом, который нарисован на карточке: такую проверку можно
 * пройти целиком, не выходя из браузера. «Серверная» проверка при этом
 * имитируется сравнением строк — она происходит тут же, на странице.
 *
 * Поле ввода — Code Slots из React Bits: одно невидимое поле держит
 * фокус, а шесть ячеек лишь показывают результат. Раньше здесь стояли
 * шесть отдельных полей ввода, и из-за этого вставка кода целиком из
 * буфера раскладывалась только по одной цифре. Сейчас работают и вставка,
 * и Backspace, Delete, стрелки, Home/End и клик по любой ячейке.
 */
export function PinInputDemo() {
  // Код общий: письмо с ним уходит из соседней карточки.
  const { secret, refresh } = useTwoFactorCode()

  const [code, setCode] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "success" | "error">(
    "idle"
  )

  const filled = code.replace(/\D/g, "").length

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
        description: "Код не совпал с тем, что пришло в письме.",
      })
    },
    [secret]
  )

  return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <MailIcon className="size-4" />
          </span>
          <Badge variant="outline" className="shrink-0 font-mono text-[0.7rem]">
            Код из письма
          </Badge>
        </div>
        <CardTitle className="mt-2 text-base">
          Двухфакторная аутентификация
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Второй фактор — то, что не утечёт вместе с базой паролей. Код
          приходит письмом на адрес из соседней карточки; вставка из буфера
          и стрелки работают.
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
              (status === "success" ? "text-tone-defense " : "") +
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
                description:
                  "Если письмо уже ушло, отправьте его заново — уйдёт новый код.",
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