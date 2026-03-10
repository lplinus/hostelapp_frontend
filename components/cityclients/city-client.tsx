"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import HostelCard from "@/components/hostels/hostel-card";
import { CityHostelResponse } from "@/types/hostel.types";
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

/** Strip backend host so images go through Next.js /media/* rewrite */
function toLocalMediaPath(url: string | null): string | null {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        return parsed.pathname;
    } catch {
        return url;
    }
}

interface Props {
    readonly data: CityHostelResponse;
}

const DEFAULT_FILTERS = {
    selectedArea: "All Areas",
    priceRange: "All Prices",
    sortBy: "Recommended",
    hostelType: "All Types",
    roomType: "All Room Types",
    sharingType: "All Sharing Types",
};

export default function CityClient({ data }: Props) {
    const router = useRouter();

    // Current city slug derived from data
    const currentCitySlug = data.city === "All Cities" ? "all" : data.city.toLowerCase();

    // Pending city slug (only navigates on Apply)
    const [pendingCitySlug, setPendingCitySlug] = useState(currentCitySlug);

    // Applied filters (what actually drives the results)
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    // Pending/draft filters (what the user is currently selecting)
    const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

    const updatePending = useCallback((key: string, value: string) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        // If city changed, navigate to the new city page
        if (pendingCitySlug !== currentCitySlug) {
            router.push(`/city/${pendingCitySlug}`);
            return;
        }
        setAppliedFilters({ ...pendingFilters });
    }, [pendingFilters, pendingCitySlug, currentCitySlug, router]);

    const handleResetFilters = useCallback(() => {
        setPendingCitySlug(currentCitySlug);
        setPendingFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, [currentCitySlug]);

    const CITIES = [
        { value: "all", label: "All Cities" },
        { value: "hyderabad", label: "Hyderabad" },
        { value: "bangalore", label: "Bangalore" },
        { value: "pune", label: "Pune" },
        { value: "mumbai", label: "Mumbai" },
        { value: "delhi", label: "Delhi" },
        { value: "chennai", label: "Chennai" },
        { value: "kolkata", label: "Kolkata" },
        { value: "ahmedabad", label: "Ahmedabad" },
    ];

    // Extract unique areas from results
    const areas = useMemo(() => {
        const allAreas = data.results
            .map((hostel) => hostel.area_name)
            .filter(Boolean) as string[];
        return ["All Areas", ...Array.from(new Set(allAreas)).sort()];
    }, [data.results]);

    // Extract unique hostel types from results
    const hostelTypes = useMemo(() => {
        const allTypes = data.results
            .map((hostel) => hostel.hostel_type)
            .filter(Boolean) as string[];
        return ["All Types", ...Array.from(new Set(allTypes))];
    }, [data.results]);

    // Check if pending filters differ from applied filters
    const hasUnappliedChanges = useMemo(() => {
        return pendingCitySlug !== currentCitySlug || JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
    }, [pendingFilters, appliedFilters, pendingCitySlug, currentCitySlug]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        return [
            appliedFilters.selectedArea !== "All Areas",
            appliedFilters.hostelType !== "All Types",
            appliedFilters.roomType !== "All Room Types",
            appliedFilters.sharingType !== "All Sharing Types",
            appliedFilters.priceRange !== "All Prices",
            appliedFilters.sortBy !== "Recommended",
        ].filter(Boolean).length;
    }, [appliedFilters]);

    // Filter and sort results using APPLIED filters
    const filteredAndSortedResults = useMemo(() => {
        let results = [...data.results];

        // Filter by Area
        if (appliedFilters.selectedArea !== "All Areas") {
            results = results.filter((hostel) => hostel.area_name === appliedFilters.selectedArea);
        }

        // Filter by Hostel Type
        if (appliedFilters.hostelType !== "All Types") {
            results = results.filter((hostel) => hostel.hostel_type === appliedFilters.hostelType);
        }

        // Filter by Room Type
        if (appliedFilters.roomType !== "All Room Types") {
            // Note: Currently backend doesn't send roomType within CityHostelSerializer, 
            // but keeping this frontend structure ready when base data includes it
        }

        // Filter by Sharing Type
        if (appliedFilters.sharingType !== "All Sharing Types") {
            // Same as roomType
        }

        // Filter by PriceRange
        if (appliedFilters.priceRange !== "All Prices") {
            results = results.filter((hostel) => {
                const price = hostel.final_price ?? (Number(hostel.price) || 0);
                if (appliedFilters.priceRange === "Under ₹5000") return price < 5000;
                if (appliedFilters.priceRange === "₹5000 - ₹10000") return price >= 5000 && price <= 10000;
                if (appliedFilters.priceRange === "Above ₹10000") return price > 10000;
                return true;
            });
        }

        // Sort
        results.sort((a: any, b: any) => {
            // Primary sort: Priority based on Verified and Discounted status
            const getPriority = (h: any) => {
                if (h.is_verified && h.is_discounted) return 1;
                if (h.is_verified) return 2;
                if (h.is_discounted) return 3;
                return 4;
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // Secondary sort: User selected sort
            if (appliedFilters.sortBy === "Price: Low to High") {
                return (a.final_price ?? (Number(a.price) || 0)) - (b.final_price ?? (Number(b.price) || 0));
            } else if (appliedFilters.sortBy === "Price: High to Low") {
                return (b.final_price ?? (Number(b.price) || 0)) - (a.final_price ?? (Number(a.price) || 0));
            } else if (appliedFilters.sortBy === "Highest Rated") {
                return b.rating - a.rating;
            }
            return 0;
        });

        return results;
    }, [data.results, appliedFilters]);

    return (
        <>
            {/* Page heading - not sticky */}
            <div className="mb-4 lg:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                        Hostels in {data.city}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Showing {filteredAndSortedResults.length} {filteredAndSortedResults.length === 1 ? 'hostel' : 'hostels'}
                        {appliedFilters.selectedArea !== "All Areas" && ` in ${appliedFilters.selectedArea}`}
                    </p>
                </div>
            </div>

            {/* Mobile Filter Button - sticky, opens a bottom sheet */}
            <div className="lg:hidden sticky top-20 z-40 -mx-6 px-6 py-3 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-6 sm:-mx-8 sm:px-8">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex justify-between gap-2 rounded-xl h-12">
                            <span className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" />
                                Filters
                            </span>
                            {activeFilterCount > 0 && (
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{activeFilterCount}</span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] p-0 overflow-hidden flex flex-col">
                        <SheetHeader className="sticky top-0 z-10 bg-white border-b px-6 py-4">
                            <div className="flex justify-between items-center">
                                <SheetTitle className="flex items-center gap-2 text-xl">
                                    <SlidersHorizontal className="w-5 h-5 text-slate-700" strokeWidth={2.5} />
                                    Filters
                                </SheetTitle>
                                <button
                                    onClick={handleResetFilters}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </SheetHeader>

                        <div className="overflow-y-auto flex-1 px-6 pb-28 space-y-6 pt-4">
                            {/* City */}
                            <div className="space-y-2">
                                <label htmlFor="city-redirect-mob" className="text-sm font-medium text-gray-700">City</label>
                                <Select
                                    value={pendingCitySlug}
                                    onValueChange={(value) => setPendingCitySlug(value)}
                                >
                                    <SelectTrigger id="city-redirect-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue placeholder="City" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CITIES.map((city) => (
                                            <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Area */}
                            {areas.length > 1 && (
                                <div className="space-y-2">
                                    <label htmlFor="area-filter-mob" className="text-sm font-medium text-gray-700">Area</label>
                                    <Select value={pendingFilters.selectedArea} onValueChange={(v) => updatePending("selectedArea", v)}>
                                        <SelectTrigger id="area-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                            <SelectValue placeholder="Area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {areas.map((area) => (
                                                <SelectItem key={area} value={area}>{area}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Hostel Type */}
                            {hostelTypes.length > 1 && (
                                <div className="space-y-2">
                                    <label htmlFor="type-filter-mob" className="text-sm font-medium text-gray-700">Hostel Type</label>
                                    <Select value={pendingFilters.hostelType} onValueChange={(v) => updatePending("hostelType", v)}>
                                        <SelectTrigger id="type-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                            <SelectValue placeholder="Hostel Type" />
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
                            )}

                            {/* Room Type */}
                            <div className="space-y-2">
                                <label htmlFor="room-type-filter-mob" className="text-sm font-medium text-gray-700">Room Type</label>
                                <Select value={pendingFilters.roomType} onValueChange={(v) => updatePending("roomType", v)}>
                                    <SelectTrigger id="room-type-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue placeholder="Room Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Room Types">All Room Types</SelectItem>
                                        <SelectItem value="AC">AC</SelectItem>
                                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sharing Type */}
                            <div className="space-y-2">
                                <label htmlFor="sharing-filter-mob" className="text-sm font-medium text-gray-700">Sharing</label>
                                <Select value={pendingFilters.sharingType} onValueChange={(v) => updatePending("sharingType", v)}>
                                    <SelectTrigger id="sharing-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue placeholder="Sharing Type" />
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

                            {/* Price Range */}
                            <div className="space-y-2">
                                <label htmlFor="price-filter-mob" className="text-sm font-medium text-gray-700">Price</label>
                                <Select value={pendingFilters.priceRange} onValueChange={(v) => updatePending("priceRange", v)}>
                                    <SelectTrigger id="price-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue placeholder="Price Range" />
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
                            <div className="space-y-2">
                                <label htmlFor="sort-filter-mob" className="text-sm font-medium text-gray-700">Sort By</label>
                                <Select value={pendingFilters.sortBy} onValueChange={(v) => updatePending("sortBy", v)}>
                                    <SelectTrigger id="sort-filter-mob" className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue placeholder="Sort By" />
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
                                className="flex-1 h-12 rounded-xl text-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Reset
                            </button>
                            <SheetClose asChild>
                                <Button
                                    onClick={handleApplyFilters}
                                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white h-12 rounded-xl text-lg"
                                >
                                    Apply Filter
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Filter bar - hidden on mobile, visible on lg+ */}
            <div className="hidden lg:block mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* City Redirect Dropdown */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="city-redirect" className="text-sm font-medium text-gray-700 mb-1">City</label>
                        <select
                            id="city-redirect"
                            value={pendingCitySlug}
                            onChange={(e) => {
                                setPendingCitySlug(e.target.value);
                            }}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            {CITIES.map((city) => (
                                <option key={city.value} value={city.value}>{city.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Area Dropdown */}
                    {areas.length > 1 && (
                        <div className="flex flex-col min-w-[160px] flex-1">
                            <label htmlFor="area-filter" className="text-sm font-medium text-gray-700 mb-1">Area</label>
                            <select
                                id="area-filter"
                                value={pendingFilters.selectedArea}
                                onChange={(e) => updatePending("selectedArea", e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {areas.map((area) => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Hostel Type Dropdown */}
                    {hostelTypes.length > 1 && (
                        <div className="flex flex-col min-w-[160px] flex-1">
                            <label htmlFor="type-filter" className="text-sm font-medium text-gray-700 mb-1">Hostel Type</label>
                            <select
                                id="type-filter"
                                value={pendingFilters.hostelType}
                                onChange={(e) => updatePending("hostelType", e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {hostelTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Room Type Dropdown */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="room-type-filter" className="text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <select
                            id="room-type-filter"
                            value={pendingFilters.roomType}
                            onChange={(e) => updatePending("roomType", e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Room Types">All Room Types</option>
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                        </select>
                    </div>

                    {/* Sharing Type Dropdown */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="sharing-filter" className="text-sm font-medium text-gray-700 mb-1">Sharing</label>
                        <select
                            id="sharing-filter"
                            value={pendingFilters.sharingType}
                            onChange={(e) => updatePending("sharingType", e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Sharing Types">All Sharing</option>
                            <option value="1">Single Sharing</option>
                            <option value="2">Double Sharing</option>
                            <option value="3">Triple Sharing</option>
                            <option value="4">Four Sharing</option>
                            <option value="5">Five Sharing</option>
                        </select>
                    </div>

                    {/* Price Range Dropdown */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="price-filter" className="text-sm font-medium text-gray-700 mb-1">Price</label>
                        <select
                            id="price-filter"
                            value={pendingFilters.priceRange}
                            onChange={(e) => updatePending("priceRange", e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Prices">All Prices</option>
                            <option value="Under ₹5000">Under ₹5000</option>
                            <option value="₹5000 - ₹10000">₹5000 - ₹10000</option>
                            <option value="Above ₹10000">Above ₹10000</option>
                        </select>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            id="sort-filter"
                            value={pendingFilters.sortBy}
                            onChange={(e) => updatePending("sortBy", e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="Recommended">Recommended</option>
                            <option value="Price: Low to High">Price: Low to High</option>
                            <option value="Price: High to Low">Price: High to Low</option>
                            <option value="Highest Rated">Highest Rated</option>
                        </select>
                    </div>
                </div>

                {/* Apply Filter & Reset Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={handleResetFilters}
                        className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 hover:bg-gray-50 px-5 py-2.5 rounded-lg"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApplyFilters}
                        disabled={!hasUnappliedChanges}
                        className={`text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors ${hasUnappliedChanges
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            : "bg-blue-100 text-blue-400 cursor-not-allowed"
                            }`}
                    >
                        Apply Filter
                    </button>
                </div>
            </div>

            {filteredAndSortedResults.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl text-center border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">No hostels found</h3>
                    <p className="text-gray-500 mt-2">
                        We couldn&apos;t find any active hostels matching your filters.
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedResults.map((hostel) => (
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
                        />
                    ))}
                </div>
            )}
        </>
    );
}
