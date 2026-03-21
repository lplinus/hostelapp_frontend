
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
        <section id="reviews" className="py-24 lg:py-32 bg-white font-inter relative overflow-hidden">
            {/* Decorative Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#8B5CF6]/5 blur-[200px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

                {/* Heading */}
                <SectionReveal>
                    <div className="max-w-5xl mx-auto text-center mb-16 lg:mb-24">
                        <div className="flex items-center justify-center gap-3 text-[#8B5CF6] mb-8">
                            <span className="text-[11px] tracking-[0.25em] font-bold uppercase">
                                {data?.testimonials_eyebrow || "Real Experiences"}
                            </span>
                        </div>

                        <h2 className="text-5xl sm:text-7xl lg:text-[100px] font-bold tracking-tighter text-[#0F172A] leading-[1] mb-6">
                            {data?.testimonials_title_main || "Trusted by"}{" "}
                            <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
                                {data?.testimonials_title_italic || "Thousands"}
                            </span>
                        </h2>
                    </div>
                </SectionReveal>

                {/* Cards */}
                <SectionReveal delay={0.2}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">

                        {displayTestimonials.map((t, idx) => (
                            <figure
                                key={idx}
                                className="group relative flex flex-col bg-[#F8FAFC] rounded-3xl p-10 lg:p-12 hover:bg-white hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all duration-500 border border-slate-100/50"
                            >
                                {/* Quote Icon */}
                                <div className="absolute top-8 right-8 text-slate-200 group-hover:text-[#8B5CF6]/20 transition-colors duration-500">
                                    <Quote size={48} strokeWidth={1} />
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 text-[#8B5CF6] mb-8 transform group-hover:scale-105 transition-transform origin-left">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <blockquote className="flex-1 text-lg sm:text-xl font-medium leading-relaxed text-[#0F172A]/90 mb-10 group-hover:text-[#0F172A] transition-colors duration-500">
                                    “{t.text}”
                                </blockquote>

                                {/* Author */}
                                <figcaption className="flex items-center gap-4 mt-auto">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-xl font-bold text-[#0F172A] flex-shrink-0 group-hover:bg-[#0F172A] group-hover:text-white transition-all shadow-sm">
                                        {t.initial || t.name.charAt(0)}
                                    </div>

                                    <div className="flex flex-col">
                                        <p className="text-base font-bold text-[#0F172A]">
                                            {t.name}
                                        </p>
                                        <p className="text-sm font-medium text-[#64748B]">
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