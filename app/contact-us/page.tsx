export const dynamic = "force-dynamic"

import ContactHero from "@/components/contactus/contact-hero";
import ContactInfo from "@/components/contactus/contact-info";
import ContactForm from "@/components/contactus/contact-form";
import ContactFAQ from "@/components/contactus/contact-faq";
import ContactCTA from "@/components/contactus/contact-cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getContactPage } from "@/services/public.service";
import type { ContactPageResponse } from "@/types/public.types";
import { getSEO } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("contact-us");

  return {
    title: seo.meta_title,
    description: seo.meta_description,
    keywords: seo.meta_keywords,

    openGraph: {
      title: seo.og_title || seo.meta_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image ? [seo.og_image] : [],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.meta_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image ? [seo.og_image] : []
    }
  };
}

export default async function ContactPage() {
  let data: ContactPageResponse | null = null;
  const seo = await getSEO("contact-us");

  try {
    data = await getContactPage();
  } catch (error) {
    console.error("Failed to fetch contact page data", error);
  }

  return (
    <>
      {seo?.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: typeof seo.structured_data === 'string'
              ? seo.structured_data
              : JSON.stringify(seo.structured_data),
          }}
        />
      )}
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
            buttonUrl="/home"
          />
        </SectionReveal>
      </main>
    </>
  );
}