import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowUpRight, Navigation } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";
import { toLocalMediaPath, isExternalImage, getCitySEOLink } from "@/lib/utils";

interface LandingCitiesProps {
  data: LandingPageResponse | null;
}

const defaultCities = [
  {
    city_name: "Hyderabad",
    count_text: "120+ Verified",
    image: "/images/hero1.webp",
    span_large: true,
    gradient: "from-orange-600/70 to-slate-900/70",
  },
  {
    city_name: "Bangalore",
    count_text: "95+ Hostels",
    image: "/images/hero2.jpg",
    span_large: false,
    gradient: "from-orange-500/70 to-amber-700/70",
  },
  {
    city_name: "Pune",
    count_text: "74+ Hostels",
    image: "/images/heroimage.jpg",
    span_large: false,
    gradient: "from-teal-500/70 to-slate-900/70",
  },
];

export default function LandingCities({ data }: LandingCitiesProps) {
  const displayCities = data?.cities && data.cities.length > 0 ? data.cities : defaultCities;

  return (
    <section id="cities" className="py-24 lg:py-32 font-inter bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* Header */}
        <SectionReveal>
          <div className="flex flex-col items-center text-center mb-16 lg:mb-24">

            <div className="flex items-center gap-3 text-[#8B5CF6] mb-5">
              <Navigation size={18} className="animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
                {data?.cities_eyebrow || "Discover Your Hub"}
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F172A] leading-[1.1] mb-8">
              {data?.cities_title_main || "Most Popular"}<br className="hidden sm:block" />
              <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
                {data?.cities_title_italic || "Destinations"}
              </span>
            </h2>

            <Link
              href="/home"
              className="group relative inline-flex items-center justify-center gap-3 bg-[#0F172A] text-white px-10 py-4 rounded-full font-bold text-sm shadow-xl shadow-[#0F172A]/20 hover:bg-[#1E293B] transition-all duration-300 active:scale-95"
            >
              See All Cities
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>

          </div>
        </SectionReveal>

        {/* Grid */}
        <SectionReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">

            {displayCities.map((c, idx) => (
              <Link
                key={idx}
                href={getCitySEOLink(c.city_name.toLowerCase())}
                className={`group relative block rounded-3xl overflow-hidden h-[400px] w-full shadow-md hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${c.span_large ? "lg:col-span-2" : ""
                  }`}
              >

                {/* IMAGE */}
                <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                  <Image
                    src={toLocalMediaPath(c.image) || "/images/hero1.webp"}
                    alt={`${c.city_name} hostels`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    priority={idx === 0}
                    unoptimized={isExternalImage(c.image)}
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/40 to-transparent group-hover:opacity-90 transition-opacity" />
                </div>

                {/* CONTENT */}
                <div className="absolute inset-x-0 bottom-0 z-20 p-8 flex flex-col justify-end h-full">
                  <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="font-bold text-[11px] uppercase tracking-[0.15em] text-[#8B5CF6] mb-1">
                      {c.count_text}
                    </p>

                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-bold text-white tracking-tight">
                        {c.city_name}
                      </p>

                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl group-hover:rotate-45">
                        <ArrowUpRight size={22} />
                      </div>
                    </div>
                  </div>
                </div>

              </Link>
            ))}

          </div>
        </SectionReveal>

      </div>
    </section>
  );
}