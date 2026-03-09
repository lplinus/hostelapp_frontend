import SectionReveal from "@/components/ui/section-reveal";
import { Search, ListChecks, CheckCircle2 } from "lucide-react";

const steps = [
    {
        n: "01",
        icon: <Search className="w-7 h-7" />,
        title: "Pick Your Hub",
        text: "Select from 25+ verified cities. Use smart filters for budget, location, and amenities.",
    },
    {
        n: "02",
        icon: <ListChecks className="w-7 h-7" />,
        title: "Compare & Select",
        text: "Browse verified photos and genuine student reviews. Compare the best options side by side.",
    },
    {
        n: "03",
        icon: <CheckCircle2 className="w-7 h-7" />,
        title: "Move In Swiftly",
        text: "Book instantly with secure deposits. Get confirmed in hours and move in without the stress.",
    },
];

export default function LandingHowItWorks() {
    return (
        <section
            id="how"
            className="py-28 sm:py-36 bg-[#fafaf9] font-poppins overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

                {/* Header */}
                <SectionReveal>
                    <div className="max-w-3xl mx-auto text-center mb-32">

                        {/* Eyebrow */}
                        <p className="text-xs tracking-[0.35em] uppercase font-semibold text-amber-600 mb-6">
                            The LiveHub Journey
                        </p>

                        {/* Main Heading */}
                        <h2 className="text-6xl lg:text-7xl font-black text-stone-900 tracking-tight leading-[1.05] mb-6">
                            Booking Made{" "}
                            <span className="italic text-amber-500">
                                Simple.
                            </span>
                        </h2>

                        {/* Sub Heading */}
                        <p className="text-lg text-stone-500 leading-relaxed max-w-xl mx-auto">
                            Finding the right hostel shouldn't take weeks.
                            LiveHub simplifies the entire process into three effortless steps.
                        </p>

                    </div>
                </SectionReveal>

                {/* Steps */}
                <div className="relative">

                    {/* Connector Line */}
                    <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[2px] bg-stone-200" />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-10">

                        {steps.map((s, i) => (
                            <SectionReveal key={s.n} delay={i * 0.1}>
                                <div className="flex flex-col items-center text-center group max-w-[320px] mx-auto">

                                    {/* Step Number */}
                                    <div className="text-[60px] font-black text-stone-200 group-hover:text-amber-400 transition-colors duration-500 mb-4">
                                        {s.n}
                                    </div>

                                    {/* Icon Bubble */}
                                    <div className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-amber-600 group-hover:bg-stone-900 group-hover:text-white transition-all duration-500 mb-6">
                                        {s.icon}
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-extrabold text-stone-900 mb-4 tracking-tight">
                                        {s.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-stone-500 font-medium leading-relaxed max-w-[260px]">
                                        {s.text}
                                    </p>

                                </div>
                            </SectionReveal>
                        ))}

                    </div>

                </div>

            </div>
        </section>
    );
}