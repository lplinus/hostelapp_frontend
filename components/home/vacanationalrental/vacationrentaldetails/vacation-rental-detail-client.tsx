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
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async () => {
        if (!guestName.trim() || guestName.trim().length < 3) {
            toast.error("Please enter a valid guest full name.");
            return;
        }
        if (!guestEmail.trim() || !guestEmail.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }
        if (!guestMobile.trim() || guestMobile.replace(/\D/g, "").length < 10) {
            toast.error("Please enter a valid 10-digit mobile number.");
            return;
        }

        setIsSubmittingBooking(true);
        try {
            const booking = await createVacationRentalBooking({
                rental_id: rental.id,
                check_in_date: checkInDate,
                check_out_date: checkOutDate,
                guest_name: guestName.trim(),
                guest_email: guestEmail.trim(),
                mobile_number: guestMobile.trim(),
                adults,
                children,
                infants,
                pets,
                special_requests: specialRequests.trim(),
                payment_method: paymentMethod,
            });

            setConfirmedBooking(booking);
            toast.success("Reservation placed successfully!", {
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

    return (
        <div className="min-h-screen bg-slate-50/70 pb-24 font-sans text-slate-800">
            {/* 1. TOP BREADCRUMB & ACTION ROW */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between text-xs font-medium text-slate-500">
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Property Highlights, Host, Description, Specs & Rules (7 cols) */}
                    <div className="lg:col-span-7 space-y-8">
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

                    {/* RIGHT COLUMN: Sticky Reservation Folio Card (5 cols) */}
                    <div className="lg:col-span-5 lg:self-start lg:sticky lg:top-24 z-20">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
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
                                            onChange={(e) => setCheckInDate(e.target.value)}
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

                            {/* CTA Action - Dark Blue */}
                            <button
                                onClick={handleOpenBookingModal}
                                className="w-full py-3.5 rounded-sm bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium text-sm tracking-wide shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Zap size={16} className="fill-current text-amber-300" />
                                {rental.instant_book ? "Instant Book Stay" : "Request to Book"}
                            </button>

                            <p className="text-[11px] text-center text-slate-600 font-medium">
                                You won't be charged yet. Instant confirmation upon reservation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. RESERVATION CONFIRMATION & GUEST FOLIO MODAL */}
            <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
                <DialogContent className="max-w-lg">
                    {confirmedBooking ? (
                        <div className="text-center py-6 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                                <CheckCircle2 size={32} />
                            </div>

                            <div className="space-y-1">
                                <DialogTitle className="text-xl font-bold text-slate-950">
                                    Reservation Confirmed!
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-700 font-medium">
                                    Your vacation stay at {rental.title} is officially reserved.
                                </DialogDescription>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-left space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-700 font-medium">Booking Reference:</span>
                                    <span className="font-mono font-bold text-slate-950">
                                        #{confirmedBooking.booking_reference}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-700 font-medium">Check-In:</span>
                                    <span className="font-bold text-slate-950">{confirmedBooking.check_in_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-700 font-medium">Check-Out:</span>
                                    <span className="font-bold text-slate-950">{confirmedBooking.check_out_date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-700 font-medium">Total Price:</span>
                                    <span className="font-bold text-slate-950">₹{confirmedBooking.total_price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-700 font-medium">Status:</span>
                                    <span className="font-bold text-[#312E81]">
                                        {confirmedBooking.status_display}
                                    </span>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 sm:justify-center pt-2">
                                <Button
                                    asChild
                                    className="bg-[#1E1B4B] hover:bg-[#312E81] text-xs font-semibold"
                                >
                                    <Link href="/vacanrentalbooking">
                                        View in Dashboard Folio
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsBookingModalOpen(false);
                                        setConfirmedBooking(null);
                                    }}
                                    className="text-xs font-semibold text-slate-700"
                                >
                                    Done
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-lg font-bold text-slate-950 flex items-center gap-2">
                                    <Palmtree size={18} className="text-[#312E81]" />
                                    Reserve {rental.title}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-700 font-medium">
                                    {numberOfNights} night(s) from {checkInDate} to {checkOutDate} • ₹{pricingCalculation.grandTotal.toLocaleString("en-IN")} Total
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-2 text-xs">
                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-800">Primary Guest Name</label>
                                    <Input
                                        placeholder="Full Name (e.g. Aarav Sharma)"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        className="h-9 text-xs font-medium text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-800">Email Address</label>
                                        <Input
                                            type="email"
                                            placeholder="guest@example.com"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="h-9 text-xs font-medium text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-800">Mobile Number</label>
                                        <Input
                                            placeholder="+91 9876543210"
                                            value={guestMobile}
                                            onChange={(e) => setGuestMobile(e.target.value)}
                                            className="h-9 text-xs font-medium text-slate-900"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-semibold text-slate-800">Special Notes for Host (Optional)</label>
                                    <Input
                                        placeholder="Late check-in, anniversary setup, airport transfer inquiry..."
                                        value={specialRequests}
                                        onChange={(e) => setSpecialRequests(e.target.value)}
                                        className="h-9 text-xs font-medium text-slate-900"
                                    />
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="font-semibold text-slate-800 block">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("online")}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${paymentMethod === "online"
                                                    ? "border-[#312E81] bg-indigo-50/50 text-[#312E81]"
                                                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span>UPI / Online Pay</span>
                                            {paymentMethod === "online" && <Check size={14} />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("on_arrival")}
                                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${paymentMethod === "on_arrival"
                                                    ? "border-[#312E81] bg-indigo-50/50 text-[#312E81]"
                                                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                                                }`}
                                        >
                                            <span>Pay on Arrival</span>
                                            {paymentMethod === "on_arrival" && <Check size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="gap-2 pt-2 border-t">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsBookingModalOpen(false)}
                                    disabled={isSubmittingBooking}
                                    className="text-xs text-slate-700 font-semibold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleConfirmBooking}
                                    disabled={isSubmittingBooking}
                                    className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-medium tracking-wide gap-1.5 shadow-sm rounded-sm"
                                >
                                    {isSubmittingBooking ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            Locking Reservation...
                                        </>
                                    ) : (
                                        "Confirm & Reserve"
                                    )}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* 6. FULL-SCREEN GALLERY LIGHTBOX */}
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
