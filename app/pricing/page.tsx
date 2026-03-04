import PricingHero from "@/components/pricing/pricing-hero";
import PricingCards from "@/components/pricing/pricing-cards";
import PricingComparison from "@/components/pricing/pricing-comparison";
import PricingFAQ from "@/components/pricing/pricing-faq";
import PricingCTA from "@/components/pricing/pricing-cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getPricingPage } from "@/services/public.service";
import type { PricingPageResponse } from "@/types/public.types";

export default async function PricingPage() {
  let data: PricingPageResponse | null = null;

  try {
    data = await getPricingPage();
  } catch (error) {
    console.error("Failed to fetch pricing page data", error);
  }

  return (
    <main className="flex flex-col overflow-hidden">
      <PricingHero
        title={data?.hero_title}
        subtitle={data?.hero_subtitle}
      />

      {/* Content sections with breathing room */}
      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
        <SectionReveal>
          <PricingCards plans={data?.plans} />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <PricingComparison
            title={data?.comparison_title}
            description={data?.comparison_description}
          />
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <PricingFAQ faqs={data?.faqs} />
        </SectionReveal>
      </div>

      <SectionReveal delay={0.1}>
        <PricingCTA
          title={data?.cta_title}
          buttonText={data?.cta_button_text}
          buttonUrl={data?.cta_button_url}
        />
      </SectionReveal>
    </main>
  );
}