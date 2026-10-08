import { Section, SectionHeader } from "@/components/section"
import { AccountSecurity } from "@/components/account-security"
import { PinInputDemo } from "@/components/pin-input-demo"

/**
 * СЕКЦИЯ «ДЕМО» (#demos).
 *
 * Два интерактивных примера:
 * 1) «Настройка безопасности аккаунта» — пошаговый чек-лист;
 * 2) «Двухфакторная аутентификация» — ввод 6-значного кода с имитацией
 *    серверной проверки.
 * Вся логика выполняется локально в браузере, данные никуда не отправляются.
 *
 * Раздел рассчитан ровно на один экран: панель не прокручивается вниз,
 * а лишнее по высоте обрезается сверху и снизу. Поэтому здесь всего две
 * карточки, а пояснения — короткой строкой вместо абзацев.
 */
export function SecurityDemos() {
  return (
    <Section id="demos" label="Демо">
      <SectionHeader
        eyebrow="07 — Демо"
        title="Попробуйте руками"
        description="Два примера прямо в браузере: проверка стойкости пароля и вход по шестизначному коду. Ничего никуда не отправляется."
      />

      <div className="mt-6 grid gap-4 sm:mt-8 lg:grid-cols-2">
        <AccountSecurity />
        <PinInputDemo />
      </div>
    </Section>
  )
}
