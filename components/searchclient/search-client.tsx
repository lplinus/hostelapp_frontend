"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, SearchX, MapPin, Grid, List as ListIcon } from "lucide-react";
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
        setAppliedHostelType(smartDefaults.hostelType);
        setAppliedRoomType(smartDefaults.roomType);
        setAppliedSharingType(smartDefaults.sharingType);
        setAppliedPriceRange(smartDefaults.priceRange);
        setAppliedSortBy(smartDefaults.sortBy);

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

    const filteredAndSortedResults = useMemo(() => {
        let filtered = [...results];
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
    }, [results, appliedCity, appliedArea, appliedHostelType, appliedPriceRange, appliedSortBy]);

    const hasUnappliedChanges = pendingCity !== appliedCity || pendingArea !== appliedArea || pendingHostelType !== appliedHostelType || pendingRoomType !== appliedRoomType || pendingSharingType !== appliedSharingType || pendingPriceRange !== appliedPriceRange || pendingSortBy !== appliedSortBy;

    const [visibleCount, setVisibleCount] = useState<number>(6);
    const paginatedResults = useMemo(() => {
        return filteredAndSortedResults.slice(0, visibleCount);
    }, [filteredAndSortedResults, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const headingText = initialQuery ? `Hostels in ${initialQuery}` : "Available Hostels";

    return (
        <>
            <div className="mb-4 lg:mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 mb-2 uppercase tracking-wider">
                            <MapPin className="w-4 h-4" />
                            {appliedCity !== "All Cities" ? appliedCity : "Multiple Locations"}
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {headingText}
                        </h1>
                        <p className="text-slate-500 font-medium">
                            {data ? `${data.total} accommodations match your search` : "Find your perfect stay"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            <button className="p-2 text-slate-400 hover:text-teal-600 transition-colors"><Grid size={18} /></button>
                            <button className="p-2 bg-teal-50 text-teal-600 rounded-lg transition-colors shadow-sm"><ListIcon size={18} /></button>
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
                        <div className="bg-white p-20 rounded-[22px] text-center border border-slate-100 shadow-sm">
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

                            {visibleCount < filteredAndSortedResults.length && (
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        onClick={handleLoadMore}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 px-10 rounded-xl shadow-lg shadow-teal-600/10 active:scale-95 transition-all"
                                    >
                                        Load More Hostels
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
                    <div className={cn("hidden lg:block sticky top-[100px]")}>
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
                                            <option value="All Sharing Types">All Sharing</option>
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
