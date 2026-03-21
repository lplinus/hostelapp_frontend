import SectionReveal from "@/components/ui/section-reveal";
import { ShieldCheck, Zap, Heart, Globe, Wifi, Wallet, LucideIcon } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

/**
 * LANDING FEATURES SECTION
 * Premium grid showcasing USP with high-contrast icons and elegant cards.
 */

interface LandingFeaturesProps {
    data: LandingPageResponse | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
    ShieldCheck,
    Zap,
    Heart,
    Globe,
    Wifi,
    Wallet,
};

const defaultFeatures = [
    {
        icon_name: "ShieldCheck",
        title: "Verified Listings",
        text: "Every property is physically inspected for safety, quality, and accuracy by our regional teams."
    },
    {
        icon_name: "Zap",
        title: "Instant Booking",
        text: "Reserve your ideal stay in minutes. No paperwork, no hidden calls, no stress."
    },
    {
        icon_name: "Heart",
        title: "Student-Centric",
        text: "Designed specifically for student needs—community vibes, study spaces, and high connectivity."
    },
];

export default function LandingFeatures({ data }: LandingFeaturesProps) {
    const displayFeatures = data?.features && data.features.length > 0 ? data.features : defaultFeatures;

    return (
        <section id="features" className="py-24 lg:py-32 bg-white font-inter relative overflow-hidden">
            {/* background glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/5 blur-[180px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

                {/* Section Header */}
                <SectionReveal>
                    <div className="max-w-3xl mx-auto text-center mb-20 lg:mb-28">

                        <div className="flex items-center justify-center gap-3 text-[#8B5CF6] mb-6">
                            <span className="text-[11px] tracking-[0.25em] font-bold uppercase">
                                {data?.features_eyebrow || "The Hostel In Advantage"}
                            </span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl font-bold text-[#0F172A] leading-[1.1] tracking-tight mb-8">
                            {data?.features_title_main || "Everything You Need,"}
                            <br />
                            <span className="italic text-[#64748B] font-medium">
                                {data?.features_title_italic || "Nothing You Don't."}
                            </span>
                        </h2>

                        <p className="text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto font-medium">
                            {data?.features_subtitle || "We've re-imagined the hostel experience from the ground up, focusing only on what truly matters to students."}
                        </p>

                    </div>
                </SectionReveal>

                {/* Feature Grid */}
                <SectionReveal delay={0.2}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {displayFeatures.map((f, idx) => {
                            const Icon = ICON_MAP[f.icon_name] || ShieldCheck;
                            return (
                                <div
                                    key={idx}
                                    className="group relative p-10 lg:p-12 bg-[#F8FAFC] rounded-3xl border border-slate-100 hover:border-[#8B5CF6]/30 hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all duration-500 hover:-translate-y-2"
                                >
                                    {/* Icon Container */}
                                    <div className="mb-10 w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-[#0F172A] shadow-sm group-hover:bg-[#8B5CF6] group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg shadow-[#8B5CF6]/20">
                                        <Icon size={32} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-[#0F172A] group-hover:text-[#8B5CF6] mb-5 tracking-tight transition-colors">
                                        {f.title}
                                    </h3>
                                    <p className="text-base leading-relaxed text-[#64748B] group-hover:text-[#0F172A]/80 font-medium transition-colors">
                                        {f.text}
                                    </p>

                                    {/* Decorative Visual Flair */}
                                    <div className="absolute bottom-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionReveal>

            </div>
        </section>
    );
}