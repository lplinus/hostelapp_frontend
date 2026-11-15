"use client";

import { Star, RotateCcw, Filter, Check, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

export interface HotelFilterState {
    searchQuery: string;
    starRatings: number[];
    hotelTypes: string[];
    maxPrice: number;
    freeCancellationOnly: boolean;
    petsAllowedOnly: boolean;
    selectedAmenities: string[];
}

interface HotelFiltersSidebarProps {
    readonly filters: HotelFilterState;
    readonly onFilterChange: (filters: HotelFilterState) => void;
    readonly onReset: () => void;
    readonly totalCount: number;
    readonly filteredCount: number;
    readonly isDrawerMode?: boolean;
}

const STAR_OPTIONS = [5, 4, 3];

const HOTEL_TYPES = [
    { id: "luxury", label: "Luxury Hotel & Suites" },
    { id: "boutique", label: "Boutique Hotel" },
    { id: "business", label: "Business Hotel" },
    { id: "resort", label: "Resort & Spa" },
    { id: "budget", label: "Budget Friendly" },
];

const POPULAR_AMENITIES = [
    "High-Speed Wi-Fi",
    "Air Conditioning",
    "Hot Showers",
    "Co-working Space",
    "Bed Linens Included",
    "Luggage Storage",
];

export default function HotelFiltersSidebar({
    filters,
    onFilterChange,
    onReset,
    totalCount,
    filteredCount,
    isDrawerMode = false,
}: HotelFiltersSidebarProps) {
    const handleStarToggle = (star: number) => {
        const current = new Set(filters.starRatings);
        if (current.has(star)) {
            current.delete(star);
        } else {
            current.add(star);
        }
        onFilterChange({ ...filters, starRatings: Array.from(current) });
    };

    const handleTypeToggle = (typeId: string) => {
        const current = new Set(filters.hotelTypes);
        if (current.has(typeId)) {
            current.delete(typeId);
        } else {
            current.add(typeId);
        }
        onFilterChange({ ...filters, hotelTypes: Array.from(current) });
    };

    const handleAmenityToggle = (amenityName: string) => {
        const current = new Set(filters.selectedAmenities);
        if (current.has(amenityName)) {
            current.delete(amenityName);
        } else {
            current.add(amenityName);
        }
        onFilterChange({ ...filters, selectedAmenities: Array.from(current) });
    };

    const hasActiveFilters =
        filters.starRatings.length > 0 ||
        filters.hotelTypes.length > 0 ||
        filters.maxPrice < 250000 ||
        filters.freeCancellationOnly ||
        filters.petsAllowedOnly ||
        filters.selectedAmenities.length > 0 ||
        Boolean(filters.searchQuery);

    return (
        <aside
            className={
                isDrawerMode
                    ? "w-full bg-transparent p-0 space-y-4"
                    : "bg-white rounded-md border border-slate-200/90 shadow-xs p-3.5 sm:p-4 flex flex-col max-h-[calc(100vh-6rem)]"
            }
        >
            {/* Header - Standard & fixed at top of card (never scrolls away) */}
            {!isDrawerMode && (
                <div className="flex items-center justify-between pb-2.5 mb-1 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-1.5">
                        <Filter size={14} className="text-[#1E1B4B]" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Filter Stays</h3>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                            {filteredCount}/{totalCount}
                        </span>
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#1E1B4B] hover:underline cursor-pointer"
                        >
                            <RotateCcw size={10} />
                            Clear All
                        </button>
                    )}
                </div>
            )}

            {/* Scrollable Items List within the Card (Clean scroll without visible scrollbar) */}
            <div
                className={
                    isDrawerMode
                        ? "space-y-4"
                        : "flex-1 overflow-y-auto pr-0 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
                }
            >
                {/* 1. Star Rating */}
                <div className="space-y-1.5">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800">
                        Star Rating
                    </h4>
                    <div className={isDrawerMode ? "space-y-1.5" : "space-y-1"}>
                        {STAR_OPTIONS.map((star) => {
                            const isChecked = filters.starRatings.includes(star);
                            return (
                                <label
                                    key={star}
                                    className={`flex items-center justify-between ${
                                        isDrawerMode ? "py-2 px-2.5" : "py-1 px-1.5"
                                    } rounded-md hover:bg-slate-50/90 active:bg-slate-100 cursor-pointer text-xs sm:text-[11px] transition-colors select-none`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Checkbox
                                            checked={isChecked}
                                            onCheckedChange={() => handleStarToggle(star)}
                                            className="h-4 w-4 data-[state=checked]:bg-[#1E1B4B] data-[state=checked]:border-[#1E1B4B]"
                                        />
                                        <div className="flex items-center gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={isDrawerMode ? 13 : 11}
                                                    className={i < star ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-semibold text-slate-800 text-xs sm:text-[11px] ml-0.5">
                                            {star}-Star
                                        </span>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Hotel Types */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800">
                        Property Type
                    </h4>
                    <div className={isDrawerMode ? "space-y-1.5" : "space-y-1"}>
                        {HOTEL_TYPES.map((type) => {
                            const isChecked = filters.hotelTypes.includes(type.id);
                            return (
                                <label
                                    key={type.id}
                                    className={`flex items-center gap-2.5 ${
                                        isDrawerMode ? "py-2 px-2.5" : "py-0.5 px-1"
                                    } rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-xs sm:text-[11px] text-slate-700 transition-colors select-none`}
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => handleTypeToggle(type.id)}
                                        className="h-4 w-4 data-[state=checked]:bg-[#1E1B4B] data-[state=checked]:border-[#1E1B4B]"
                                    />
                                    <span className={isChecked ? "font-bold text-slate-900" : "font-medium"}>
                                        {type.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Max Price Slider (Up to 2.5 Lakhs) */}
                <div className="space-y-2 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800">
                            Budget Per Night
                        </h4>
                        <span className="text-xs sm:text-[11px] font-extrabold text-[#1E1B4B] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                            Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <Slider
                        value={[filters.maxPrice]}
                        min={1500}
                        max={250000}
                        step={2500}
                        onValueChange={(val) =>
                            onFilterChange({ ...filters, maxPrice: val[0] })
                        }
                        className={isDrawerMode ? "py-2" : "py-1"}
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>₹1,500</span>
                        <span>₹1.25L</span>
                        <span>₹2.5L+</span>
                    </div>
                </div>

                {/* 4. Booking Policies & Perks */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800">
                        Booking Policies
                    </h4>
                    <div className={isDrawerMode ? "space-y-1.5" : "space-y-1"}>
                        <label className={`flex items-center gap-2.5 ${
                            isDrawerMode ? "py-2 px-2.5" : "py-0.5 px-1"
                        } rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-xs sm:text-[11px] text-slate-700 transition-colors select-none`}>
                            <Checkbox
                                checked={filters.freeCancellationOnly}
                                onCheckedChange={(checked) =>
                                    onFilterChange({ ...filters, freeCancellationOnly: Boolean(checked) })
                                }
                                className="h-4 w-4 data-[state=checked]:bg-[#1E1B4B] data-[state=checked]:border-[#1E1B4B]"
                            />
                            <span className={filters.freeCancellationOnly ? "font-bold text-slate-900" : "font-medium"}>
                                Free Cancellation Available
                            </span>
                        </label>
                        <label className={`flex items-center gap-2.5 ${
                            isDrawerMode ? "py-2 px-2.5" : "py-0.5 px-1"
                        } rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-xs sm:text-[11px] text-slate-700 transition-colors select-none`}>
                            <Checkbox
                                checked={filters.petsAllowedOnly}
                                onCheckedChange={(checked) =>
                                    onFilterChange({ ...filters, petsAllowedOnly: Boolean(checked) })
                                }
                                className="h-4 w-4 data-[state=checked]:bg-[#1E1B4B] data-[state=checked]:border-[#1E1B4B]"
                            />
                            <span className={filters.petsAllowedOnly ? "font-bold text-slate-900" : "font-medium"}>
                                Pet Friendly Stays
                            </span>
                        </label>
                    </div>
                </div>

                {/* 5. Popular Amenities */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                    <h4 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800">
                        Key Amenities
                    </h4>
                    <div className={isDrawerMode ? "space-y-1.5" : "space-y-0.5"}>
                        {POPULAR_AMENITIES.map((amenity) => {
                            const isChecked = filters.selectedAmenities.includes(amenity);
                            return (
                                <label
                                    key={amenity}
                                    className={`flex items-center gap-2.5 ${
                                        isDrawerMode ? "py-2 px-2.5" : "py-0.5 px-1"
                                    } rounded-md hover:bg-slate-50 active:bg-slate-100 cursor-pointer text-xs sm:text-[11px] text-slate-700 transition-colors select-none`}
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => handleAmenityToggle(amenity)}
                                        className="h-4 w-4 data-[state=checked]:bg-[#1E1B4B] data-[state=checked]:border-[#1E1B4B]"
                                    />
                                    <span className={isChecked ? "font-bold text-slate-900" : "font-medium"}>
                                        {amenity}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </aside>
    );
}
