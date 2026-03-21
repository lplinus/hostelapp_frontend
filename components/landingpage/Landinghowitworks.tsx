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
        title: "Pick Your Hub",
        text: "Select from 25+ verified cities. Use smart filters for budget, location, and amenities.",
    },
    {
        step_number: "02",
        icon_name: "ListChecks",
        title: "Compare & Select",
        text: "Browse verified photos and genuine student reviews. Compare the best options side by side.",
    },
    {
        step_number: "03",
        icon_name: "CheckCircle2",
        title: "Move In Swiftly",
        text: "Book instantly with secure deposits. Get confirmed in hours and move in without the stress.",
    },
];

export default function LandingHowItWorks({ data }: LandingHowItWorksProps) {
    const displaySteps = data?.steps && data.steps.length > 0 ? data.steps : defaultSteps;

    return (
        <section
            id="how"
            className="py-24 lg:py-32 bg-[#F8FAFC] font-inter overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

                {/* Header */}
                <SectionReveal>
                    <div className="max-w-3xl mx-auto text-center mb-20 lg:mb-32">

                        <div className="flex items-center justify-center gap-3 text-[#8B5CF6] mb-6">
                            <span className="text-[11px] tracking-[0.25em] font-bold uppercase">
                                {data?.how_eyebrow || "The Hostel In Journey"}
                            </span>
                        </div>

                        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-[#0F172A] tracking-tight leading-[1.1] mb-8">
                            {data?.how_title_main || "Booking Made"}{" "}
                            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
                                {data?.how_title_italic || "Simple."}
                            </span>
                        </h2>

                        <p className="text-lg text-[#64748B] leading-relaxed max-w-xl mx-auto font-medium">
                            {data?.how_subtitle || "Finding the right hostel shouldn't take weeks. Hostel In simplifies the entire process into three effortless steps."}
                        </p>

                    </div>
                </SectionReveal>

                {/* Steps */}
                <div className="relative">

                    {/* Connector Line */}
                    <div className="hidden lg:block absolute top-[110px] left-[15%] right-[15%] h-[1px] bg-slate-200" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10">

                        {displaySteps.map((s, i) => {
                            const Icon = ICON_MAP[s.icon_name] || Search;
                            return (
                                <SectionReveal key={i} delay={i * 0.1}>
                                    <div className="flex flex-col items-center text-center group max-w-[320px] mx-auto relative">

                                        {/* Step Number Background */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-[100px] font-black text-slate-100 group-hover:text-[#8B5CF6]/5 transition-colors duration-500 pointer-events-none select-none z-0">
                                            {s.step_number}
                                        </div>

                                        {/* Icon Bubble */}
                                        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl shadow-[#0F172A]/5 flex items-center justify-center text-[#0F172A] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all duration-500 mb-8 relative z-10 border border-slate-50">
                                            <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-[#0F172A] mb-4 tracking-tight group-hover:text-[#8B5CF6] transition-colors relative z-10">
                                            {s.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-[#64748B] font-medium leading-relaxed max-w-[260px] relative z-10 transition-colors group-hover:text-[#0F172A]/80">
                                            {s.text}
                                        </p>

                                    </div>
                                </SectionReveal>
                            );
                        })}

                    </div>

                </div>

            </div>
        </section>
    );
}