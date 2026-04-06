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
import { toLocalMediaPath, isExternalImage } from "@/lib/utils";

interface City {
    id: number;
    name: string;
    slug: string;
    city_image: string | null;
    latitude: string | null;
    longitude: string | null;
}


interface FeaturedCitiesCarouselProps {
    cities: City[];
}

export default function FeaturedCitiesCarousel({
    cities,
}: FeaturedCitiesCarouselProps) {
    return (
        <div className="relative group/carousel">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                {/* Navigation Buttons Moved to Top Right (relative to Carousel) */}
                <div className="absolute -top-14 sm:-top-16 right-0 flex gap-2 sm:gap-3 z-20">
                    <CarouselPrevious
                        className="static translate-y-0 size-11 md:size-12 rounded-full border border-slate-200 bg-white text-[#312E81] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                    />
                    <CarouselNext
                        className="static translate-y-0 size-11 md:size-12 rounded-full border border-slate-200 bg-white text-[#312E81] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                    />
                </div>

                <CarouselContent className="-ml-4 sm:-ml-6">
                    {cities.map((city) => (
                        <CarouselItem
                            key={city.id}
                            className="pl-4 sm:pl-6 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                        >
                            <Link
                                href={`/city/${city.slug}`}
                                className="group block"
                            >
                                <div className="relative h-44 rounded-3xl overflow-hidden shadow-md border border-slate-100/50 group-hover:shadow-2xl group-hover:shadow-[#10B981]/30 transition-all duration-500 group-hover:-translate-y-2">
                                    {city.city_image && (
                                        <Image
                                            src={toLocalMediaPath(city.city_image) || ""}
                                            alt={city.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 70vw, 20vw"
                                            unoptimized={isExternalImage(city.city_image)}
                                        />
                                    )}
                                </div>
                                <div className="mt-3 w-full">
                                    <p className="font-sans text-slate-800 font-medium text-base tracking-tight group-hover:text-[#10B981] transition-all duration-300 text-center">
                                        {city.name}
                                    </p>
                                </div>
                            </Link>

                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>

    );
}
