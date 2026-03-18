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
        <section className="py-8 sm:py-10 lg:py-12 bg-white">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8">
                    Browse by Hostel Type
                </h2>

                <div className="relative group/carousel overflow-visible">
                    {/* Vanishing Edge Gradients */}
                    <div className="absolute -left-1 top-0 bottom-0 w-3 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    <div className="absolute -right-1 top-0 bottom-0 w-3 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                    <Carousel
                        opts={{
                            align: "start",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-3">
                            {hostelTypes.map((type) => (
                                <CarouselItem
                                    key={type.id}
                                    className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                                >
                                    <Link
                                        href={`/hostel-type/${type.hostel_type}`}
                                        className="group block"
                                    >
                                        <div className="relative h-36 rounded-2xl overflow-hidden shadow-lg mb-3 border border-black">
                                            {type.image ? (
                                                <Image
                                                    src={toLocalMediaPath(type.image) || ""}
                                                    alt={type.alt_text || type.name}
                                                    fill
                                                    className="object-cover transition duration-500"
                                                    sizes="(max-width: 768px) 50vw, 20vw"
                                                    unoptimized={isExternalImage(type.image)}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-blue-500 opacity-90 transition duration-500" />
                                            )}
                                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                                        </div>

                                        <p className="text-center font-bold text-slate-800 text-base group-hover:text-orange-600 transition-colors">
                                            {type.name}
                                        </p>
                                    </Link>

                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        <CarouselPrevious
                            className="-left-6 size-11 rounded-full border-2 border-slate-100 bg-white text-black shadow-2xl hover:scale-110 transition-all duration-200 disabled:opacity-0 top-[72px] z-30 [&_svg]:size-6"
                        />
                        <CarouselNext
                            className="-right-6 size-11 rounded-full border-2 border-slate-100 bg-white text-black shadow-2xl hover:scale-110 transition-all duration-200 disabled:opacity-0 top-[72px] z-30 [&_svg]:size-6"
                        />
                    </Carousel>
                </div>

            </div>
        </section>
    );
}
