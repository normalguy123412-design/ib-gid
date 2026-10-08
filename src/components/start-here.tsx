import { CompassIcon } from "lucide-react"
import { Section, SectionHeader } from "@/components/section"
import { Parallax } from "@/components/parallax"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { startSteps } from "@/lib/content"

/**
 * СЕКЦИЯ «С ЧЕГО НАЧАТЬ» (#start).
 *
 * Вводный блок для тех, кто раньше про безопасность не думал: три шага
 * от нуля до первого полезного действия. Стоит сразу после hero, чтобы
 * новичок не потерялся среди терминов.
 */
export function StartHere() {
  return (
    <Section id="start" label="С чего начать">
      <SectionHeader
        eyebrow="00 — С чего начать"
        title="Если вы совсем новичок"
        description="Ниже — три шага, которые объясняют весь сайт. Можно пройти только их и уже стать заметно защищённее."
      />

      <div className="mt-10 grid gap-4 sm:mt-14 md:grid-cols-3">
        {startSteps.map((step, i) => (
          // Шаги двигаются навстречу прокрутке — лёгкий параллакс.
          <Parallax key={step.title} speed={0.12 - i * 0.09}>
            <Card className="h-full transition-shadow duration-300 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="size-5" />
                  </span>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                </div>
                <CardDescription className="text-pretty">
                  {step.text}
                </CardDescription>
              </CardHeader>
            </Card>
          </Parallax>
        ))}
      </div>

      <Card className="mt-4 border-dashed">
        <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:gap-4">
          <CompassIcon className="size-5 shrink-0 text-primary" />
          <p className="text-pretty text-muted-foreground">
            <span className="font-medium text-foreground">
              Не знаете, что такое TLS, SIEM или Zero Trust?
            </span>{" "}
            Все сокращения расшифрованы в{" "}
            <a href="#glossary" className="font-medium text-primary underline underline-offset-4">
              словарике
            </a>{" "}
            внизу страницы.
          </p>
        </CardContent>
      </Card>
    </Section>
  )
}