"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section, SectionHeader } from "@/components/section"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import { faqCategories } from "@/lib/content"

/**
 * СЕКЦИЯ «FAQ» (#faq).
 *
 * Вопросы сгруппированы по темам, каждая тема — отдельная колонка
 * с раскрывающимися ответами. Ответы раскрыты все сразу (тип multiple),
 * чтобы не искать нужный и не дочитывать раздел прокруткой вниз.
 *
 * Четыре темы по четыре вопроса в один экран не помещаются, поэтому
 * панель шириной в пять экранов: первый отдан заголовку, дальше идёт
 * по теме. Раздел раскрывается только вправо.
 */
export function FaqWithCategories() {
  return (
    <Section id="faq" label="Вопросы" screens={5}>
      <div className="flex h-full w-full gap-10">
        <div className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center">
          <SectionHeader
            eyebrow="08 — FAQ"
            title="Частые вопросы"
            description="Короткие ответы без терминов. Листайте вправо — темы идут по одной. Если чего-то не нашлось — начните с блока «С чего начать» или загляните в словарик."
          />
        </div>

        {faqCategories.map((category, ci) => (
          <div
            key={category.id}
            className="flex h-full w-[calc(100vw-4rem)] shrink-0 flex-col justify-center gap-3"
          >
            <Badge variant="outline" className="w-fit gap-1.5 font-normal">
              <category.icon className="size-3.5" />
              {category.label}
            </Badge>

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

            <p className="font-mono text-xs text-muted-foreground">
              {ci + 2} / {faqCategories.length + 1}
            </p>
          </div>
        ))}
      </div>
    </Section>
  )
}
