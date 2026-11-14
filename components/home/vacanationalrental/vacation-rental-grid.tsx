"use client";

import { useState, useMemo } from "react";
import VacationRentalCard from "./vacation-rental-card";
import type { VacationRental } from "@/types/vacationrental.types";
import {
    Palmtree,
    ArrowUpDown,
    SlidersHorizontal,
    SearchX,
    Sparkles,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface VacationRentalGridProps {
    readonly rentals: readonly VacationRental[];
    readonly onOpenMobileFilter?: () => void;
    readonly onResetFilters?: () => void;
    readonly isFiltering?: boolean;
}

export default function VacationRentalGrid({
    rentals,
    onOpenMobileFilter,
    onResetFilters,
    isFiltering = false,
}: VacationRentalGridProps) {
    const [sortBy, setSortBy] = useState<string>("featured");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isSortLoading, setIsSortLoading] = useState(false);
    const itemsPerPage = 9;

    const handleSortChange = (value: string) => {
        setSortBy(value);
        setCurrentPage(1);
        setIsSortLoading(true);
        setTimeout(() => setIsSortLoading(false), 250);
    };

    const showLoader = isFiltering || isSortLoading;

    // Sorting logic
    const sortedRentals = useMemo(() => {
        return [...rentals].sort((a, b) => {
            if (sortBy === "price_asc") {
                return parseFloat(a.price_per_night || "0") - parseFloat(b.price_per_night || "0");
            }
            if (sortBy === "price_desc") {
                return parseFloat(b.price_per_night || "0") - parseFloat(a.price_per_night || "0");
            }
            if (sortBy === "rating") {
                return parseFloat(b.rating_avg || "0") - parseFloat(a.rating_avg || "0");
            }
            // Default: featured first, then rating
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return parseFloat(b.rating_avg || "0") - parseFloat(a.rating_avg || "0");
        });
    }, [rentals, sortBy]);

    const totalPages = Math.ceil(sortedRentals.length / itemsPerPage);

    const paginatedRentals = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedRentals.slice(start, start + itemsPerPage);
    }, [sortedRentals, currentPage, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    return (
        <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {showLoader ? (
                        <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-800">
                            <Loader2 size={15} className="animate-spin text-[#312E81]" />
                            <span>Updating stays...</span>
                        </div>
                    ) : (
                        <>
                            <span className="text-sm font-bold text-slate-900">
                                {rentals.length} Properties Found
                            </span>
                            <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                            <span className="text-xs text-slate-500 hidden sm:inline">
                                Verified private villas, beach retreats &amp; cabins
                            </span>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-2 ml-auto">
                    {/* Mobile Filter Button */}
                    {onOpenMobileFilter && (
                        <button
                            onClick={onOpenMobileFilter}
                            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <SlidersHorizontal size={13} />
                            Filters
                        </button>
                    )}

                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <ArrowUpDown size={13} className="text-slate-400 hidden sm:inline" />
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-[170px] h-8 text-xs font-semibold bg-white border-slate-200">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="text-xs">
                                <SelectItem value="featured">Featured Stays</SelectItem>
                                <SelectItem value="rating">Top Rated</SelectItem>
                                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Grid or Empty State or Loader */}
            {showLoader ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 py-20 px-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center gap-3 min-h-[380px]">
                    <div className="w-9 h-9 rounded-full border-2 border-slate-200 border-t-[#312E81] animate-spin" />
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800">
                            Updating vacation rentals...
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Filtering properties to match your criteria
                        </p>
                    </div>
                </div>
            ) : sortedRentals.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                        <SearchX size={26} />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                        <h3 className="text-base font-bold text-slate-900">
                            No Vacation Rentals Found
                        </h3>
                        <p className="text-xs text-slate-500">
                            We couldn't find any stays matching your selected filters. Try broadening your budget, removing filters, or searching another city.
                        </p>
                    </div>
                    {onResetFilters && (
                        <button
                            onClick={onResetFilters}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E1B4B] hover:bg-[#312E81] text-white shadow-xs transition-colors"
                        >
                            Reset All Filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch auto-rows-fr">
                    {paginatedRentals.map((rental) => (
                        <VacationRentalCard key={rental.id} rental={rental} />
                    ))}
                </div>
            )}

            {/* Pagination (9 items per page) */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200/80">
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
                                        ? "bg-[#1E1B4B] text-white"
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
