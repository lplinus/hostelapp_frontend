import HostelCard from "@/components/hostels/hostel-card";
import { getFeaturedHostels } from "@/services/hostel.service";
import { HostelListItem } from "@/types/hostel.types";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { toLocalMediaPath } from "@/lib/utils";

function getPrimaryImage(hostel: HostelListItem): string | null {
    const primaryImg = hostel.images.find((img) => img.is_primary);
    const firstImg = hostel.images[0];
    const imgObj = primaryImg || firstImg;

    if (imgObj) {
        // Try fields image, image2, ..., image10
        for (let i = 1; i <= 10; i++) {
            const field = i === 1 ? "image" : `image${i}` as keyof typeof imgObj;
            const src = imgObj[field];
            if (typeof src === "string" && src) return toLocalMediaPath(src);
        }
    }

    // Fallback to default images from backend
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

export default async function FeaturedHostels() {
    let featuredHostels = await getFeaturedHostels();

    // Priority Sort:
    // 1. Both Verified & Discounted
    // 2. Verified
    // 3. Discounted
    // 4. Others
    featuredHostels = [...featuredHostels].sort((a, b) => {
        const getPriority = (h: any) => {
            if (h.is_verified && h.is_discounted) return 1;
            if (h.is_verified) return 2;
            if (h.is_discounted) return 3;
            return 4;
        };
        return getPriority(a) - getPriority(b);
    });

    if (featuredHostels.length === 0) {
        return null; // hide section if no featured hostels
    }

    return (
        <section className="py-8 sm:py-10 lg:py-12 bg-white">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
                {/* Section Heading — left-aligned with View All on same row */}
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                            Featured Hostels
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Hand-picked hostels loved by students
                        </p>
                    </div>
                    <Link
                        href="/hostels"
                        className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors mt-1"
                    >
                        View All <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    {/* Arrow controls */}
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <CarouselPrevious
                            className="static translate-y-0 size-8 rounded-full border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100"
                        />
                        <CarouselNext
                            className="static translate-y-0 size-8 rounded-full border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100"
                        />
                    </div>

                    {/* Carousel Slider — 4 cards per slide on xl */}
                    <CarouselContent className="-ml-4">
                        {featuredHostels.map((hostel) => (
                            <CarouselItem
                                key={hostel.id}
                                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                            >
                                <div className="h-full py-1">
                                    <HostelCard
                                        id={String(hostel.id)}
                                        slug={hostel.slug}
                                        name={hostel.name}
                                        location={`${hostel.area?.name || ""}, ${hostel.city.name}`}
                                        price={hostel.final_price ?? (Number(hostel.price) || 0)}
                                        originalPrice={hostel.is_discounted ? Number(hostel.price) || 0 : undefined}
                                        isDiscounted={!!hostel.is_discounted}
                                        discountPercentage={hostel.discount_percentage ? Number(hostel.discount_percentage) : undefined}
                                        rating={hostel.rating_avg}
                                        reviewsCount={hostel.rating_count}
                                        image={getPrimaryImage(hostel)}
                                        gender={hostel.hostel_type || "coed"}
                                        features={hostel.amenities.slice(0, 2).map((a) => a.name)}
                                        distance=""
                                        isFeatured={hostel.is_featured}
                                        isVerified={!!hostel.is_verified}
                                        isApproved={!!hostel.is_approved}
                                        layout="grid"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </section>
    );
}

