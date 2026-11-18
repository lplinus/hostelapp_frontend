"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import VacationRentalGrid from "./vacation-rental-grid";
import VacationRentalFiltersSidebar, { VacationRentalFilterState } from "./vacation-rental-filters-sidebar";
import VacationRentalAdBanner from "./vacanational_addbanner/vacation-rental-ad-banner";
import type { VacationRental } from "@/types/vacationrental.types";
import { getVacationRentals } from "@/services/vacanatinalrentalservices/vacationrental.service";
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
    const [searchInput, setSearchInput] = useState(filters.searchQuery);
    const [backendRentals, setBackendRentals] = useState<VacationRental[] | null>(null);
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
        const timer = setTimeout(async () => {
            try {
                const params: Record<string, string | number | boolean | undefined> = {};
                if (filters.searchQuery.trim()) {
                    params.search = filters.searchQuery.trim();
                }
                const activeCategory = activeTab !== "all" ? activeTab : "";
                const selectedCats = filters.categories.length > 0 ? filters.categories.join(",") : activeCategory;
                if (selectedCats) {
                    params.category = selectedCats;
                }
                if (filters.maxPrice < 35000) {
                    params.max_price = filters.maxPrice;
                }
                if (filters.minBedrooms > 0) {
                    params.min_bedrooms = filters.minBedrooms;
                }
                if (filters.instantBookOnly) {
                    params.instant_book = true;
                }
                if (filters.petsAllowedOnly) {
                    params.allows_pets = true;
                }
                if (filters.superhostOnly) {
                    params.is_superhost = true;
                }
                if (filters.selectedAmenities.length > 0) {
                    params.amenities = filters.selectedAmenities.join(",");
                }

                const res = await getVacationRentals(params);
                if (Array.isArray(res)) {
                    setBackendRentals(res);
                }
            } catch (err) {
                console.error("Backend filtering request failed, using client fallback:", err);
            } finally {
                setIsFiltering(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, activeTab]);

    // Dynamic Filter Engine (operates on backend results or initial rentals fallback)
    const baseRentals = backendRentals ?? rentals;
    const filteredRentals = useMemo(() => {
        return baseRentals.filter((rental) => {
            // 1. Search Query
            if (!backendRentals && filters.searchQuery.trim()) {
                const stopWords = new Set(["vacation", "rentals", "rental", "in", "near", "at", "for", "with", "best", "top", "stay", "stays"]);
                const tokens = filters.searchQuery
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, " ")
                    .split(/\s+/)
                    .filter((t) => t.length > 1 && !stopWords.has(t));

                const searchableText = `${rental.title} ${rental.area_name || ""} ${rental.city_name || ""} ${rental.tagline || ""} ${rental.address || ""}`.toLowerCase();
                if (tokens.length > 0) {
                    const matchesAny = tokens.some((t) => searchableText.includes(t));
                    if (!matchesAny) return false;
                } else {
                    const q = filters.searchQuery.toLowerCase();
                    if (!searchableText.includes(q)) return false;
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
    }, [baseRentals, filters, activeTab]);

    // Top 4 Sponsored Vacation Rentals (dynamically loaded & location-aware)
    const [sponsoredRentals, setSponsoredRentals] = useState<VacationRental[]>([]);

    const handleSponsoredRentalsLoaded = useCallback((campaigns: any[]) => {
        const top4 = (campaigns || []).slice(0, 4);
        const mapped: VacationRental[] = [];

        for (const c of top4) {
            const existing = baseRentals.find(
                (r) => String(r.id) === String(c.vacation_rental) || (c.target_property_slug && r.slug === c.target_property_slug)
            );
            if (existing) {
                mapped.push({
                    ...existing,
                    is_sponsored: true,
                    campaign_id: c.id,
                });
            } else if (c.target_property_title && c.target_property_slug) {
                mapped.push({
                    id: String(c.vacation_rental || c.id),
                    title: c.target_property_title,
                    slug: c.target_property_slug,
                    city_name: c.target_property_city || "Destination",
                    address: c.target_property_address || c.target_property_city || "",
                    price_per_night: String(c.target_property_price || "0"),
                    rating_avg: String(c.target_property_rating || "5.0"),
                    category: "villa",
                    category_display: "Luxury Villa",
                    images: c.property_image_url ? [{ id: 1, image: c.property_image_url, is_primary: true }] : [],
                    is_sponsored: true,
                    campaign_id: c.id,
                    is_active: true,
                    is_featured: true,
                    is_verified: true,
                    is_superhost: true,
                    bedrooms: 2,
                    bathrooms: 2,
                    max_guests: 4,
                    instant_bookable: true,
                    allows_pets: true,
                    cancellation_policy: "flexible",
                    check_in_time: "15:00",
                    check_out_time: "11:00",
                    rating_count: 18,
                });
            }
        }
        setSponsoredRentals(mapped);
    }, [baseRentals]);

    // Combine Top 4 Sponsored Rentals at the beginning with non-duplicate organic listings
    const finalRentals = useMemo(() => {
        if (!sponsoredRentals.length) return filteredRentals;
        const sponsoredIds = new Set(sponsoredRentals.map((s) => String(s.id)));
        const nonDuplicateFiltered = filteredRentals.filter((r) => !sponsoredIds.has(String(r.id)));
        return [...sponsoredRentals, ...nonDuplicateFiltered];
    }, [sponsoredRentals, filteredRentals]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.categories.length > 0) count += filters.categories.length;
        if (filters.maxPrice < 35000) count += 1;
        if (filters.minBedrooms > 0) count += 1;
        if (filters.instantBookOnly) count += 1;
        if (filters.petsAllowedOnly) count += 1;
        if (filters.superhostOnly) count += 1;
        if (filters.selectedAmenities.length > 0) count += filters.selectedAmenities.length;
        if (filters.searchQuery.trim()) count += 1;
        return count;
    }, [filters]);

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        setActiveTab("all");
        setBackendRentals(null);
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

                    {/* Integrated Quick Search Bar - Crisp rectangular modern design */}
                    <div className="max-w-2xl mx-auto pt-3">
                        <div className="relative bg-white rounded-md shadow-xl p-1.5 flex items-center gap-2 border border-slate-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                            <div className="pl-3 text-slate-400 flex items-center">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by destination (Goa, Udaipur, Mumbai...), villa name or area..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        setFilters((prev) => ({ ...prev, searchQuery: searchInput.trim() }));
                                    }
                                }}
                                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent pr-2"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput("");
                                        setFilters((prev) => ({ ...prev, searchQuery: "" }));
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
                                >
                                    <X size={15} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setFilters((prev) => ({ ...prev, searchQuery: searchInput.trim() }));
                                }}
                                className="px-5 py-2.5 rounded bg-[#1E1B4B] hover:bg-[#312E81] text-white text-xs sm:text-sm font-semibold transition-colors shrink-0 shadow-sm"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* DYNAMIC TOP ROTATING AD BANNER (Location-Aware) */}
            <VacationRentalAdBanner
                activeCity={filters.searchQuery}
                onSponsoredLoaded={handleSponsoredRentalsLoaded}
            />

            {/* 2. CATEGORY PILLS BAR + STICKY MOBILE FILTER (Sticky at Top) */}
            <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between gap-2.5 py-2.5 sm:py-3">
                        {/* Mobile Sticky Filter Button */}
                        <button
                            type="button"
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="lg:hidden shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1E1B4B] text-white shadow-xs hover:bg-[#312E81] active:scale-95 transition-all cursor-pointer"
                        >
                            <SlidersHorizontal size={13} className="text-rose-300" />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        <div className="h-5 w-px bg-slate-200 lg:hidden shrink-0" />

                        {/* Category Tabs */}
                        <div className="flex-1 min-w-0 flex items-center justify-start md:justify-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
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
            </div>

            {/* 3. MAIN CONTENT: GRID + RIGHT-SIDE SIDEBAR */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
                <div className="flex items-start gap-8">
                    {/* Results Grid (Left Column - Flexible) */}
                    <div className="flex-1 min-w-0">
                        <VacationRentalGrid
                            rentals={finalRentals}
                            isFiltering={isFiltering}
                            onResetFilters={handleResetFilters}
                        />
                    </div>

                    {/* Desktop Sidebar (Right Column - 280px, Sticky & Self-Contained) */}
                    <div className="hidden lg:block w-[280px] shrink-0 sticky top-32 self-start">
                        <VacationRentalFiltersSidebar
                            filters={filters}
                            onFilterChange={setFilters}
                            onResetFilters={handleResetFilters}
                            totalCount={rentals.length}
                            filteredCount={finalRentals.length}
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
                                    {finalRentals.length} of {rentals.length} properties available
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
                            totalCount={rentals.length}
                            filteredCount={finalRentals.length}
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
                                Show {finalRentals.length} Properties
                            </button>
                        </SheetClose>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
