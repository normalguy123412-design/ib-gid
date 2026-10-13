"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  AtSignIcon,
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  IdCardIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { useTwoFactorCode } from "@/components/two-factor-code"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Адрес почтовой функции.
 *
 * Сайт собирается статикой, поэтому адрес известен только на момент сборки
 * и вшивается в код. Если переменной нет — кнопка отправки не появляется,
 * и строка восстановления ведёт себя как раньше: проверяет адрес на вид и
 * отмечает первый шаг чек-листа. Демонстрация в обоих случаях должна
 * выглядеть цельно, а не как кнопка, которая никуда не ведёт.
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

function scorePassword(value: string) {
  let score = 0
  if (value.length >= 12) score += 25
  if (value.length >= 16) score += 15
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 20
  if (/\d/.test(value)) score += 15
  if (/[^A-Za-z0-9]/.test(value)) score += 15
  if (/(.)\1{2,}/.test(value)) score -= 10
  const common = ["password", "qwerty", "123456", "admin", "iloveyou"]
  if (common.some((word) => value.toLowerCase().includes(word))) score -= 40
  return Math.max(0, Math.min(100, score))
}

function strengthLabel(score: number) {
  if (score >= 80) return { text: "Очень надёжный", tone: "bg-emerald-500" }
  if (score >= 55) return { text: "Надёжный", tone: "bg-lime-500" }
  if (score >= 30) return { text: "Средний", tone: "bg-amber-500" }
  return { text: "Слабый", tone: "bg-destructive" }
}

/**
 * ДЕМО 1: «Настройка безопасности аккаунта».
 *
 * Пошаговый чек-лист (подтверждение email → надёжный пароль → 2FA →
 * верификация личности) и оценка стойкости пароля.
 * Проверка стойкости — упрощённая эвристика для наглядности,
 * в реальной системе пароль оценивают на сервере.
 */
export function AccountSecurity() {
  // Код живёт в соседней карточке 2FA: письмо уходит с тем самым
  // значением, которое человек затем вводит в поле кода.
  const { secret } = useTwoFactorCode()
  const canSend = Boolean(CODE_API && secret)

  const [email, setEmail] = React.useState("")
  const [emailState, setEmailState] = React.useState<
    "idle" | "valid" | "invalid"
  >("idle")

  /* Отправка кода подтверждения письмом. */
  const [mail, setMail] = React.useState<
    "idle" | "sending" | "sent" | "error"
  >("idle")
  const [mailNote, setMailNote] = React.useState("")

  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [twoFactor, setTwoFactor] = React.useState(true)
  const [verified, setVerified] = React.useState(false)

  const score = scorePassword(password)
  const strength = strengthLabel(score)

  const rejectEmail = () => {
    setEmailState("invalid")
    setMail("idle")
    setMailNote("")
  }

  const confirmEmail = () => {
    if (!EMAIL_RE.test(email)) {
      rejectEmail()
      toast.error("Некорректный email", {
        description: "Проверьте адрес — например, name@company.ru",
      })
      return
    }
    setEmailState("valid")
    toast.success("Адрес подтверждён", {
      description: "На него отправлена ссылка для восстановления доступа.",
    })
  }

  /**
   * Отправляет текущий код из карточки 2FA.
   *
   * Успех засчитывается как первый шаг чек-листа: письмо на адрес и есть
   * доказательство, что адрес принадлежит вам, — ровно так работает и
   * настоящее подтверждение. Слово «Подтвердить» исчезает только когда
   * письмо действительно уходит.
   */
  const sendCode = async () => {
    if (!secret || mail === "sending") return

    if (!EMAIL_RE.test(email)) {
      rejectEmail()
      toast.error("Некорректный email", {
        description: "Проверьте адрес — например, name@company.ru",
      })
      return
    }

    setMail("sending")
    setMailNote("")
    setEmailState("idle")

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
        setEmailState("valid")
        setMailNote(`Письмо с кодом отправлено на ${email.trim()}.`)
        toast.success("Код отправлен", {
          description: "Введите его в соседней карточке — там он нарисован.",
        })
        return
      }

      setMail("error")
      setMailNote(
        MAIL_ERRORS[data.reason ?? ""] ??
          "Не удалось отправить письмо. Попробуйте позже."
      )
    } catch {
      /* Сеть недоступна или адрес функции неверный — на защите это просто
         неработающая кнопка, а не падение страницы. */
      setMail("error")
      setMailNote("Почтовый сервис недоступен.")
    }
  }

  const identityStep = verified
  const steps = [
    { label: "Email подтверждён", done: emailState === "valid" },
    { label: "Надёжный пароль (12+ символов)", done: score >= 55 },
    { label: "Двухфакторная аутентификация", done: twoFactor },
    { label: "Верификация личности", done: identityStep },
  ]
  const doneCount = steps.filter((step) => step.done).length
  const percent = Math.round((doneCount / steps.length) * 100)
  const level = percent === 100 ? "max" : percent >= 50 ? "good" : "weak"

  /*
 * gap-0 здесь стоял, чтобы шапка и содержимое шли вплотную: карточка
 * сама разносит их на --card-spacing. Но явно обнулённый промежуток
 * прижимал полоску готовности к подписи «Email для восстановления» —
 * между ними не оставалось ни пикселя. Теперь промежуток карточки
 * остаётся в силе.
 */
