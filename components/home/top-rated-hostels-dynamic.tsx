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
import { cn, toLocalMediaPath } from "@/lib/utils";

interface TopRatedHostelsDynamicProps {
    hostels: HostelListItem[];
    cities: any[];
}

export default function TopRatedHostelsDynamic({ hostels, cities }: TopRatedHostelsDynamicProps) {
    // 1. Identify cities that have at least one toprated hostel
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
    const topRatedInCity = useMemo(() => {
        const name = activeCityName.toLowerCase();
        return hostels.filter(h =>
            (h.city.id === activeCityId || h.city.name.toLowerCase() === name)
        );
    }, [hostels, activeCityId, activeCityName]);

    if (dynamicCities.length === 0) return null;

    return (
        <section className="py-12 sm:py-16 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                {/* Header */}
                <div className="mb-10">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#1E1B4B] tracking-tight mb-8">
                        Top Rated Hostels in India
                    </h2>

                    {/* Tabs + Link Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-100">
                        <div className="flex flex-wrap gap-6 sm:gap-10">
                            {dynamicCities.map((city) => (
                                <button
                                    key={city.id}
                                    onClick={() => setActiveCityId(city.id)}
                                    className={cn(
                                        "pb-4 text-base font-semibold transition-all relative",
                                        activeCityId === city.id
                                            ? "text-[#312E81]"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {city.name}
                                    {activeCityId === city.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#312E81] rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <Link
                            href={activeCitySlug ? `/hostels-in-${activeCitySlug}/` : "/hostels"}
                            className="flex items-center gap-2 text-[15px] font-bold text-[#312E81] hover:text-[#10B981] transition-all group shrink-0"
                        >
                            See more ({activeCityName}) properties
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="relative">
                    <Carousel opts={{ align: "start", loop: false }} className="w-full">
                        <CarouselContent className="-ml-6">
                            {topRatedInCity.map((hostel) => (
                                <CarouselItem key={hostel.id} className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
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
                                                isTopRated: true,
                                                isVerified: !!hostel.is_verified,
                                                layout: "grid"
                                            }}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="hidden sm:flex justify-end gap-2 mt-6">
                            <CarouselPrevious className="static translate-y-0 size-10 rounded-full border-slate-200" />
                            <CarouselNext className="static translate-y-0 size-10 rounded-full border-slate-200" />
                        </div>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

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
