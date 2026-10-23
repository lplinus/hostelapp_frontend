import SectionReveal from "@/components/ui/section-reveal";
import { Search, ListChecks, CheckCircle2, LucideIcon } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingHowItWorksProps {
  data: LandingPageResponse | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Search,
  ListChecks,
  CheckCircle2,
};

const defaultSteps = [
  {
    step_number: "01",
    icon_name: "Search",
    title: "Pick Your City & Campus",
    text: "Select from 25+ verified hubs with transparent student prices and distance filters.",
  },
  {
    step_number: "02",
    icon_name: "ListChecks",
    title: "Compare Verified Spaces",
    text: "Check verified amenities, food menus, Wi-Fi speeds, and genuine resident reviews.",
  },
  {
    step_number: "03",
    icon_name: "CheckCircle2",
    title: "Instant Move-in Confirmation",
    text: "Lock in your lowest price stay online and move into your new room seamlessly.",
  },
];

export default function LandingHowItWorks({ data }: LandingHowItWorksProps) {
  const displaySteps = data?.steps && data.steps.length > 0 ? data.steps : defaultSteps;

  return (
    <section id="how" className="py-8 sm:py-10 bg-slate-50/50 font-inter border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Compact Header */}
        <SectionReveal>
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {data?.how_eyebrow || "Simple 3-Step Process"}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mb-2">
              {data?.how_title_main || "Booking Made"}{" "}
              <span className="text-slate-600 font-normal">
                {data?.how_title_italic || "Effortless"}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              {data?.how_subtitle ||
                "Finding the right student stay takes minutes, not weeks. No broker visits or paperwork hassles."}
            </p>
          </div>
        </SectionReveal>

        {/* Compact Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {displaySteps.map((s, i) => {
            const Icon = ICON_MAP[s.icon_name] || Search;
            return (
              <SectionReveal key={i} delay={i * 0.08}>
                <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      STEP {s.step_number}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] mb-1 tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {s.text}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}