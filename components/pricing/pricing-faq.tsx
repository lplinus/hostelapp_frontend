"use client";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { PricingFAQItem } from "@/types/public.types";

interface PricingFAQProps {
  faqs?: PricingFAQItem[];
}

const defaultFaqs: PricingFAQItem[] = [
  {
    question: "Can I cancel anytime?",
    answer: "Yes, you can cancel or downgrade anytime.",
  },
  {
    question: "Are there hidden fees?",
    answer: "No. Pricing is fully transparent.",
  },
];

export default function PricingFAQ({ faqs }: PricingFAQProps) {
  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Pricing FAQs
        </h2>

        <Accordion type="single" collapsible>
          {displayFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}