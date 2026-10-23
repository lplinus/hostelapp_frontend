import HotelManagement from "@/components/home/Hotels/hotelsmaping/hotelmaping";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hotel Management | Hostel In Dashboard",
    description: "Manage your hotels, luxury suites, and daily reservations.",
};

export default function HotelPage() {
    return <HotelManagement />;
}

