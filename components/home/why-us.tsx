"use client";

import { ShieldCheck, Shield, Search, Star, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Shield,
  Search,
  Star,
};

interface WhyUsItem {
  id?: number;
  title: string;
  description: string;
  icon: string | LucideIcon;
}

interface WhyUsProps {
  title?: string;
  items?: WhyUsItem[];
}

export default function WhyUs({ title, items }: WhyUsProps) {
  const defaultFeatures: WhyUsItem[] = [
    {
      id: 1,
      icon: "ShieldCheck",
      title: "Verified Listings",
      description: "Every hostel is physically verified by our team for quality assurance.",
    },
    {
      id: 2,
      icon: "Shield",
      title: "Safe & Secure",
      description: "We prioritize your safety with background checks and audits.",
    },
    {
      id: 3,
      icon: "Search",
      title: "Easy Discovery",
      description: "Find your perfect hostel with smart filters and search.",
    },
    {
      id: 4,
      icon: "Star",
      title: "Honest Reviews",
      description: "Read genuine reviews from real students.",
    },
  ];

  const featuresToRender = items && items.length > 0 ? items : defaultFeatures;

  // Clean the title prop to avoid duplication (removes "StayNest" or "Hostel In" if already present)
  // then we append the correctly styled "Hostel In" brand name.
  const cleanTitle = title 
    ? title.replace(/StayNest/gi, "").replace(/Hostel In/gi, "").trim() 
    : "Why Choose";

  return (
    <section className="py-24 bg-[#F8FAFC] font-inter overflow-hidden relative">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#312E81]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10 text-center">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-20 lg:mb-24">
          <div className="flex items-center justify-center gap-3 text-[#312E81] mb-6">
            <span className="text-[11px] tracking-[0.25em] font-bold uppercase">The Advantage</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight mb-8">
            {cleanTitle}{" "}
            <span className="italic text-[#64748B] font-medium">Hostel In</span>
          </h2>

          <p className="text-lg text-[#64748B] leading-relaxed max-w-2xl mx-auto font-medium">
            We've re-imagined the hostel experience from the ground up, focusing only on what truly matters to students.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {featuresToRender.map((feature, index) => {
            // Dynamic Icon Resolution via ICON_MAP
            let IconComponent: LucideIcon;
            if (typeof feature.icon === 'string') {
              IconComponent = ICON_MAP[feature.icon] || Shield;
            } else {
              IconComponent = feature.icon || Shield;
            }

            return (
              <div
                key={feature.id || index}
                className="group relative p-10 bg-white rounded-3xl border border-slate-100 hover:border-[#312E81]/30 hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all duration-500 hover:-translate-y-2"
              >
                {/* Icon Container */}
                <div className="mb-10 w-16 h-16 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-[#0F172A] group-hover:bg-[#312E81] group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
                  <IconComponent size={28} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#312E81] mb-4 tracking-tight transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base leading-relaxed text-[#64748B] group-hover:text-[#0F172A]/80 font-medium transition-colors">
                  {feature.description}
                </p>

                {/* Decorative Visual Flair */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}