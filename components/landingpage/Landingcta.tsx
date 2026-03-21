import Link from "next/link";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowRight, Sparkles } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingCTAProps {
    data: LandingPageResponse | null;
}

export default function LandingCTA({ data }: LandingCTAProps) {
    return (
        <section className="relative py-28 lg:py-40 overflow-hidden bg-[#F8FAFC] font-inter">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#8B5CF6]/5 rounded-full blur-[140px]" />
            </div>

            <div className="relative max-w-5xl mx-auto px-6 sm:px-10 text-center z-10">

                <SectionReveal>

                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-slate-100 mb-8 lg:mb-12 shadow-sm">
                        <Sparkles size={18} className="text-[#8B5CF6]" />
                        <span className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[#0F172A]">
                            {data?.cta_bottom_eyebrow || "Start your journey"}
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="flex items-center justify-center">
                        <h2 className="text-5xl sm:text-7xl lg:text-9xl font-bold tracking-tighter text-[#0F172A] leading-[1.05] mb-10">
                            {data?.cta_bottom_title_main || "Ready for your"}
                            <br />
                            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
                                {data?.cta_bottom_title_italic || "next chapter?"}
                            </span>
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-[#64748B] font-medium max-w-xl mx-auto leading-relaxed mb-16">
                        {data?.cta_bottom_subtitle || "Join 10,000+ students living their best life in verified spaces. Secure your spot in minutes."}
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center justify-center w-full px-6 sm:px-0">
                        <Link
                            href={data?.cta_bottom_button_url || "/home"}
                            className="group relative inline-flex items-center justify-center gap-4 bg-[#8B5CF6] text-white px-10 sm:px-14 py-5 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.5)] hover:bg-[#7C3AED] transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto overflow-hidden outline-none"
                        >
                            {data?.cta_bottom_button_text || "Start Exploring"}
                            <ArrowRight
                                size={24}
                                className="group-hover:translate-x-2 transition-transform shrink-0"
                            />
                        </Link>
                    </div>

                </SectionReveal>

            </div>
        </section>
    );
}