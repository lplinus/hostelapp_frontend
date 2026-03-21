"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ContactFAQItem } from "@/types/public.types";

interface ContactFAQProps {
  faqs?: ContactFAQItem[];
}

const defaultFaqs: ContactFAQItem[] = [
  {
    question: "How quickly will I get a response?",
    answer: "We usually respond within 24 hours during business days.",
  },
  {
    question: "Can hostel owners list their properties?",
    answer:
      "Yes! We welcome verified hostel owners. Contact us to become a partner and list your property on Hostel In.",
  },
  {
    question: "Is there a service fee?",
    answer:
      "Students can browse listings for free. Any applicable service charges are transparently shown before booking.",
  },
];

export default function ContactFAQ({ faqs }: ContactFAQProps) {
  const displayFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full space-y-4"
        >
          {displayFaqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border rounded-2xl px-6"
            >
              <AccordionTrigger className="text-left text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}