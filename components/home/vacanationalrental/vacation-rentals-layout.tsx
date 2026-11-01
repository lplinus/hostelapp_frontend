"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import VacationRentalGrid from "./vacation-rental-grid";
import VacationRentalFiltersSidebar, { VacationRentalFilterState } from "./vacation-rental-filters-sidebar";
import type { VacationRental } from "@/types/vacationrental.types";
import {
    Search,
    X,
    Sparkles,
    Palmtree,
    Waves,
    Trees,
    Home,
    Building,
    SlidersHorizontal
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";

interface VacationRentalsLayoutProps {
    readonly rentals: readonly VacationRental[];
}

const INITIAL_FILTERS: VacationRentalFilterState = {
    searchQuery: "",
    categories: [],
    maxPrice: 35000,
    minBedrooms: 0,
    instantBookOnly: false,
    petsAllowedOnly: false,
    superhostOnly: false,
    selectedAmenities: [],
};

const CATEGORY_TABS = [
    { key: "all", label: "All Properties", icon: Sparkles },
    { key: "villa", label: "Villas", icon: Palmtree },
    { key: "beach_house", label: "Beach Houses", icon: Waves },
    { key: "cabin", label: "Cabins", icon: Trees },
    { key: "farmhouse", label: "Farmhouses", icon: Home },
    { key: "penthouse", label: "Penthouses", icon: Building },
    { key: "cottage", label: "Cottages", icon: Home },
];

export default function VacationRentalsLayout({ rentals }: VacationRentalsLayoutProps) {
    const [filters, setFilters] = useState<VacationRentalFilterState>(INITIAL_FILTERS);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("all");
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
    }, [filters, activeTab]);

    // Dynamic Filter Engine
    const filteredRentals = useMemo(() => {
        return rentals.filter((rental) => {
            // 1. Search Query
            if (filters.searchQuery.trim()) {
                const q = filters.searchQuery.toLowerCase();
                const titleMatch = rental.title.toLowerCase().includes(q);
                const cityMatch = rental.city_name?.toLowerCase().includes(q);
                const areaMatch = rental.area_name?.toLowerCase().includes(q);
                const taglineMatch = rental.tagline?.toLowerCase().includes(q);
                if (!titleMatch && !cityMatch && !areaMatch && !taglineMatch) {
                    return false;
                }
            }

            // 2. Active Tab Category Pill
            if (activeTab !== "all") {
                if (rental.category !== activeTab) {
                    return false;
                }
            }

            // 3. Sidebar Categories Checklist
            if (filters.categories.length > 0) {
                if (!filters.categories.includes(rental.category)) {
                    return false;
                }
            }

            // 4. Max Price
            const price = parseFloat(rental.price_per_night || "0");
            if (price > 0 && price > filters.maxPrice) {
                return false;
            }

            // 5. Min Bedrooms
            if (filters.minBedrooms > 0 && rental.bedrooms < filters.minBedrooms) {
                return false;
            }

            // 6. Instant Book Only
            if (filters.instantBookOnly && !rental.instant_book) {
                return false;
            }

            // 7. Pets Allowed Only
            if (filters.petsAllowedOnly && !rental.allows_pets) {
                return false;
            }

            // 8. Superhost Only
            if (filters.superhostOnly && !rental.is_superhost) {
                return false;
            }

            // 9. Amenities Checklist
            if (filters.selectedAmenities.length > 0) {
                const rentalAmenities = (rental.amenities_list || []).map((a) => a.name.toLowerCase());
                const matchesAll = filters.selectedAmenities.every((req) =>
                    rentalAmenities.includes(req.toLowerCase())
                );
                if (!matchesAll) {
                    return false;
                }
            }

            return true;
        });
    }, [rentals, filters, activeTab]);

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setActiveTab("all");
    };

    return (
        <div className="min-h-screen bg-slate-50/70 pb-20 font-sans">
            {/* 1. HERO HEADER */}
            <section className="relative min-h-[390px] sm:min-h-[420px] md:min-h-[450px] pt-[84px] sm:pt-[92px] md:pt-[104px] pb-10 sm:pb-12 md:pb-14 flex items-center justify-center bg-[#0F172A] z-[5] overflow-hidden">
                {/* Background Image Scrim */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <Image
                        src="/images/hero-home-nature.webp"
                        alt="Vacation Rentals Hero"
                        fill
                        priority
                        className="object-cover object-center opacity-30 mix-blend-luminosity scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/85 to-transparent" />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-2 md:py-3 text-center space-y-3.5 sm:space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold backdrop-blur-md">
                        <Palmtree size={14} className="text-rose-400" />
                        <span>Curated Airbnb &amp; Boutique Escapes</span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        Private Villas, Cottages &amp; Beach Escapes
                    </h1>

                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
                        Discover luxury waterfront estates, misty mountain cabins, and heritage havelis across India with verified hosts and instant booking.
                    </p>

                    {/* Integrated Quick Search Bar */}
                    <div className="max-w-2xl mx-auto pt-3">
                        <div className="relative bg-white rounded-2xl shadow-xl p-1.5 flex items-center gap-2 border border-slate-200">
                            <div className="pl-3 text-slate-400 flex items-center">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by destination (Goa, Udaipur, Mumbai...), villa name or area..."
                                value={filters.searchQuery}
                                onChange={(e) =>
                                    setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                                }
                                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent pr-2"
                            />
                            {filters.searchQuery && (
                                <button
                                    onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <button className="px-5 py-2.5 rounded-xl bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm">
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CATEGORY PILLS BAR (Flush underneath Hero) */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto py-3 scrollbar-none no-scrollbar">
                        {CATEGORY_TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        isActive
                                            ? "bg-[#1E1B4B] text-white shadow-xs"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon size={14} className={isActive ? "text-rose-300" : "text-slate-500"} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 3. MAIN CONTENT: GRID + RIGHT-SIDE SIDEBAR */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                <div className="flex items-start gap-8">
                    {/* Results Grid (Left Column - Flexible) */}
                    <div className="flex-1 min-w-0">
                        <VacationRentalGrid
                            rentals={filteredRentals}
                            isFiltering={isFiltering}
                            onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {/* Desktop Sidebar (Right Column - 280px) */}
                    <div className="hidden lg:block w-[280px] shrink-0 sticky top-32">
                        <VacationRentalFiltersSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onResetFilters={handleResetFilters}
                        />
                    </div>
                </div>
            </main>

            {/* 4. OFF-CANVAS RIGHT-SIDE SLIDE-OVER DRAWER (Uniform with Hotels) */}
            <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="w-full sm:max-w-md p-0 flex flex-col h-full bg-white border-l border-slate-200 shadow-2xl gap-0 z-50 overflow-hidden"
                >
                    {/* Sticky Header */}
                    <SheetHeader className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-200 flex flex-row items-center justify-between space-y-0 shrink-0">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <SlidersHorizontal className="w-4 h-4 text-rose-600" />
                            </div>
                            <div>
                                <SheetTitle className="text-base font-extrabold text-slate-950 tracking-tight">
                                    Filter Vacation Rentals
                                </SheetTitle>
                                <p className="text-[11px] font-semibold text-slate-500">
                                    {filteredRentals.length} of {rentals.length} properties available
                                </p>
                            </div>
                        </div>
                        <SheetClose className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer" aria-label="Close filters">
                            <X className="w-5 h-5" />
                        </SheetClose>
                    </SheetHeader>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto px-5 py-5 overscroll-contain">
                        <VacationRentalFiltersSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onResetFilters={handleResetFilters}
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
                                Show {filteredRentals.length} Properties
                            </button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
