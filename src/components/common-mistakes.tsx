import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import { Section, SectionHeader } from "@/components/section"
import { commonMistakes } from "@/lib/content"

/**
 * СЕКЦИЯ «ЧАСТЫЕ ОШИБКИ» (#mistakes).
 *
 * Памятка в формате «ошибка → как правильно». Слева привычка, которой
 * соответствует большинство неприятностей, справа — конкретная замена.
 * Формат выбран потому, что человек узнаёт свою привычку и сразу видит
 * действие, а не должен догадываться, что из этого следует.
 */
export function CommonMistakes() {
  return (
    <Section id="mistakes">
      <SectionHeader
        eyebrow="06 — Памятка"
        title="Частые ошибки"
        description="Почти все неприятности начинаются с одной из этих шести привычек. Слева — то, что делают чаще всего, справа — что делать вместо этого."
      />

      <div className="mt-10 flex flex-col gap-3 sm:mt-14">
        {commonMistakes.map((item) => (
          <div
            key={item.mistake}
            className="grid items-start gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary/30 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4"
          >
            <div className="flex items-start gap-2.5">
              <XIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <span className="text-sm text-pretty text-muted-foreground">
                {item.mistake}
              </span>
            </div>

            <ArrowRightIcon className="hidden size-4 shrink-0 text-muted-foreground/60 sm:block" />

            <div className="flex items-start gap-2.5 sm:pl-0">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-500" />
              <span className="text-sm font-medium text-pretty">
                {item.instead}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
