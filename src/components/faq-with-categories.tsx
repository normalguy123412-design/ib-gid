"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section, SectionHeader } from "@/components/section"
import { Parallax } from "@/components/parallax"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import { faqCategories } from "@/lib/content"

/**
 * СЕКЦИЯ «FAQ» (#faq).
 *
 * Вопросы сгруппированы по темам, каждая тема — отдельная колонка
 * с раскрывающимися ответами. Ответы можно раскрыть все сразу
 * (тип multiple), чтобы не искать нужный.
 */
export function FaqWithCategories() {
  return (
    <Section id="faq" label="Вопросы">
      <SectionHeader
        eyebrow="08 — FAQ"
        title="Частые вопросы"
        description="Короткие ответы без терминов. Если чего-то не нашлось — начните с блока «С чего начать» или загляните в словарик."
      />

      <div className="mt-10 grid gap-8 sm:mt-14 md:grid-cols-2">
        {faqCategories.map((category, ci) => (
          <div key={category.id} className="flex flex-col gap-3">
            <Parallax speed={0.16 - ci * 0.05}>
              <Badge
                variant="outline"
                className="gap-1.5 font-normal"
              >
                <category.icon className="size-3.5" />
                {category.label}
              </Badge>
            </Parallax>

            <Accordion
              type="multiple"
              defaultValue={category.items.map((_, i) => `${category.id}-${i}`)}
              className={cn("w-full")}
            >
              {category.items.map((item, index) => (
                <AccordionItem
                  key={item.question}
                  value={`${category.id}-${index}`}
                  className="px-0 first:border-t-0"
                >
                  <AccordionTrigger className="py-4 text-left text-sm hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </Section>
  )
}
