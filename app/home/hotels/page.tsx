import HotelsLayout from "@/components/home/Hotels/hotels-layout";
import { getHotels } from "@/services/hotelservices/hotel.service";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Hotels & Luxury Suites | Verified Stays across India",
    description: "Browse and reserve handpicked 5-star hotels, luxury suites, and business resorts with daily tariffs and verified amenities.",
    openGraph: {
        title: "Hotels & Luxury Suites | Verified Stays across India",
        description: "Browse and reserve handpicked 5-star hotels, luxury suites, and business resorts with daily tariffs and verified amenities.",
        type: "website",
    },
};

export default async function HotelsPage() {
    let hotels: any[] = [];
    try {
        hotels = await getHotels();
    } catch (err) {
        console.error("Failed to fetch hotels for listing:", err);
    }

    return <HotelsLayout hotels={hotels} />;
}
