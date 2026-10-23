import SectionReveal from "@/components/ui/section-reveal";
import { ShieldCheck, Zap, Heart, Globe, Wifi, Wallet, LucideIcon } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

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
    title: "100% Verified Listings",
    text: "Every property is physically inspected for security, hygiene, and room specs.",
  },
  {
    icon_name: "Zap",
    title: "Instant Digital Booking",
    text: "Reserve your ideal student room online with zero paperwork or broker calls.",
  },
  {
    icon_name: "Heart",
    title: "Student-First Pricing",
    text: "Affordable monthly and daily stays designed specifically for student budgets.",
  },
  {
    icon_name: "Wifi",
    title: "High-Speed Connectivity",
    text: "Dependable WiFi and dedicated study desks in all top-tier student rooms.",
  },
  {
    icon_name: "Wallet",
    title: "Zero Brokerage",
    text: "Transparent rental pricing with no hidden charges, surprise fees, or middleman cuts.",
  },
  {
    icon_name: "Globe",
    title: "25+ Major Education Hubs",
    text: "Explore curated student accommodations close to colleges and tech hubs nationwide.",
  },
];

export default function LandingFeatures({ data }: LandingFeaturesProps) {
  const displayFeatures = data?.features && data.features.length > 0 ? data.features : defaultFeatures;

  return (
    <section id="features" className="py-8 sm:py-10 bg-white font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Compact Section Header */}
        <SectionReveal>
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {data?.features_eyebrow || "Why Choose Hostel In"}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
              {data?.features_title_main || "Everything You Need,"}{" "}
              <span className="text-slate-600 font-normal">
                {data?.features_title_italic || "Nothing You Don't"}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              {data?.features_subtitle ||
                "Re-imagining the student hostel experience with verified safety, honest rates, and instant reservations."}
            </p>
          </div>
        </SectionReveal>

        {/* Compact Feature Grid */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {displayFeatures.map((f, idx) => {
              const Icon = ICON_MAP[f.icon_name] || ShieldCheck;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {/* Compact Icon */}
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-[#0F172A] shadow-xs shrink-0 mt-0.5">
                    <Icon size={18} className="text-slate-700" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] tracking-tight mb-1">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {f.text}
                    </p>
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