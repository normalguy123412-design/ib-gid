"use client"

import { Parallax } from "@/components/parallax"
import { Section, SectionRule } from "@/components/section"
import { Counter } from "@/components/counter"

/**
 * ПОЛОСА «В ЦИФРАХ» (#numbers).
 *
 * Числа, которые помогают понять масштаб: сколько терминов расшифровано
 * в словарике, сколько шагов в схеме защиты, сколько знаков в коде 2FA.
 * Значения вычисляются из данных сайта, а не выдуманы, поэтому не вводят
 * в заблуждение.
 *
 * Счётчик доезжает до цели, когда полоса попадает в экран.
 */

type Stat = {
  value: number
  suffix?: string
  prefix?: string
  label: string
}

export function NumbersStrip({ stats }: { stats: Stat[] }) {
  return (
    <Section id="numbers" veil="light" label="В цифрах">
      {/*
        Рубрики не было — раздел выбивался из ряда, а теперь он стоит в
        общей шкале, и пропуск между 07 и 09 бросался бы в глаза.
      */}
      <Parallax speed={0.1} className="flex flex-col gap-3">
        <SectionRule label="08 — В цифрах" />
        <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Коротко о главном в цифрах
        </h2>
      </Parallax>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-2 rounded-2xl border bg-card/55 p-5 backdrop-blur-sm"
          >
            <dt className="order-2 text-sm text-pretty text-muted-foreground">
              {stat.label}
            </dt>
            <dd className="order-1">
              <Counter
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className="font-heading text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl"
              />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
