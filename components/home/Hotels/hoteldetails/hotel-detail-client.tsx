"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Star,
    Sparkles,
    CheckCircle2,
    Clock,
    BedDouble,
    Wifi,
    ShieldCheck,
    Coffee,
    ArrowLeft,
    Share2,
    Heart,
    ChevronRight,
    Users,
    Maximize2,
    Calendar,
    PhoneCall,
    Car,
    Waves,
    Loader2,
    XCircle,
    Grid
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Hotel, HotelRoomType, HotelBooking } from "@/types/hotel.types";
import { isExternalImage } from "@/lib/utils";
import { toast } from "sonner";
import { createHotelBooking, checkHotelAvailability } from "@/services/hotelservices/hotel.service";
import { HotelBookingModal } from "./HotelBookingModal";
import { HotelMobileBookingBar } from "./HotelMobileBookingBar";
import { FullPageAvailabilityLoader } from "@/components/ui/FullPageAvailabilityLoader";
import { loadRazorpayScript } from "@/lib/razorpay";
import { validateIndianMobile } from "@/lib/validation";
import { EmailOtpModal } from "@/components/home/booking/steps/EmailOtpModal";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/user.service";
import HotelRatings from "../hotelsreviews/HotelRatings";
import HotelReviews from "../hotelsreviews/HotelReviews";

interface HotelDetailClientProps {
    readonly hotel: Hotel;
}

