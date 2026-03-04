"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";

interface City {
    id: number;
    name: string;
    slug: string;
    city_image: string | null;
    latitude: string | null;
    longitude: string | null;
}

/** Strip backend host so images go through Next.js /media/* rewrite */
function toLocalMediaPath(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.pathname; // "/media/cities/dg.webp"
    } catch {
        return url; // already a relative path
    }
}

interface FeaturedCitiesCarouselProps {
    cities: City[];
}

export default function FeaturedCitiesCarousel({
    cities,
}: FeaturedCitiesCarouselProps) {
    return (
        <Carousel
            opts={{
                align: "start",
                loop: false,
            }}
            className="w-full">


            {/* Carousel Slider */}
            <CarouselContent className="-ml-3">
                {cities.map((city) => (
                    <CarouselItem
                        key={city.id}
                        className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                    >
                        <Link
                            href={`/city/${city.slug}`}
                            className="relative h-36 rounded-2xl overflow-hidden shadow-lg group block"
                        >
                            {city.city_image && (
                                <Image
                                    src={toLocalMediaPath(city.city_image)}
                                    alt={city.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition duration-500"
                                    sizes="(max-width: 768px) 50vw, 20vw"
                                />
                            )}

                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-lg font-semibold">
                                {city.name}
                            </div>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>

            {/* Side arrows — transparent */}
            <CarouselPrevious
                className="-left-4 size-9 rounded-full border-0 bg-white/70 backdrop-blur-sm text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0"
            />
            <CarouselNext
                className="-right-4 size-9 rounded-full border-0 bg-white/70 backdrop-blur-sm text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0"
            />
        </Carousel>
    );
}
