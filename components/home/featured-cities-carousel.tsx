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
                }}
                className="w-full"
            >
                {/* Navigation Buttons */}
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
                            className="pl-4 sm:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                        >
                            <Link
                                href={`/city/${city.slug}`}
                                className="group block"
                            >
                                <div className="relative aspect-square rounded-[1.25rem] overflow-hidden shadow-sm border border-slate-100 mb-3">
                                    {city.city_image ? (
                                        <Image
                                            src={toLocalMediaPath(city.city_image) || ""}
                                            alt={city.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                            unoptimized={isExternalImage(city.city_image)}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                            <MapPin className="text-slate-200" size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="px-1">
                                    <p className="font-bold text-[15px] sm:text-[16px] text-gray-900 leading-tight group-hover:text-[#312E81] transition-colors">
                                        {city.name}
                                    </p>
                                    <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 font-medium">
                                        {city.hostel_count ? `${city.hostel_count.toLocaleString()} accommodations` : "Explore more"}
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
