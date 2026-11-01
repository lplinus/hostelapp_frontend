"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import HotelGrid from "./hotel-grid";
import HotelFiltersSidebar, { HotelFilterState } from "./hotel-filters-sidebar";
import { Hotel } from "@/types/hotel.types";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";

interface HotelsLayoutProps {
    readonly hotels: readonly Hotel[];
}

const INITIAL_FILTERS: HotelFilterState = {
    searchQuery: "",
    starRatings: [],
    hotelTypes: [],
    maxPrice: 15000,
    freeCancellationOnly: false,
    petsAllowedOnly: false,
    selectedAmenities: [],
};

export default function HotelsLayout({ hotels }: HotelsLayoutProps) {
    const [filters, setFilters] = useState<HotelFilterState>(INITIAL_FILTERS);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setIsFiltering(true);
        const timer = setTimeout(() => {
            setIsFiltering(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters]);

    // Dynamic Filter Engine
    const filteredHotels = useMemo(() => {
        return hotels.filter((hotel) => {
            // 1. Search Query (name, area, city, tagline)
            if (filters.searchQuery.trim()) {
                const query = filters.searchQuery.toLowerCase();
                const matchesName = hotel.name.toLowerCase().includes(query);
                const matchesArea = hotel.area_name?.toLowerCase().includes(query);
                const matchesCity = hotel.city_name?.toLowerCase().includes(query);
                const matchesTagline = hotel.tagline?.toLowerCase().includes(query);
                if (!matchesName && !matchesArea && !matchesCity && !matchesTagline) {
                    return false;
                }
            }

            // 2. Star Rating
            if (filters.starRatings.length > 0) {
                const hotelStars = hotel.star_rating || 5;
                if (!filters.starRatings.includes(hotelStars)) {
                    return false;
                }
            }

            // 3. Hotel Types
            if (filters.hotelTypes.length > 0) {
                const currentType = (hotel.hotel_type || "").toLowerCase();
                if (!filters.hotelTypes.includes(currentType)) {
                    return false;
                }
            }

            // 4. Max Price
            const startingPrice = parseFloat(hotel.starting_price_per_night || "0");
            if (startingPrice > 0 && startingPrice > filters.maxPrice) {
                return false;
            }

            // 5. Free Cancellation
            if (filters.freeCancellationOnly && hotel.cancellation_policy !== "free_cancellation") {
                return false;
            }

            // 6. Pets Allowed
            if (filters.petsAllowedOnly && !hotel.allows_pets) {
                return false;
            }

            // 7. Amenities
            if (filters.selectedAmenities.length > 0) {
                const hotelAmenityNames = (hotel.amenities_list || []).map((a) => a.name.toLowerCase());
                const matchesAllAmenities = filters.selectedAmenities.every((amenity) =>
                    hotelAmenityNames.includes(amenity.toLowerCase())
                );
                if (!matchesAllAmenities) {
                    return false;
                }
            }

            return true;
        });
    }, [hotels, filters]);

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20">
            {/* HERO / SEARCH HEADER - Matches Home Hero Background & Colors */}
            <section className="relative min-h-[410px] sm:min-h-[440px] md:min-h-[470px] pt-[84px] sm:pt-[92px] md:pt-[104px] pb-10 sm:pb-12 md:pb-14 flex items-center justify-center bg-[#0F172A] z-[5] overflow-hidden">
                {/* 1. BACKGROUND - High-Clarity Luxury Hotel Visual & Crisp Scrim */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="/images/hero-hotel-luxury.webp"
                        alt="Hotels & Luxury Suites Hero Background"
                        fill
                        priority
                        quality={85}
                        sizes="100vw"
                        className="object-cover object-center scale-[1.01] transform transition-transform duration-1000 filter contrast-[1.04] saturate-[1.05]"
                    />
                    {/* High-Clarity Scrim - Preserves rich daylight & turquoise pool clarity */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/65 via-[#0B1120]/30 to-[#0B1120]/80" />
                    <div className="absolute inset-0 bg-radial-[at_center] from-transparent via-transparent to-[#0B1120]/35 pointer-events-none" />
                </div>

                {/* 2. CONTENT CONTAINER (Centered in the middle, balanced responsive spacing) */}
                <div className="relative z-10 container mx-auto px-4 sm:px-6 py-2 md:py-3 max-w-5xl flex flex-col items-center text-center overflow-visible">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="w-full max-w-4xl mx-auto flex flex-col items-center text-center"
                    >
                        {/* TOP TAG */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-black/40 backdrop-blur-md rounded-md mb-2 md:mb-2.5 border border-white/20">
                            <Sparkles size={13} className="text-amber-300" />
                            <span className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-white drop-shadow-sm">
                                Premium Hospitality &amp; Daily Tariffs
                            </span>
                        </div>

                        {/* HEADLINE */}
                        <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-medium text-white leading-[1.15] mb-2 md:mb-2.5 tracking-tight text-center drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                            Hotels &amp; Luxury Suites
                        </h1>

                        {/* SUBTEXT */}
                        <p className="font-sans text-sm sm:text-base md:text-lg text-slate-100 max-w-xl font-normal leading-relaxed mb-6 md:mb-7 text-center mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
                            Reserve verified luxury suites, boutique stays, and executive business hotels with daily check-ins and world-class service.
                        </p>

                        {/* [PLAIN SEARCH BAR] - Centered in middle, exact same width (max-w-4xl) as home hero */}
                        <div className="w-full max-w-4xl mx-auto relative z-30">
                            <div className="relative flex items-center bg-white rounded-lg p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-slate-200 focus-within:border-black focus-within:ring-2 focus-within:ring-indigo-400/30 transition-all">
                                <div className="pl-3.5 pr-2 text-slate-400 shrink-0">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by hotel name, city (e.g. Hyderabad), area, or landmark..."
                                    value={filters.searchQuery}
                                    onChange={(e) =>
                                        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                                    }
                                    className="w-full py-2.5 sm:py-3 pr-3 text-slate-900 placeholder:text-slate-400 text-sm md:text-[15px] font-medium bg-transparent border-0 focus:outline-none"
                                />
                                {filters.searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                                        className="p-1.5 mr-1 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
                                        aria-label="Clear search"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const section = document.getElementById("hotels-listing-section");
                                        if (section) {
                                            section.scrollIntoView({ behavior: "smooth" });
                                        }
                                    }}
                                    className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium text-sm rounded-md transition-all shadow-md active:scale-95 shrink-0"
                                >
                                    <Search size={16} strokeWidth={2.5} />
                                    <span>Search</span>
                                </button>
                            </div>

                            {/* Popular Location Data Chips */}
                            <div className="flex items-center justify-center gap-2 flex-wrap mt-3.5 md:mt-4 text-xs">
                                <span className="text-gray-300 font-medium">Popular:</span>
                                {["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Pune", "Delhi"].map((city) => (
                                    <button
                                        key={city}
                                        type="button"
                                        onClick={() => {
                                            setFilters((prev) => ({ ...prev, searchQuery: city }));
                                        }}
                                        className={`px-2.5 py-1 rounded-md backdrop-blur-sm border transition-all font-medium text-xs active:scale-95 ${
                                            filters.searchQuery.toLowerCase() === city.toLowerCase()
                                                ? "bg-white text-[#0F172A] border-white font-semibold"
                                                : "bg-white/10 hover:bg-white/20 text-white border-white/10"
                                        }`}
                                    >
                                        {city}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* MAIN CONTENT AREA */}
            <div id="hotels-listing-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 scroll-mt-6">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden mb-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs">
                    <span className="text-xs font-bold text-slate-800">
                        {filteredHotels.length} Stays Available
                    </span>
                    <button
                        type="button"
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1B4B] text-white text-xs font-semibold shadow-xs hover:bg-[#312E81] transition-colors cursor-pointer"
                    >
                        <SlidersHorizontal size={14} className="text-white" />
                        <span>Filter Stays</span>
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8 items-start">
                    {/* LEFT / MAIN LISTINGS GRID (8 cols on lg) */}
                    <div className="col-span-12 lg:col-span-8">
                        <HotelGrid
                            hotels={filteredHotels}
                            isFiltering={isFiltering}
                            onResetFilters={handleResetFilters}
                            onOpenFilter={() => setIsMobileFilterOpen(true)}
                        />
                    </div>

                    {/* RIGHT / STICKY FILTER SIDEBAR (4 cols on lg) */}
                    <div className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-24">
                            <HotelFiltersSidebar
                                filters={filters}
                                onFilterChange={setFilters}
                                onReset={handleResetFilters}
                                totalCount={hotels.length}
                                filteredCount={filteredHotels.length}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* OFF-CANVAS RIGHT-SIDE SLIDE-OVER DRAWER (Uniform with Vacation Rentals) */}
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl gap-0 z-50 overflow-hidden"
                >
                    {/* Sticky Header */}
                    <SheetHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-200 flex flex-row items-center justify-between space-y-0 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#312E81] flex items-center justify-center">
                                <SlidersHorizontal className="w-4 h-4 text-[#312E81]" />
                            </div>
                            <div>
                                <SheetTitle className="text-base font-extrabold text-slate-950 tracking-tight">
                                    Filter Stays
                                </SheetTitle>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    {filteredHotels.length} of {hotels.length} stays available
                                </p>
                            </div>
                        </div>
                        <SheetClose className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer" aria-label="Close filters">
                            <X className="w-5 h-5" />
                        </SheetClose>
                    </SheetHeader>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 overscroll-contain">
                        <HotelFiltersSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onReset={handleResetFilters}
                            totalCount={hotels.length}
                            filteredCount={filteredHotels.length}
                            isDrawerMode={true}
                        />
                    </div>

                    {/* Sticky Bottom Actions */}
                    <div className="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md border-t border-slate-200 px-5 py-3.5 flex items-center gap-3 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                        >
                            Reset All
                        </button>
                        <SheetClose asChild>
                            <button
                                type="button"
                                className="flex-1 py-2.5 px-4 bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md active:scale-98 cursor-pointer text-center"
                            >
                                Show {filteredHotels.length} Stays
                            </button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
