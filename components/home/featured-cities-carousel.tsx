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
import { MapPin } from "lucide-react";

interface City {
    id: number;
    name: string;
    slug: string;
    city_image: string | null;
    latitude: string | null;
    longitude: string | null;
    hostel_count?: number;
}


interface FeaturedCitiesCarouselProps {
    cities: City[];
}

export default function FeaturedCitiesCarousel({
    cities,
}: FeaturedCitiesCarouselProps) {
    if (!cities || cities.length === 0) return null;

    return (
        <div className="relative group/carousel">
            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                    dragFree: true,
                    containScroll: "trimSnaps",
                    duration: 28,
                }}
                className="w-full"
            >
                {/* Navigation Buttons */}
                <div className="absolute -top-[3.75rem] sm:-top-[3.5rem] right-0 flex gap-1.5 z-20">
                    <CarouselPrevious
                        className="static translate-y-0 size-8 rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-none hover:bg-neutral-100 hover:border-neutral-300 hover:text-black active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all touch-manipulation select-none"
                    />
                    <CarouselNext
                        className="static translate-y-0 size-8 rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-none hover:bg-neutral-100 hover:border-neutral-300 hover:text-black active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all touch-manipulation select-none"
                    />
                </div>

                <CarouselContent className="-ml-2.5 sm:-ml-3">
                    {cities.map((city) => (
                        <CarouselItem
                            key={city.id}
                            className="pl-2.5 sm:pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                        >
                            <Link
                                href={`/city/${city.slug}`}
                                className="group block select-none"
                            >
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-100/80 mb-2">
                                    {city.city_image ? (
                                        <Image
                                            src={toLocalMediaPath(city.city_image) || ""}
                                            alt={city.name}
                                            fill
                                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                                            unoptimized={isExternalImage(city.city_image)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                                            <MapPin className="text-slate-300" size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="px-0.5 min-w-0">
                                    <p className="font-medium text-[13px] sm:text-[14px] text-black leading-tight group-hover:text-[#312E81] transition-colors truncate">
                                        {city.name}
                                    </p>
                                    <p className="text-[11px] sm:text-xs text-black mt-0.5 font-medium truncate">
                                        {city.hostel_count ? `${city.hostel_count.toLocaleString()} hostels` : "Explore more"}
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
