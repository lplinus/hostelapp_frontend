"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MapPin,
    Star,
    Sparkles,
    CheckCircle2,
    Clock,
    Users,
    Bed,
    Bath,
    Palmtree,
    Wifi,
    ShieldCheck,
    Coffee,
    ArrowLeft,
    Share2,
    Heart,
    ChevronRight,
    Zap,
    Calendar,
    PawPrint,
    Check,
    AlertCircle,
    Home,
    Building,
    FileText,
    Receipt,
    Loader2
} from "lucide-react";
import type { VacationRental, VacationRentalBooking } from "@/types/vacationrental.types";
import { createVacationRentalBooking } from "@/services/vacanatinalrentalservices/vacationrental.service";
import { isExternalImage } from "@/lib/utils";
import { toast } from "sonner";
import { VacationRentalBookingModal } from "./VacationRentalBookingModal";
import { VacationRentalMobileBookingBar } from "./VacationRentalMobileBookingBar";
import { loadRazorpayScript } from "@/lib/razorpay";
import { validateIndianMobile } from "@/lib/validation";
import { EmailOtpModal } from "@/components/home/booking/steps/EmailOtpModal";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/user.service";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VacationRentalDetailClientProps {
    readonly rental: VacationRental;
}

export default function VacationRentalDetailClient({ rental }: VacationRentalDetailClientProps) {
    const router = useRouter();

    // Booking Widget States
    const [checkInDate, setCheckInDate] = useState<string>(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });
    const [checkOutDate, setCheckOutDate] = useState<string>(() => {
        const next = new Date();
        next.setDate(next.getDate() + 3);
        return next.toISOString().split("T")[0];
    });

    const [adults, setAdults] = useState<number>(2);
    const [children, setChildren] = useState<number>(0);
    const [infants, setInfants] = useState<number>(0);
    const [pets, setPets] = useState<number>(0);

    const [isSaved, setIsSaved] = useState(false);
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

    // Reservation Checkout Modal States
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [guestMobile, setGuestMobile] = useState("");
    const [specialRequests, setSpecialRequests] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"online" | "on_arrival">("online");
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [confirmedBooking, setConfirmedBooking] = useState<VacationRentalBooking | null>(null);

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

    // Images
    const images = rental.images && rental.images.length > 0 ? rental.images : [];
    const primaryImg = images.find((img) => img.is_primary) || images[0];

    // Ratings
    const rating = parseFloat(rental.rating_avg || "4.95");
    const reviewCount = rental.rating_count || 18;

    // Nights Calculation
    const numberOfNights = useMemo(() => {
        if (!checkInDate || !checkOutDate) return 1;
        const d1 = new Date(checkInDate);
        const d2 = new Date(checkOutDate);
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(1, diffDays);
    }, [checkInDate, checkOutDate]);

    // Live Dynamic Pricing Engine
    const pricingCalculation = useMemo(() => {
        const baseRate = parseFloat(rental.price_per_night || "0");
        const weekendRate = rental.weekend_price_per_night
            ? parseFloat(rental.weekend_price_per_night)
            : baseRate;
        const cleaningFee = parseFloat(rental.cleaning_fee || "0");

        // Calculate nights with Friday/Saturday weekend surge
        let staySubtotal = 0;
        const curr = new Date(checkInDate);
        for (let i = 0; i < numberOfNights; i++) {
            const dayOfWeek = curr.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                staySubtotal += weekendRate;
            } else {
                staySubtotal += baseRate;
            }
            curr.setDate(curr.getDate() + 1);
        }

        // Stay discounts
        let discount = 0;
        if (numberOfNights >= 28 && rental.monthly_discount_percentage > 0) {
            discount = (staySubtotal * rental.monthly_discount_percentage) / 100;
        } else if (numberOfNights >= 7 && rental.weekly_discount_percentage > 0) {
            discount = (staySubtotal * rental.weekly_discount_percentage) / 100;
        }

        const discountedSubtotal = Math.max(0, staySubtotal - discount);
        const serviceFee = Math.round(discountedSubtotal * 0.05); // 5% platform fee
        const grandTotal = discountedSubtotal + cleaningFee + serviceFee;

        return {
            baseRate,
            staySubtotal,
            discount,
            cleaningFee,
            serviceFee,
            grandTotal,
        };
    }, [rental, checkInDate, numberOfNights]);

    const handleShare = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    const handleOpenBookingModal = () => {
        const totalGuests = adults + children;
        if (totalGuests > rental.max_guests) {
            toast.error(`Headcount exceeds property limit of ${rental.max_guests} guests.`);
            return;
        }
        if (pets > 0 && !rental.allows_pets) {
            toast.error("Pets are not permitted at this property.");
            return;
        }
        setConfirmedBooking(null);
        setIsBookingModalOpen(true);
    };

    const executeConfirmedBooking = async (cleanedGuestEmail: string, cleanedMobile: string) => {
        const proceedBookingSubmission = async (razorpayPaymentId?: string) => {
            setIsSubmittingBooking(true);
            try {
                const booking = await createVacationRentalBooking({
                    rental_id: rental.id,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    guest_name: guestName.trim(),
                    guest_email: cleanedGuestEmail,
                    mobile_number: cleanedMobile,
                    adults,
                    children,
                    infants,
                    pets,
                    special_requests: specialRequests.trim() + (razorpayPaymentId ? ` [Razorpay ID: ${razorpayPaymentId}]` : ""),
                    payment_method: paymentMethod,
                });

                setConfirmedBooking(booking);
                toast.success("Reservation confirmed successfully!", {
                    description: `Confirmation #${booking.booking_reference}`,
                });
            } catch (err: any) {
                const errorMsg =
                    err?.response?.data?.detail ||
                    err?.response?.data?.check_in_date ||
                    err?.response?.data?.adults ||
                    "Failed to complete reservation. Please review dates and details.";
                toast.error(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
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
                    amount: Math.round(pricingCalculation.grandTotal * 100), // paise
                    currency: "INR",
                    name: "Hostel In Rentals",
                    description: `Reservation for ${rental.title}`,
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
                        color: "#312E81"
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
            toast.error(phoneValidation.error || "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
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
            {/* 1. TOP BREADCRUMB & ACTION ROW */}
            <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs font-medium text-slate-500">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        <Link href="/home" className="hover:text-slate-900 shrink-0">Home</Link>
                        <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        <Link href="/vacanationalrental" className="hover:text-slate-900 shrink-0">Vacation Rentals</Link>
                        {rental.city_name && (
                            <>
                                <ChevronRight size={13} className="text-slate-400 shrink-0" />
                                <span className="hover:text-slate-900 shrink-0">{rental.city_name}</span>
                            </>
                        )}
                        <ChevronRight size={13} className="text-slate-400 shrink-0" />
                        <span className="text-slate-900 font-semibold truncate">{rental.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs"
                        >
                            <Share2 size={13} />
                            Share
                        </button>
                        <button
                            onClick={() => {
                                setIsSaved(!isSaved);
                                toast.success(isSaved ? "Removed from Wishlist" : "Saved to Wishlist!");
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold shadow-2xs"
                        >
                            <Heart size={13} className={isSaved ? "fill-rose-500 text-rose-500" : ""} />
                            {isSaved ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TITLE & HEADER DETAILS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#1E1B4B] text-white uppercase tracking-wider">
                                <Palmtree size={12} className="text-amber-300" />
                                {rental.category_display || rental.category || "Entire Place"}
                            </span>
                            {rental.is_superhost && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                                    <Sparkles size={12} />
                                    Superhost
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight leading-snug">
                            {rental.title}
                        </h1>
                        <p className="text-sm text-slate-800 font-medium flex items-center gap-1.5 pt-0.5">
                            <MapPin size={14} className="text-[#312E81] shrink-0" />
                            <span>
                                {rental.address ? `${rental.address}, ` : ""}
                                {rental.city_name || "India"}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-950 text-sm">
                                {rating.toFixed(2)}
                            </span>
                            <span className="text-slate-600 text-xs font-medium">({reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. AIRBNB-GRADE 5-PHOTO MASONRY GALLERY */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 rounded-2xl overflow-hidden max-h-[460px] bg-slate-100 relative">
                    {/* Featured Large Left Image */}
                    <div
                        onClick={() => {
                            setActiveGalleryIndex(0);
                            setIsGalleryModalOpen(true);
                        }}
                        className="md:col-span-2 relative h-[320px] md:h-full cursor-pointer overflow-hidden group"
                    >
                        {primaryImg?.image ? (
                            <Image
                                src={primaryImg.image}
                                alt={primaryImg.caption || rental.title}
                                fill
                                priority
                                className="object-cover"
                                unoptimized={isExternalImage(primaryImg.image)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <Palmtree size={32} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* 4 Supporting Grid Images */}
                    <div className="hidden md:grid col-span-2 grid-cols-2 gap-2.5 h-full">
                        {images.slice(1, 5).map((img, idx) => (
                            <div
                                key={img.id || idx}
                                onClick={() => {
                                    setActiveGalleryIndex(idx + 1);
                                    setIsGalleryModalOpen(true);
                                }}
                                className="relative h-[225px] cursor-pointer overflow-hidden group"
                            >
                                <Image
                                    src={img.image}
                                    alt={img.caption || `Photo ${idx + 2}`}
                                    fill
                                    className="object-cover"
                                    unoptimized={isExternalImage(img.image)}
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        ))}
                    </div>

                    {/* "Show All Photos" Button */}
                    {images.length > 0 && (
                        <button
                            onClick={() => setIsGalleryModalOpen(true)}
                            className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-lg border border-slate-200 backdrop-blur-md flex items-center gap-2 transition-transform active:scale-95"
                        >
                            <span>Show all {images.length} photos</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 4. MAIN TWO-COLUMN BODY */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 xl:gap-10 items-start">
                    {/* LEFT COLUMN: Property Highlights, Host, Description, Specs & Rules */}
                    <div className="min-w-0 space-y-8">
                        {/* Host Overview */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Entire {rental.category_display || "Home"} hosted by {rental.host_name || "Superhost"}
                                    </h2>
                                    <p className="text-xs text-slate-700 mt-0.5 font-medium">
                                        {rental.max_guests} guests • {rental.bedrooms} bedrooms • {rental.beds} beds • {rental.bathrooms} baths
                                    </p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-200/80 text-[#312E81] flex items-center justify-center font-bold text-sm shrink-0">
                                    {(rental.host_name || "H").charAt(0).toUpperCase()}
                                </div>
                            </div>

                            {/* Property Highlights */}
                            <div className="space-y-3 pt-1 text-xs">
                                <div className="flex items-start gap-3">
                                    <Zap className="w-5 h-5 text-[#312E81] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-950">
                                            {rental.instant_book ? "Instant Bookable Stay" : "Host Approved Stay"}
                                        </p>
                                        <p className="text-slate-700 font-normal">
                                            {rental.instant_book
                                                ? "Reserve immediately without waiting for host confirmation."
                                                : "Host typically confirms reservations within 2 hours."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#312E81] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-950">100% Verified Property</p>
                                        <p className="text-slate-700 font-normal">
                                            This property has been physically inspected for cleanliness and safety specs.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-[#312E81] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-950">
                                            Cancellation: {rental.cancellation_policy_display || "Flexible"}
                                        </p>
                                        <p className="text-slate-700 font-normal">
                                            Full refund available up to standard policy timeframe before check-in.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                            <h3 className="text-base font-bold text-slate-950">About this place</h3>
                            <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                                {rental.description}
                            </p>
                        </div>

                        {/* Sleeping Arrangements */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                            <h3 className="text-base font-bold text-slate-950">Where you'll sleep</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Array.from({ length: rental.bedrooms }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                                    >
                                        <Bed size={20} className="text-[#312E81]" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-950">Bedroom {i + 1}</p>
                                            <p className="text-[11px] text-slate-700 font-medium">1 King/Queen Bed</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Amenities Grid */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                            <h3 className="text-base font-bold text-slate-950">What this place offers</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-800">
                                {rental.amenities_list && rental.amenities_list.length > 0 ? (
                                    rental.amenities_list.map((am) => (
                                        <div
                                            key={am.id}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70"
                                        >
                                            <CheckCircle2 size={15} className="text-[#312E81] shrink-0" />
                                            <span className="font-semibold text-slate-900 truncate">{am.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-700 font-medium">Amenities catalog available on check-in.</p>
                                )}
                            </div>
                        </div>

                        {/* House Rules & Policies */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
                            <h3 className="text-base font-bold text-slate-950">House Rules &amp; Check-In</h3>
                            <div className="grid grid-cols-2 gap-3 text-xs text-slate-700">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-700 block">Check-in</span>
                                    <span className="font-semibold text-slate-950">{rental.check_in_time || "15:00"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-700 block">Check-out</span>
                                    <span className="font-semibold text-slate-950">{rental.check_out_time || "11:00"}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-700 block">Pets</span>
                                    <span className="font-semibold text-slate-950">
                                        {rental.allows_pets ? "Pets allowed 🐾" : "No pets allowed"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-slate-700 block">Smoking</span>
                                    <span className="font-semibold text-slate-950">
                                        {rental.allows_smoking ? "Smoking allowed" : "No smoking"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Reservation Folio Card (Compact 380px like Hostel) */}
                    <div className="lg:self-start lg:sticky lg:top-[120px] hidden lg:block z-20 w-full max-w-[380px] ml-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                            {/* Nightly Tariff Header */}
                            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-[#1E1B4B] tracking-tight">
                                        ₹{parseFloat(rental.price_per_night || "0").toLocaleString("en-IN")}
                                    </span>
                                    <span className="text-xs text-slate-700 font-semibold">/ night</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-bold text-slate-950">
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                    <span>{rating.toFixed(2)}</span>
                                    <span className="text-slate-600 font-medium">({reviewCount})</span>
                                </div>
                            </div>

                            {/* Booking Schedule Inputs */}
                            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200 text-xs">
                                <div className="grid grid-cols-2 divide-x divide-slate-200">
                                    <div className="p-3 bg-slate-50/50">
                                        <label className="text-[10px] uppercase font-bold text-slate-700 block">
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
                                            className="w-full font-bold text-slate-950 bg-transparent focus:outline-none pt-0.5 cursor-pointer"
                                        />
                                    </div>
                                    <div className="p-3 bg-slate-50/50">
                                        <label className="text-[10px] uppercase font-bold text-slate-700 block">
                                            Check-Out
                                        </label>
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            min={checkInDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                            className="w-full font-bold text-slate-950 bg-transparent focus:outline-none pt-0.5 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Headcount Selector */}
                                <div className="p-3 bg-slate-50/50 space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-700 block">
                                        Guests Headcount
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                            <span className="text-xs text-slate-800 font-medium">Adults:</span>
                                            <div className="flex items-center gap-2 font-bold text-slate-950">
                                                <button
                                                    onClick={() => setAdults(Math.max(1, adults - 1))}
                                                    className="w-5 h-5 rounded-md bg-slate-100 text-[#312E81] flex items-center justify-center hover:bg-indigo-50 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span>{adults}</span>
                                                <button
                                                    onClick={() => setAdults(adults + 1)}
                                                    className="w-5 h-5 rounded-md bg-slate-100 text-[#312E81] flex items-center justify-center hover:bg-indigo-50 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                                            <span className="text-xs text-slate-800 font-medium">Children:</span>
                                            <div className="flex items-center gap-2 font-bold text-slate-950">
                                                <button
                                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                                    className="w-5 h-5 rounded-md bg-slate-100 text-[#312E81] flex items-center justify-center hover:bg-indigo-50 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span>{children}</span>
                                                <button
                                                    onClick={() => setChildren(children + 1)}
                                                    className="w-5 h-5 rounded-md bg-slate-100 text-[#312E81] flex items-center justify-center hover:bg-indigo-50 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Airbnb Pricing Breakdown */}
                            <div className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-800">
                                        ₹{pricingCalculation.baseRate.toLocaleString("en-IN")} × {numberOfNights} night{numberOfNights > 1 ? "s" : ""}
                                    </span>
                                    <span className="font-bold text-slate-950">
                                        ₹{pricingCalculation.staySubtotal.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                {pricingCalculation.discount > 0 && (
                                    <div className="flex justify-between text-[#312E81] font-semibold">
                                        <span>Extended Stay Discount</span>
                                        <span>-₹{pricingCalculation.discount.toLocaleString("en-IN")}</span>
                                    </div>
                                )}

                                {pricingCalculation.cleaningFee > 0 && (
                                    <div className="flex justify-between font-medium">
                                        <span className="text-slate-800">Cleaning fee</span>
                                        <span className="font-bold text-slate-950">
                                            ₹{pricingCalculation.cleaningFee.toLocaleString("en-IN")}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between font-medium">
                                    <span className="text-slate-800">Platform Service Fee (5%)</span>
                                    <span className="font-bold text-slate-950">
                                        ₹{pricingCalculation.serviceFee.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-950">
                                    <span>Total Payable</span>
                                    <span className="text-xl tracking-tight font-extrabold text-[#1E1B4B]">
                                        ₹{pricingCalculation.grandTotal.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            {/* CTA Action */}
                            <button
                                onClick={handleOpenBookingModal}
                                className="w-full h-12 rounded-xl bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold text-[15px] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Zap size={16} className="fill-current text-amber-300" />
                                {rental.instant_book ? "Instant Book Stay" : "Request to Book"}
                            </button>

                            <p className="text-[11px] text-center text-slate-500 font-medium leading-relaxed">
                                You won't be charged yet. Instant confirmation upon reservation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. RESERVATION CONFIRMATION & GUEST FOLIO MODAL (SEPARATE MODULAR COMPONENT) */}
            <VacationRentalBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => {
                    setIsBookingModalOpen(false);
                    setConfirmedBooking(null);
                }}
                rental={rental}
                confirmedBooking={confirmedBooking}
                setConfirmedBooking={setConfirmedBooking}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                numberOfNights={numberOfNights}
                pricingCalculation={pricingCalculation}
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

            {/* 6. MOBILE STICKY BOTTOM BAR (RESERVE BUTTON & DATES DRAWER) */}
            <VacationRentalMobileBookingBar
                rental={rental}
                checkInDate={checkInDate}
                setCheckInDate={setCheckInDate}
                checkOutDate={checkOutDate}
                setCheckOutDate={setCheckOutDate}
                guestsCount={adults + children}
                setGuestsCount={(count) => {
                    setAdults(count);
                    setChildren(0);
                }}
                numberOfNights={numberOfNights}
                pricingCalculation={pricingCalculation}
                onOpenBookingModal={handleOpenBookingModal}
            />

            {/* 7. FULL-SCREEN GALLERY LIGHTBOX */}
            <Dialog open={isGalleryModalOpen} onOpenChange={setIsGalleryModalOpen}>
                <DialogContent className="max-w-4xl w-[94vw] sm:w-[92vw] md:w-[90vw] lg:w-full max-h-[88vh] sm:max-h-[85vh] p-0 gap-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl flex flex-col bg-white no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {/* Fixed Modal Header */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0 pr-12 sm:pr-14 bg-white/95 backdrop-blur-xs">
                        <DialogTitle className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-2 sm:gap-2.5 min-w-0">
                            <span className="truncate">{rental.title} Photo Gallery</span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#312E81] bg-indigo-50 border border-indigo-200/80 px-2 sm:px-2.5 py-0.5 rounded-full shrink-0">
                                {images.length} {images.length === 1 ? "Photo" : "Photos"}
                            </span>
                        </DialogTitle>
                    </div>

                    {/* Smooth Scrollable Gallery - Zero Visible Scrollbar (No Grey Side Bar) & All-Device Responsive */}
                    <div className="overflow-y-auto scroll-smooth overscroll-contain touch-pan-y px-3.5 sm:px-6 py-3.5 sm:py-5 flex-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={img.id || i}
                                    className="group relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                                >
                                    <Image
                                        src={img.image}
                                        alt={img.caption || `${rental.title} Photo ${i + 1}`}
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
