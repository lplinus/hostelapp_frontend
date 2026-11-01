import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHotelBySlug } from "@/services/hotelservices/hotel.service";
import HotelDetailClient from "@/components/home/Hotels/hoteldetails/hotel-detail-client";

export const dynamic = "force-dynamic";

interface Props {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const hotel = await getHotelBySlug(slug);
        const title = `${hotel.name} - ${hotel.star_rating || 5}-Star Hotel in ${hotel.city_name || "India"}`;
        const description =
            hotel.short_description ||
            hotel.tagline ||
            (hotel.description ? `${hotel.description.slice(0, 155)}...` : `Reserve your stay at ${hotel.name}.`);

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: hotel.images?.[0]?.image ? [hotel.images[0].image] : [],
                type: "website",
            },
        };
    } catch {
        return {
            title: "Hotel Not Found | Hostel In",
            description: "The hotel you are looking for could not be found.",
            robots: "noindex,nofollow",
        };
    }
}

export default async function HotelDetailPage({ params }: Props) {
    const { slug } = await params;

    let hotel;
    try {
        hotel = await getHotelBySlug(slug);
    } catch (err) {
        notFound();
    }

    if (!hotel) {
        notFound();
    }

    return <HotelDetailClient hotel={hotel} />;
}
