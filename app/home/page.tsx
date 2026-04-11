export const dynamic = "force-dynamic"

import type { Metadata } from "next";
import Hero from "@/components/home/hero";
import SearchBar from "@/components/home/search-bar";
import FeaturedCities from "@/components/home/featured-cities";
import FeaturedHostelTypes from "@/components/home/featured-hostel-types";
// import TopHostels from "@/components/home/top-hostels";
// import FeaturedHostels from "@/components/home/featured-hostels";
import RecommendedHostels from "@/components/home/recommended-hostels";
import TopRatedHostelsDynamic from "@/components/home/top-rated-hostels-dynamic";
import WhyUs from "@/components/home/why-us";
import CTA from "@/components/home/cta";
import SectionReveal from "@/components/ui/section-reveal";
import { getHomePage } from "@/services/public.service";
import { getHostels, getFeaturedHostels, getTopRatedHostels } from "@/services/hostel.service";
import type { HomePageResponse } from "@/types/public.types";

import { getSEO } from "@/lib/seo";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getCities() {
  try {
    const res = await fetch(`${BASE_URL}/api/locations/cities/`, {
      next: { revalidate: 60 },
    });
    return res.json();
  } catch (err) {
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("home");

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

export default async function HomePage() {
  let homepageData: HomePageResponse | null = null;
  const seo = await getSEO("home");

  const [featuredHostels, topRatedHostels, cities] = await Promise.all([
    getFeaturedHostels(),
    getTopRatedHostels(),
    getCities()
  ]);

  try {
    homepageData = await getHomePage();
  } catch (error) {
    console.error("Failed to fetch homepage data", error);
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
      <main className="flex flex-col">
        {/* Hero - no animation (keep LCP stable) */}
        <Hero
          title={homepageData?.hero_title}
          subtitle={homepageData?.hero_subtitle}
        />

        {/* Content sections with breathing room */}
        <div className="flex flex-col mt-4 sm:mt-6 lg:mt-8">
          <SectionReveal>
            <FeaturedCities />
          </SectionReveal>

          <SectionReveal delay={0.05}>
            <FeaturedHostelTypes />
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <RecommendedHostels hostels={featuredHostels} cities={cities} />
          </SectionReveal>

          <SectionReveal delay={0.15}>
            <TopRatedHostelsDynamic hostels={topRatedHostels} cities={cities} />
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
      </main>
    </>
  );
}
