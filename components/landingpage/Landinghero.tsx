import Link from "next/link";
import { ArrowRight, Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import SectionReveal from "@/components/ui/section-reveal";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHeroProps {
    data: LandingPageResponse | null;
}

export default function LandingHero({ data }: LandingHeroProps) {
    return (
        <section className="relative w-full min-h-[100vh] lg:min-h-[105vh] flex flex-col pt-24 font-poppins bg-white overflow-hidden">

            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">

                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-gray-100" />

                <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[180px]" />
                <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-slate-300/30 rounded-full blur-[180px]" />
                <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[160px]" />

            </div>

            <div className="flex-1 mx-2 sm:mx-4 lg:mx-6 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-xl relative bg-white border border-slate-200">

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8 sm:px-16 lg:px-24 py-24">

                    <SectionReveal>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-full mb-12 shadow-sm">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-700">
                                {data?.hero_badge || "India's Most Trusted Student Hub"}
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8 max-w-5xl">
                            {data?.hero_title_main || "Find Your Perfect"}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-slate-400 italic font-medium">
                                {data?.hero_title_italic || "Student Hostel"}
                            </span>{" "}
                            <br />
                            {data?.hero_title_footer || "Near Your Campus"}
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-slate-500 max-w-xl mb-12 font-medium leading-relaxed">
                            {data?.hero_description || "Premium, pre-verified hostels designed for the modern student. Join 10,000+ residents across 25+ major cities."}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto mt-12 px-4 sm:px-0">

                            {/* Primary Button */}
                            <Link
                                href={data?.hero_primary_cta_url || "/home"}
                                className="group flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 sm:px-10 py-5 rounded-2xl transition-all shadow-lg active:scale-95 text-[15px] sm:text-base w-full sm:w-auto"
                            >
                                {data?.hero_primary_cta_text || "Explore Hostels"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Secondary Button */}
                            <Link
                                href={data?.hero_secondary_cta_url || "#how"}
                                className="group flex justify-center items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-semibold px-8 sm:px-10 py-5 rounded-2xl transition-all shadow-sm active:scale-95 text-[15px] sm:text-base w-full sm:w-auto"
                            >
                                {data?.hero_secondary_cta_text || "Our Standards"}
                            </Link>

                        </div>

                        {/* Explicit Spacer to prevent overlaps */}
                        <div className="h-16 sm:h-24 w-full" />

                        {/* Trust Row */}
                        <div className="flex flex-wrap gap-8 sm:gap-12 items-center justify-center text-slate-500 text-[10px] sm:text-[11px] font-black uppercase tracking-widest w-full">

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <ShieldCheck size={16} className="text-blue-500" />
                                <span>100% Pre-Verified</span>
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <MapPin size={16} className="text-blue-500" />
                                <span>25+ Major Cities</span>
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Star size={16} fill="currentColor" className="text-amber-500" />
                                <span>4.9 Avg Rating</span>
                            </div>

                        </div>

                    </SectionReveal>

                </div>

            </div>

        </section>
    );
}