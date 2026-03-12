
import Link from "next/link";
import { ArrowRight, Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import SectionReveal from "@/components/ui/section-reveal";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHeroProps {
    data: LandingPageResponse | null;
}

export default function LandingHero({ data }: LandingHeroProps) {
    return (
        <section className="relative w-full min-h-[100vh] lg:min-h-[105vh] flex flex-col pt-12 lg:pt-16 pb-12 lg:pb-20 font-poppins bg-slate-50 overflow-hidden">

            {/* Background Layer: Grid and Glows */}
            <div className="absolute inset-0 -z-10">
                {/* 1. The Light Pink Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{ 
                        backgroundImage: `radial-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)`,
                        backgroundSize: '40px 40px, 40px 40px, 40px 40px'
                    }} 
                />

                {/* 2. Soft Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-slate-100/50" />

                {/* 3. Decorative Blur Orbs */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-200/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-teal-100/20 rounded-full blur-[120px]" />
            </div>

            {/* Main Rounded Container - Orange Theme */}
            <div className="flex-1 mx-2 sm:mx-4 lg:mx-6 rounded-[2.5rem] lg:rounded-[3.5rem] overflow-hidden shadow-2xl shadow-orange-500/20 relative bg-gradient-to-br from-orange-500 to-orange-600 border border-white/20">

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-8 sm:px-16 lg:px-24 py-24">

                    <SectionReveal>

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 rounded-full mb-12 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-orange-200" />
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
                                {data?.hero_badge || "India's Most Trusted Student Hub"}
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter mb-8 max-w-5xl">
                            {data?.hero_title_main || "Find Your Perfect"}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-orange-100 italic font-medium">
                                {data?.hero_title_italic || "Student Hostel"}
                            </span>{" "}
                            <br />
                            {data?.hero_title_footer || "Near Your Campus"}
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mb-12 font-medium leading-[1.6] tracking-tight mx-auto">
                            {data?.hero_description || "Premium, pre-verified hostels designed for the modern student. Join 10,000+ residents across 25+ major cities."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-2xl mx-auto mt-12 px-4 sm:px-0">

                            <Link
                                href={data?.hero_primary_cta_url || "/home"}
                                className="group flex justify-center items-center gap-3 bg-white text-orange-500 hover:bg-orange-50 font-semibold px-8 sm:px-10 py-5 rounded-2xl transition-all shadow-xl shadow-orange-500/10 active:scale-95 text-[15px] sm:text-base w-full sm:w-auto"
                            >
                                {data?.hero_primary_cta_text || "Explore Hostels"}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Secondary Button */}
                            <Link
                                href={data?.hero_secondary_cta_url || "#how"}
                                className="group flex justify-center items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 sm:px-10 py-5 rounded-2xl transition-all shadow-sm active:scale-95 text-[15px] sm:text-base w-full sm:w-auto"
                            >
                                {data?.hero_secondary_cta_text || "Our Standards"}
                            </Link>

                        </div>

                        {/* Spacer */}
                        <div className="h-16 sm:h-24 w-full" />

                        {/* Trust Row */}
                        <div className="flex flex-wrap gap-8 sm:gap-12 items-center justify-center text-white/80 font-black uppercase tracking-widest w-full">

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <ShieldCheck size={16} className="text-white" />
                                <span>100% Pre-Verified</span>
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <MapPin size={16} className="text-white" />
                                <span>25+ Major Cities</span>
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <Star size={16} fill="currentColor" className="text-white" />
                                <span>4.9 Avg Rating</span>
                            </div>

                        </div>

                        {/* Bottom edge spacer */}
                        <div className="h-8 lg:h-12 w-full" />


                    </SectionReveal>

                </div>
            </div>
        </section>
    );
}