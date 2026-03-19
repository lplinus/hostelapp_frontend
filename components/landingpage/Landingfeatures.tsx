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
        <section id="features" className="py-28 sm:py-36 bg-slate-50 font-poppins relative overflow-hidden">

            {/* subtle background glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-200/20 blur-[180px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

                {/* Section Header */}
                <SectionReveal>
                    <div className="max-w-3xl mx-auto text-center mb-28">

                        {/* Eyebrow */}
                        <p className="text-[11px] tracking-[0.35em] font-semibold text-orange-500 uppercase mb-6">
                            {data?.features_eyebrow || "The Hostel In Advantage"}
                        </p>

                        {/* Main Heading */}
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight mb-6">
                            {data?.features_title_main || "Everything You Need,"}
                            <br />
                            <span className="italic text-slate-500 font-medium">
                                {data?.features_title_italic || "Nothing You Don't."}
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-2xl mx-auto">
                            {data?.features_subtitle || "We've re-imagined the hostel experience from the ground up, focusing only on what truly matters to students."}
                        </p>

                    </div>
                </SectionReveal>

                {/* Feature Grid */}
                <SectionReveal delay={0.2}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {displayFeatures.map((f, idx) => {
                            const Icon = ICON_MAP[f.icon_name] || ShieldCheck;
                            return (
                                <div
                                    key={idx}
                                    className="group relative p-12 bg-white rounded-[3rem] border border-slate-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-200/20 transition-all duration-700 active:scale-[0.98]"
                                >
                                    {/* Icon Container */}
                                    <div className="mb-10 w-20 h-20 rounded-[2rem] bg-orange-50 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-900/5 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-[10deg] transition-all duration-700">
                                        <Icon size={32} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-black text-slate-900 group-hover:text-orange-600 mb-4 tracking-tight transition-colors">
                                        {f.title}
                                    </h3>
                                    <p className="text-base leading-relaxed text-slate-500 group-hover:text-slate-600 font-medium transition-colors">
                                        {f.text}
                                    </p>

                                    {/* Decorative Visual Flair */}
                                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
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