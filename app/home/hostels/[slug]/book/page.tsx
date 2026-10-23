import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getHostelBySlug } from "@/services/hostel.service";
import BookingContainer from "@/components/user/booking/booking-container";
import RecaptchaWrapper from "@/components/providers/RecaptchaWrapper";

interface Props {
    readonly params: Promise<{ slug: string }>;
    readonly searchParams: Promise<{ roomId?: string, priceMode?: string, checkIn?: string, checkOut?: string, guests?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const hostel = await getHostelBySlug(slug);
        return {
            title: `Book ${hostel.name} | Hostel In`,
            description: `Book your stay at ${hostel.name} in ${hostel.city.name}. Secure your bed today.`,
        };
    } catch {
        return {
            title: "Booking | Hostel In",
        };
    }
}

export default async function BookingPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { roomId, priceMode, checkIn, checkOut, guests } = await searchParams;

    let hostel;
    try {
        hostel = await getHostelBySlug(slug);
    } catch {
        notFound();
    }

    if (!hostel) {
        notFound();
    }

    return (
        <div className="bg-white min-h-screen">
            <RecaptchaWrapper>
                <BookingContainer 
                    hostel={hostel} 
                    initialRoomId={roomId} 
                    initialPriceMode={priceMode}
                    initialCheckIn={checkIn}
                    initialCheckOut={checkOut}
                    initialGuests={guests}
                />
            </RecaptchaWrapper>
        </div>
    );
}
