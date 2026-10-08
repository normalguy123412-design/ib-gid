"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  AtSignIcon,
  CheckCircle2Icon,
  CircleIcon,
  EyeIcon,
  EyeOffIcon,
  FingerprintIcon,
  IdCardIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  const [email, setEmail] = React.useState("")
  const [emailState, setEmailState] = React.useState<
    "idle" | "valid" | "invalid"
  >("idle")

  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [twoFactor, setTwoFactor] = React.useState(true)
  const [verified, setVerified] = React.useState(false)

  const score = scorePassword(password)
  const strength = strengthLabel(score)

  const confirmEmail = () => {
    if (!EMAIL_RE.test(email)) {
      setEmailState("invalid")
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

  return (
    <Card className="flex flex-col gap-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-5" />
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
        <CardTitle className="mt-3">Настройка безопасности аккаунта</CardTitle>
        <CardDescription>
          Четыре шага, которые закрывают большую часть сценариев атаки на
          учётную запись.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">Готовность аккаунта</span>
            <span className="font-mono text-sm text-muted-foreground">
              {doneCount}/{steps.length} · {percent}%
            </span>
          </div>
          <Progress value={percent} />
          <ul className="mt-1 flex flex-col gap-1.5">
            {steps.map((step) => (
              <li
                key={step.label}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                {step.done ? (
                  <CheckCircle2Icon className="size-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <CircleIcon className="size-3.5 shrink-0 opacity-50" />
                )}
                <span className={step.done ? "text-foreground" : undefined}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <Label htmlFor="acc-email">
            <AtSignIcon className="size-3.5 text-muted-foreground" />
            Email для восстановления
          </Label>
          <div className="flex gap-2">
            <Input
              id="acc-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@company.ru"
              value={email}
              aria-invalid={emailState === "invalid"}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailState !== "idle") setEmailState("idle")
              }}
            />
            <Button
              type="button"
              variant={emailState === "valid" ? "secondary" : "outline"}
              onClick={confirmEmail}
              disabled={emailState === "valid"}
            >
              {emailState === "valid" ? "Готово" : "Подтвердить"}
            </Button>
          </div>
          {emailState === "invalid" ? (
            <p className="text-xs text-destructive">
              Это не похоже на корректный email-адрес.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="acc-password">
            <KeyRoundIcon className="size-3.5 text-muted-foreground" />
            Пароль
          </Label>
          <div className="flex gap-2">
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
          {password ? (
            <div className="flex flex-col gap-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${strength.tone}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Оценка {score}/100 — {strength.text.toLowerCase()}. Надёжный
                пароль длиннее, чем «сложный».
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="acc-2fa" className="cursor-pointer">
              <FingerprintIcon className="size-3.5 text-muted-foreground" />
              Двухфакторная аутентификация
            </Label>
            <p className="text-xs text-muted-foreground">
              Пароль + код из приложения. Защищает даже при утечке пароля.
            </p>
          </div>
          <Switch
            id="acc-2fa"
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 p-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="acc-id" className="cursor-pointer">
              <IdCardIcon className="size-3.5 text-muted-foreground" />
              Верификация личности
            </Label>
            <p className="text-xs text-muted-foreground">
              Возвращает доступ, если все каналы восстановления утеряны.
            </p>
          </div>
          <Switch
            id="acc-id"
            checked={verified}
            onCheckedChange={(checked) => {
              setVerified(checked)
              toast(
                checked ? "success" : "info",
                {
                  description: checked
                    ? "Код восстановления сохранён офлайн."
                    : "Верификация отключена.",
                }
              )
            }}
          />
        </div>
      </CardContent>

      <CardFooter>
        <p className="text-xs text-pretty text-muted-foreground">
          Ничего из этого не отправляется на сервер — демонстрация работает
          полностью в браузере.
        </p>
      </CardFooter>
    </Card>
  )
}