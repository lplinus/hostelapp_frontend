"use client";

import SectionReveal from "@/components/ui/section-reveal";
import { ShieldCheck, Zap, Heart, Globe, Wifi, Wallet } from "lucide-react";

/**
 * LANDING FEATURES SECTION
 * Premium grid showcasing USP with high-contrast icons and elegant cards.
 */

const features = [
    {
        icon: <ShieldCheck size={32} />,
        title: "Verified Listings",
        text: "Every property is physically inspected for safety, quality, and accuracy by our regional teams."
    },
    {
        icon: <Zap size={32} />,
        title: "Instant Booking",
        text: "Reserve your ideal stay in minutes. No paperwork, no hidden calls, no stress."
    },
    {
        icon: <Heart size={32} />,
        title: "Student-Centric",
        text: "Designed specifically for student needs—community vibes, study spaces, and high connectivity."
    },
    {
        icon: <Wifi size={32} />,
        title: "Smart Amenities",
        text: "High-speed internet, nutritious meals, and 24/7 security come standard with our picks."
    },
    {
        icon: <Wallet size={32} />,
        title: "Total Transparency",
        text: "Clear pricing, verified reviews, and secure payments with zero hidden extra costs."
    },
    {
        icon: <Globe size={32} />,
        title: "Massive Network",
        text: "Access 500+ premium hostels across India's top 25+ education and tech hubs."
    },
];

export default function LandingFeatures() {
    return (
        <section id="features" className="py-28 sm:py-36 bg-[#fafaf9] font-poppins relative overflow-hidden">

            {/* subtle background glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-200/20 blur-[180px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

                {/* Section Header */}
                <SectionReveal>
                    <div className="max-w-3xl mx-auto text-center mb-28">

                        {/* Eyebrow */}
                        <p className="text-[11px] tracking-[0.35em] font-semibold text-amber-600 uppercase mb-6">
                            The LiveHub Advantage
                        </p>

                        {/* Main Heading */}
                        <h2 className="text-4xl sm:text-6xl font-extrabold text-stone-900 leading-[1.1] tracking-tight mb-6">
                            Everything You Need,
                            <br />
                            <span className="italic text-stone-500 font-medium">
                                Nothing You Don't.
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-base sm:text-lg text-stone-500 leading-relaxed max-w-2xl mx-auto">
                            We've re-imagined the hostel experience from the ground up,
                            focusing only on what truly matters to students.
                        </p>

                    </div>
                </SectionReveal>

                {/* Feature Grid (UNCHANGED) */}
                <SectionReveal delay={0.2}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group relative p-12 bg-white rounded-[3rem] border border-stone-100/50 hover:bg-stone-900 hover:border-stone-900 transition-all duration-700 shadow-xl shadow-stone-200/20 active:scale-[0.98]"
                            >
                                {/* Icon Container */}
                                <div className="mb-10 w-20 h-20 rounded-[2rem] bg-amber-50 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-900/5 group-hover:bg-amber-500 group-hover:text-white group-hover:rotate-[10deg] transition-all duration-700">
                                    {f.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-black text-stone-900 group-hover:text-white mb-4 tracking-tight transition-colors">
                                    {f.title}
                                </h3>
                                <p className="text-base leading-relaxed text-stone-500 group-hover:text-stone-400 font-medium transition-colors">
                                    {f.text}
                                </p>

                                {/* Decorative Visual Flair */}
                                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionReveal>

            </div>
        </section>
    );
}