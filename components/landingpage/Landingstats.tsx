import SectionReveal from "@/components/ui/section-reveal";
import { Home, Users, Map, Star, ShieldCheck, Globe, Heart, Zap, LucideIcon } from "lucide-react";

/**
 * LANDING STATS SECTION
 * Clean, minimal stats overview with subtle interactive hover states.
 */

interface LandingStatData {
    number: string;
    label: string;
    icon_name: string;
    color_gradient: string;
}

interface LandingStatsProps {
    stats?: LandingStatData[];
}

const ICON_MAP: Record<string, LucideIcon> = {
    Home,
    Users,
    Map,
    Star,
    ShieldCheck,
    Globe,
    Heart,
    Zap,
};

const defaultStats: LandingStatData[] = [
    {
        number: "500+",
        label: "Verified Hostels",
        icon_name: "Home",
        color_gradient: "from-amber-400 to-amber-600"
    },
    {
        number: "10K+",
        label: "Happy Students",
        icon_name: "Users",
        color_gradient: "from-blue-400 to-blue-600"
    },
    {
        number: "25+",
        label: "Prime Cities",
        icon_name: "Map",
        color_gradient: "from-emerald-400 to-emerald-600"
    },
    {
        number: "4.9★",
        label: "Customer Trust",
        icon_name: "Star",
        color_gradient: "from-rose-400 to-rose-600"
    },
];

export default function LandingStats({ stats }: LandingStatsProps) {
    const displayStats = stats && stats.length > 0 ? stats : defaultStats;

    return (
        <section className="bg-white py-16 lg:py-24 font-poppins relative">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <SectionReveal>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {displayStats.map((s, idx) => {
                            const Icon = ICON_MAP[s.icon_name] || Home;
                            return (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col items-center justify-center p-10 sm:p-12 text-center bg-[#fafaf9] rounded-[2.5rem] border border-stone-100/50 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 active:scale-95"
                                >
                                    {/* Icon Circle */}
                                    <div className="mb-6 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all duration-500">
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    {/* Stat Number */}
                                    <dt className="text-4xl sm:text-5xl font-black tracking-tight text-stone-900 mb-2">
                                        {s.number}
                                    </dt>

                                    {/* Stat Label */}
                                    <dd className="text-[10px] sm:text-[11px] uppercase font-black tracking-[0.2em] text-stone-400 group-hover:text-stone-900 transition-colors">
                                        {s.label}
                                    </dd>

                                    {/* Corner accent */}
                                    <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-stone-100 group-hover:bg-amber-500 transition-colors" />
                                </div>
                            );
                        })}
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}