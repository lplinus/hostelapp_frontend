import Link from "next/link";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowRight } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingCTAProps {
  data: LandingPageResponse | null;
}

export default function LandingCTA({ data }: LandingCTAProps) {
  return (
    <section className="py-10 sm:py-14 bg-slate-50 font-inter border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <SectionReveal>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            {data?.cta_bottom_eyebrow || "Instant Move-in"}
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-tight mb-2">
            {data?.cta_bottom_title_main || "Ready for Your"}{" "}
            <span className="text-slate-600 font-normal">
              {data?.cta_bottom_title_italic || "Next Chapter?"}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6 font-normal">
            {data?.cta_bottom_subtitle ||
              "Join 10,000+ students living in pre-verified spaces across India. Reserve your room in minutes."}
          </p>

          <div className="flex items-center justify-center">
            <Link
              href={data?.cta_bottom_button_url || "/home"}
              className="inline-flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-95"
            >
              {data?.cta_bottom_button_text || "Start Exploring"}
              <ArrowRight size={16} />
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}