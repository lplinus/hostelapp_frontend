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
        <section className="bg-transparent py-20 lg:py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <SectionReveal>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                        {displayStats.map((s, idx) => {
                            const Icon = ICON_MAP[s.icon_name] || Home;
                            return (
                                <div
                                    key={idx}
                                    className="group relative flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-[#0F172A]/5 hover:-translate-y-2 transition-all duration-500 border border-slate-100/50"
                                >
                                    {/* Subtle Icon Background */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-transparent group-hover:bg-gradient-to-right from-transparent via-[#8B5CF6] to-transparent transition-all duration-500" />
                                    
                                    {/* Icon Circle */}
                                    <div className="mb-8 w-16 h-16 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#64748B] group-hover:bg-[#8B5CF6]/10 group-hover:text-[#8B5CF6] transition-all duration-500 shadow-inner">
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    {/* Stat Number */}
                                    <dt className="text-4xl sm:text-5xl font-bold tracking-tight text-[#0F172A] mb-3">
                                        {s.number}
                                    </dt>

                                    {/* Stat Label */}
                                    <dd className="text-xs sm:text-[13px] uppercase font-bold tracking-[0.1em] text-[#64748B] group-hover:text-[#0F172A] transition-colors">
                                        {s.label}
                                    </dd>
                                    
                                    {/* Decorative Dot */}
                                    <div className="mt-6 w-1 h-1 rounded-full bg-slate-200 group-hover:bg-[#8B5CF6] group-hover:scale-150 transition-all duration-500" />
                                </div>
                            );
                        })}
                    </div>
                </SectionReveal>
            </div>
        </section>
    );
}