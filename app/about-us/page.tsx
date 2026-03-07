export const dynamic = "force-dynamic"

import AboutHero from "@/components/aboutus/about-hero";
import AboutMission from "@/components/aboutus/about-mission";
import AboutStats from "@/components/aboutus/about-stats";
import AboutValues from "@/components/aboutus/about-values";
import AboutTeam from "@/components/aboutus/about-team";
import AboutCTA from "@/components/aboutus/about-cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getAboutPage } from "@/services/public.service";
import type { AboutPageResponse } from "@/types/public.types";
import { getSEO } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("about-us");

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

export default async function AboutPage() {
  let data: AboutPageResponse | null = null;
  const seo = await getSEO("about-us");

  try {
    data = await getAboutPage();
  } catch (error) {
    console.error("Failed to fetch about page data", error);
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
        {/* Hero loads immediately (important for perceived speed) */}
        <AboutHero
          title={data?.hero_title}
          subtitle={data?.hero_subtitle}
        />

        {/* Content sections with breathing room */}
        <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
          <SectionReveal>
            <AboutMission
              missionTitle={data?.mission_title}
              missionDescription={data?.mission_description}
              cardTitle={data?.mission_card_title}
              cardDescription={data?.mission_card_description}
            />
          </SectionReveal>

          <SectionReveal delay={0.05}>
            <AboutStats stats={data?.stats} />
          </SectionReveal>

          <SectionReveal delay={0.08}>
            <AboutValues values={data?.values} />
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <AboutTeam members={data?.team_members} />
          </SectionReveal>
        </div>

        <SectionReveal delay={0.12}>
          <AboutCTA
            title={data?.cta_title}
            buttonText={data?.cta_button_text}
            buttonUrl={data?.cta_button_url}
          />
        </SectionReveal>
      </main>
    </>
  );
}