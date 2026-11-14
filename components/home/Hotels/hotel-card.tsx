"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    MapPin,
    Star,
    CheckCircle2,
    Clock,
    BedDouble,
    ShieldCheck,
    Building2
} from "lucide-react";
import { Hotel } from "@/types/hotel.types";
import { isExternalImage } from "@/lib/utils";

interface HotelCardProps {
    readonly hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
    const [isAmenitiesExpanded, setIsAmenitiesExpanded] = useState(false);

    // Primary image resolution
    const primaryImg = hotel.images?.find((img) => img.is_primary) || hotel.images?.[0];
    const imageUrl = primaryImg?.image || null;

    // Price formatting
    const priceNum = parseFloat(hotel.starting_price_per_night || "0");
    const formattedPrice = priceNum > 0 ? `₹${priceNum.toLocaleString("en-IN")}` : "Rates on Request";

    // Star rating generator (up to 5 stars)
    const starCount = Math.max(1, Math.min(5, hotel.star_rating || 5));

    // Type display
    const typeLabel = (hotel.hotel_type_display || hotel.hotel_type || "Luxury Hotel").toUpperCase();

    // Cancellation policy display
    const isFreeCancellation = hotel.cancellation_policy === "free_cancellation";

    const ratingVal = parseFloat(String(hotel.rating_avg || 0));
    const ratingDisplay = ratingVal > 0 ? ratingVal.toFixed(1) : "5.0";
    const ratingLabel = ratingVal >= 4.5
        ? "Exceptional"
        : ratingVal >= 4.0
            ? "Excellent"
            : "Top Rated";

