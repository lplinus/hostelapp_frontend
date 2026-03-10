
import SectionReveal from "@/components/ui/section-reveal";
import { Star, Quote } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingTestimonialsProps {
    data: LandingPageResponse | null;
}

const defaultTestimonials = [
    {
        text: "Found an amazing hostel in Hyderabad within 10 minutes. The verification gave me real confidence booking from another city.",
        name: "Rahul S.",
        role: "Engineering Student",
        initial: "R",
    },
    {
        text: "Unbeatable prices and a smooth process. My hostel has everything — WiFi, meals, AC. Exactly what was promised.",
        name: "Priya M.",
        role: "MBA Student",
        initial: "P",
    },
];

export default function LandingTestimonials({ data }: LandingTestimonialsProps) {
    const displayTestimonials = data?.testimonials && data.testimonials.length > 0 ? data.testimonials : defaultTestimonials;

    return (
        <section id="reviews" className="py-24 sm:py-32 bg-white font-poppins relative overflow-hidden">

            {/* Decorative Quote Mark */}
            <div className="absolute top-16 right-16 opacity-[0.04] pointer-events-none hidden lg:block">
                <Quote size={180} strokeWidth={1.5} />
            </div>

            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

                {/* Heading */}
                <SectionReveal>
                    <div className="max-w-6xl mx-auto text-center">

                        <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-[0.35em] uppercase text-amber-600 block mb-8">
                            {data?.testimonials_eyebrow || "Real Experiences"}
                        </span>

                        <h2 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-stone-900 leading-[1.02]">
                            {data?.testimonials_title_main || "Trusted by"}{" "}
                            <span className="text-stone-400 italic font-semibold">
                                {data?.testimonials_title_italic || "Thousands"}
                            </span>
                        </h2>

                    </div>
                </SectionReveal>

                {/* Explicit Spacer */}
                <div className="h-20 sm:h-32 lg:h-40 w-full" />

                {/* Cards */}
                <SectionReveal delay={0.2}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">

                        {displayTestimonials.map((t, idx) => (
                            <figure
                                key={idx}
                                className="group flex flex-col bg-[#fafaf9] rounded-[3rem] p-12 hover:bg-white hover:shadow-2xl hover:shadow-stone-200/50 transition-all duration-700 active:scale-95 border border-stone-100"
                            >

                                {/* Stars */}
                                <div className="flex gap-1.5 text-amber-400 mb-8 group-hover:scale-110 transition-transform origin-left">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill="currentColor" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <blockquote className="flex-1 text-lg sm:text-xl font-medium leading-relaxed text-stone-700 mb-12 group-hover:text-amber-600 transition-colors duration-500">
                                    “{t.text}”
                                </blockquote>

                                {/* Author */}
                                <figcaption className="flex items-center gap-4 mt-auto">

                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-lg font-bold text-amber-600 flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                                        {t.initial || t.name.charAt(0)}
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-base font-semibold text-stone-900">
                                            {t.name}
                                        </p>
                                        <p className="text-sm text-stone-500">
                                            {t.role}
                                        </p>
                                    </div>

                                </figcaption>

                            </figure>
                        ))}

                    </div>
                </SectionReveal>

            </div>
        </section>
    );
}