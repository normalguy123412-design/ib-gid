import { Section, SectionHeader } from "@/components/section"
import { AccountSecurity } from "@/components/account-security"
import { PinInputDemo } from "@/components/pin-input-demo"
import { TwoFactorCodeProvider } from "@/components/two-factor-code"
import { Card, CardContent } from "@/components/ui/card"
import { ServerCrashIcon, TerminalIcon } from "lucide-react"

/*
 * Комментарии вынесены на свои строки. Пока они стояли в конце строк кода,
 * самая длинная строка не помещалась в карточку, и блок уезжал под обрез —
 * читалось, что пример недописан.
 */
const snippet = `// Сервер сверяет код из письма
const ok = await codes.match({
  email: user.email,
  // 6 цифр из письма
  code,
  singleUse: true,
})

if (!ok) {
  // защита от перебора
  await rateLimit(user.email)
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
 * Вся логика выполняется локально в браузере. Наружу уходит ровно одно:
 * шестизначный код по нажатию «Отправить код» — на адрес, введённый
 * в первой карточке. Пароль и введённый код никуда не уходят.
 *
 * Раздел рассчитан ровно на один экран: панель не прокручивается вниз,
 * а лишнее по высоте обрезается сверху и снизу. Поэтому на широком экране
 * блоки стоят в три колонки — в две они бы не поместились: справа от кода
 * ещё шёл серверный сниппет, и колонка была вдвое выше соседних.
 *
 * Отступы здесь щедрее, чем в остальных разделах: блоки живут в одной
 * сетке три в ряд, и на общих отступах поля, кнопки и подписи слипались
 * в один плотный список. Запас по высоте у раздела есть — карточки
 * занимают меньше половины экрана.
 */
export function SecurityDemos() {
  return (
    <Section
      id="demos"
      veil="strong"
      label="Демо"
      contentClassName="px-6 py-14 sm:px-10"
    >
      <SectionHeader
        eyebrow="06 — Демо"
        title="Попробуйте руками"
        description="Два примера прямо в браузере: проверка стойкости пароля и вход по шестизначному коду. Код можно отправить себе письмом — уйдёт тот самый, что нарисован во втором блоке."
      />

      {/*
        Обёртка идёт вокруг всей сетки, а не вокруг двух карточек:
        провайдер не рисует разметки, но если он окажется прямым
        ребёнком grid, то станет одной ячейкой из трёх, и третья
        карточка уедет на новую строку.

        Код живёт в общем состоянии: карточка слева отправляет его
        письмом, карточка справа — рисует и сверяет. Пока состояние
        было локальным у второй карточки, связать их было нечем.
      */}
      <TwoFactorCodeProvider>
        <div className="mt-10 grid items-start gap-6 sm:mt-12 lg:grid-cols-3">
          <AccountSecurity />
          <PinInputDemo />

          <Card className="gap-5 [--card-spacing:--spacing(6)]">
            <CardContent className="flex flex-col gap-4">
              <span className="flex items-center gap-2 text-sm font-medium">
                <TerminalIcon className="size-4 text-primary" />
                Что делает сервер
              </span>
              <pre className="overflow-x-auto rounded-lg bg-muted/60 p-5 font-mono text-[0.7rem] leading-relaxed">
                <code>{snippet}</code>
              </pre>
              <p className="flex items-start gap-2.5 text-xs text-pretty text-muted-foreground">
                <ServerCrashIcon className="mt-0.5 size-3.5 shrink-0" />
                Код из письма срабатывает один раз: утечка базы паролей войти
                не даёт, а перебор шестизначного кода упирается в счётчик
                попыток.
              </p>
            </CardContent>
          </Card>
        </div>
      </TwoFactorCodeProvider>
    </Section>
  )
}
