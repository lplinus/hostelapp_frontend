import SectionReveal from "@/components/ui/section-reveal";
import { Star } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingTestimonialsProps {
  data: LandingPageResponse | null;
}

const defaultTestimonials = [
  {
    text: "Found an amazing verified hostel in Hyderabad within 10 minutes. The pricing was totally transparent with zero hidden costs.",
    name: "Rahul S.",
    role: "Engineering Student, Hyderabad",
    initial: "R",
  },
  {
    text: "Unbeatable prices and a smooth booking process. My room has high-speed WiFi, clean meals, and AC exactly as described.",
    name: "Priya M.",
    role: "MBA Student, Bangalore",
    initial: "P",
  },
];

export default function LandingTestimonials({ data }: LandingTestimonialsProps) {
  const displayTestimonials =
    data?.testimonials && data.testimonials.length > 0 ? data.testimonials : defaultTestimonials;

  return (
    <section id="reviews" className="py-8 sm:py-10 bg-white font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Compact Header */}
        <SectionReveal>
          <div className="max-w-2xl mx-auto text-center mb-6 sm:mb-8">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {data?.testimonials_eyebrow || "Student Reviews"}
            </span>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              {data?.testimonials_title_main || "Trusted by"}{" "}
              <span className="text-slate-600 font-normal">
                {data?.testimonials_title_italic || "Thousands of Students"}
              </span>
            </h2>
          </div>
        </SectionReveal>

        {/* Compact Cards */}
        <SectionReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {displayTestimonials.map((t, idx) => (
              <figure
                key={idx}
                className="flex flex-col justify-between p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-black hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-2.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>

                  <blockquote className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal mb-4">
                    “{t.text}”
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3 pt-3 border-t border-slate-200/60 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-[#0F172A] shrink-0">
                    {t.initial || t.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#0F172A] leading-tight truncate">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
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