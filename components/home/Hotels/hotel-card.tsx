"use client";

import { useState } from "react";
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
    Building2,
    CalendarCheck,
    Coffee
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

    return (
        <div
            onMouseLeave={() => setIsAmenitiesExpanded(false)}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-none w-full"
        >
            <div className="flex flex-col md:flex-row items-stretch">
                {/* 1. IMAGE CONTAINER (Flush, Rectangular, No Upper Gap) */}
                <div className="relative w-full md:w-[320px] lg:w-[340px] h-56 md:h-auto min-h-[220px] bg-slate-100 shrink-0 overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={hotel.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 340px"
                            className="object-cover object-center"
                            unoptimized={isExternalImage(imageUrl)}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-2 p-4">
                            <Building2 className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                            <span className="text-xs font-medium text-slate-400">Luxury Hotel Photo</span>
                        </div>
                    )}

                    {/* BADGES ON IMAGE */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                        {/* Rectangular Hotel Type Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase bg-[#312E81] text-white shadow-sm border border-indigo-900/20">
                            <Sparkles size={10} className="text-amber-300" />
                            {typeLabel}
                        </span>

                        {isFreeCancellation && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase bg-emerald-700 text-white shadow-sm">
                                <CheckCircle2 size={10} />
                                Free Cancellation
                            </span>
                        )}
                    </div>

                    {/* Star Rating Badge on Bottom-Left of Image */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-[2px] px-2.5 py-1 rounded-md flex items-center gap-1 text-white z-10">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < starCount ? "fill-amber-400 text-amber-400" : "fill-slate-500 text-slate-500"}`}
                                />
                            ))}
                        </div>
                        <span className="text-[11px] font-bold ml-1 text-amber-300">
                            {hotel.star_rating || 5}-Star
                        </span>
                    </div>
                </div>

                {/* 2. HOTEL DETAILS CONTENT */}
                <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-3 min-w-0">
                    <div className="space-y-2">
                        {/* Top Row: Type & Star Rating & Status */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-[#312E81] uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                                    {hotel.city_name || "City Center"}
                                </span>
                                {hotel.is_verified && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#312E81] bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200/80">
                                        <ShieldCheck size={12} />
                                        Verified Property
                                    </span>
                                )}
                            </div>

                            {/* Reviews / Rating Score */}
                            <div className="flex items-center gap-1.5 text-right">
                                <div className="text-right">
                                    <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                                        {parseFloat(String(hotel.rating_avg || 0)) >= 4.5
                                            ? "Exceptional"
                                            : parseFloat(String(hotel.rating_avg || 0)) >= 4.0
                                                ? "Excellent"
                                                : "Top Rated"}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {hotel.rating_count ? `${hotel.rating_count} guest reviews` : "Verified stay reviews"}
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-lg bg-[#312E81] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                                    {parseFloat(String(hotel.rating_avg || 0)) > 0
                                        ? parseFloat(String(hotel.rating_avg)).toFixed(1)
                                        : "5.0"}
                                </div>
                            </div>
                        </div>

                        {/* Title & Tagline */}
                        <div>
                            <Link
                                href={`/hotels/${hotel.slug}`}
                                className="text-lg md:text-xl font-bold text-slate-900 leading-snug hover:text-[#312E81] transition-none block truncate"
                            >
                                {hotel.name}
                            </Link>
                            {hotel.tagline && (
                                <p className="text-xs text-slate-500 font-medium italic mt-0.5 truncate">
                                    &ldquo;{hotel.tagline}&rdquo;
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#312E81] shrink-0" />
                            <span className="truncate">
                                {[hotel.area_name, hotel.city_name, hotel.postal_code].filter(Boolean).join(", ") || hotel.address}
                            </span>
                        </div>

                        {/* Amenities Chips with Expand / Collapse on Pointer Exit */}
                        {hotel.amenities_list && hotel.amenities_list.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                {(isAmenitiesExpanded
                                    ? hotel.amenities_list
                                    : hotel.amenities_list.slice(0, 4)
                                ).map((amenity) => (
                                    <span
                                        key={amenity.id}
                                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-700"
                                    >
                                        <CheckCircle2 size={11} className="text-[#312E81] shrink-0" />
                                        {amenity.name}
                                    </span>
                                ))}

                                {hotel.amenities_list.length > 4 && !isAmenitiesExpanded && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsAmenitiesExpanded(true);
                                        }}
                                        className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-md bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/70 text-[11px] font-bold text-[#312E81] transition-none cursor-pointer"
                                        title="Click to view all amenities"
                                    >
                                        +{hotel.amenities_list.length - 4} more
                                    </button>
                                )}

                                {isAmenitiesExpanded && hotel.amenities_list.length > 4 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsAmenitiesExpanded(false);
                                        }}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-semibold text-slate-600 transition-none cursor-pointer"
                                    >
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Room Categories preview */}
                        {hotel.room_types && hotel.room_types.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-600 pt-0.5">
                                <BedDouble size={14} className="text-[#312E81] shrink-0" />
                                <span className="font-semibold text-slate-800">
                                    {hotel.room_types[0].category_display || hotel.room_types[0].name}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-slate-500 text-[11px]">
                                    {hotel.room_types[0].bed_display || "King/Queen Bed"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 3. FOOTER ROW: Check-in, Pricing & Solid Dark Blue Button */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-3 mt-1">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                                <Clock size={12} className="text-slate-400" />
                                <span>Check-in: {hotel.check_in_time ? hotel.check_in_time.slice(0, 5) : "14:00"}</span>
                                <span>•</span>
                                <span>Check-out: {hotel.check_out_time ? hotel.check_out_time.slice(0, 5) : "11:00"}</span>
                            </div>

                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                Starting Tariff / Night
                            </span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                                    {formattedPrice}
                                </span>
                                <span className="text-xs text-slate-500 font-medium">/ night</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                                + taxes & applicable service charges
                            </span>
                        </div>

                        {/* Solid Dark Blue Action Button */}
                        <Link
                            href={`/hotels/${hotel.slug}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-medium tracking-wider transition-all shadow-sm shrink-0 uppercase active:scale-[0.98]"
                        >
                            Reserve
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
