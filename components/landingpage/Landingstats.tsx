import SectionReveal from "@/components/ui/section-reveal";
import { Home, Users, Map, Star, ShieldCheck, Globe, Heart, Zap, LucideIcon } from "lucide-react";

interface LandingStatData {
  number: string;
  label: string;
  icon_name: string;
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
  },
  {
    number: "10K+",
    label: "Happy Students",
    icon_name: "Users",
  },
  {
    number: "25+",
    label: "Prime Cities",
    icon_name: "Map",
  },
  {
    number: "4.9★",
    label: "Customer Trust",
    icon_name: "Star",
  },
];

export default function LandingStats({ stats }: LandingStatsProps) {
  const displayStats = stats && stats.length > 0 ? stats : defaultStats;

  return (
    <section className="py-6 sm:py-8 font-inter bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {displayStats.map((s, idx) => {
              const Icon = ICON_MAP[s.icon_name] || Home;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0F172A] shrink-0">
                    <Icon className="w-5 h-5 text-slate-700" />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] leading-tight">
                      {s.number}
                    </div>
                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {s.label}
                    </div>
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