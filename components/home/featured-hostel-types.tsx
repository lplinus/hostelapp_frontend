import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import Image from "next/image";
import { HostelType } from "@/types/hostel.types";

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
        <section className="pt-0 pb-16 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-8">
                    <div>
                        <div className="flex items-center gap-3 text-[#10B981] mb-3">
                            <span className="text-[11px] tracking-[0.25em] font-semibold uppercase font-sans">Categories</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-semibold text-[#1E1B4B] tracking-tight font-sans">
                            Browse by <span className="text-slate-500 font-medium">Hostel Type</span>
                        </h2>
                    </div>
                </div>

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
                                className="static translate-y-0 size-11 md:size-12 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                            />
                            <CarouselNext
                                className="static translate-y-0 size-11 md:size-12 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                            />
                        </div>

                        <CarouselContent className="-ml-4 sm:-ml-6">
                            {hostelTypes.map((type) => (
                                <CarouselItem
                                    key={type.id}
                                    className="pl-4 sm:pl-6 basis-[70%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                                >
                                    <Link
                                        href={`/hostel-type/${type.hostel_type}`}
                                        className="group block"
                                    >
                                        <div className="relative h-44 rounded-3xl overflow-hidden shadow-md border border-slate-100/50 group-hover:shadow-2xl group-hover:shadow-[#10B981]/30 transition-all duration-500 group-hover:-translate-y-2">
                                            {type.image ? (
                                                <Image
                                                    src={toLocalMediaPath(type.image) || ""}
                                                    alt={type.alt_text || type.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 70vw, 20vw"
                                                    unoptimized={isExternalImage(type.image)}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-[#10B981] opacity-90 transition duration-500" />
                                            )}
                                        </div>
                                        <div className="mt-3 w-full">
                                            <p className="font-sans text-slate-800 font-medium text-base tracking-tight group-hover:text-[#10B981] transition-all duration-300 text-center">
                                                {type.name}
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
