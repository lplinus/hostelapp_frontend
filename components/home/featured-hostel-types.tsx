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

/** Strip backend host so images go through Next.js /media/* rewrite */
function toLocalMediaPath(url: string | null): string {
    if (!url) return "";
    try {
        const parsed = new URL(url);
        return parsed.pathname;
    } catch {
        return url;
    }
}

export default async function FeaturedHostelTypes() {
    const hostelTypes = await getHostelTypes();

    if (!hostelTypes?.length) return null;
    return (
        <section className="py-8 sm:py-10 lg:py-12 bg-white">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8">
                    Browse by Hostel Type
                </h2>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full">
                    <CarouselContent className="-ml-3">
                        {hostelTypes.map((type) => (
                            <CarouselItem
                                key={type.id}
                                className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                            >
                                <Link
                                    href={`/hostel-type/${type.hostel_type}`}
                                    className="relative h-36 rounded-2xl overflow-hidden shadow-lg group block"
                                >
                                    {type.image ? (
                                        <Image
                                            src={toLocalMediaPath(type.image)}
                                            alt={type.alt_text || type.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition duration-500"
                                            sizes="(max-width: 768px) 50vw, 20vw"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-blue-500 opacity-90 group-hover:scale-110 transition duration-500" />
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white p-4 text-center">
                                        <span className="text-lg font-semibold">{type.name}</span>
                                    </div>
                                </Link>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious
                        className="-left-4 size-9 rounded-full border-0 bg-white/70 backdrop-blur-sm text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0"
                    />
                    <CarouselNext
                        className="-right-4 size-9 rounded-full border-0 bg-white/70 backdrop-blur-sm text-gray-800 shadow-md hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0"
                    />
                </Carousel>
            </div>
        </section>
    );
}
