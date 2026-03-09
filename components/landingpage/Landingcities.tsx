import Link from "next/link";
import Image from "next/image";
import SectionReveal from "@/components/ui/section-reveal";
import { ArrowUpRight, Navigation } from "lucide-react";

const cities = [
  {
    city: "Hyderabad",
    count: "120+ Verified",
    image: "/images/hero1.webp",
    span: true,
    grad: "from-blue-600/70 to-indigo-900/70",
  },
  {
    city: "Bangalore",
    count: "95+ Hostels",
    image: "/images/hero2.jpg",
    span: false,
    grad: "from-amber-500/70 to-orange-700/70",
  },
  {
    city: "Pune",
    count: "74+ Hostels",
    image: "/images/heroimage.jpg",
    span: false,
    grad: "from-emerald-500/70 to-teal-800/70",
  },
  {
    city: "Mumbai",
    count: "88+ Top Picks",
    image: "/images/I1avif.webp",
    span: false,
    grad: "from-rose-500/70 to-red-900/70",
  },
  {
    city: "Chennai",
    count: "60+ Verified",
    image: "/images/i3.webp",
    span: false,
    grad: "from-violet-500/70 to-purple-900/70",
  },
];

export default function LandingCities() {
  return (
    <section id="cities" className="py-28 sm:py-36 bg-white font-poppins">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* Header */}
        <SectionReveal>
          <div className="flex flex-col items-center text-center mb-20">

            <div className="flex items-center gap-3 text-blue-600 mb-5">
              <Navigation size={18} className="animate-pulse" />
              <span className="text-[11px] font-black tracking-[0.25em] uppercase">
                Discover Your Hub
              </span>
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] mb-6">
              Most Popular <br className="hidden sm:block" />
              <span className="italic underline decoration-blue-400/40 underline-offset-8">
                Destinations
              </span>
            </h2>

            <Link
              href="/home"
              className="group inline-flex items-center justify-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95 min-w-[180px]"
            >
              See All Cities
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </Link>

          </div>
        </SectionReveal>

        {/* Grid */}
        <SectionReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 lg:gap-8">

            {cities.map((c) => (
              <Link
                key={c.city}
                href={`/city/${c.city.toLowerCase()}`}
                className={`group relative block rounded-[2.5rem] overflow-hidden h-[380px] sm:h-[420px] w-full shadow-2xl transition-all duration-500 hover:-translate-y-1 ${c.span ? "lg:col-span-2" : ""
                  }`}
              >

                {/* IMAGE */}
                <div className="absolute inset-0 w-full h-full z-0">
                  <Image
                    src={c.image}
                    alt={`${c.city} hostels`}
                    fill
                    className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    priority={c.city === "Hyderabad"}
                  />
                </div>

                {/* GRADIENT */}
                <div
                  className={`absolute inset-0 z-10 bg-gradient-to-br ${c.grad}`}
                />

                {/* CONTENT */}
                <div className="absolute inset-x-6 bottom-6 z-20 p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 flex flex-col gap-2">

                  <p className="font-bold text-[11px] uppercase tracking-[0.2em] text-blue-300 shadow-sm">
                    {c.count}
                  </p>

                  <div className="flex justify-between items-center">

                    <p className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                      {c.city}
                    </p>

                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg">
                      <ArrowUpRight size={20} />
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