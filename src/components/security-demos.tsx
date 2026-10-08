import { Section, SectionHeader } from "@/components/section"
import { AccountSecurity } from "@/components/account-security"
import { PinInputDemo } from "@/components/pin-input-demo"
import { Card, CardContent } from "@/components/ui/card"
import { ServerCrashIcon, TerminalIcon } from "lucide-react"

const snippet = `// Сервер проверяет код из приложения
const ok = await totp.verify({
  token: code,           // 6 цифр из телефона
  secret: user.totpSecret,
  window: 1,             // допуск ±30 секунд
})

if (!ok) {
  await rateLimit("2fa:" + user.id)   // защита от перебора
  throw new UnauthorizedError()
}` as const

/**
 * СЕКЦИЯ «ДЕМО» (#demos).
 *
 * Три блока:
 * 1) «Настройка безопасности аккаунта» — пошаговый чек-лист;
 * 2) «Двухфакторная аутентификация» — ввод 6-значного кода с имитацией
 *    серверной проверки;
 * 3) что именно делает сервер с этим кодом.
 * Вся логика выполняется локально в браузере, данные никуда не отправляются.
 *
 * Раздел рассчитан ровно на один экран: панель не прокручивается вниз,
 * а лишнее по высоте обрезается сверху и снизу. Поэтому на широком экране
 * блоки стоят в три колонки — в две они бы не поместились: справа от кода
 * ещё шёл серверный сниппет, и колонка была вдвое выше соседних.
 */
export function SecurityDemos() {
  return (
    <Section id="demos" label="Демо">
      <SectionHeader
        eyebrow="07 — Демо"
        title="Попробуйте руками"
        description="Два примера прямо в браузере: проверка стойкости пароля и вход по шестизначному коду. Ничего никуда не отправляется."
      />

      <div className="mt-6 grid items-start gap-4 sm:mt-8 lg:grid-cols-2 xl:grid-cols-3">
        <AccountSecurity />
        <PinInputDemo />

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardContent className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <TerminalIcon className="size-4 text-primary" />
              Что делает сервер
            </span>
            <pre className="overflow-x-auto rounded-lg bg-muted/60 p-3 font-mono text-[0.65rem] leading-relaxed">
              <code>{snippet}</code>
            </pre>
            <p className="flex items-start gap-2 text-xs text-pretty text-muted-foreground">
              <ServerCrashIcon className="mt-0.5 size-3.5 shrink-0" />
              Секрет хранится только на сервере: утечка базы паролей не даёт
              войти, а перебор шестизначного кода упирается в счётчик попыток.
            </p>
          </CardContent>
        </Card>
      </div>
    </Section>
  )
}
