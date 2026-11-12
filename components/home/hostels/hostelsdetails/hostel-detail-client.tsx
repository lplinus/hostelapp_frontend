"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getHostelBySlug } from "@/services/hostelservices/hostel.service";
import { useHostelImages } from "@/hooks/useHostelImages";

import type { HostelDetail } from "@/types/hostel.types";

import Breadcrumb from "./detail/Breadcrumb";
import HostelGallery from "./detail/HostelGallery";
import RatingsSummary from "./detail/RatingsSummary";
import HostelTags from "./detail/HostelTags";
import HostelDescription from "./detail/HostelDescription";
import HostelAmenities from "./detail/HostelAmenities";
import HostelRooms from "./detail/HostelRooms";
import HostelLocation from "./detail/HostelLocation";
import HostelReviews from "./detail/HostelReviews";
import BookingSidebar from "./detail/BookingSidebar";
import MobileBookingBar from "./detail/MobileBookingBar";
import { FullPageAvailabilityLoader } from "@/components/ui/FullPageAvailabilityLoader";

interface Props {
    hostel: HostelDetail;
}

export default function HostelDetailClient({ hostel }: Props) {
    const [priceMode, setPriceMode] = useState<"monthly" | "daily">("monthly");
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
    const previousReviewCount = useRef(hostel.rating_count);
    const router = useRouter();

    // Polling for review approval
    const { data: hostelData } = useQuery({
        queryKey: ["hostel", hostel.slug],
        queryFn: () => getHostelBySlug(hostel.slug, true),
        initialData: hostel,
        enabled: isWaitingForApproval,
        refetchInterval: isWaitingForApproval ? 5000 : false,
    });

    useEffect(() => {
        if (isWaitingForApproval && hostelData?.rating_count && hostelData.rating_count > previousReviewCount.current) {
            setIsWaitingForApproval(false);
            previousReviewCount.current = hostelData.rating_count;
            router.refresh();
            toast.success("Your review is now live!");
        }
    }, [hostelData?.rating_count, isWaitingForApproval, router]);

    const currentHostel = hostelData || hostel;
    const hostelImages = useHostelImages(hostel);

    const sharingOptions = useMemo(() => {
        const getNumeric = (val: string | undefined | null) => {
            if (!val) return "";
            const s = String(val).toLowerCase();
            if (s.includes('single')) return '1';
            if (s.includes('double')) return '2';
            if (s.includes('triple')) return '3';
            if (s.includes('quad') || s.includes('four')) return '4';
            if (s.includes('five')) return '5';
            if (s.includes('six')) return '6';
            const match = s.match(/\d+/);
            if (match) return match[0];
            return String(val);
        };
        const opts = Array.from(new Set(hostel.room_types?.map((r) => getNumeric(r.sharing_display)).filter(Boolean) as string[]));
        return opts.sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true }));
    }, [hostel.room_types]);

    return (
        <div className="hostel-detail-page bg-white min-h-screen pb-24 lg:pb-0">
            {/* Sticky Breadcrumb Bar */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-2.5">
                    <Breadcrumb hostelName={hostel.name} />
                </div>
            </div>

            <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-4 pb-16">
                <HostelGallery
                    images={hostelImages}
                    hostelName={hostel.name}
                    ratingAvg={currentHostel.rating_avg}
                    ratingCount={currentHostel.rating_count}
                    areaName={hostel.area?.name}
                    cityName={hostel.city?.name}
                    isTopRated={hostel.is_toprated}
                    isFeatured={hostel.is_featured}
                />

                {/* Verified Badge */}
                {hostel.is_verified && (
                    <div className="mt-6 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded bg-indigo-50 text-[#312E81] border border-indigo-200 uppercase tracking-wider">
                            ● Verified Stay
                        </span>
                    </div>
                )}

                {/* Hostel Name */}
                <h1
                    className="text-2xl sm:text-3xl lg:text-[2.2rem] font-extrabold text-black tracking-tight mt-3 mb-1 leading-tight"
                    style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}
                >
                    {hostel.name}
                </h1>

                <RatingsSummary
                    ratingAvg={currentHostel.rating_avg}
                    ratingCount={currentHostel.rating_count}
                    areaName={hostel.area?.name}
                    cityName={hostel.city?.name}
                    price={hostel.price}
                    hostelRating={currentHostel.hostel_rating_avg}
                    foodRating={currentHostel.food_rating_avg}
                    roomRating={currentHostel.room_rating_avg}
                />

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 min-w-0">
                    <div className="min-w-0">
                        <HostelTags
                            isVerified={hostel.is_verified}
                            isFeatured={hostel.is_featured}
                            sharingOptions={sharingOptions}
                        />

                        <HostelDescription description={hostel.description} />

                        <HostelRooms
                            rooms={hostel.room_types}
                            hostelSlug={hostel.slug}
                            priceMode={priceMode}
                            extraCharges={hostel.extra_charges}
                            suitableFor={hostel.suitable_for}
                            selectedRoom={selectedRoom}
                            onSelectRoom={setSelectedRoom}
                        />

                        <HostelAmenities amenities={hostel.amenities} />

                        <HostelReviews
                            hostelId={hostel.id}
                            reviews={currentHostel.reviews}
                            ratingAvg={currentHostel.rating_avg}
                            ratingCount={currentHostel.rating_count}
                            onReviewSubmitted={() => setIsWaitingForApproval(true)}
                        />

                        <HostelLocation
                            name={hostel.name}
                            address={hostel.address}
                            cityName={hostel.city?.name}
                            latitude={hostel.latitude}
                            longitude={hostel.longitude}
                            landmarks={hostel.landmarks}
                        />
                    </div>

                    <BookingSidebar
                        hostel={{
                            ...hostel,
                            rating_avg: currentHostel.rating_avg,
                            rating_count: currentHostel.rating_count
                        }}
                        roomTypes={hostel.room_types}
                        priceMode={priceMode}
                        setPriceMode={setPriceMode}
                        selectedRoom={selectedRoom}
                        setSelectedRoom={setSelectedRoom}
                        isCheckingAvailability={isCheckingAvailability}
                        setIsCheckingAvailability={setIsCheckingAvailability}
                    />
                </div>
            </div>

            <MobileBookingBar
                hostel={{
                    ...hostel,
                    rating_avg: currentHostel.rating_avg,
                    rating_count: currentHostel.rating_count
                }}
                roomTypes={hostel.room_types}
                priceMode={priceMode}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                isCheckingAvailability={isCheckingAvailability}
                setIsCheckingAvailability={setIsCheckingAvailability}
            />

            {/* Whole-page availability checking loader */}
            <FullPageAvailabilityLoader
                isChecking={isCheckingAvailability}
                onClose={() => setIsCheckingAvailability(false)}
                title="Checking Hostel Availability"
                subtitle={`Verifying bed & room inventory at ${hostel.name}...`}
            />
        </div>
    );
}
