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

interface HostelTypesProps {
    hostels: HostelListItem[];
}

export default function HostelTypes({ hostels }: HostelTypesProps) {
    // 1. Identify hostel types that have at least one hostel
    const dynamicTypes = useMemo(() => {
        const typesMap = new Map<string, { id: string; name: string }>();

        hostels?.forEach((h) => {
            if (h.hostel_type) {
                const typeStr = h.hostel_type.toLowerCase();
                if (!typesMap.has(typeStr)) {
                    // Format type nicely for display
                    let name = typeStr;
                    if (typeStr === "boys") name = "Boys";
                    else if (typeStr === "girls") name = "Girls";
                    else if (typeStr === "coed" || typeStr === "co-ed")
                        name = "Co-ed";
                    else
                        name =
                            typeStr
                                .split("_")
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(" ");

                    typesMap.set(typeStr, {
                        id: typeStr,
                        name: name,
                    });
                }
            }
        });

        // Optional: define an order if preferred (e.g. boys -> girls -> coed)
        const order = { "boys": 1, "girls": 2, "coed": 3 };
        return Array.from(typesMap.values()).sort(
            (a, b) => (order[a.id as keyof typeof order] || 99) - (order[b.id as keyof typeof order] || 99)
        );
    }, [hostels]);

    const [activeTypeId, setActiveTypeId] = useState<string>(
        dynamicTypes[0]?.id || ""
    );

    // Update active tab if dynamicTypes change and activeTypeId is no longer valid
    React.useEffect(() => {
        if (dynamicTypes.length > 0 && !dynamicTypes.find((t) => t.id === activeTypeId)) {
            setActiveTypeId(dynamicTypes[0].id);
        }
    }, [dynamicTypes, activeTypeId]);

    // 2. Filter hostels for the active type
    const hostelsInType = useMemo(() => {
        return hostels?.filter(
            (h) => h.hostel_type && h.hostel_type.toLowerCase() === activeTypeId
        ) || [];
    }, [hostels, activeTypeId]);

    if (!dynamicTypes || dynamicTypes.length === 0 || !hostels || hostels.length === 0) return null;

    return (
        <section className="pt-6 pb-12 sm:pt-8 sm:pb-16 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                    {/* Header */}
                    <div className="mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#1E1B4B] tracking-tight mb-8">
                            Hostel Type
                        </h2>

                        {/* Tabs + Link Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6 pb-2 border-b border-slate-100">
                            <div className="flex overflow-x-auto gap-6 sm:gap-10 whitespace-nowrap w-full sm:w-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {dynamicTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setActiveTypeId(type.id)}
                                        className={cn(
                                            "pb-4 text-base font-semibold transition-all relative",
                                            activeTypeId === type.id
                                                ? "text-[#312E81]"
                                                : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        {type.name}
                                        {activeTypeId === type.id && (
                                            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#312E81] rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                                <Link
                                    href={`/hostel-type/${activeTypeId}`}
                                    className="flex items-center gap-2 text-[14px] sm:text-[15px] font-bold text-[#312E81] hover:text-[#10B981] transition-all group shrink-0"
                                >
                                    See more
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <div className="flex items-center gap-2">
                                    <CarouselPrevious className="static translate-y-0 size-8 sm:size-10 rounded-full border-slate-200 hover:bg-[#312E81] hover:text-white transition-all" />
                                    <CarouselNext className="static translate-y-0 size-8 sm:size-10 rounded-full border-slate-200 hover:bg-[#312E81] hover:text-white transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="relative">
                        <CarouselContent className="-ml-6">
                            {hostelsInType.map((hostel) => (
                                <CarouselItem
                                    key={hostel.id}
                                    className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                                >
                                    <div className="h-full py-2">
                                        <HostelCard
                                            {...{
                                                id: String(hostel.id),
                                                slug: hostel.slug,
                                                name: hostel.name,
                                                location: `${hostel.area?.name || ""}, ${hostel.city?.name || ""}`,
                                                price: hostel.final_price ?? (Number(hostel.price) || 0),
                                                pricePerDay:
                                                    hostel.final_price_per_day ??
                                                    (hostel.price_per_day ? Number(hostel.price_per_day) : undefined),
                                                originalPrice: hostel.is_discounted ? Number(hostel.price) || 0 : undefined,
                                                isDiscounted: !!hostel.is_discounted,
                                                discountPercentage: hostel.discount_percentage
                                                    ? Number(hostel.discount_percentage)
                                                    : undefined,
                                                rating: hostel.rating_avg || 0,
                                                reviewsCount: hostel.rating_count || 0,
                                                image: getPrimaryImage(hostel),
                                                gender: hostel.hostel_type || "coed",
                                                features: hostel.amenities?.slice(0, 2).map((a) => a.name) || [],
                                                isTopRated: !!hostel.is_toprated,
                                                isFeatured: !!hostel.is_featured,
                                                isVerified: !!hostel.is_verified,
                                                layout: "grid",
                                            }}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </div>
                </Carousel>
            </div>
        </section>
    );
}

function getPrimaryImage(hostel: HostelListItem): string | null {
    const primaryImg = hostel.images?.find((img) => img.is_primary);
    const firstImg = hostel.images?.[0];
    const imgObj = primaryImg || firstImg;

    if (imgObj) {
        for (let i = 1; i <= 10; i++) {
            const field = i === 1 ? "image" : (`image${i}` as keyof typeof imgObj);
            const src = imgObj[field as keyof typeof imgObj];
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
