import { Section, SectionHeader } from "@/components/section"
import { AccountSecurity } from "@/components/account-security"
import { PinInputDemo } from "@/components/pin-input-demo"
import { Card, CardContent } from "@/components/ui/card"
import { ServerCrashIcon, TerminalIcon } from "lucide-react"

const snippet = `// Как сервер проверяет код из приложения (упрощённо)
const isValid = await totp.verify({
  token: code,            // 6 цифр из телефона
  secret: user.totpSecret,
  window: 1,              // допуск +/- 30 секунд
})

if (!isValid) {
  await rateLimit("2fa:" + user.id)
  throw new UnauthorizedError("Неверный код")
}

await sessions.revokeOthers(user.id)` as const

/**
 * СЕКЦИЯ «ДЕМО» (#demos).
 *
 * Два интерактивных примера:
 * 1) «Настройка безопасности аккаунта» — пошаговый чек-лист;
 * 2) «Двухфакторная аутентификация» — ввод 6-значного кода с имитацией
 *    серверной проверки.
 * Вся логика выполняется локально в браузере, данные никуда не отправляются.
 */
export function SecurityDemos() {
  return (
    <Section id="demos">
      <SectionHeader
        eyebrow="05 — Демо"
        title="Попробуйте руками"
        description="Два примера, которые можно потрогать: проверка надёжности пароля и настоящий вход по шестизначному коду. Всё считается прямо в браузере, ничего никуда не отправляется."
      />

      <div className="mt-10 grid gap-4 sm:mt-14 lg:grid-cols-2">
        <AccountSecurity />
        <div className="flex flex-col gap-4">
          <PinInputDemo />
          <Card>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TerminalIcon className="size-4 text-primary" />
                Что делает сервер
              </div>
              <pre className="overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-xs leading-relaxed">
                <code>{snippet}</code>
              </pre>
              <p className="flex items-start gap-2 text-xs text-pretty text-muted-foreground">
                <ServerCrashIcon className="mt-0.5 size-3.5 shrink-0" />
                Секрет хранится только на сервере: при утечке базы паролей
                восстановить доступ нельзя.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  )
}