    return (
        <div
            onMouseLeave={() => setIsAmenitiesExpanded(false)}
            className="group bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300/90 overflow-hidden transition-all duration-200 w-full"
        >
            <div className="flex flex-col md:flex-row items-stretch">
                {/* 1. COMPACT LUXURY IMAGE CONTAINER (Clickable & No Zoom on Hover) */}
                <Link
                    href={`/hotels/${hotel.slug}`}
                    className="relative block w-full md:w-[240px] lg:w-[260px] h-52 md:h-auto min-h-[200px] md:min-h-[210px] bg-slate-100 shrink-0 overflow-hidden cursor-pointer"
                >
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={hotel.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 260px"
                            className="object-cover object-center"
                            unoptimized={isExternalImage(imageUrl)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2 p-4">
                            <Building2 className="w-9 h-9 text-slate-300" strokeWidth={1.5} />
                            <span className="text-[11px] font-medium text-slate-400">Luxury Hotel Photo</span>
                        </div>
                    )}

                    {/* Gradient Overlay for bottom badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 pointer-events-none" />

                    {/* BADGES ON IMAGE (TOP-LEFT - Glossy rectangular with less soft corners) */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[9px] font-semibold tracking-wider uppercase bg-white/85 text-slate-900 shadow-xs border border-white/60 backdrop-blur-md">
                            {typeLabel}
                        </span>

                        {isFreeCancellation && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[9px] font-semibold tracking-wider uppercase bg-white/85 text-emerald-800 shadow-xs border border-white/60 backdrop-blur-md">
                                Free Cancellation
                            </span>
                        )}
                    </div>

                    {/* Star Rating Badge (BOTTOM-LEFT - Glossy rectangular finish) */}
                    <div className="absolute bottom-2.5 left-2.5 bg-white/85 backdrop-blur-md border border-white/60 shadow-xs px-2 py-0.5 rounded-xs flex items-center gap-1 text-slate-900 z-10 pointer-events-none">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-2.5 h-2.5 ${i < starCount ? "fill-amber-400 text-amber-400" : "fill-slate-300 text-slate-300"}`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-semibold ml-0.5 text-slate-800">
                            {hotel.star_rating || 5}-Star
                        </span>
                    </div>
                </Link>

                {/* 2. MIDDLE & RIGHT CONTENT WRAPPER */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col md:flex-row justify-between gap-4 min-w-0">
                    {/* MIDDLE: Hotel Info & Specs */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 gap-2">
                        <div className="space-y-1.5">
                            {/* City & Verified Pill */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold text-[#312E81] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                    {hotel.city_name || "City Center"}
                                </span>
                                {hotel.is_verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        <ShieldCheck size={11} className="text-emerald-600" />
                                        Verified Property
                                    </span>
                                )}
                            </div>

                            {/* Title & Tagline */}
                            <div>
                                <Link
                                    href={`/hotels/${hotel.slug}`}
                                    className="text-base sm:text-lg font-bold text-slate-900 leading-snug hover:text-[#312E81] transition-colors block truncate"
                                >
                                    {hotel.name}
                                </Link>
                                {hotel.tagline && (
                                    <p className="text-[11px] text-slate-500 font-medium italic truncate mt-0.5">
                                        &ldquo;{hotel.tagline}&rdquo;
                                    </p>
                                )}
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#312E81] shrink-0" />
                                <span className="truncate">
                                    {[hotel.area_name, hotel.city_name, hotel.postal_code].filter(Boolean).join(", ") || hotel.address}
                                </span>
                            </div>

                            {/* Amenities Chips */}
                            {hotel.amenities_list && hotel.amenities_list.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    {(isAmenitiesExpanded
                                        ? hotel.amenities_list
                                        : hotel.amenities_list.slice(0, 3)
                                    ).map((amenity) => (
                                        <span
                                            key={amenity.id}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 border border-slate-200/80 text-[10px] font-medium text-slate-700"
                                        >
                                            <CheckCircle2 size={10} className="text-[#312E81] shrink-0" />
                                            {amenity.name}
                                        </span>
                                    ))}

                                    {hotel.amenities_list.length > 3 && !isAmenitiesExpanded && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsAmenitiesExpanded(true);
                                            }}
                                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/70 text-[10px] font-bold text-[#312E81] transition-none cursor-pointer"
                                            title="View more amenities"
                                        >
                                            +{hotel.amenities_list.length - 3} more
                                        </button>
                                    )}

                                    {isAmenitiesExpanded && hotel.amenities_list.length > 3 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsAmenitiesExpanded(false);
                                            }}
                                            className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[10px] font-semibold text-slate-600 transition-none cursor-pointer"
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Room Preview */}
                            {hotel.room_types && hotel.room_types.length > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-0.5">
                                    <BedDouble size={13} className="text-[#312E81] shrink-0" />
                                    <span className="font-semibold text-slate-800 text-[11px]">
                                        {hotel.room_types[0].category_display || hotel.room_types[0].name}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-500 text-[11px]">
                                        {hotel.room_types[0].bed_display || "King/Queen Bed"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Timing Info */}
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                            <Clock size={11} className="text-slate-400 shrink-0" />
                            <span>Check-in: {hotel.check_in_time ? hotel.check_in_time.slice(0, 5) : "14:00"}</span>
                            <span>•</span>
                            <span>Check-out: {hotel.check_out_time ? hotel.check_out_time.slice(0, 5) : "11:00"}</span>
                        </div>
                    </div>

                    {/* RIGHT SIDE: Dedicated Pricing & Action Panel */}
                    <div className="md:w-[190px] lg:w-[210px] md:border-l md:border-slate-100 md:pl-4 flex flex-col justify-between items-start md:items-end text-left md:text-right shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 gap-3">
                        {/* Rating block */}
                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                            <div className="text-left md:text-right">
                                <span className="text-xs font-bold text-slate-800 block leading-tight">
                                    {ratingLabel}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                    {hotel.rating_count ? `${hotel.rating_count} reviews` : "Verified reviews"}
                                </span>
                            </div>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#312E81] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                                {ratingDisplay}
                            </div>
                        </div>

                        {/* Price & Action Button */}
                        <div className="flex md:flex-col items-end justify-between w-full md:w-auto gap-2 md:gap-2.5">
                            <div className="text-left md:text-right">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                                    Starting Tariff
                                </span>
                                <div className="flex items-baseline md:justify-end gap-1">
                                    <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                        {formattedPrice}
                                    </span>
                                    <span className="text-[11px] text-slate-500 font-normal">/ night</span>
                                </div>
                            </div>

                            <Link
                                href={`/hotels/${hotel.slug}`}
                                className="w-full inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-semibold tracking-wider text-center transition-all shadow-xs shrink-0 uppercase active:scale-[0.98]"
                            >
                                Reserve
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
