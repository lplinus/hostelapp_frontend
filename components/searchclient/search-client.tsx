"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, SearchX, MapPin, Grid, List as ListIcon, Search, X } from "lucide-react";
import HostelCard from "@/components/hostels/hostel-card";
import { SearchHostelResponse } from "@/types/hostel.types";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { toLocalMediaPath } from "@/lib/utils";

interface Props {
    readonly data: SearchHostelResponse | null;
    readonly initialQuery: string;
    readonly initialBudget: string;
    readonly initialGender: string;
}

export default function SearchClient({
    data,
    initialQuery,
    initialBudget,
    initialGender,
}: Props) {
    const results = data?.results ?? [];

    const smartDefaults = useMemo(() => {
        const defaults = {
            city: "All Cities",
            area: "All Areas",
            hostelType: "All Types",
            roomType: "All Room Types",
            sharingType: "All Sharing Types",
            priceRange: "All Prices",
            sortBy: "Recommended",
        };

        if (results.length === 0) return defaults;

        const uniqueCities = Array.from(new Set(results.map((h) => h.city_name).filter(Boolean)));
        if (uniqueCities.length === 1) defaults.city = uniqueCities[0] as string;

        const uniqueAreas = Array.from(new Set(results.map((h) => h.area_name).filter(Boolean) as string[]));
        if (uniqueAreas.length === 1) defaults.area = uniqueAreas[0];

        const uniqueTypes = Array.from(new Set(results.map((h) => h.hostel_type).filter(Boolean)));
        if (uniqueTypes.length === 1) defaults.hostelType = uniqueTypes[0] as string;

        if (initialQuery) {
            const q = initialQuery.toLowerCase();
            const matchedCity = uniqueCities.find((c) => c?.toLowerCase() === q);
            if (matchedCity) defaults.city = matchedCity;
            const matchedArea = uniqueAreas.find((a) => a.toLowerCase() === q);
            if (matchedArea) defaults.area = matchedArea;
        }

        return defaults;
    }, [results, initialQuery]);

    const [appliedCity, setAppliedCity] = useState<string>("All Cities");
    const [appliedArea, setAppliedArea] = useState<string>("All Areas");
    const [appliedPriceRange, setAppliedPriceRange] = useState<string>("All Prices");
    const [appliedSortBy, setAppliedSortBy] = useState<string>("Recommended");
    const [appliedHostelType, setAppliedHostelType] = useState<string>("All Types");
    const [appliedRoomType, setAppliedRoomType] = useState<string>("All Room Types");
    const [appliedSharingType, setAppliedSharingType] = useState<string>("All Sharing Types");

    const [pendingCity, setPendingCity] = useState<string>("All Cities");
    const [pendingArea, setPendingArea] = useState<string>("All Areas");
    const [pendingPriceRange, setPendingPriceRange] = useState<string>("All Prices");
    const [pendingSortBy, setPendingSortBy] = useState<string>("Recommended");
    const [pendingHostelType, setPendingHostelType] = useState<string>("All Types");
    const [pendingRoomType, setPendingRoomType] = useState<string>("All Room Types");
    const [pendingSharingType, setPendingSharingType] = useState<string>("All Sharing Types");

    useEffect(() => {
        setAppliedCity(smartDefaults.city);
        setAppliedArea(smartDefaults.area);
        setAppliedPriceRange(smartDefaults.priceRange);
        setAppliedSortBy(smartDefaults.sortBy);
        setAppliedHostelType(smartDefaults.hostelType);
        setAppliedRoomType(smartDefaults.roomType);
        setAppliedSharingType(smartDefaults.sharingType);

        setPendingCity(smartDefaults.city);
        setPendingArea(smartDefaults.area);
        setPendingHostelType(smartDefaults.hostelType);
        setPendingRoomType(smartDefaults.roomType);
        setPendingSharingType(smartDefaults.sharingType);
        setPendingPriceRange(smartDefaults.priceRange);
        setPendingSortBy(smartDefaults.sortBy);
    }, [smartDefaults]);

    const handleApplyFilters = useCallback(() => {
        setAppliedCity(pendingCity);
        setAppliedArea(pendingArea);
        setAppliedHostelType(pendingHostelType);
        setAppliedRoomType(pendingRoomType);
        setAppliedSharingType(pendingSharingType);
        setAppliedPriceRange(pendingPriceRange);
        setAppliedSortBy(pendingSortBy);
    }, [pendingCity, pendingArea, pendingHostelType, pendingRoomType, pendingSharingType, pendingPriceRange, pendingSortBy]);

    const handleResetFilters = useCallback(() => {
        setPendingCity(smartDefaults.city);
        setPendingArea(smartDefaults.area);
        setPendingPriceRange(smartDefaults.priceRange);
        setPendingSortBy(smartDefaults.sortBy);
        setPendingHostelType(smartDefaults.hostelType);
        setPendingRoomType(smartDefaults.roomType);
        setPendingSharingType(smartDefaults.sharingType);

        setAppliedCity(smartDefaults.city);
        setAppliedArea(smartDefaults.area);
        setAppliedPriceRange(smartDefaults.priceRange);
        setAppliedSortBy(smartDefaults.sortBy);
        setAppliedHostelType(smartDefaults.hostelType);
        setAppliedRoomType(smartDefaults.roomType);
        setAppliedSharingType(smartDefaults.sharingType);
    }, [smartDefaults]);

    const cities = useMemo(() => {
        const allCities = results.map((h) => h.city_name).filter(Boolean) as string[];
        return ["All Cities", ...Array.from(new Set(allCities)).sort((a, b) => a.localeCompare(b))];
    }, [results]);

    const areas = useMemo(() => {
        let filtered = results;
        if (pendingCity !== "All Cities") filtered = filtered.filter((h) => h.city_name === pendingCity);
        const allAreas = filtered.map((h) => h.area_name).filter(Boolean) as string[];
        return ["All Areas", ...Array.from(new Set(allAreas)).sort((a, b) => a.localeCompare(b))];
    }, [results, pendingCity]);

    const hostelTypes = useMemo(() => {
        const all = results.map((h) => h.hostel_type).filter(Boolean) as string[];
        return ["All Types", ...Array.from(new Set(all))];
    }, [results]);

    const handleCityChange = (value: string) => {
        setPendingCity(value);
        setPendingArea("All Areas");
    };

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([...results]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const params = new URLSearchParams();
                
                if (searchQuery.trim()) params.append("q", searchQuery);
                if (appliedCity !== "All Cities") params.append("city", appliedCity);
                if (appliedArea !== "All Areas") params.append("area", appliedArea);
                if (appliedHostelType !== "All Types") params.append("type", appliedHostelType);
                if (appliedRoomType !== "All Room Types") params.append("room_type", appliedRoomType);
                if (appliedSharingType !== "All Sharing Types") params.append("sharing", appliedSharingType);

                const response = await fetch(`${baseUrl}/api/locations/inner-search/?${params.toString()}`);
                if (response.ok) {
                    const searchData = await response.json();
                    setSearchResults(searchData.results || []);
                }
            } catch (error) {
                console.error("Inner search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, appliedCity, appliedArea, appliedHostelType, appliedRoomType, appliedSharingType]);

    const filteredAndSortedResults = useMemo(() => {
        let filtered = [...searchResults];
        if (appliedCity !== "All Cities") filtered = filtered.filter((h) => h.city_name === appliedCity);
        if (appliedArea !== "All Areas") filtered = filtered.filter((h) => h.area_name === appliedArea);
        if (appliedHostelType !== "All Types") filtered = filtered.filter((h) => h.hostel_type === appliedHostelType);
        if (appliedPriceRange !== "All Prices") {
            filtered = filtered.filter((hostel) => {
                const price = hostel.final_price ?? (Number(hostel.price) || 0);
                if (appliedPriceRange === "Under ₹5000") return price < 5000;
                if (appliedPriceRange === "₹5000 - ₹10000") return price >= 5000 && price <= 10000;
                if (appliedPriceRange === "Above ₹10000") return price > 10000;
                return true;
            });
        }
        filtered.sort((a, b) => {
            const getPriority = (h: any) => {
                if (h.is_verified && h.is_discounted) return 1;
                if (h.is_verified) return 2;
                if (h.is_discounted) return 3;
                return 4;
            };
            const priorityA = getPriority(a);
            const priorityB = getPriority(b);
            if (priorityA !== priorityB) return priorityA - priorityB;
            if (appliedSortBy === "Price: Low to High") return (a.final_price ?? (Number(a.price) || 0)) - (b.final_price ?? (Number(b.price) || 0));
            if (appliedSortBy === "Price: High to Low") return (b.final_price ?? (Number(b.price) || 0)) - (a.final_price ?? (Number(a.price) || 0));
            if (appliedSortBy === "Highest Rated") return (b.rating || 0) - (a.rating || 0);
            return 0;
        });
        return filtered;
    }, [searchResults, appliedCity, appliedArea, appliedHostelType, appliedRoomType, appliedSharingType, appliedPriceRange, appliedSortBy]);

    const totalPages = Math.ceil(filteredAndSortedResults.length / itemsPerPage);

    const paginatedResults = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedResults.slice(start, start + itemsPerPage);
    }, [filteredAndSortedResults, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [appliedCity, appliedArea, appliedHostelType, appliedPriceRange, appliedSortBy, searchQuery]);

    const hasUnappliedChanges = useMemo(() => {
        return pendingCity !== appliedCity || 
               pendingArea !== appliedArea || 
               pendingHostelType !== appliedHostelType || 
               pendingRoomType !== appliedRoomType || 
               pendingSharingType !== appliedSharingType || 
               pendingPriceRange !== appliedPriceRange || 
               pendingSortBy !== appliedSortBy;
    }, [pendingCity, appliedCity, pendingArea, appliedArea, pendingHostelType, appliedHostelType, pendingRoomType, appliedRoomType, pendingSharingType, appliedSharingType, pendingPriceRange, appliedPriceRange, pendingSortBy, appliedSortBy]);

    const headingText = initialQuery ? `Hostels in ${initialQuery}` : "Available Hostels";

    return (
        <>
            <div className="mb-6 lg:mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 mb-2 uppercase tracking-wider">
                            <MapPin className="w-4 h-4" />
                            {appliedCity !== "All Cities" ? appliedCity : "Multiple Locations"}
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {headingText}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            {data ? `${filteredAndSortedResults.length} accommodations match your search` : "Find your perfect stay"}
                        </p>
                    </div>

                    <div className="flex-1 max-w-xl w-full">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none">
                                <Search size={22} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, area or address..."
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
                            {/* City */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">City</Label>
                                <Select value={pendingCity} onValueChange={handleCityChange}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Area */}
                            <div className="space-y-1.5 ">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">Area</Label>
                                <Select value={pendingArea} onValueChange={setPendingArea}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {areas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Hostel Type */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-bold text-slate-700 ml-0.5">Hostel Type</Label>
                                <Select value={pendingHostelType} onValueChange={setPendingHostelType}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {hostelTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Room Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700 ml-0.5">Room Type</Label>
                                    <Select value={pendingRoomType} onValueChange={setPendingRoomType}>
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
                                    <Select value={pendingSharingType} onValueChange={setPendingSharingType}>
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
                                <Select value={pendingPriceRange} onValueChange={setPendingPriceRange}>
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
                                <Select value={pendingSortBy} onValueChange={setPendingSortBy}>
                                    <SelectTrigger className="w-full h-12 rounded-xl bg-slate-50 border-none font-medium">
                                        <SelectValue placeholder="Sort by" />
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

                        {/* Sticky Action Buttons */}
                        <div className="sticky bottom-0 bg-white border-t border-slate-100 p-6 flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-2xl font-bold border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </Button>
                            <SheetClose asChild>
                                <Button
                                    className="flex-[2] h-12 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-teal-600/10 transition-all active:scale-95"
                                    onClick={handleApplyFilters}
                                    disabled={!hasUnappliedChanges}
                                >
                                    Apply Filter
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <div className="grid grid-cols-12 gap-6 lg:gap-8 w-full">
                <div className="col-span-12 lg:col-span-8 order-2 lg:order-1 flex flex-col items-center lg:items-end">
                    {!data || filteredAndSortedResults.length === 0 ? (
                        <div className="bg-white p-20 rounded-[22px] text-center border border-slate-200/60 shadow-sm">
                            <SearchX className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-slate-900">No hostels match your filters</h3>
                            <p className="text-slate-500 mt-3 max-w-md mx-auto">
                                Try adjusting your search criteria or removing some filters to see more results.
                            </p>
                            <Button variant="outline" className="mt-8 rounded-xl h-12 px-8 font-bold border-slate-200" onClick={handleResetFilters}>
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto lg:max-w-3xl lg:ml-auto lg:mr-0 min-h-[600px]">
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
                                    rating={hostel.rating || 0}
                                    reviewsCount={0}
                                    image={toLocalMediaPath(hostel.thumbnail)}
                                    gender={hostel.hostel_type || "coed"}
                                    features={[]}
                                    distance=""
                                    isFeatured={false}
                                    isVerified={!!hostel.is_verified}
                                    isApproved={!!hostel.is_approved}
                                    layout="list"
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

                <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
                    <div className={cn("hidden lg:block sticky top-[100px]")}>
                        <Card className="rounded-[22px] border border-slate-200/60 shadow-[0_8px_40px_rgb(0,0,0,0.03)] overflow-hidden">
                            <CardHeader className="bg-slate-50/50 px-6 py-5 border-b border-slate-200/60">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                                        Search Filters
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-5">
                                {/* City */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">City</Label>
                                    <Select value={pendingCity} onValueChange={handleCityChange}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Area */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Area</Label>
                                    <Select value={pendingArea} onValueChange={setPendingArea}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => <SelectItem key={area} value={area}>{area}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Hostel Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Hostel Type</Label>
                                    <Select value={pendingHostelType} onValueChange={setPendingHostelType}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostelTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Room Type */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Room Type</Label>
                                    <Select value={pendingRoomType} onValueChange={setPendingRoomType}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Room Types">All Room Types</SelectItem>
                                            <SelectItem value="AC">AC</SelectItem>
                                            <SelectItem value="Non-AC">Non-AC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sharing */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Sharing</Label>
                                    <Select value={pendingSharingType} onValueChange={setPendingSharingType}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Sharing Types">All Sharing</SelectItem>
                                            <SelectItem value="1">Single Sharing</SelectItem>
                                            <SelectItem value="2">Double Sharing</SelectItem>
                                            <SelectItem value="3">Triple Sharing</SelectItem>
                                            <SelectItem value="4">Four Sharing</SelectItem>
                                            <SelectItem value="5">Five Sharing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Price */}
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-bold text-slate-700">Price</Label>
                                    <Select value={pendingPriceRange} onValueChange={setPendingPriceRange}>
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
                                    <Select value={pendingSortBy} onValueChange={setPendingSortBy}>
                                        <SelectTrigger className="w-full h-11 rounded-xl bg-white border-slate-200 font-medium font-bold text-slate-700">
                                            <SelectValue placeholder="Sort by" />
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
                                        className="flex-1 h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all"
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
