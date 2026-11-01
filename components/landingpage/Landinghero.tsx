import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHeroProps {
  data: LandingPageResponse | null;
}

export default function LandingHero({ data }: LandingHeroProps) {
  return (
    <section className="relative w-full pt-6 sm:pt-8 pb-6 sm:pb-8 font-inter bg-[#F8FAFC]">
      {/* Main Rounded Container - Refined Dark Navy Theme with hero1 image */}
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-2xl bg-[#0F172A] border border-slate-800/80 relative">
        {/* HIGH CLARITY NATURE HERO IMAGE BACKGROUND & OPTIMIZED SCRIM */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/images/hero-landing-nature.webp"
            alt="Scenic Nature Retreat & Hostels Across India"
            fill
            priority
            quality={85}
            sizes="(max-width: 1280px) 100vw, 1440px"
            className="object-cover object-center scale-[1.01] transform transition-transform duration-1000 filter contrast-[1.04] saturate-[1.05]"
          />
          {/* High-Clarity Scrim - Preserves rich daylight & sharp clarity while ensuring crisp typography */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/70 via-[#0B1120]/35 to-[#0B1120]/85" />
          <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-transparent to-[#0B1120]/40 pointer-events-none" />
        </div>

        {/* Content - Spacious, balanced & elevated */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/40 border border-white/20 rounded-full mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-white drop-shadow-sm">
              {data?.hero_badge || "India's Most Trusted Student Hub"}
            </span>
          </div>

          {/* Heading - High clarity presence & strong typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12] max-w-4xl mb-5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
            {data?.hero_title_main || "Find Your Perfect"}{" "}
            <span className="text-slate-100 font-extrabold underline decoration-slate-400 underline-offset-4">
              {data?.hero_title_italic || "Student Hostel"}
            </span>{" "}
            <span className="text-white/95">
              {data?.hero_title_footer || "Near Your Campus"}
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-100 max-w-2xl mb-8 font-normal leading-relaxed mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            {data?.hero_description ||
              "Verified student hostels with verified pricing, zero brokerage, and instant confirmation across 25+ prime cities."}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto">
            <Link
              href={data?.hero_primary_cta_url || "/home"}
              className="inline-flex justify-center items-center gap-2.5 bg-white text-[#0F172A] hover:bg-slate-100 font-semibold px-8 py-3.5 rounded-xl transition-all shadow-sm active:scale-95 text-base w-full sm:w-auto"
            >
              {data?.hero_primary_cta_text || "Explore Hostels"}
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={data?.hero_secondary_cta_url || "#cities"}
              className="inline-flex justify-center items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium px-8 py-3.5 rounded-xl transition-all active:scale-95 text-base w-full sm:w-auto"
            >
              {data?.hero_secondary_cta_text || "View Destinations"}
            </Link>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 items-center justify-center text-slate-400 text-sm font-medium tracking-wide w-full mt-12 sm:mt-14 border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <span className="text-slate-200">100% Pre-Verified</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-slate-200" />
              <span className="text-slate-200">25+ Major Cities</span>
            </div>

            <div className="flex items-center gap-2">
              <Star size={18} className="text-amber-400 fill-amber-400" />
              <span className="text-slate-200">4.9 Avg Student Rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}