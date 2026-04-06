"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Building2, MapPin, Grid, ListIcon, Search, X } from "lucide-react";
import HostelCard from "@/components/hostels/hostel-card";
import { TypeHostelResponse } from "@/types/hostel.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { toLocalMediaPath } from "@/lib/utils";

interface Props {
    readonly data: TypeHostelResponse;
}

const DEFAULT_FILTERS = {
    selectedCity: "All Cities",
    selectedArea: "All Areas",
    priceRange: "All Prices",
    sortBy: "Recommended",
    hostelType: "All Types",
    roomType: "All Room Types",
    sharingType: "All Sharing Types",
};

export default function TypeClient({ data }: Props) {
    const router = useRouter();

    // Current type slug derived from data
    const currentTypeSlug = data.type_slug;

    // Pending type slug (only navigates on Apply)
    const [pendingTypeSlug, setPendingTypeSlug] = useState(currentTypeSlug);

    // Applied filters (what actually drives the results)
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    // Pending/draft filters (what the user is currently selecting)
    const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

    const updatePending = useCallback((key: string, value: string) => {
        setPendingFilters((prev) => {
            const updated = { ...prev, [key]: value };
            // Reset area when city changes
            if (key === "selectedCity") {
                updated.selectedArea = "All Areas";
            }
            return updated;
        });
    }, []);

    const handleApplyFilters = useCallback(() => {
        // If type changed, navigate to the new type page
        if (pendingTypeSlug !== currentTypeSlug) {
            router.push(`/hostel-type/${pendingTypeSlug}`);
            return;
        }
        setAppliedFilters({ ...pendingFilters });
    }, [pendingFilters, pendingTypeSlug, currentTypeSlug, router]);

    const handleResetFilters = useCallback(() => {
        setPendingTypeSlug(currentTypeSlug);
        setPendingFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, [currentTypeSlug]);

    const HOSTEL_TYPES = [
        { value: "all", label: "All Types" },
        { value: "boys", label: "Boys Hostel" },
        { value: "girls", label: "Girls Hostel" },
        { value: "co_living", label: "Co-Living Hostel" },
        { value: "working_professional", label: "Working Professionals Hostel" },
        { value: "student", label: "Student Hostel" },
        { value: "luxury", label: "Luxury Hostel" },
        { value: "budget", label: "Budget Hostel" },
        { value: "pg", label: "PG Accommodation" },
    ];

    // Extract unique cities from results
    const cities = useMemo(() => {
        const allCities = data.results
            .map((hostel) => hostel.city_name)
            .filter(Boolean) as string[];
        return ["All Cities", ...Array.from(new Set(allCities)).sort()];
    }, [data.results]);

    // Extract unique areas from results, dependent on pending selected city
    const areas = useMemo(() => {
        let relevantHostels = data.results;
        if (pendingFilters.selectedCity !== "All Cities") {
            relevantHostels = relevantHostels.filter(h => h.city_name === pendingFilters.selectedCity);
        }
        const allAreas = relevantHostels
            .map((hostel) => hostel.area_name)
            .filter(Boolean) as string[];
        return ["All Areas", ...Array.from(new Set(allAreas)).sort()];
    }, [data.results, pendingFilters.selectedCity]);

    // Check if pending filters differ from applied filters
    const hasUnappliedChanges = useMemo(() => {
        return pendingTypeSlug !== currentTypeSlug || JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
    }, [pendingFilters, appliedFilters, pendingTypeSlug, currentTypeSlug]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        return [
            appliedFilters.selectedCity !== "All Cities",
            appliedFilters.selectedArea !== "All Areas",
            appliedFilters.roomType !== "All Room Types",
            appliedFilters.sharingType !== "All Sharing Types",
            appliedFilters.priceRange !== "All Prices",
            appliedFilters.sortBy !== "Recommended",
        ].filter(Boolean).length;
    }, [appliedFilters]);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([...data.results]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!searchQuery.trim() && appliedFilters.roomType === "All Room Types" && appliedFilters.sharingType === "All Sharing Types") {
            setSearchResults([...data.results]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const cityParam = appliedFilters.selectedCity !== "All Cities" ? `&city=${encodeURIComponent(appliedFilters.selectedCity)}` : "";
                const typeParam = `&type=${encodeURIComponent(currentTypeSlug)}`;
                const roomTypeParam = appliedFilters.roomType !== "All Room Types" ? `&room_type=${encodeURIComponent(appliedFilters.roomType)}` : "";
                const sharingParam = appliedFilters.sharingType !== "All Sharing Types" ? `&sharing=${encodeURIComponent(appliedFilters.sharingType)}` : "";
                
                const response = await fetch(`${baseUrl}/api/locations/inner-search/?q=${encodeURIComponent(searchQuery)}${cityParam}${typeParam}${roomTypeParam}${sharingParam}`);
                if (response.ok) {
                    const searchData = await response.json();
                    setSearchResults(searchData.results);
                }
            } catch (error) {
                console.error("Inner search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, data.results, appliedFilters.selectedCity, appliedFilters.roomType, appliedFilters.sharingType, currentTypeSlug]);

    // Filter and sort results using APPLIED filters and searchResults
    const filteredAndSortedResults = useMemo(() => {
        let resultsArr = [...searchResults];

        // Filter by City
        if (appliedFilters.selectedCity !== "All Cities") {
            resultsArr = resultsArr.filter((hostel) => hostel.city_name === appliedFilters.selectedCity);
        }

        // Filter by Area
        if (appliedFilters.selectedArea !== "All Areas") {
            resultsArr = resultsArr.filter((hostel) => hostel.area_name === appliedFilters.selectedArea);
        }

        // Filter by PriceRange
        if (appliedFilters.priceRange !== "All Prices") {
            resultsArr = resultsArr.filter((hostel) => {
                const price = hostel.final_price ?? (Number(hostel.price) || 0);
                if (appliedFilters.priceRange === "Under ₹5000") return price < 5000;
                if (appliedFilters.priceRange === "₹5000 - ₹10000") return price >= 5000 && price <= 10000;
                if (appliedFilters.priceRange === "Above ₹10000") return price > 10000;
                return true;
            });
        }

        // Categorize results for sorting and statistics (Match Purity)
        const categorized = resultsArr.map(hostel => {
            const hasRoomFilter = appliedFilters.roomType !== "All Room Types";
            const hasSharingFilter = appliedFilters.sharingType !== "All Sharing Types";
            
            const matchesRoom = !hasRoomFilter || 
                hostel.room_types?.some((r: any) => 
                    appliedFilters.roomType === "AC" ? r.room_category === "AC" : r.room_category === "NON_AC"
                );
            
            const matchesSharing = !hasSharingFilter ||
                hostel.room_types?.some((r: any) => Number(r.sharing_type) === Number(appliedFilters.sharingType));

            if (!matchesRoom || !matchesSharing) return { hostel, matchType: 'none' as const };

            // Determine Purity: Pure if ALL rooms match the filter
            let allRoomsMatch = true;
            if (hasRoomFilter) {
                const pureRoom = hostel.room_types?.every((r: any) => 
                    appliedFilters.roomType === "AC" ? r.room_category === "AC" : r.room_category === "NON_AC"
                );
                if (!pureRoom) allRoomsMatch = false;
            }
            if (hasSharingFilter) {
                const pureSharing = hostel.room_types?.every((r: any) => 
                    Number(r.sharing_type) === Number(appliedFilters.sharingType)
                );
                if (!pureSharing) allRoomsMatch = false;
            }

            return { hostel, matchType: allRoomsMatch ? ('pure' as const) : ('mixed' as const) };
        }).filter(item => item.matchType !== 'none');

        // Sorting
        categorized.sort((a, b) => {
            // First priority: Pure Match vs Mixed Match (only if filters are active)
            const isFiltering = appliedFilters.roomType !== "All Room Types" || appliedFilters.sharingType !== "All Sharing Types";
            if (isFiltering && a.matchType !== b.matchType) {
                return a.matchType === 'pure' ? -1 : 1;
            }

            // Second priority: Verified/Discounted status
            const getPriority = (h: any) => {
                if (h.is_verified && h.is_discounted) return 1;
                if (h.is_verified) return 2;
                if (h.is_discounted) return 3;
                return 4;
            };

            const priorityA = getPriority(a.hostel);
            const priorityB = getPriority(b.hostel);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            if (appliedFilters.sortBy === "Price: Low to High") {
                return (a.hostel.final_price ?? (Number(a.hostel.price) || 0)) - (b.hostel.final_price ?? (Number(b.hostel.price) || 0));
            } else if (appliedFilters.sortBy === "Price: High to Low") {
                return (b.hostel.final_price ?? (Number(b.hostel.price) || 0)) - (a.hostel.final_price ?? (Number(a.hostel.price) || 0));
            } else if (appliedFilters.sortBy === "Highest Rated") {
                return b.hostel.rating - a.hostel.rating;
            }
            return 0;
        });

        const finalResults = categorized.map(i => i.hostel);
        const pureCount = categorized.filter(i => i.matchType === 'pure').length;
        const mixedCount = categorized.filter(i => i.matchType === 'mixed').length;

        return { results: finalResults, pureCount, mixedCount };
    }, [searchResults, appliedFilters]);

    const totalPages = Math.ceil(filteredAndSortedResults.results.length / itemsPerPage);

    const paginatedResults = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedResults.results.slice(start, start + itemsPerPage);
    }, [filteredAndSortedResults.results, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [appliedFilters, searchQuery, currentTypeSlug]);

    return (
        <>
            <div className="mb-6 lg:mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 mb-2 uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            {data.type}
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                            Best {data.type}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Showing {filteredAndSortedResults.results.length} {filteredAndSortedResults.results.length === 1 ? 'hostel' : 'hostels'}
                            {appliedFilters.roomType !== "All Room Types" || appliedFilters.sharingType !== "All Sharing Types" ? (
                                <span className="text-teal-600 ml-1 font-semibold">
                                    ({filteredAndSortedResults.pureCount} only {
                                        appliedFilters.roomType !== "All Room Types" && appliedFilters.sharingType !== "All Sharing Types" 
                                        ? `${appliedFilters.roomType} ${appliedFilters.sharingType}-Sharing`
                                        : appliedFilters.roomType !== "All Room Types" 
                                        ? appliedFilters.roomType 
                                        : `${appliedFilters.sharingType}-Sharing`
                                    }, {filteredAndSortedResults.mixedCount} Mixed)
                                </span>
                            ) : null}
                            {appliedFilters.selectedCity !== "All Cities" && ` in ${appliedFilters.selectedCity}`}
                        </p>
                    </div>

                    <div className="flex-1 max-w-xl w-full">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none">
                                <Search size={22} />
                            </div>
                            <input
                                type="text"
                                placeholder={`Search in ${data.type}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-12 py-4 rounded-[1.25rem] border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none text-slate-900 font-medium placeholder:text-slate-400 transition-all"
                            />
                            {isSearching && (
                                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                                    <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                                </div>
                            )}
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Button - edge-to-edge sticky bar using negative margins */}
            <div className="lg:hidden sticky top-20 z-40 -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm mb-6 w-[100vw] sm:w-auto">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex justify-between gap-2 rounded-xl h-10 border-slate-200 shadow-none bg-white font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98]">
                            <span className="flex items-center gap-1.5">
                                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                                <span className="text-sm">Filters & Sort</span>
                            </span>
                            <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-lg text-[10px] uppercase border border-teal-100 tracking-wider">
                                Refine
                            </span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[88vh] rounded-t-[2rem] p-0 overflow-hidden flex flex-col border-none">
                        <SheetHeader className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5">
                            <div className="flex justify-between items-center">
                                <SheetTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                    <SlidersHorizontal className="w-5 h-5 text-teal-600" strokeWidth={2.5} />
                                    Search Filters
                                </SheetTitle>
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors bg-teal-50 px-3 py-1.5 rounded-lg"
                                >
                                    Reset
                                </button>
                            </div>
                        </SheetHeader>

                        <div className="overflow-y-auto flex-1 px-6 pb-28 pt-6 space-y-6">
                            {/* Hostel Type */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">Hostel Type</Label>
                                <Select value={pendingTypeSlug} onValueChange={setPendingTypeSlug}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {HOSTEL_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* City */}
                            {cities.length > 1 && (
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700 ml-0.5">City</Label>
                                    <Select value={pendingFilters.selectedCity} onValueChange={(v) => updatePending("selectedCity", v)}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Area */}
                            {areas.length > 1 && (
                                <div className="space-y-1.5 ">
                                    <Label className="text-sm font-bold text-slate-700 ml-0.5">Area</Label>
                                    <Select value={pendingFilters.selectedArea} onValueChange={(v) => updatePending("selectedArea", v)}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                {/* Room Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700 ml-0.5">Room Type</Label>
                                    <Select value={pendingFilters.roomType} onValueChange={(v) => updatePending("roomType", v)}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium text-xs sm:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Room Types">All Types</SelectItem>
                                            <SelectItem value="AC">AC</SelectItem>
                                            <SelectItem value="Non-AC">Non-AC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sharing */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700 ml-0.5">Sharing</Label>
                                    <Select value={pendingFilters.sharingType} onValueChange={(v) => updatePending("sharingType", v)}>
                                        <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium text-xs sm:text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Sharing Types">All</SelectItem>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4">4</SelectItem>
                                            <SelectItem value="5">5</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">Price Range</Label>
                                <Select value={pendingFilters.priceRange} onValueChange={(v) => updatePending("priceRange", v)}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Prices">All Prices</SelectItem>
                                        <SelectItem value="Under ₹5000">Under ₹5000</SelectItem>
                                        <SelectItem value="₹5000 - ₹10000">₹5000 - ₹10000</SelectItem>
                                        <SelectItem value="Above ₹10000">Above ₹10000</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort By */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">Sort By</Label>
                                <Select value={pendingFilters.sortBy} onValueChange={(v) => updatePending("sortBy", v)}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Recommended">Recommended</SelectItem>
                                        <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
                                        <SelectItem value="Price: High to Low">Price: High to Low</SelectItem>
                                        <SelectItem value="Highest Rated">Highest Rated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Sticky bottom buttons */}
                        <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
                            <button
                                onClick={handleResetFilters}
                                className="flex-1 h-12 rounded-xl text-lg font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Reset
                            </button>
                            <SheetClose asChild>
                                <Button
                                    onClick={handleApplyFilters}
                                    className="flex-[2] bg-teal-600 hover:bg-teal-700 text-white h-12 rounded-xl text-lg shadow-lg shadow-teal-600/10"
                                >
                                    Apply Filter
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid grid-cols-12 gap-6 lg:gap-8 w-full">
                {/* Listings Section (Left - 8 Cols) */}
                <div className="col-span-12 lg:col-span-8 order-2 lg:order-1 flex flex-col items-center lg:items-end">
                    {filteredAndSortedResults.results.length === 0 ? (
                        <div className="bg-white p-20 rounded-[22px] text-center border border-slate-100 shadow-sm w-full">
                            <h3 className="text-2xl font-bold text-slate-900">No hostels found</h3>
                            <p className="text-slate-500 mt-3">
                                We couldn&apos;t find any active hostels matching your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto lg:max-w-3xl lg:ml-auto lg:mr-0">
                            {paginatedResults.map((hostel) => (
                                <HostelCard
                                    key={hostel.id}
                                    id={String(hostel.id)}
                                    slug={hostel.slug}
                                    name={hostel.name}
                                    location={hostel.area_name ? `${hostel.area_name}, ${hostel.city_name}` : hostel.city_name}
                                    price={hostel.final_price ?? (Number(hostel.price) || 0)}
                                    originalPrice={hostel.is_discounted ? Number(hostel.price) || 0 : undefined}
                                    isDiscounted={!!hostel.is_discounted}
                                    discountPercentage={hostel.discount_percentage ? Number(hostel.discount_percentage) : undefined}
                                    rating={hostel.rating}
                                    reviewsCount={0}
                                    image={toLocalMediaPath(hostel.thumbnail)}
                                    gender={hostel.hostel_type || "coed"}
                                    features={[]}
                                    distance=""
                                    isFeatured={false}
                                    isVerified={!!hostel.is_verified}
                                    isApproved={!!hostel.is_approved}
                                    availableRooms={hostel.available_rooms}
                                />
                            ))}
                            {totalPages > 1 && (
                                <nav className="flex items-center justify-center gap-2 mt-10 mb-6 w-full" aria-label="Pagination">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1.5 mx-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page
                                                                ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20"
                                                                : "border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600"
                                                            }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            } else if (
                                                (page === currentPage - 2 && page > 1) ||
                                                (page === currentPage + 2 && page < totalPages)
                                            ) {
                                                return <span key={page} className="text-slate-400 font-bold px-1 select-none">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
                                    >
                                        Next
                                    </Button>
                                </nav>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters Sidebar (Right - 4 Cols) */}
                <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
                    <div className="hidden lg:block sticky top-[100px]">
                        <Card className="rounded-[22px] border border-slate-100 shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden">
                            <CardHeader className="bg-slate-50/50 px-6 py-5 border-b border-slate-100">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                                        Search Filters
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                {/* Hostel Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Hostel Type</Label>
                                    <Select value={pendingTypeSlug} onValueChange={setPendingTypeSlug}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {HOSTEL_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* City Filter */}
                                {cities.length > 1 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-bold text-slate-700">City</Label>
                                        <Select value={pendingFilters.selectedCity} onValueChange={(v) => updatePending("selectedCity", v)}>
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Area Filter */}
                                {areas.length > 1 && (
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-bold text-slate-700">Area</Label>
                                        <Select value={pendingFilters.selectedArea} onValueChange={(v) => updatePending("selectedArea", v)}>
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {areas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Room Type */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-bold text-slate-700">Room Type</Label>
                                        <Select value={pendingFilters.roomType} onValueChange={(v) => updatePending("roomType", v)}>
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium text-xs sm:text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All Room Types">All Types</SelectItem>
                                                <SelectItem value="AC">AC</SelectItem>
                                                <SelectItem value="Non-AC">Non-AC</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Sharing */}
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-bold text-slate-700">Sharing</Label>
                                        <Select value={pendingFilters.sharingType} onValueChange={(v) => updatePending("sharingType", v)}>
                                            <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium text-xs sm:text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All Sharing Types">All</SelectItem>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2</SelectItem>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="4">4</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Price Range</Label>
                                    <Select value={pendingFilters.priceRange} onValueChange={(v) => updatePending("priceRange", v)}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Prices">All Prices</SelectItem>
                                            <SelectItem value="Under ₹5000">Under ₹5000</SelectItem>
                                            <SelectItem value="₹5000 - ₹10000">₹5000 - ₹10000</SelectItem>
                                            <SelectItem value="Above ₹10000">Above ₹10000</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort By */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Sort By</Label>
                                    <Select value={pendingFilters.sortBy} onValueChange={(v) => updatePending("sortBy", v)}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Recommended">Recommended</SelectItem>
                                            <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
                                            <SelectItem value="Price: High to Low">Price: High to Low</SelectItem>
                                            <SelectItem value="Highest Rated">Highest Rated</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all font-medium"
                                        onClick={handleResetFilters}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        className="flex-[2] h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/10 transition-all active:scale-95"
                                        onClick={handleApplyFilters}
                                        disabled={!hasUnappliedChanges}
                                    >
                                        Apply Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
