import { Section, SectionHeader } from "@/components/section"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ifItHappens } from "@/lib/content"

/**
 * СЕКЦИЯ «ЕСЛИ ЧТО-ТО ПРОИЗОШЛО» (#emergency).
 *
 * Вторая часть памятки: что делать, когда неприятность уже случилась.
 * Шаги пронумерованы и идут от срочного к безопасному — в панике люди
 * чаще всего вводят пароль ещё раз или удаляют следы, поэтому порядок
 * здесь часть подсказки.
 */
export function IfItHappens() {
  return (
    <Section id="emergency" label="Если произошло">
      <SectionHeader
        eyebrow="09 — Если произошло"
        title="Первые шаги, когда неприятность уже случилась"
        description="Две частые ситуации и порядок действий в каждой. Делайте по очереди, не перескакивая: порядок шагов важнее скорости."
      />

      <div className="mt-10 grid gap-4 sm:mt-14 lg:grid-cols-2">
        {ifItHappens.map((block) => (
          /*
            Подъём и тень при наведении сняты: карточка не кликабельна, а
            такой отклик обещает переход. Подсветка номера шага осталась —
            она откликается на взгляд, а не приглашает нажать.
          */
          <Card key={block.title} className="group flex">
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-3">
                {block.steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm text-pretty">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-xs text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  )
}
