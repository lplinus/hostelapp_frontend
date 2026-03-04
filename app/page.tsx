import type { Metadata } from "next";
import Hero from "@/components/home/hero";
import FeaturedCities from "@/components/home/featured-cities";
import FeaturedHostelTypes from "@/components/home/featured-hostel-types";
import TopHostels from "@/components/home/top-hostels";
import FeaturedHostels from "@/components/home/featured-hostels";
import WhyUs from "@/components/home/why-us";
import CTA from "@/components/home/cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getHomePage } from "@/services/public.service";
import type { HomePageResponse } from "@/types/public.types";

export const metadata: Metadata = {
  title: "Book Affordable Hostels Across India | LiveHub",
  description:
    "Find and book affordable hostels across India. Compare prices, read reviews, and reserve instantly with LiveHub.",
  openGraph: {
    title: "LiveHub - Affordable Hostel Booking",
    description:
      "Discover the best hostels in top cities. Book instantly with secure payment.",
    type: "website",
  },
};

export default async function HomePage() {
  let homepageData: HomePageResponse | null = null;

  try {
    homepageData = await getHomePage();
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
  }

  return (
    <main className="flex flex-col overflow-hidden">
      {/* Hero - no animation (keep LCP stable) */}
      <Hero
        title={homepageData?.hero_title}
        subtitle={homepageData?.hero_subtitle}
      />

      {/* Content sections with breathing room */}
      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
        <SectionReveal>
          <FeaturedCities />
        </SectionReveal>

        <SectionReveal delay={0.05}>
          <FeaturedHostelTypes />
        </SectionReveal>

        {/* <SectionReveal delay={0.1}>
          <FeaturedHostels />
        </SectionReveal> */}

        {/* <SectionReveal delay={0.15}>
          <TopHostels />
        </SectionReveal> */}

        <SectionReveal delay={0.2}>
          <WhyUs
            title={homepageData?.why_title}
            items={homepageData?.why_items}
          />
        </SectionReveal>
      </div>

      <SectionReveal delay={0.2}>
        <CTA
          title={homepageData?.cta_title}
          subtitle={homepageData?.cta_subtitle}
          buttonText={homepageData?.cta_button_text}
        />
      </SectionReveal>
    </main>
  );
}