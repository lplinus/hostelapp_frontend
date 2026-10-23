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
    <section className="py-8 sm:py-10 bg-[#F8FAFC] font-inter overflow-hidden relative">
      {/* Background visual element */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#312E81]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        {/* Compact Section Header */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-semibold tracking-wider uppercase mb-2">
            <span>The Advantage</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
            {cleanTitle}{" "}
            <span className="font-normal text-slate-600">Hostel In</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
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
                className="group relative p-5 sm:p-6 bg-white rounded-2xl border border-slate-200/90 hover:border-black hover:shadow-md transition-all duration-200 flex flex-col justify-between text-left"
              >
                <div>
                  {/* Card Top Row: Icon Container & Index Indicator */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-[#0F172A] group-hover:text-white flex items-center justify-center text-slate-700 transition-colors duration-200 shadow-sm">
                      <IconComponent size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-800 transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[15px] sm:text-base font-bold text-[#0F172A] group-hover:text-black mb-1.5 tracking-tight transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-[#0F172A] transition-colors">
                    Student Verified
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-emerald-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>

        {/* PREVIOUS WHY US LAYOUT (Preserved as commented-out for future re-inclusion):
        <div className="max-w-3xl mx-auto mb-10 lg:mb-12 text-center mt-12">
          <div className="flex items-center justify-center gap-3 text-black mb-4">
            <span className="text-[11px] tracking-[0.25em] font-medium uppercase text-black">The Advantage</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-normal text-black tracking-tight mb-8">
            {cleanTitle} <span className="italic text-black font-normal">Hostel In</span>
          </h2>
          <p className="text-lg text-black leading-relaxed max-w-2xl mx-auto font-normal">
            We've re-imagined the hostel experience from the ground up, focusing only on what truly matters to students.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {featuresToRender.map((feature, index) => {
            let IconComponent: LucideIcon;
            if (typeof feature.icon === 'string') {
              IconComponent = ICON_MAP[feature.icon] || Shield;
            } else {
              IconComponent = feature.icon || Shield;
            }
            return (
              <div
                key={feature.id || index}
                className="group relative p-10 bg-white rounded-3xl border border-slate-100 hover:border-black/20 hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="mb-10 w-16 h-16 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all duration-500 group-hover:scale-110 shadow-sm">
                  <IconComponent size={28} />
                </div>
                <h3 className="text-xl font-medium text-black group-hover:text-black mb-4 tracking-tight transition-colors">
                  {feature.title}
                </h3>
                <p className="text-base leading-relaxed text-black group-hover:text-black font-normal transition-colors">
                  {feature.description}
                </p>
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-bounce" />
                </div>
              </div>
            );
          })}
        </div>
        */}
      </div>
    </section>
  );
}