"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Section, SectionHeader } from "@/components/section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { faqCategories } from "@/lib/content"

/**
 * СЕКЦИЯ «FAQ» (#faq).
 *
 * Вопросы сгруппированы по вкладкам (Основы, Угрозы, Защита, Практика),
 * внутри каждой группы ответы раскрываются аккордеоном.
 */
export function FaqWithCategories() {
  const [tab, setTab] = React.useState(faqCategories[0].id)

  return (
    <Section id="faq">
      <SectionHeader
        eyebrow="05 — FAQ"
        title="Частые вопросы"
        description="Короткие ответы на то, что спрашивают чаще всего. Если вопроса нет — начните с разделов «Понятия» и «Защита»."
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mt-10 gap-6 sm:mt-14"
      >
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          {faqCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="gap-1.5 px-3"
            >
              <category.icon className="size-4" />
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {faqCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue="faq-0"
            >
              {category.items.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className="py-4 text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-pretty text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </Section>
  )
}