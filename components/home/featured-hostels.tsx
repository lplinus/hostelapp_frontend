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
        return null;
    }

    return (
        <section className="py-24 bg-white font-inter">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-[#10B981] mb-4">
                            <span className="text-[11px] tracking-[0.25em] font-bold uppercase">Featured Selection</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-[#1E1B4B] tracking-tight mb-2">
                            Curated <span className="italic text-[#64748B] font-medium">Hostels</span>
                        </h2>
                        <p className="text-lg text-[#64748B] font-medium">
                            Hand-picked stays loved by our community
                        </p>
                    </div>

                    <Link
                        href="/hostels"
                        className="group flex items-center gap-3 text-[15px] font-bold text-[#1E1B4B] hover:text-[#10B981] transition-all bg-[#F8FAFC] px-6 py-3 rounded-full border border-slate-100"
                    >
                        View All Listings
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-6">
                        {featuredHostels.map((hostel) => (
                            <CarouselItem
                                key={hostel.id}
                                className="pl-6 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                            >
                                <div className="h-full py-4">
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

                    {/* Navigation */}
                    <div className="flex justify-end gap-3 mt-10">
                        <CarouselPrevious
                            className="static translate-y-0 size-12 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                        />
                        <CarouselNext
                            className="static translate-y-0 size-12 rounded-full border border-slate-200 bg-white text-[#1E1B4B] shadow-sm hover:bg-[#312E81] hover:text-white transition-all disabled:opacity-30"
                        />
                    </div>
                </Carousel>
            </div>
        </section>
    );
}

