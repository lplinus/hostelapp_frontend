import Link from "next/link";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowUpRight, MapPin } from "lucide-react";
import { LandingPageResponse } from "@/lib/api/types";

interface LandingCitiesProps {
  data: LandingPageResponse | null;
}

interface CityCardItem {
  city_name: string;
  count_text: string;
  price_text: string;
  areas: string;
}

const defaultCities: CityCardItem[] = [
  {
    city_name: "Hyderabad",
    count_text: "120+ Hostels",
    price_text: "From ₹3,443/mo",
    areas: "Madhapur, Gachibowli, Ameerpet",
  },
  {
    city_name: "Bangalore",
    count_text: "95+ Hostels",
    price_text: "From ₹4,200/mo",
    areas: "Koramangala, HSR, Indiranagar",
  },
  {
    city_name: "Pune",
    count_text: "74+ Hostels",
    price_text: "From ₹3,800/mo",
    areas: "Viman Nagar, Kothrud, Hinjewadi",
  },
  {
    city_name: "Mumbai",
    count_text: "88+ Hostels",
    price_text: "From ₹5,500/mo",
    areas: "Andheri, Powai, Navi Mumbai",
  },
  {
    city_name: "Chennai",
    count_text: "60+ Hostels",
    price_text: "From ₹3,200/mo",
    areas: "OMR, Velachery, Guindy",
  },
];

export default function LandingCities({ data }: LandingCitiesProps) {
  const displayCities: CityCardItem[] =
    data?.cities && data.cities.length > 0
      ? data.cities.map((c, i) => {
        const fallback = defaultCities[i % defaultCities.length];
        return {
          city_name: c.city_name,
          count_text: c.count_text || fallback.count_text,
          price_text: fallback.price_text,
          areas: fallback.areas,
        };
      })
      : defaultCities;

  // Duplicate for seamless infinite loop
  const carouselCities = [...displayCities, ...displayCities];

  return (
    <section id="cities" className="py-12 sm:py-16 font-inter bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        {/* Header */}
        <SectionReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <MapPin size={13} className="text-slate-700" />
                <span>Prime Hubs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
                {data?.cities_title_main || "Popular"}{" "}
                <span className="text-slate-600 font-normal">
                  {data?.cities_title_italic || "Destinations"}
                </span>
              </h2>
            </div>

            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] hover:text-slate-600 transition-colors group shrink-0"
            >
              <span>See all cities</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </SectionReveal>
      </div>

      {/* Continuous Moving Carousel (Stops on Hover) */}
      <div className="relative w-full overflow-hidden py-2">
        {/* Soft edge gradient masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Infinite Moving Track */}
        <div className="animate-marquee-continuous gap-4 sm:gap-5 px-4">
          {carouselCities.map((c, idx) => (
            <div
              key={idx}
              className="w-[240px] sm:w-[270px] shrink-0 flex flex-col justify-between p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-black hover:shadow-md transition-all duration-200 select-none cursor-pointer min-h-[175px] sm:min-h-[190px]"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {c.count_text}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight mb-1">
                  {c.city_name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {c.areas}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0F172A]">
                  {c.price_text}
                </span>
                <span className="text-[10px] text-slate-400">
                  Hostel Stays
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}