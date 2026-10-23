import Link from "next/link";
import { ArrowRight, Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHeroProps {
  data: LandingPageResponse | null;
}

export default function LandingHero({ data }: LandingHeroProps) {
  return (
    <section className="relative w-full pt-6 sm:pt-8 pb-6 sm:pb-8 font-inter bg-[#F8FAFC]">
      {/* Main Rounded Container - Refined Dark Navy Theme */}
      <div className="mx-4 sm:mx-6 lg:mx-8 rounded-3xl lg:rounded-[2.5rem] overflow-hidden shadow-lg bg-[#0F172A] border border-slate-800 relative">
        {/* Subtle Ambient Tone without colorful rainbow blurs */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0F172A]" />

        {/* Content - Spacious, balanced & elevated */}
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-16 py-16 sm:py-20 lg:py-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-slate-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-200">
              {data?.hero_badge || "India's Most Trusted Student Hub"}
            </span>
          </div>

          {/* Heading - Bigger presence & strong typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12] max-w-4xl mb-5">
            {data?.hero_title_main || "Find Your Perfect"}{" "}
            <span className="text-slate-100 font-extrabold underline decoration-slate-600 underline-offset-4">
              {data?.hero_title_italic || "Student Hostel"}
            </span>{" "}
            <span className="text-white/90">
              {data?.hero_title_footer || "Near Your Campus"}
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mb-8 font-normal leading-relaxed mx-auto">
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