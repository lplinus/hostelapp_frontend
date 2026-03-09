import Link from "next/link";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingCTA() {
    return (
        <section className="relative py-24 sm:py-40 overflow-hidden bg-white font-poppins">

            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-100/30 rounded-full blur-[120px]" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[80px]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-6 sm:px-10 text-center z-10">

                <SectionReveal>

                    {/* Eyebrow */}
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-stone-200 mb-6 sm:mb-8 shadow-sm">
                        <Sparkles size={18} className="text-stone-900" />
                        <span className="text-sm sm:text-base font-black tracking-[0.32em] uppercase text-stone-900">
                            Start your journey
                        </span>
                    </div>

                    {/* Heading */}
                    <div className="flex items-center justify-center">
                        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-stone-900 leading-[1.05] mb-8">
                            Ready for your
                            <br />
                            <span className="italic text-amber-500 font-bold">
                                next chapter?
                            </span>
                        </h2>
                    </div>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-stone-500 font-medium max-w-xl mx-auto leading-relaxed mb-12">
                        Join 10,000+ students living their best life in verified spaces.
                        Secure your spot in minutes.
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center justify-center w-full px-6 sm:px-0">
                        <Link
                            href="/home"
                            className="group inline-flex items-center justify-center gap-3 bg-white text-stone-900 border-2 border-stone-200 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg shadow-xl shadow-stone-200/50 hover:bg-stone-50 hover:border-stone-300 transition-all hover:-translate-y-1 active:scale-95 w-full sm:w-auto whitespace-nowrap overflow-hidden outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                        >
                            Start Exploring
                            <ArrowRight
                                size={22}
                                className="group-hover:translate-x-1.5 transition-transform shrink-0"
                            />
                        </Link>
                    </div>

                </SectionReveal>

            </div>
        </section>
    );
}