// export const dynamic = "force-dynamic"

// import type { Metadata } from "next";
// import Hero from "@/components/home/hero";
// import FeaturedCities from "@/components/home/featured-cities";
// import FeaturedHostelTypes from "@/components/home/featured-hostel-types";
// import TopHostels from "@/components/home/top-hostels";
// import FeaturedHostels from "@/components/home/featured-hostels";
// import WhyUs from "@/components/home/why-us";
// import CTA from "@/components/home/cta";
// import SectionReveal from "@/components/ui/section-reveal";
// import { getHomePage } from "@/services/public.service";
// import type { HomePageResponse } from "@/types/public.types";

// import { getSEO } from "@/lib/seo";

// export async function generateMetadata(): Promise<Metadata> {
//   const seo = await getSEO("home");

//   return {
//     title: seo.meta_title,
//     description: seo.meta_description,
//     keywords: seo.meta_keywords,

//     openGraph: {
//       title: seo.og_title || seo.meta_title,
//       description: seo.og_description || seo.meta_description,
//       images: seo.og_image ? [seo.og_image] : [],
//     },

//     twitter: {
//       card: "summary_large_image",
//       title: seo.og_title || seo.meta_title,
//       description: seo.og_description || seo.meta_description,
//       images: seo.og_image ? [seo.og_image] : []
//     }
//   };
// }

// export default async function HomePage() {
//   let homepageData: HomePageResponse | null = null;
//   const seo = await getSEO("home");

//   try {
//     homepageData = await getHomePage();
//   } catch (error) {
//     console.error("Failed to fetch homepage data", error);
//   }

//   return (
//     <>
//       {seo?.structured_data && (
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: typeof seo.structured_data === 'string'
//               ? seo.structured_data
//               : JSON.stringify(seo.structured_data),
//           }}
//         />
//       )}
//       <main className="flex flex-col overflow-hidden">
//         {/* Hero - no animation (keep LCP stable) */}
//         <Hero
//           title={homepageData?.hero_title}
//           subtitle={homepageData?.hero_subtitle}
//         />

//         {/* Content sections with breathing room */}
//         <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
//           <SectionReveal>
//             <FeaturedCities />
//           </SectionReveal>

//           <SectionReveal delay={0.05}>
//             <FeaturedHostelTypes />
//           </SectionReveal>

//           {/* <SectionReveal delay={0.1}>
//           <FeaturedHostels />
//         </SectionReveal> */}

//           {/* <SectionReveal delay={0.15}>
//           <TopHostels />
//         </SectionReveal> */}

//           <SectionReveal delay={0.2}>
//             <WhyUs
//               title={homepageData?.why_title}
//               items={homepageData?.why_items}
//             />
//           </SectionReveal>
//         </div>

//         <SectionReveal delay={0.2}>
//           <CTA
//             title={homepageData?.cta_title}
//             subtitle={homepageData?.cta_subtitle}
//             buttonText={homepageData?.cta_button_text}
//           />
//         </SectionReveal>
//       </main>
//     </>
//   );
// }



export const dynamic = "force-dynamic"

import type { Metadata } from "next";
import { getSEO } from "@/lib/seo";

// Landing Page Components
import LandingHero from "@/components/landingpage/Landinghero";
import LandingStats from "@/components/landingpage/Landingstats";
import LandingCities from "@/components/landingpage/Landingcities";
import LandingFeatures from "@/components/landingpage/Landingfeatures";
import LandingHowItWorks from "@/components/landingpage/Landinghowitworks";
import LandingTestimonials from "@/components/landingpage/Landingtestimonials";
import LandingCTA from "@/components/landingpage/Landingcta";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("home");

  return {
    title: seo?.meta_title || "LiveHub | Verified Hostels for Students",
    description: seo?.meta_description || "Discover verified, affordable hostels across India. Trusted by 10,000+ students.",
    keywords: seo?.meta_keywords,

    openGraph: {
      title: seo?.og_title || seo?.meta_title,
      description: seo?.og_description || seo?.meta_description,
      images: seo?.og_image ? [seo.og_image] : [],
    },

    twitter: {
      card: "summary_large_image",
      title: seo?.og_title || seo?.meta_title,
      description: seo?.og_description || seo?.meta_description,
      images: seo?.og_image ? [seo.og_image] : []
    }
  };
}

export default async function LandingPage() {
  const seo = await getSEO("home");

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

      <main className="antialiased font-poppins bg-white text-stone-900 overflow-hidden">
        {/* Full-width premium sections */}
        <LandingHero />
        <LandingStats />
        <LandingCities />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingCTA />
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
