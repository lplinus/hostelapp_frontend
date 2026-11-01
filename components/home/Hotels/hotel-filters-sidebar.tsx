"use client";

import { Star, RotateCcw, Filter, Check, Sparkles } from "lucide-react";

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
        filters.maxPrice < 15000 ||
        filters.freeCancellationOnly ||
        filters.petsAllowedOnly ||
        filters.selectedAmenities.length > 0 ||
        Boolean(filters.searchQuery);

    return (
        <aside
            className={
                isDrawerMode
                    ? "w-full bg-transparent p-0 space-y-6"
                    : "bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 space-y-6"
            }
        >
            {/* Header - Shown only in inline/sidebar mode */}
            {!isDrawerMode && (
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-[#312E81]" />
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Filter Stays</h3>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {filteredCount} of {totalCount}
                        </span>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={onReset}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#312E81] hover:underline"
                        >
                            <RotateCcw size={11} />
                            Clear All
                        </button>
                    )}
                </div>
            )}

            {/* 1. Star Rating */}
            <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Star Rating
                </h4>
                <div className="space-y-1.5">
                    {STAR_OPTIONS.map((star) => {
                        const isChecked = filters.starRatings.includes(star);
                        return (
                            <label
                                key={star}
                                className="flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:bg-slate-50/80 cursor-pointer text-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleStarToggle(star)}
                                        className="w-4 h-4 rounded text-[#312E81] focus:ring-[#312E81] border-slate-300"
                                    />
                                    <div className="flex items-center gap-0.5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                size={13}
                                                className={i < star ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-slate-800 text-[11px] ml-1">
                                        {star}-Star
                                    </span>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* 2. Hotel Types */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Property Type
                </h4>
                <div className="space-y-1.5">
                    {HOTEL_TYPES.map((type) => {
                        const isChecked = filters.hotelTypes.includes(type.id);
                        return (
                            <label
                                key={type.id}
                                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleTypeToggle(type.id)}
                                    className="w-4 h-4 rounded text-[#312E81] focus:ring-[#312E81] border-slate-300"
                                />
                                <span className={isChecked ? "font-bold text-slate-900" : "font-medium"}>
                                    {type.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* 3. Max Price Slider */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Budget Per Night
                    </h4>
                    <span className="text-xs font-extrabold text-[#312E81]">
                        Up to ₹{filters.maxPrice.toLocaleString("en-IN")}
                    </span>
                </div>
                <input
                    type="range"
                    min={1500}
                    max={15000}
                    step={500}
                    value={filters.maxPrice}
                    onChange={(e) =>
                        onFilterChange({ ...filters, maxPrice: Number(e.target.value) })
                    }
                    className="w-full accent-[#312E81] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>₹1,500</span>
                    <span>₹8,000</span>
                    <span>₹15,000+</span>
                </div>
            </div>

            {/* 4. Booking Policies & Perks */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Booking Policies
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                        type="checkbox"
                        checked={filters.freeCancellationOnly}
                        onChange={(e) =>
                            onFilterChange({ ...filters, freeCancellationOnly: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#312E81] focus:ring-[#312E81] border-slate-300"
                    />
                    <span className="font-medium">Free Cancellation Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                        type="checkbox"
                        checked={filters.petsAllowedOnly}
                        onChange={(e) =>
                            onFilterChange({ ...filters, petsAllowedOnly: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-[#312E81] focus:ring-[#312E81] border-slate-300"
                    />
                    <span className="font-medium">Pet Friendly Stays</span>
                </label>
            </div>

            {/* 5. Popular Amenities */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Key Amenities
                </h4>
                <div className="space-y-1.5">
                    {POPULAR_AMENITIES.map((amenity) => {
                        const isChecked = filters.selectedAmenities.includes(amenity);
                        return (
                            <label
                                key={amenity}
                                className="flex items-center gap-2 cursor-pointer text-xs text-slate-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleAmenityToggle(amenity)}
                                    className="w-4 h-4 rounded text-[#312E81] focus:ring-[#312E81] border-slate-300"
                                />
                                <span className={isChecked ? "font-bold text-slate-900" : "font-medium"}>
                                    {amenity}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
