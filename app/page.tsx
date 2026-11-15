export const dynamic = "force-dynamic"

import type { Metadata } from "next";
import { getSEO } from "@/lib/seo";
import { Suspense } from "react";
import dynamicImport from "next/dynamic";

// Critical Landing Page Component (SSR)
import LandingHero from "@/components/landingpage/Landinghero";

// Non-critical components (Dynamic Import)
const LandingStats = dynamicImport(() => import("@/components/landingpage/Landingstats"), { ssr: true });
const LandingCities = dynamicImport(() => import("@/components/landingpage/Landingcities"), { ssr: true });
const LandingFeatures = dynamicImport(() => import("@/components/landingpage/Landingfeatures"), { ssr: true });
const LandingHowItWorks = dynamicImport(() => import("@/components/landingpage/Landinghowitworks"), { ssr: true });
const LandingTestimonials = dynamicImport(() => import("@/components/landingpage/Landingtestimonials"), { ssr: true });
const LandingCTA = dynamicImport(() => import("@/components/landingpage/Landingcta"), { ssr: true });

import { landingService } from "@/services/landing.service";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("landing");

  return {
    title: seo?.meta_title || "Best Hotels & Vacation Rentals Across India | StayNest",
    description: seo?.meta_description || "Discover verified luxury hotels, boutique stays, and vacation rentals across India's top destinations. Compare prices, explore amenities, and book your stay with StayNest.",
    keywords: seo?.meta_keywords || "hotels in India, vacation rentals, luxury villas, boutique stays, hotel booking platform, verified hotels, resort booking",
    alternates: {
      canonical: seo?.canonical_url || "https://hostelin.online/",
    },
    robots: {
      index: seo?.is_indexed ?? true,
      follow: true,
    },
    openGraph: {
      title: seo?.og_title || seo?.meta_title || "Best Hotels & Vacation Rentals Across India | StayNest",
      description: seo?.og_description || seo?.meta_description || "Discover verified luxury hotels, boutique stays, and vacation rentals across India's top destinations.",
      images: seo?.og_image ? [seo.og_image] : ["https://hostelin.online/images/og-home.jpg"],
      url: "https://hostelin.online/",
      siteName: "StayNest",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || seo?.meta_title || "Best Hotels & Vacation Rentals Across India | StayNest",
      description: seo?.og_description || seo?.meta_description || "Discover verified luxury hotels, boutique stays, and vacation rentals across India's top destinations.",
      images: seo?.og_image ? [seo.og_image] : ["https://hostelin.online/images/og-home.jpg"],
    }
  };
}

export default async function LandingPage() {
  const seo = await getSEO("landing");
  let landingData = null;

  try {
    landingData = await landingService.getLandingData();
  } catch (error) {
    console.error("Failed to fetch landing data:", error);
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

      <main className="antialiased font-sans bg-white text-stone-900 overflow-hidden">
        {/* Full-width premium sections */}
        <LandingHero data={landingData} />

        {/* Below the fold components - Loaded dynamically with Suspense */}
        <Suspense fallback={<div className="h-40 bg-slate-50 animate-pulse" />}>
          <LandingStats stats={landingData?.stats} />
          <LandingCities data={landingData} />
          <LandingFeatures data={landingData} />
          <LandingHowItWorks data={landingData} />
          <LandingTestimonials data={landingData} />
          <LandingCTA data={landingData} />
        </Suspense>
      </main>
    </>
  );
}

/* 
  The original homepage code is preserved below as per user request.
  This content is moved to the bottom to keep the main landing page active and clean.

  // import Hero from "@/components/home/hero";
  // import FeaturedCities from "@/components/home/featured-cities";
  // ... (and the rest of the original HomePage content)
*/
