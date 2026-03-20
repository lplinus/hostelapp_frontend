import Image from "next/image";
import SearchBar from "./search-bar";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  return (
    <section className="relative text-white overflow-hidden">

      {/* Background Image */}
      <Image
        src="/images/hero1.webp"
        alt="Modern hostel interior"
        fill
        priority
        className="object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          {title || "Find Your Perfect Hostel Stay"}
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
          {subtitle ||
            "Affordable. Comfortable. Verified. Book hostels across India in seconds."}
        </p>

        <div className="mt-10">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}