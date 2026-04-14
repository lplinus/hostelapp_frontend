import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

interface HostelType {
    id: number;
    hostel_type: string;
    name: string;
    image: string | null;
    alt_text: string;
    hostels_count?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function getHostelTypes(): Promise<HostelType[]> {
    try {
        const res = await fetch(`${BASE_URL}/api/hostels/types/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) {
            console.error("Failed to fetch hostel types");
            return [];
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching hostel types:", error);
        return [];
    }
}

import { toLocalMediaPath, isExternalImage } from "@/lib/utils";

export default async function FeaturedHostelTypes() {
    const hostelTypes = await getHostelTypes();

    if (!hostelTypes?.length) return null;
    return (
        <section className="pt-16 pb-16 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                {/* Section Header */}
                <div className="mb-12 sm:mb-8">
                    <div className="flex items-center gap-3 text-[#10B981] mb-3">
                        <span className="text-[11px] tracking-[0.25em] font-semibold uppercase font-sans">Categories</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E1B4B] tracking-tight font-sans">
                        <span className="text-slate-500 font-medium">Hostel Type</span>
                    </h2>
                </div>

                {/* Carousel with arrows positioned like Popular Cities */}
                <div className="relative group/carousel">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        {/* Navigation Buttons - Absolutely positioned top-right, matching Popular Cities */}
                        <div className="absolute -top-14 sm:-top-16 right-0 flex gap-2 sm:gap-3 z-20">
                            <CarouselPrevious
                                className="static translate-y-0 size-8 md:size-9 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                            />
                            <CarouselNext
                                className="static translate-y-0 size-8 md:size-9 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                            />
                        </div>

                        <CarouselContent className="-ml-4 sm:-ml-6">
                            {hostelTypes.map((type) => (
                                <CarouselItem
                                    key={type.id}
                                    className="pl-4 sm:pl-6 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
                                >
                                    <Link
                                        href={`/hostel-type/${type.hostel_type}`}
                                        className="group block"
                                    >
                                        <div className="relative aspect-square rounded-[1.25rem] overflow-hidden shadow-sm border border-slate-100 mb-3">
                                            {type.image ? (
                                                <Image
                                                    src={toLocalMediaPath(type.image) || ""}
                                                    alt={type.alt_text || type.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                    sizes="(max-width: 768px) 50vw, 20vw"
                                                    unoptimized={isExternalImage(type.image)}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
                                                    <LayoutGrid className="text-slate-200" size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="px-1">
                                            <h3 className="font-bold text-[15px] sm:text-[16px] text-gray-900 leading-tight group-hover:text-[#312E81] transition-colors line-clamp-1">
                                                {type.name}
                                            </h3>
                                            <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1 font-medium">
                                                {type.hostels_count ? `${type.hostels_count.toLocaleString()} accommodations` : "View properties"}
                                            </p>
                                        </div>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                </div>
            </div>
        </section>
    );
}