return (
    <Card className="[--card-spacing:--spacing(6)]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-4" />
          </span>
          <Badge
            variant={level === "weak" ? "destructive" : "secondary"}
            className="shrink-0"
          >
            {level === "max"
              ? "Максимальная защита"
              : level === "good"
                ? "Базовая защита"
                : "Уязвимо"}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-base">
          Настройка безопасности аккаунта
        </CardTitle>

        {/*
          Четыре шага перечислены не отдельным списком, а самими полями и
          переключателями ниже — так они занимают одну строку вместо пяти и
          остаются на одном экране вместе с остальными демо.
        */}
        <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
          <span>Готовность аккаунта</span>
          <span className="font-mono">
            {doneCount}/{steps.length} · {percent}%
          </span>
        </div>
        <Progress value={percent} />
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="acc-email" className="text-xs">
            <AtSignIcon className="size-3.5 text-muted-foreground" />
            {canSend ? "Куда прислать код" : "Email для восстановления"}
          </Label>
          <div className="flex gap-3">
            <Input
              id="acc-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@company.ru"
              value={email}
              disabled={mail === "sending"}
              aria-invalid={emailState === "invalid"}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailState !== "idle") setEmailState("idle")
                if (mail !== "idle") {
                  setMail("idle")
                  setMailNote("")
                }
              }}
            />
            {canSend ? (
              <Button
                type="button"
                size="sm"
                variant={emailState === "valid" ? "secondary" : "default"}
                onClick={() => void sendCode()}
                disabled={
                  mail === "sending" || emailState === "valid" || !email.trim()
                }
              >
                {mail === "sending"
                  ? "Отправляем…"
                  : emailState === "valid"
                    ? "Готово"
                    : "Отправить код"}
              </Button>
            ) : (
              /* Без адреса сервиса отправлять нечем — остаётся прежнее
                 поведение: проверить адрес на вид и отметить шаг. */
              <Button
                type="button"
                size="sm"
                variant={emailState === "valid" ? "secondary" : "outline"}
                onClick={confirmEmail}
                disabled={emailState === "valid"}
              >
                {emailState === "valid" ? "Готово" : "Подтвердить"}
              </Button>
            )}
          </div>
          {emailState === "invalid" ? (
            <p className="text-xs text-destructive">
              Это не похоже на корректный email-адрес.
            </p>
          ) : null}
          {mailNote ? (
            <p
              role="status"
              className={
                "text-xs " +
                (mail === "error" ? "text-destructive" : "text-muted-foreground")
              }
            >
              {mailNote}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="acc-password" className="text-xs">
            <KeyRoundIcon className="size-3.5 text-muted-foreground" />
            Пароль
          </Label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                id="acc-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Минимум 12 символов"
                className="pr-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-1/2 right-1 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOffIcon className="size-3.5" />
                ) : (
                  <EyeIcon className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${strength.tone}`}
              style={{ width: `${password ? score : 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {password
              ? `Оценка ${score}/100 — ${strength.text.toLowerCase()}. Надёжный пароль длиннее, чем «сложный».`
              : "Оценка появляется при вводе. Надёжный пароль длиннее, чем «сложный»."}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <Label htmlFor="acc-2fa" className="cursor-pointer text-xs">
            <FingerprintIcon className="size-3.5 text-muted-foreground" />
            Двухфакторная аутентификация — пароль плюс код из приложения
          </Label>
          <Switch
            id="acc-2fa"
            className="shrink-0"
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-4">
          <Label htmlFor="acc-id" className="cursor-pointer text-xs">
            <IdCardIcon className="size-3.5 text-muted-foreground" />
            Верификация личности — вернёт доступ при утере каналов восстановления
          </Label>
          <Switch
            id="acc-id"
            className="shrink-0"
            checked={verified}
            onCheckedChange={(checked) => {
              setVerified(checked)
              toast(checked ? "success" : "info", {
                description: checked
                  ? "Код восстановления сохранён офлайн."
                  : "Верификация отключена.",
              })
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}