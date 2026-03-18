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
        <div className="relative group/carousel overflow-visible">
            {/* Vanishing Edge Gradients */}
            <div className="absolute -left-1 top-0 bottom-0 w-3 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
            <div className="absolute -right-1 top-0 bottom-0 w-3 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                {/* Carousel Slider */}
                <CarouselContent className="-ml-3">
                    {cities.map((city) => (
                        <CarouselItem
                            key={city.id}
                            className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                        >
                            <Link
                                href={`/city/${city.slug}`}
                                className="group block"
                            >
                                <div className="relative h-36 rounded-2xl overflow-hidden shadow-lg mb-3 border border-black">
                                    {city.city_image && (
                                        <Image
                                            src={toLocalMediaPath(city.city_image) || ""}
                                            alt={city.name}
                                            fill
                                            className="object-cover transition duration-500"
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                            unoptimized={isExternalImage(city.city_image)}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                                </div>

                                <p className="text-center font-bold text-slate-800 text-base group-hover:text-orange-600 transition-colors">
                                    {city.name}
                                </p>
                            </Link>

                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Side arrows — transparent */}
                <CarouselPrevious
                    className="-left-6 size-11 rounded-full border-2 border-slate-100 bg-white text-black shadow-2xl hover:scale-110 transition-all duration-200 disabled:opacity-0 top-[72px] z-30 [&_svg]:size-6"
                />
                <CarouselNext
                    className="-right-6 size-11 rounded-full border-2 border-slate-100 bg-white text-black shadow-2xl hover:scale-110 transition-all duration-200 disabled:opacity-0 top-[72px] z-30 [&_svg]:size-6"
                />
            </Carousel>
        </div>

    );
}
