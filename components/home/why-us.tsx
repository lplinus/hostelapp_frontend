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
    <section className="py-8 sm:py-10 bg-transparent font-inter overflow-hidden relative">
      {/* Background visual element */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#312E81]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Compact Section Header */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#DBD5C8] text-[#5A544A] text-[11px] font-semibold tracking-wider uppercase mb-2 border border-[#D2CABC]">
            <span>The Advantage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1916] tracking-tight mb-2">
            {cleanTitle}{" "}
            <span className="font-normal text-[#5A544A]">Hostel In</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#686259] leading-relaxed max-w-xl mx-auto">
            We've re-imagined the hostel experience from the ground up, focusing only on what truly matters to students.
          </p>
        </div>

        {/* Compact & Amazing Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
                className="group relative p-5 sm:p-6 bg-[#E5DFD4] rounded-2xl border border-[#D2CABC] hover:border-[#1F1E1B] hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left"
              >
                <div>
                  {/* Card Top Row: Icon Container & Index Indicator */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#DBD5C8] group-hover:bg-[#1F1E1B] group-hover:text-white flex items-center justify-center text-[#1F1E1B] transition-colors duration-200 shadow-xs">
                      <IconComponent size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-[#7A746B] group-hover:text-[#1A1916] transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] sm:text-base font-bold text-[#1A1916] group-hover:text-black mb-1.5 tracking-tight transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-[#686259] leading-relaxed group-hover:text-[#1A1916] transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-4 pt-3 border-t border-[#D2CABC] flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A746B] group-hover:text-[#1A1916] transition-colors">
                    Student Verified
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D2CABC] group-hover:bg-[#1F1E1B] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}