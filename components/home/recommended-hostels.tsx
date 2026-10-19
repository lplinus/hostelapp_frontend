"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import HostelCard from "@/components/hostels/hostel-card";
import { HostelListItem } from "@/types/hostel.types";
import { cn } from "@/lib/utils";

interface RecommendedHostelsProps {
    hostels: HostelListItem[];
    cities: any[];
}

export default function RecommendedHostels({ hostels, cities }: RecommendedHostelsProps) {
    // 1. Identify cities that have at least one featured hostel
    const dynamicCities = useMemo(() => {
        return cities.filter(city =>
            hostels.some(h =>
                (h.city.id === city.id || h.city.name.toLowerCase() === city.name.toLowerCase())
            )
        );
    }, [hostels, cities]);

    const [activeCityId, setActiveCityId] = useState<number | string>(
        dynamicCities[0]?.id || ""
    );

    const activeCity = useMemo(() => {
        return dynamicCities.find(c => c.id === activeCityId);
    }, [dynamicCities, activeCityId]);

    const activeCityName = activeCity?.name || "";
    const activeCitySlug = activeCity?.slug || "";

    // 2. Filter hostels for the active city
    const featuredInCity = useMemo(() => {
        const name = activeCityName.toLowerCase();
        return hostels.filter(h =>
            (h.city.id === activeCityId || h.city.name.toLowerCase() === name)
        );
    }, [hostels, activeCityId, activeCityName]);

    if (dynamicCities.length === 0) return null;

    return (
        <section className="py-4 sm:py-6 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <Carousel opts={{ align: "start", loop: false, dragFree: true, containScroll: "trimSnaps", duration: 28 }} className="w-full">
                    {/* Header */}
                    <div className="mb-4 sm:mb-5">
                        <h2 className="text-2xl sm:text-3xl font-medium text-black tracking-tight mb-3">
                            Featured Hostels for you
                        </h2>

                        {/* Tabs + Link Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 border-b border-slate-100">
                            <div className="flex items-center overflow-x-auto gap-6 sm:gap-10 whitespace-nowrap w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth touch-pan-x select-none">
                                {dynamicCities.map((city) => (
                                    <button
                                        key={city.id}
                                        onClick={() => setActiveCityId(city.id)}
                                        className={cn(
                                            "relative inline-flex items-center h-11 text-base font-medium transition-all",
                                            activeCityId === city.id
                                                ? "text-black"
                                                : "text-gray-600 hover:text-black"
                                        )}
                                    >
                                        {city.name}
                                        {activeCityId === city.id && (
                                            <div className="absolute -bottom-[1px] left-0 w-full h-[2.5px] bg-black rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto h-11 shrink-0 mt-2 sm:mt-0">
                                <Link
                                    href={activeCitySlug ? `/hostels-in-${activeCitySlug}/` : "/hostels"}
                                    className="inline-flex items-center gap-1.5 text-[14px] font-medium text-black hover:text-[#10B981] transition-all group shrink-0"
                                >
                                    See more
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <CarouselPrevious className="static translate-y-0 size-8 rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-none hover:bg-neutral-100 hover:border-neutral-300 hover:text-black active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all touch-manipulation select-none" />
                                    <CarouselNext className="static translate-y-0 size-8 rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-none hover:bg-neutral-100 hover:border-neutral-300 hover:text-black active:scale-90 disabled:opacity-25 disabled:pointer-events-none transition-all touch-manipulation select-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Content Sections */}
                <div className="space-y-6">
                    {/* Featured Section */}
                    {featuredInCity.length > 0 && (
                        <div className="relative">
                            {/* <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-[#1E1B4B]">Featured in {activeCityName}</h3>
                            </div> */}

                                <CarouselContent className="-ml-2.5 sm:-ml-3">
                                    {featuredInCity.map((hostel) => (
                                        <CarouselItem key={hostel.id} className="pl-2.5 sm:pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
                                            <div className="h-full py-2">
                                                <HostelCard
                                                    {...{
                                                        id: String(hostel.id),
                                                        slug: hostel.slug,
                                                        name: hostel.name,
                                                        location: `${hostel.area?.name || ""}, ${hostel.city.name}`,
                                                        price: hostel.final_price ?? (Number(hostel.price) || 0),
                                                        pricePerDay: hostel.final_price_per_day ?? (hostel.price_per_day ? Number(hostel.price_per_day) : undefined),
                                                        originalPrice: hostel.is_discounted ? Number(hostel.price) || 0 : undefined,
                                                        isDiscounted: !!hostel.is_discounted,
                                                        discountPercentage: hostel.discount_percentage ? Number(hostel.discount_percentage) : undefined,
                                                        rating: hostel.rating_avg,
                                                        reviewsCount: hostel.rating_count,
                                                        image: getPrimaryImage(hostel),
                                                        gender: hostel.hostel_type || "coed",
                                                        features: hostel.amenities.slice(0, 2).map((a) => a.name),
                                                        isFeatured: true,
                                                        isVerified: !!hostel.is_verified,
                                                        layout: "grid"
                                                    }}
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>

                        </div>
                    )}

                </div>
                </Carousel>
            </div>
        </section>
    );
}

import { toLocalMediaPath } from "@/lib/utils";

function getPrimaryImage(hostel: HostelListItem): string | null {
    const primaryImg = hostel.images.find((img) => img.is_primary);
    const firstImg = hostel.images[0];
    const imgObj = primaryImg || firstImg;

    if (imgObj) {
        for (let i = 1; i <= 10; i++) {
            const field = i === 1 ? "image" : `image${i}` as keyof typeof imgObj;
            const src = imgObj[field];
            if (typeof src === "string" && src) return toLocalMediaPath(src);
        }
    }

    if (hostel.default_images) {
        const d = hostel.default_images;
        for (let i = 1; i <= 10; i++) {
            const field = `image${i}` as keyof typeof d;
            const src = d[field];
            if (typeof src === "string" && src) return toLocalMediaPath(src);
        }
    }

    return null;
}
