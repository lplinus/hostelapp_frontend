import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostelBySlug } from "@/services/hostel.service";
import BookingContainer from "@/components/user/booking/booking-container";

interface Props {
    readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const hostel = await getHostelBySlug(slug);
        return {
            title: `Book ${hostel.name} | StayNest`,
            description: `Book your stay at ${hostel.name} in ${hostel.city.name}. Secure your bed today.`,
        };
    } catch {
        return {
            title: "Booking | StayNest",
        };
    }
}

export default async function BookingPage({ params }: Props) {
    const { slug } = await params;

    let hostel;
    try {
        console.log("Fetching hostel for slug:", slug);
        hostel = await getHostelBySlug(slug);
        console.log("Hostel found:", hostel.name);
    } catch (error) {
        console.error("Error fetching hostel:", error);
        notFound();
    }

    if (!hostel) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            <BookingContainer hostel={hostel} />
        </div>
    );
}
