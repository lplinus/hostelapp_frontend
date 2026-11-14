"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Star,
    Sparkles,
    CheckCircle2,
    Users,
    Bed,
    Bath,
    Palmtree,
    Zap,
    Heart,
    ChevronLeft,
    ChevronRight,
    PawPrint,
    ShieldCheck
} from "lucide-react";
import type { VacationRental } from "@/types/vacationrental.types";
import { isExternalImage } from "@/lib/utils";
import { toast } from "sonner";

interface VacationRentalCardProps {
    readonly rental: VacationRental;
}

export default function VacationRentalCard({ rental }: VacationRentalCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    // Gallery images
    const images = rental.images && rental.images.length > 0 ? rental.images : [];
    const activeImage = images[currentImageIndex]?.image || rental.og_image || null;

    // Price formatting
    const priceNum = parseFloat(rental.price_per_night || "0");
    const formattedPrice = priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "Rates on Request";

    // Rating
    const rating = parseFloat(rental.rating_avg || "4.9");
    const reviewCount = rental.rating_count || 12;

    const handlePrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const toggleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
        toast.success(isSaved ? "Removed from Wishlist" : "Saved to Wishlist!");
    };

    const categoryLabel = rental.category_display || rental.category || "Vacation Villa";

    return (
        <div className="group bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col h-full">
            {/* 1. MEDIA CAROUSEL CONTAINER */}
            <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden shrink-0">
                <Link href={`/vacanationalrental/${rental.slug}/`} className="block w-full h-full">
                    {activeImage ? (
                        <Image
                            src={activeImage}
                            alt={rental.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 380px"
                            className="object-cover object-center"
                            unoptimized={isExternalImage(activeImage)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2 p-4">
                            <Palmtree className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                            <span className="text-xs font-medium text-slate-400">Vacation Home Photo</span>
                        </div>
                    )}
                </Link>

                {/* SUPERHOST BADGE (Glossy rectangular finish with less soft corners, no icon) */}
                {rental.is_superhost && (
                    <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-xs text-[9px] font-semibold tracking-wider uppercase bg-white/85 text-slate-900 shadow-xs border border-white/60 backdrop-blur-md">
                            Superhost
                        </span>
                    </div>
                )}

                {/* WISHLIST BUTTON */}
                <button
                    onClick={toggleSave}
                    aria-label="Save to Wishlist"
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 shadow-sm z-10"
                >
                    <Heart
                        size={16}
                        className={isSaved ? "fill-rose-500 text-rose-500" : "text-slate-700"}
                    />
                </button>

                {/* CAROUSEL ARROWS */}
                {images.length > 1 && (
                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                            onClick={handlePrev}
                            aria-label="Previous Photo"
                            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform active:scale-95"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={handleNext}
                            aria-label="Next Photo"
                            className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center shadow-md transition-transform active:scale-95"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* 2. CARD CONTENT */}
            <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                    {/* Location & Rating Header */}
                    <div className="flex items-center justify-between text-xs text-slate-500 h-5">
                        <div className="flex items-center gap-1 font-medium text-slate-600 truncate max-w-[200px]">
                            <MapPin size={13} className="text-rose-500 shrink-0" />
                            <span className="truncate">
                                {rental.area_name ? `${rental.area_name}, ` : ""}
                                {rental.city_name || "India"}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 font-semibold text-slate-900 shrink-0">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>{rating.toFixed(2)}</span>
                            <span className="text-slate-400 font-normal">({reviewCount})</span>
                        </div>
                    </div>

                    {/* Title */}
                    <Link href={`/vacanationalrental/${rental.slug}/`} className="block">
                        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-950 transition-colors truncate">
                            {rental.title}
                        </h3>
                    </Link>

                    {/* Tagline / Subtitle */}
                    <p className="text-xs text-slate-500 truncate italic h-4">
                        {rental.tagline ? `"${rental.tagline}"` : "\u00A0"}
                    </p>

                    {/* Space Breakdown Badges (Guaranteed Single Line, No Wrapping) */}
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium whitespace-nowrap overflow-hidden h-5">
                        <span className="inline-flex items-center gap-1 shrink-0">
                            <Users size={12} className="text-slate-400" />
                            {rental.max_guests} Guests
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 shrink-0">
                            <Bed size={12} className="text-slate-400" />
                            {rental.bedrooms} Bed{rental.bedrooms > 1 ? "s" : ""}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="inline-flex items-center gap-1 shrink-0">
                            <Bath size={12} className="text-slate-400" />
                            {rental.bathrooms} Bath{rental.bathrooms > 1 ? "s" : ""}
                        </span>
                    </div>

                    {/* Property Terms (Villa, Farmhouse, Instant Book, Pet-Friendly) - Fixed Height Row */}
                    <div className="flex items-center gap-1.5 flex-wrap h-6 overflow-hidden">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs shrink-0">
                            {categoryLabel}
                        </span>

                        {rental.instant_book && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs shrink-0">
                                Instant Book
                            </span>
                        )}

                        {rental.allows_pets && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-semibold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs shrink-0">
                                Pet-Friendly
                            </span>
                        )}
                    </div>
                </div>

                {/* Footer / Pricing & CTA (Always Locked on Equal Level) */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <div className="min-w-0">
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                                {formattedPrice}
                            </span>
                            <span className="text-xs text-slate-500 font-normal">/ night</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                            {rental.weekly_discount_percentage > 0
                                ? `${rental.weekly_discount_percentage}% off for 7+ nights`
                                : "No hidden charges"}
                        </p>
                    </div>

                    <Link
                        href={`/vacanationalrental/${rental.slug}/`}
                        className="px-4 py-2 rounded-sm text-xs font-medium tracking-wide bg-[#1E1B4B] hover:bg-[#312E81] text-white shadow-xs transition-colors shrink-0 active:scale-95"
                    >
                        Reserve
                    </Link>
                </div>
            </div>
        </div>
    );
}
