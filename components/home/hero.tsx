import Image from "next/image";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative flex items-center justify-center text-white overflow-hidden bg-[#0F172A]">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero1.webp"
          alt="Modern hostel interior"
          fill
          priority
          className="object-cover opacity-50 scale-105"
        />
        {/* Multi-layer Overlay for LUXURY Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/90 via-[#0F172A]/40 to-[#0F172A]/95" />
      </div>

      {/* COMPACT Content */}
      <div className="relative z-10 container mx-auto px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-32 text-center">
        <div className="max-w-6xl mx-auto w-full px-2">
          <h1 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:whitespace-nowrap font-extrabold leading-tight tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-6 duration-700 drop-shadow-2xl">
            {title || "Find Your Perfect Stay"}
          </h1>

          <p className="font-sans text-base md:text-xl text-gray-300/90 max-w-xl mx-auto font-medium leading-normal animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            {subtitle ||
              "Affordable. Comfortable. Verified. Book hostels across India in seconds."}
          </p>
        </div>
      </div>
    </section>
  );
}