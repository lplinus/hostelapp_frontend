import ContactHero from "@/components/contactus/contact-hero";
import ContactInfo from "@/components/contactus/contact-info";
import ContactForm from "@/components/contactus/contact-form";
import ContactFAQ from "@/components/contactus/contact-faq";
import ContactCTA from "@/components/contactus/contact-cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getContactPage } from "@/services/public.service";
import type { ContactPageResponse } from "@/types/public.types";

export default async function ContactPage() {
  let data: ContactPageResponse | null = null;

  try {
    data = await getContactPage();
  } catch (error) {
    console.error("Failed to fetch contact page data", error);
  }

  return (
    <main className="flex flex-col overflow-hidden">
      <ContactHero
        title={data?.hero_title}
        subtitle={data?.hero_subtitle}
      />

      {/* Content sections with breathing room */}
      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
        <SectionReveal>
          <ContactInfo items={data?.info_items} />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <ContactForm />
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <ContactFAQ faqs={data?.faqs} />
        </SectionReveal>
      </div>

      <SectionReveal delay={0.1}>
        <ContactCTA
          title={data?.cta_title}
          buttonText={data?.cta_button_text}
          buttonUrl={data?.cta_button_url}
        />
      </SectionReveal>
    </main>
  );
}