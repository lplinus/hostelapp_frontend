
import Link from "next/link";
import { ArrowRight, Star, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import SectionReveal from "@/components/ui/section-reveal";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHeroProps {
    data: LandingPageResponse | null;
}

export default function LandingHero({ data }: LandingHeroProps) {
    return (
        <section className="relative w-full min-h-[100vh] flex flex-col pt-12 lg:pt-16 pb-12 lg:pb-20 font-inter bg-[#F8FAFC] overflow-hidden">
            {/* Background Layer: Subtle Gradients */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 opacity-[0.3]"
                    style={{
                        backgroundImage: `radial-gradient(#64748B 0.5px, transparent 0.5px)`,
                        backgroundSize: '32px 32px'
                    }}
                />
                <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-[#0F172A]/5 rounded-full blur-[140px]" />
            </div>

            {/* Main Rounded Container - Premium Dark Theme */}
            <div className="flex-1 mx-4 sm:mx-6 lg:mx-8 rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-[#0F172A]/20 relative bg-[#0F172A] border border-white/10 group">
                {/* Decorative Background for Container */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] opacity-90" />
                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
                
                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-24 py-20 lg:py-32">
                    <SectionReveal>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-10 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/80">
                                {data?.hero_badge || "India's Most Trusted Student Hub"}
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="text-5xl sm:text-7xl lg:text-[92px] font-bold text-white leading-[1.1] lg:leading-[1.05] tracking-tight mb-8 max-w-5xl">
                            {data?.hero_title_main || "Find Your Perfect"}<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] font-extrabold italic">
                                {data?.hero_title_italic || "Student Hostel"}
                            </span>{" "}
                            <br />
                            <span className="text-white/90">
                                {data?.hero_title_footer || "Near Your Campus"}
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-lg sm:text-xl md:text-2xl text-[#94A3B8] max-w-3xl mb-14 font-medium leading-relaxed mx-auto">
                            {data?.hero_description || "Premium, pre-verified hostels designed for the modern student. Join 10,000+ residents across 25+ major cities."}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-2xl mx-auto px-4 mt-4">
                            <Link
                                href={data?.hero_primary_cta_url || "/home"}
                                className="group/btn relative flex justify-center items-center gap-3 bg-[#8B5CF6] text-white font-bold px-10 py-5 rounded-2xl transition-all shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.5)] hover:bg-[#7C3AED] active:scale-95 text-base w-full sm:w-auto"
                            >
                                {data?.hero_primary_cta_text || "Explore Hostels"}
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href={data?.hero_secondary_cta_url || "#how"}
                                className="group/btn flex justify-center items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold px-10 py-5 rounded-2xl transition-all backdrop-blur-sm active:scale-95 text-base w-full sm:w-auto"
                            >
                                {data?.hero_secondary_cta_text || "Our Standards"}
                            </Link>
                        </div>

                        {/* Trust Row */}
                        <div className="flex flex-wrap gap-x-12 gap-y-6 items-center justify-center text-white/60 text-sm font-semibold tracking-wide w-full mt-20 lg:mt-32">
                            <div className="flex items-center gap-3 group/item cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-[#8B5CF6]/20 transition-colors">
                                    <ShieldCheck size={20} className="text-[#8B5CF6]" />
                                </div>
                                <span>100% Pre-Verified</span>
                            </div>

                            <div className="flex items-center gap-3 group/item cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-[#8B5CF6]/20 transition-colors">
                                    <MapPin size={20} className="text-[#8B5CF6]" />
                                </div>
                                <span>25+ Major Cities</span>
                            </div>

                            <div className="flex items-center gap-3 group/item cursor-default">
                                <div className="p-2 rounded-lg bg-white/5 group-hover/item:bg-[#8B5CF6]/20 transition-colors">
                                    <Star size={20} fill="currentColor" className="text-[#8B5CF6]" />
                                </div>
                                <span>4.9 Avg Rating</span>
                            </div>
                        </div>
                    </SectionReveal>
                </div>
            </div>
        </section>
    );
}