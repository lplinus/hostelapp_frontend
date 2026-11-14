"use client";

import { useState, useMemo } from "react";
import HotelCard from "./hotel-card";
import { Hotel } from "@/types/hotel.types";
import { ChevronDown, ArrowUpDown, Hotel as HotelIcon, RotateCcw, Loader2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelGridProps {
    readonly hotels: readonly Hotel[];
    readonly onResetFilters?: () => void;
    readonly isFiltering?: boolean;
    readonly onOpenFilter?: () => void;
}

export type SortOption = "recommended" | "price_asc" | "price_desc" | "stars_desc" | "name_asc";

export default function HotelGrid({
    hotels,
    onResetFilters,
    isFiltering = false,
    onOpenFilter,
}: HotelGridProps) {
    const [sortBy, setSortBy] = useState<SortOption>("recommended");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isSortLoading, setIsSortLoading] = useState(false);
    const itemsPerPage = 9;

    const handleSortChange = (value: SortOption) => {
        setSortBy(value);
        setCurrentPage(1);
        setIsSortLoading(true);
        setTimeout(() => setIsSortLoading(false), 250);
    };

    const showLoader = isFiltering || isSortLoading;

    // Sorting logic
    const sortedHotels = useMemo(() => {
        const list = [...hotels];
        switch (sortBy) {
            case "price_asc":
                return list.sort((a, b) => {
                    const priceA = parseFloat(a.starting_price_per_night || "0");
                    const priceB = parseFloat(b.starting_price_per_night || "0");
                    return priceA - priceB;
                });
            case "price_desc":
                return list.sort((a, b) => {
                    const priceA = parseFloat(a.starting_price_per_night || "0");
                    const priceB = parseFloat(b.starting_price_per_night || "0");
                    return priceB - priceA;
                });
            case "stars_desc":
                return list.sort((a, b) => (b.star_rating || 0) - (a.star_rating || 0));
            case "name_asc":
                return list.sort((a, b) => a.name.localeCompare(b.name));
            case "recommended":
            default:
                return list.sort((a, b) => {
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return (b.star_rating || 0) - (a.star_rating || 0);
                });
        }
    }, [hotels, sortBy]);

    // Pagination
    const totalPages = Math.ceil(sortedHotels.length / itemsPerPage);
    const paginatedHotels = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedHotels.slice(start, start + itemsPerPage);
    }, [sortedHotels, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 180, behavior: "smooth" });
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Header Controls: Count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                        Available Hotels & Luxury Suites
                    </h2>
                    {showLoader ? (
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold mt-0.5">
                            <Loader2 size={13} className="animate-spin text-[#312E81]" />
                            <span>Updating available hotels...</span>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            Showing <strong className="text-slate-800">{sortedHotels.length}</strong> verified properties with daily tariffs
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {onOpenFilter && (
                        <button
                            type="button"
                            onClick={onOpenFilter}
                            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <SlidersHorizontal size={13} className="text-[#312E81]" />
                            <span>Filters</span>
                        </button>
                    )}
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value as SortOption)}
                            className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 pr-8 shadow-xs focus:outline-none focus:ring-1 focus:ring-[#312E81] appearance-none cursor-pointer"
                        >
                            <option value="recommended">Recommended & Featured</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="stars_desc">Star Rating: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Hotel Cards List */}
            <div className="flex flex-col gap-5 w-full min-h-[400px]">
                {showLoader ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] min-h-[380px] gap-3">
                        <div className="w-9 h-9 rounded-full border-2 border-slate-200 border-t-[#312E81] animate-spin" />
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-800">
                                Updating hotels & luxury suites...
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Filtering properties to match your selected criteria
                            </p>
                        </div>
                    </div>
                ) : paginatedHotels.length > 0 ? (
                    paginatedHotels.map((hotel) => (
                        <HotelCard key={hotel.id} hotel={hotel} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#312E81] mb-3">
                            <HotelIcon size={24} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No hotels match your filters</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                            Try adjusting your price range, star rating, or search term to discover available suites.
                        </p>
                        {onResetFilters && (
                            <button
                                onClick={onResetFilters}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#312E81] text-white text-xs font-semibold shadow-xs hover:bg-[#1E1B4B] transition-colors"
                            >
                                <RotateCcw size={13} />
                                Reset All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-200/80">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border-slate-200 text-slate-700 disabled:opacity-50 h-9 px-3 text-xs font-semibold"
                    >
                        Previous
                    </Button>

                    <div className="flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-none ${
                                    currentPage === page
                                        ? "bg-[#312E81] text-white"
                                        : "border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl border-slate-200 text-slate-700 disabled:opacity-50 h-9 px-3 text-xs font-semibold"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
