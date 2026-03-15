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
        hostel = await getHostelBySlug(slug);
    } catch (error: any) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">Error fetching hostel</h1>
                <p className="text-red-500">{error.message}</p>
                <p className="text-gray-500">Slug: {slug}</p>
            </div>
        );
    }

    if (!hostel) {
        return (
            <div className="p-10">
                <h1 className="text-2xl font-bold">Hostel not found</h1>
                <p className="text-gray-500">Slug: {slug}</p>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <BookingContainer hostel={hostel} />
        </div>
    );
}