export default function HotelDetailClient({ hotel }: HotelDetailClientProps) {
    const [selectedRoom, setSelectedRoom] = useState<HotelRoomType | null>(
        hotel.room_types && hotel.room_types.length > 0 ? hotel.room_types[0] : null
    );
    const [isSaved, setIsSaved] = useState(false);
    const [highlightBooking, setHighlightBooking] = useState(false);

    // Reservation Checkout Modal States
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [checkInDate, setCheckInDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
    const [checkOutDate, setCheckOutDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split("T")[0];
    });

    const nights = useMemo(() => {
        if (!checkInDate || !checkOutDate) return 1;
        const d1 = new Date(checkInDate);
        const d2 = new Date(checkOutDate);
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
    }, [checkInDate, checkOutDate]);

    const handleAdjustNights = (delta: number) => {
        const nextNights = Math.max(1, nights + delta);
        const d = new Date(checkInDate);
        d.setDate(d.getDate() + nextNights);
        setCheckOutDate(d.toISOString().split("T")[0]);
    };
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestMobile, setGuestMobile] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"online" | "on_arrival">("online");
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<HotelBooking | null>(null);

    const { user } = useAuth();
    const { data: profile } = useQuery({
        queryKey: ["userProfile"],
        queryFn: getUserProfile,
        enabled: !!user,
    });
    const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
    const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

    const isEmailVerified = Boolean(
        (profile?.is_email_verified && profile?.email?.toLowerCase() === guestEmail.trim().toLowerCase()) ||
        (verifiedEmail && verifiedEmail.toLowerCase() === guestEmail.trim().toLowerCase())
    );

    const handleSelectAndBookRoom = (room: HotelRoomType) => {
        if (selectedRoom?.id === room.id) {
            setSelectedRoom(null);
        } else {
            setSelectedRoom(room);
            setHighlightBooking(true);
            setTimeout(() => setHighlightBooking(false), 1500);
        }
    };

    // Images
    const images = hotel.images && hotel.images.length > 0
        ? hotel.images
        : [];
    const primaryImg = images.find((img) => img.is_primary) || images[0];

    // Star rating
    const starCount = Math.max(1, Math.min(5, hotel.star_rating || 5));

    // Price calculation
    const currentPriceNum = selectedRoom
        ? parseFloat(selectedRoom.base_price_per_night || selectedRoom.price_per_night || "0")
        : parseFloat(hotel.starting_price_per_night || "0");
    const subtotal = currentPriceNum * nights;
    const taxes = Math.round(subtotal * 0.12);
    const totalAmount = subtotal + taxes;

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleBookNow = async () => {
        if (!checkInDate || !checkOutDate) {
            toast.error("Please select valid check-in and check-out dates.");
            return;
        }

        if (nights < 1 || checkInDate >= checkOutDate) {
            toast.error("Check-out date must be strictly after check-in date. Minimum stay is 1 night.");
            return;
        }

        const roomTypeId = selectedRoom?.id || hotel.room_types?.[0]?.id;
        if (!roomTypeId) {
            toast.error("Please select a suite or room type to proceed.");
            return;
        }

        setIsCheckingAvailability(true);
        const startTime = Date.now();
        const MIN_WAIT_MS = 6000;

        try {
            const res = await checkHotelAvailability({
                hotel_id: hotel.id,
                room_type_id: roomTypeId,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                number_of_rooms: 1,
                guest_email: guestEmail.trim() || user?.email || undefined,
                mobile_number: guestMobile.trim() || user?.phone || undefined,
            });

            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_WAIT_MS) {
                await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsed));
            }

            if (!res.available) {
                toast.error(res.message || res.error || "Selected suite is sold out for these dates. Please choose different dates or suite.");
                return;
            }

            toast.success(res.message || "Suite available! Proceeding to reservation...");
            setConfirmedBooking(null);
            setIsBookingModalOpen(true);
        } catch (error: any) {
            const elapsed = Date.now() - startTime;
            if (elapsed < MIN_WAIT_MS) {
                await new Promise((resolve) => setTimeout(resolve, MIN_WAIT_MS - elapsed));
            }
            const errMsg =
                error?.message ||
                error?.error ||
                error?.response?.data?.error ||
                error?.response?.data?.detail ||
                "Failed to verify availability. Please try again.";
            toast.error(errMsg);
            return;
        } finally {
            setIsCheckingAvailability(false);
        }
    };

    const executeConfirmedBooking = async (cleanedGuestEmail: string, cleanedMobile: string) => {
        const roomTypeId = selectedRoom?.id || hotel.room_types?.[0]?.id;
        if (!roomTypeId) {
            toast.error("Please select a valid suite / room type.");
            return;
        }

        const proceedBookingSubmission = async (razorpayPaymentId?: string) => {
            setIsSubmittingBooking(true);
            try {
                const booking = await createHotelBooking({
                    hotel_id: hotel.id,
                    room_type_id: roomTypeId,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    number_of_rooms: 1,
                    guest_name: guestName.trim(),
                    guest_email: cleanedGuestEmail,
                    mobile_number: cleanedMobile,
                    adults_count: 2,
                    children_count: 0,
                    special_requests: specialRequests.trim() + (razorpayPaymentId ? ` [Razorpay Payment ID: ${razorpayPaymentId}]` : ""),
                    payment_method: paymentMethod,
                });

                setConfirmedBooking(booking);
                toast.success("Hotel reservation confirmed successfully!", {
                    description: `Confirmation #${booking.booking_reference}`,
                });
            } catch (err: any) {
                const errorData = err?.response?.data || err?.errors;
                let errorMsg =
                    err?.message ||
                    errorData?.detail ||
                    errorData?.non_field_errors?.[0] ||
                    errorData?.error;

                if (!errorMsg && errorData && typeof errorData === "object") {
                    const firstVal = Object.values(errorData)[0];
                    if (Array.isArray(firstVal)) {
                        errorMsg = firstVal[0];
                    } else if (typeof firstVal === "string") {
                        errorMsg = firstVal;
                    }
                }

                if (!errorMsg && typeof errorData === "string") {
                    errorMsg = errorData;
                }

                toast.error(errorMsg || "Failed to complete reservation. Please review dates and room availability.");
            } finally {
                setIsSubmittingBooking(false);
            }
        };

        if (paymentMethod === "online") {
            setIsSubmittingBooking(true);
            try {
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded || typeof (window as any).Razorpay === "undefined") {
                    toast.error("Unable to load Razorpay payment gateway. Please check your internet connection.");
                    setIsSubmittingBooking(false);
                    return;
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SRVXPRrskTPpW6",
                    amount: Math.round(totalAmount * 100), // paise
                    currency: "INR",
                    name: "Hostel In - Hotels",
                    description: `Reservation for ${hotel.name}`,
                    handler: async function (response: any) {
                        toast.success("Online payment successful!");
                        await proceedBookingSubmission(response.razorpay_payment_id);
                    },
                    modal: {
                        ondismiss: function () {
                            setIsSubmittingBooking(false);
                            toast.info("Payment window closed.");
                        }
                    },
                    prefill: {
                        name: guestName.trim(),
                        email: cleanedGuestEmail,
                        contact: cleanedMobile
                    },
                    theme: {
                        color: "#003580"
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on("payment.failed", function (response: any) {
                    toast.error(response.error?.description || "Payment failed.");
                    setIsSubmittingBooking(false);
                });
                rzp.open();
            } catch (e: any) {
                toast.error(e.message || "Failed to initiate Razorpay checkout.");
                setIsSubmittingBooking(false);
            }
        } else {
            // Pay on arrival
            await proceedBookingSubmission();
        }
    };

    const handleConfirmBooking = async () => {
        if (!guestName.trim() || guestName.trim().length < 3) {
            toast.error("Please enter a valid guest full name (at least 3 characters).");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!guestEmail.trim() || !emailRegex.test(guestEmail.trim())) {
            toast.error("Please enter a valid email address.");
            return;
        }

        const phoneValidation = validateIndianMobile(guestMobile);
        if (!phoneValidation.isValid) {
            toast.error(phoneValidation.error || "Please enter a valid 10-digit mobile number.");
            return;
        }

        const roomTypeId = selectedRoom?.id || hotel.room_types?.[0]?.id;
        if (!roomTypeId) {
            toast.error("Please select a valid suite / room type.");
            return;
        }

        const cleanEmail = guestEmail.trim().toLowerCase();
        const cleanMobile = phoneValidation.cleanNumber || guestMobile.trim();

        if (!isEmailVerified) {
            setShowEmailOtpModal(true);
            return;
        }

        await executeConfirmedBooking(cleanEmail, cleanMobile);
    };

    return (
        <div className="min-h-screen bg-slate-50/70 pb-24 font-sans text-slate-800">
            {/* 1. TOP BREADCRUMB & BACK ROW */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <Link href="/home" className="hover:text-slate-900 shrink-0">Home</Link>
                        <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        <Link href="/hotels" className="hover:text-slate-900 shrink-0">Hotels</Link>
                        {hotel.city_name && (
                            <>
                                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                                <span className="hover:text-slate-900 shrink-0">{hotel.city_name}</span>
                            </>
                        )}
                        <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-900 font-semibold truncate">{hotel.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-none shadow-2xs"
                        >
                            <Share2 size={13} />
                            Share
                        </button>
                        <button
                            onClick={() => {
                                setIsSaved(!isSaved);
                                toast.success(isSaved ? "Removed from saved stays" : "Saved to your favorites!");
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-none shadow-2xs font-semibold ${
                                isSaved
                                    ? "bg-red-50 border-red-200 text-red-600"
                                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                            }`}
                        >
                            <Heart size={13} className={isSaved ? "fill-red-600 text-red-600" : ""} />
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
                {/* 2. HOTEL HEADER */}
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Luxury Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#312E81] text-white">
                            <Sparkles size={11} className="text-amber-300" />
                            {hotel.hotel_type_display || hotel.hotel_type || "Luxury Hotel"}
                        </span>

                        {/* Full 5-Star Rating */}
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                            <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={13}
                                        className={i < starCount ? "fill-amber-400 text-amber-400" : "fill-slate-300 text-slate-300"}
                                    />
                                ))}
                            </div>
                            <span className="ml-1 text-[11px] font-extrabold text-amber-800">
                                {hotel.star_rating || 5}-Star Rated
                            </span>
                        </div>

                        {hotel.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-[#312E81] border border-indigo-200/80 text-[11px] font-bold">
                                <ShieldCheck size={13} className="text-[#312E81]" />
                                Verified Property
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-bold text-slate-950 tracking-tight leading-snug">
                        {hotel.name}
                    </h1>

                    {hotel.tagline && (
                        <p className="text-sm sm:text-base text-slate-800 italic font-medium">
                            &ldquo;{hotel.tagline}&rdquo;
                        </p>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold pt-1">
                        <MapPin size={14} className="text-[#312E81] shrink-0" />
                        <span>{[hotel.area_name, hotel.city_name].filter(Boolean).join(", ") || hotel.city_name || "Premier Location"}</span>
                    </div>
                </div>

                {/* 3. PHOTO GALLERY GRID */}
                <div className="relative grid grid-cols-1 md:grid-cols-12 gap-3 h-auto md:h-[420px] rounded-2xl overflow-hidden">
                    {/* Hero Left Photo */}
                    <div
                        onClick={() => setIsGalleryModalOpen(true)}
                        className="md:col-span-8 relative h-72 md:h-full bg-slate-200 overflow-hidden cursor-pointer group"
                    >
                        {primaryImg?.image ? (
                            <Image
                                src={primaryImg.image}
                                alt={hotel.name}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, 66vw"
                                className="object-cover object-center"
                                unoptimized={isExternalImage(primaryImg.image)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                                Luxury Suite Photo
                            </div>
                        )}
                    </div>

                    {/* Secondary Photos (Right side) */}
                    <div className="md:col-span-4 grid grid-cols-2 gap-3 h-full">
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const currentSecondary = images[idx + 1];
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setIsGalleryModalOpen(true)}
                                    className="relative h-32 md:h-[202px] bg-slate-200 overflow-hidden cursor-pointer group"
                                >
                                    {currentSecondary?.image ? (
                                        <Image
                                            src={currentSecondary.image}
                                            alt={`${hotel.name} Photo ${idx + 2}`}
                                            fill
                                            sizes="25vw"
                                            className="object-cover object-center"
                                            unoptimized={isExternalImage(currentSecondary.image)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 text-[11px] p-2 text-center">
                                            <span>Suite View</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right below corner: Symbol & Button to see all images */}
                    {images.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setIsGalleryModalOpen(true)}
                            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-lg border border-slate-200/90 backdrop-blur-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer z-10"
                        >
                            <Grid size={13} className="text-slate-800 shrink-0" />
                            <span>Show all {images.length} photos</span>
                        </button>
                    )}
                </div>

                {/* 4. KEY HIGHLIGHTS BAR */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-[#312E81] shrink-0" />
                        <div>
                            <span className="font-semibold text-slate-950 block">Check-in</span>
                            <span className="text-slate-700 font-medium">{hotel.check_in_time ? hotel.check_in_time.slice(0, 5) : "14:00"} PM</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-5 h-5 text-[#312E81] shrink-0" />
                        <div>
                            <span className="font-semibold text-slate-950 block">Check-out</span>
                            <span className="text-slate-700 font-medium">{hotel.check_out_time ? hotel.check_out_time.slice(0, 5) : "11:00"} AM</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-[#312E81] shrink-0" />
                        <div>
                            <span className="font-semibold text-slate-950 block">Cancellation</span>
                            <span className="text-slate-700 font-medium capitalize">{hotel.cancellation_policy.replace("_", " ")}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-[#312E81] shrink-0" />
                        <div>
                            <span className="font-semibold text-slate-950 block">Pet Policy</span>
                            <span className="text-slate-700 font-medium">{hotel.allows_pets ? "Pets Welcome" : "No Pets Allowed"}</span>
                        </div>
                    </div>
                </div>

                {/* 5. MAIN CONTENT & STICKY BOOKING CARD */}
                <div className="grid grid-cols-12 gap-8 relative">
                    {/* LEFT COLUMN: Description, Rooms, Amenities, Address */}
                    <div className="col-span-12 lg:col-span-8 space-y-10">
                        {/* Description */}
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                                About {hotel.name}
                            </h2>
                            <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                                {hotel.description || "Experience refined elegance and personalized hospitality designed for travelers seeking luxury, privacy, and exceptional comfort."}
                            </p>
                        </div>

                        {/* Room Types & Categories */}
                        <div className="border-t border-slate-200/80 pt-8 space-y-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                                    Available Suites & Room Configurations
                                </h2>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">
                                    Select your preferred room type to reserve your stay
                                </p>
                            </div>

                            <div className="space-y-4">
                                {hotel.room_types && hotel.room_types.length > 0 ? (
                                    hotel.room_types.map((room) => {
                                        const isSelected = selectedRoom?.id === room.id;
                                        return (
                                            <div
                                                key={room.id}
                                                className={`p-3.5 sm:px-4 sm:py-3 rounded-xl border transition-all duration-200 ${
                                                    isSelected
                                                        ? "border-[#312E81] bg-indigo-50/40 ring-1 ring-[#312E81] shadow-xs"
                                                        : "border-slate-200 bg-white hover:border-slate-300"
                                                }`}
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                                    {/* Left: Suite Details & Specs */}
                                                    <div className="space-y-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base capitalize">
                                                                {room.name || room.category_display}
                                                            </h3>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                                                                {room.category_display || room.room_category}
                                                            </span>
                                                            {(room.is_available && (room.rooms_available === undefined || room.rooms_available > 0)) ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                                                    Available
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                                                    <XCircle size={12} className="text-rose-600 shrink-0" />
                                                                    Sold Out
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600">
                                                            <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                                                                <BedDouble size={13} className="text-[#312E81]" />
                                                                {room.bed_display || "1 King Bed"}
                                                            </span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="inline-flex items-center gap-1">
                                                                <Users size={12} className="text-slate-500" />
                                                                Max {room.max_adults} Adults{room.max_children ? `, ${room.max_children} Child` : ""}
                                                            </span>
                                                            {room.room_size_sqft && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span className="inline-flex items-center gap-1">
                                                                        <Maximize2 size={12} className="text-slate-500" />
                                                                        {room.room_size_sqft} sq ft
                                                                    </span>
                                                                </>
                                                            )}
                                                            {room.includes_breakfast && (
                                                                <>
                                                                    <span className="text-slate-300">•</span>
                                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                                                        <Coffee size={11} className="text-emerald-600" />
                                                                        Breakfast Included
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Right: Price & Action Button side-by-side (Taxes removed from list) */}
                                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                                        <div className="text-left sm:text-right">
                                                            <div className="flex items-baseline sm:justify-end gap-1">
                                                                <span className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                                                    ₹{parseFloat(room.base_price_per_night || room.price_per_night || "0").toLocaleString("en-IN")}
                                                                </span>
                                                                <span className="text-[11px] text-slate-500 font-normal">/ night</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => handleSelectAndBookRoom(room)}
                                                            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
                                                                isSelected
                                                                    ? "bg-[#312E81] text-white shadow-xs ring-2 ring-[#312E81]/25"
                                                                    : "border border-[#312E81] bg-white text-[#312E81] hover:bg-[#312E81] hover:text-white"
                                                            }`}
                                                        >
                                                            {isSelected ? "Selected" : "Reserve"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-600">
                                        Standard Suite configurations available on inquiry with hotel concierge.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="border-t border-slate-200/80 pt-8 space-y-4">
                            <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
                                <Sparkles size={18} className="text-[#312E81]" />
                                Amenities & Hotel Services
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {hotel.amenities_list && hotel.amenities_list.length > 0 ? (
                                    hotel.amenities_list.map((amenity) => (
                                        <div
                                            key={amenity.id}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-900"
                                        >
                                            <CheckCircle2 size={15} className="text-[#312E81] shrink-0" />
                                            <span>{amenity.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-slate-700 font-medium">
                                        High-Speed Wi-Fi, 24/7 Front Desk, Housekeeping, Air Conditioning.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location & Property Address (Directly below Amenities) */}
                        <div className="border-t border-slate-200/80 pt-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
                                    <MapPin size={18} className="text-[#312E81]" />
                                    Property Location & Address
                                </h2>
                                {hotel.city_name && (
                                    <span className="text-xs font-bold text-[#312E81] bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg">
                                        {hotel.city_name}
                                    </span>
                                )}
                            </div>

                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-[#312E81] flex items-center justify-center shrink-0 mt-0.5">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-slate-950 block">Full Property Address</span>
                                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                                            {hotel.address}
                                            {hotel.postal_code && <span className="font-bold text-slate-950"> - {hotel.postal_code}</span>}
                                        </p>
                                        {hotel.area_name && (
                                            <p className="text-[11px] text-slate-700 font-medium">
                                                Area: <span className="font-semibold text-slate-900">{hotel.area_name}</span>
                                                {hotel.city_name && <span> • City: <span className="font-semibold text-slate-900">{hotel.city_name}</span></span>}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex flex-wrap gap-2">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${hotel.name}, ${hotel.address}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold shadow-xs transition-colors"
                                    >
                                        <MapPin size={13} />
                                        Get Directions on Google Maps
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 1. Guest Ratings & Scores Overview */}
                        <HotelRatings
                            ratingAvg={Number(hotel.rating_avg) || 0}
                            ratingCount={hotel.rating_count || 0}
                            hotelName={hotel.name}
                        />

                        {/* 2. What Guests Say (Verified User Reviews) */}
                        <HotelReviews
                            hotelId={hotel.id}
                            hotelName={hotel.name}
                            reviews={hotel.reviews}
                            ratingAvg={Number(hotel.rating_avg) || 0}
                            ratingCount={hotel.rating_count || 0}
                        />
                    </div>

                    {/* RIGHT COLUMN: Sticky Reservation Card */}
                    <div className="col-span-12 lg:col-span-4 lg:self-start lg:sticky lg:top-[124px] z-20 w-full max-w-[380px] ml-auto">
                        <div
                            id="hotel-booking-card"
                            className={`bg-[#E5DFD4] rounded-2xl border transition-all duration-300 p-6 shadow-xs space-y-5 ${
                                highlightBooking
                                    ? "border-[#1F1E1B] ring-2 ring-[#1F1E1B]/20 shadow-md"
                                    : "border-[#D2CABC]"
                            }`}
                        >
                            <div className="flex items-baseline justify-between pb-3 border-b border-[#D2CABC]">
                                <div>
                                    <span className="text-2xl font-bold text-[#1A1916]">
                                        ₹{currentPriceNum.toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-xs text-[#686259] font-semibold"> / night</span>
                                </div>
                                <span className="text-xs font-bold text-[#1F1E1B] bg-[#DBD5C8] border border-[#D2CABC] px-2.5 py-0.5 rounded-md">
                                    Best Rate Guaranteed
                                </span>
                            </div>

                            {/* Booking Controls */}
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold text-[#1A1916] block mb-1">
                                        Selected Suite
                                    </label>
                                    <div className="p-2.5 rounded-xl border border-[#D2CABC] bg-[#DBD5C8]/40 text-xs font-semibold text-[#1A1916] flex items-center justify-between">
                                        <span>{selectedRoom?.category_display || selectedRoom?.name || "Standard Luxury Suite"}</span>
                                        {selectedRoom && (
                                            (selectedRoom.is_available && (selectedRoom.rooms_available === undefined || selectedRoom.rooms_available > 0)) ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 size={11} className="text-emerald-600" />
                                                    Available
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                                                    <XCircle size={11} className="text-rose-600" />
                                                    Sold Out
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Stay Dates Selection */}
                                <div>
                                    <label className="text-xs font-semibold text-[#1A1916] block mb-1">
                                        Stay Dates
                                    </label>
                                    <div className="border border-[#D2CABC] rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#D2CABC] text-xs grid grid-cols-2 bg-[#DBD5C8]/30">
                                        <div className="p-2.5">
                                            <label className="text-[10px] uppercase font-bold text-[#686259] block mb-0.5">
                                                Check-In
                                            </label>
                                            <input
                                                type="date"
                                                value={checkInDate}
                                                min={new Date().toISOString().split("T")[0]}
                                                onChange={(e) => {
                                                    const newIn = e.target.value;
                                                    if (!newIn) return;
                                                    setCheckInDate(newIn);
                                                    if (newIn && checkOutDate && newIn >= checkOutDate) {
                                                        const next = new Date(newIn);
                                                        next.setDate(next.getDate() + 1);
                                                        setCheckOutDate(next.toISOString().split("T")[0]);
                                                    }
                                                }}
                                                className="w-full font-bold text-[#1A1916] bg-transparent focus:outline-none cursor-pointer text-xs"
                                            />
                                        </div>
                                        <div className="p-2.5">
                                            <label className="text-[10px] uppercase font-bold text-[#686259] block mb-0.5">
                                                Check-Out
                                            </label>
                                            <input
                                                type="date"
                                                value={checkOutDate}
                                                min={checkInDate}
                                                onChange={(e) => {
                                                    const newOut = e.target.value;
                                                    if (!newOut) return;
                                                    setCheckOutDate(newOut);
                                                }}
                                                className="w-full font-bold text-[#1A1916] bg-transparent focus:outline-none cursor-pointer text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-[#1A1916] block mb-1">
                                        Duration of Stay
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleAdjustNights(-1)}
                                            className="w-9 h-9 rounded-lg border border-[#D2CABC] text-[#1F1E1B] font-bold bg-[#DBD5C8] hover:bg-[#1F1E1B] hover:text-[#EDE8DF] flex items-center justify-center text-sm transition-colors cursor-pointer"
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center py-2 border border-[#D2CABC] rounded-lg text-xs font-bold bg-[#E5DFD4] text-[#1A1916]">
                                            {nights} {nights === 1 ? "Night" : "Nights"}
                                        </div>
                                        <button
                                            onClick={() => handleAdjustNights(1)}
                                            className="w-9 h-9 rounded-lg border border-[#D2CABC] text-[#1F1E1B] font-bold bg-[#DBD5C8] hover:bg-[#1F1E1B] hover:text-[#EDE8DF] flex items-center justify-center text-sm transition-colors cursor-pointer"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 pt-3 border-t border-[#D2CABC] text-xs text-[#686259]">
                                <div className="flex justify-between">
                                    <span className="font-medium text-[#686259]">₹{currentPriceNum.toLocaleString("en-IN")} × {nights} night(s)</span>
                                    <span className="font-bold text-[#1A1916]">₹{subtotal.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-[#686259]">Estimated Taxes & Service (12%)</span>
                                    <span className="font-bold text-[#1A1916]">₹{taxes.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-[#D2CABC] text-sm font-bold text-[#1A1916]">
                                    <span>Total Payable</span>
                                    <span className="text-base font-extrabold text-[#1A1916]">₹{totalAmount.toLocaleString("en-IN")}</span>
                                </div>
                            </div>

                            {/* Simple & Elegant Button */}
                            <button
                                onClick={handleBookNow}
                                disabled={isCheckingAvailability}
                                className="w-full py-3.5 rounded-sm bg-[#1F1E1B] hover:bg-[#34322D] text-[#EDE8DF] text-sm font-medium tracking-normal transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-85"
                            >
                                {isCheckingAvailability ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin text-[#EDE8DF]" />
                                        <span>Checking Availability...</span>
                                    </>
                                ) : (
                                    <span>Check Availability</span>
                                )}
                            </button>

                            <p className="text-[11px] text-[#686259] text-center font-medium leading-relaxed">
                                No instant cancellation penalty for free cancellation tiers. Digital invoice sent upon check-in.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. RESERVATION CONFIRMATION MODAL */}
            <HotelBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setConfirmedBooking(null);
                }}
                hotel={hotel}
                selectedRoom={selectedRoom}
                confirmedBooking={confirmedBooking}
                setConfirmedBooking={setConfirmedBooking}
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkOutDate={checkOutDate}
                setCheckOutDate={setCheckOutDate}
                numberOfNights={nights}
                totalAmount={totalAmount}
                guestName={guestName}
                setGuestName={setGuestName}
                guestEmail={guestEmail}
                setGuestEmail={setGuestEmail}
                guestMobile={guestMobile}
                setGuestMobile={setGuestMobile}
                specialRequests={specialRequests}
                setSpecialRequests={setSpecialRequests}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isSubmittingBooking={isSubmittingBooking}
                handleConfirmBooking={handleConfirmBooking}
                isEmailVerified={isEmailVerified}
            />

            <EmailOtpModal
                isOpen={showEmailOtpModal}
                onClose={() => setShowEmailOtpModal(false)}
                email={guestEmail.trim()}
                guestName={guestName.trim()}
                onVerified={() => {
                    const cleanEmail = guestEmail.trim().toLowerCase();
                    setVerifiedEmail(cleanEmail);
                    const phoneValidation = validateIndianMobile(guestMobile);
                    const cleanMobile = phoneValidation.cleanNumber || guestMobile.trim();
                    executeConfirmedBooking(cleanEmail, cleanMobile);
                }}
            />

            {/* 7. MOBILE STICKY BOTTOM BAR (STATIC DOWN BUTTON) */}
            <HotelMobileBookingBar
                hotel={hotel}
                selectedRoom={selectedRoom}
                setSelectedRoom={setSelectedRoom}
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkOutDate={checkOutDate}
                setCheckOutDate={setCheckOutDate}
                numberOfNights={nights}
                totalAmount={totalAmount}
                onOpenBookingModal={handleBookNow}
                isCheckingAvailability={isCheckingAvailability}
            />

            {/* Whole-page availability checking loader */}
            <FullPageAvailabilityLoader
                isChecking={isCheckingAvailability}
                onClose={() => setIsCheckingAvailability(false)}
                title="Checking Suite Availability"
                subtitle={`Verifying live room inventory at ${hotel.name}...`}
            />

            {/* 8. FULL-SCREEN GALLERY LIGHTBOX - RECTANGULAR WITH LESS SOFT CORNERS & BIGGER SIZE */}
            <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
                <DialogContent className="max-w-5xl w-[95vw] sm:w-[94vw] md:w-[92vw] lg:w-full max-h-[90vh] sm:max-h-[88vh] p-0 gap-0 overflow-hidden rounded-md sm:rounded-lg border border-slate-200 shadow-2xl flex flex-col bg-white no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Fixed Modal Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0 pr-12 sm:pr-14 bg-white/95 backdrop-blur-xs">
                        <DialogTitle className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <span className="truncate">{hotel.name} Photo Gallery</span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#312E81] bg-indigo-50 border border-indigo-200/80 px-2 sm:px-2.5 py-0.5 rounded shrink-0">
                                {images.length} {images.length === 1 ? "Photo" : "Photos"}
                            </span>
                        </DialogTitle>
                    </div>

                    {/* Smooth Scrollable Gallery - Zero Visible Scrollbar */}
                    <div className="overflow-y-auto scroll-smooth overscroll-contain touch-pan-y px-3.5 sm:px-6 py-3.5 sm:py-5 flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={img.id || i}
                                    className="group relative aspect-[16/10] rounded-md overflow-hidden bg-slate-100 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                                >
                                    <Image
                                        src={img.image}
                                        alt={img.caption || `${hotel.name} Photo ${i + 1}`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 450px"
                                        className="object-cover"
                                        unoptimized={isExternalImage(img.image)}
                                    />
                                    {img.caption && (
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-2.5 sm:p-3 text-white text-xs font-medium">
                                            {img.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
