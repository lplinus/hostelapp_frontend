"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
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

    // ── Derive smart defaults from search results ───────────────────────
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

        // If all results share the same city, auto-select it
        const uniqueCities = Array.from(
            new Set(results.map((h) => h.city_name).filter(Boolean))
        );
        if (uniqueCities.length === 1) {
            defaults.city = uniqueCities[0];
        }

        // If all results share the same area, auto-select it
        const uniqueAreas = Array.from(
            new Set(results.map((h) => h.area_name).filter(Boolean) as string[])
        );
        if (uniqueAreas.length === 1) {
            defaults.area = uniqueAreas[0];
        }

        // If all results share the same hostel type, auto-select it
        const uniqueTypes = Array.from(
            new Set(results.map((h) => h.hostel_type).filter(Boolean))
        );
        if (uniqueTypes.length === 1) {
            defaults.hostelType = uniqueTypes[0];
        }

        // Match search query to city/area for smarter pre-selection
        if (initialQuery) {
            const q = initialQuery.toLowerCase();
            // Check if query matches a city name
            const matchedCity = uniqueCities.find(
                (c) => c.toLowerCase() === q
            );
            if (matchedCity) defaults.city = matchedCity;

            // Check if query matches an area name
            const matchedArea = uniqueAreas.find(
                (a) => a.toLowerCase() === q
            );
            if (matchedArea) defaults.area = matchedArea;
        }

        return defaults;
    }, [results, initialQuery]);

    // ── Applied (active) filter state ───────────────────────────────────
    const [appliedCity, setAppliedCity] = useState<string>("All Cities");
    const [appliedArea, setAppliedArea] = useState<string>("All Areas");
    const [appliedPriceRange, setAppliedPriceRange] = useState<string>("All Prices");
    const [appliedSortBy, setAppliedSortBy] = useState<string>("Recommended");
    const [appliedHostelType, setAppliedHostelType] = useState<string>("All Types");
    const [appliedRoomType, setAppliedRoomType] = useState<string>("All Room Types");
    const [appliedSharingType, setAppliedSharingType] = useState<string>("All Sharing Types");

    // ── Pending (draft) filter state — what user sees in dropdowns ──────
    const [pendingCity, setPendingCity] = useState<string>("All Cities");
    const [pendingArea, setPendingArea] = useState<string>("All Areas");
    const [pendingPriceRange, setPendingPriceRange] = useState<string>("All Prices");
    const [pendingSortBy, setPendingSortBy] = useState<string>("Recommended");
    const [pendingHostelType, setPendingHostelType] = useState<string>("All Types");
    const [pendingRoomType, setPendingRoomType] = useState<string>("All Room Types");
    const [pendingSharingType, setPendingSharingType] = useState<string>("All Sharing Types");

    // ── On mount / when results change, set smart defaults ──────────────
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

    // ── Apply filters (copy pending → applied) ─────────────────────────
    const handleApplyFilters = useCallback(() => {
        setAppliedCity(pendingCity);
        setAppliedArea(pendingArea);
        setAppliedHostelType(pendingHostelType);
        setAppliedRoomType(pendingRoomType);
        setAppliedSharingType(pendingSharingType);
        setAppliedPriceRange(pendingPriceRange);
        setAppliedSortBy(pendingSortBy);
    }, [pendingCity, pendingArea, pendingHostelType, pendingRoomType, pendingSharingType, pendingPriceRange, pendingSortBy]);

    // ── Reset filters to smart defaults ─────────────────────────────────
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

    // ── Extract unique cities from results ──────────────────────────────
    const cities = useMemo(() => {
        const allCities = results
            .map((h) => h.city_name)
            .filter(Boolean) as string[];
        return ["All Cities", ...Array.from(new Set(allCities)).sort((a, b) => a.localeCompare(b))];
    }, [results]);

    // ── Extract unique areas (scoped to pending city for dropdown) ──────
    const areas = useMemo(() => {
        let filtered = results;
        if (pendingCity !== "All Cities") {
            filtered = filtered.filter((h) => h.city_name === pendingCity);
        }
        const allAreas = filtered
            .map((h) => h.area_name)
            .filter(Boolean) as string[];
        return ["All Areas", ...Array.from(new Set(allAreas)).sort((a, b) => a.localeCompare(b))];
    }, [results, pendingCity]);

    // ── Extract unique hostel types ─────────────────────────────────────
    const hostelTypes = useMemo(() => {
        const all = results
            .map((h) => h.hostel_type)
            .filter(Boolean) as string[];
        return ["All Types", ...Array.from(new Set(all))];
    }, [results]);

    // ── Handle city change (reset area when city changes) ──────────────
    const handleCityChange = (value: string) => {
        setPendingCity(value);
        setPendingArea("All Areas");
    };

    // ── Filter and sort using APPLIED values ────────────────────────────
    const filteredAndSortedResults = useMemo(() => {
        let filtered = [...results];

        // City filter
        if (appliedCity !== "All Cities") {
            filtered = filtered.filter((h) => h.city_name === appliedCity);
        }
        // Area filter
        if (appliedArea !== "All Areas") {
            filtered = filtered.filter((h) => h.area_name === appliedArea);
        }
        // Hostel type filter
        if (appliedHostelType !== "All Types") {
            filtered = filtered.filter((h) => h.hostel_type === appliedHostelType);
        }
        // Price range filter
        if (appliedPriceRange !== "All Prices") {
            filtered = filtered.filter((hostel) => {
                const price = hostel.final_price ?? (Number(hostel.price) || 0);
                if (appliedPriceRange === "Under ₹5000") return price < 5000;
                if (appliedPriceRange === "₹5000 - ₹10000") return price >= 5000 && price <= 10000;
                if (appliedPriceRange === "Above ₹10000") return price > 10000;
                return true;
            });
        }

        // Sort
        if (appliedSortBy === "Price: Low to High") {
            filtered.sort(
                (a, b) =>
                    (a.final_price ?? (Number(a.price) || 0)) -
                    (b.final_price ?? (Number(b.price) || 0))
            );
        } else if (appliedSortBy === "Price: High to Low") {
            filtered.sort(
                (a, b) =>
                    (b.final_price ?? (Number(b.price) || 0)) -
                    (a.final_price ?? (Number(a.price) || 0))
            );
        } else if (appliedSortBy === "Highest Rated") {
            filtered.sort((a, b) => b.rating - a.rating);
        }

        return filtered;
    }, [results, appliedCity, appliedArea, appliedHostelType, appliedPriceRange, appliedSortBy]);

    // ── Check if pending differs from applied ───────────────────────────
    const hasUnappliedChanges =
        pendingCity !== appliedCity ||
        pendingArea !== appliedArea ||
        pendingHostelType !== appliedHostelType ||
        pendingRoomType !== appliedRoomType ||
        pendingSharingType !== appliedSharingType ||
        pendingPriceRange !== appliedPriceRange ||
        pendingSortBy !== appliedSortBy;

    // ── Build heading text ──────────────────────────────────────────────
    const headingText = initialQuery
        ? `Search results for "${initialQuery}"`
        : "Search Results";
    const subText = [
        initialBudget ? `Budget: Below ₹${Number(initialBudget).toLocaleString()}` : "",
        initialGender ? `Type: ${initialGender}` : "",
    ]
        .filter(Boolean)
        .join(" • ");

    return (
        <>
            {/* Page heading */}
            <div className="mb-4 lg:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {headingText}
                    </h1>
                    {subText && (
                        <p className="text-sm text-gray-500 mt-1">{subText}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-0.5">
                        {data
                            ? `${data.total} hostel${data.total !== 1 ? "s" : ""} found`
                            : "No results"}
                    </p>
                </div>
            </div>

            {/* ═══════════ Mobile Filter Sheet ═══════════ */}
            <div className="lg:hidden mb-4 sticky top-0 z-30 bg-gray-50 py-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full flex items-center gap-2 justify-center bg-white shadow-sm"
                        >
                            <SlidersHorizontal className="w-4 h-4" />
                            Filters & Sort
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-2xl">
                        <SheetHeader>
                            <SheetTitle>Filters & Sort</SheetTitle>
                        </SheetHeader>
                        <div className="grid grid-cols-1 gap-4 mt-4 px-1">
                            {/* City Filter */}
                            {cities.length > 1 && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">City</label>
                                    <Select value={pendingCity} onValueChange={handleCityChange}>
                                        <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((city) => (
                                                <SelectItem key={city} value={city}>{city}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Area Filter */}
                            {areas.length > 1 && (
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Area</label>
                                    <Select value={pendingArea} onValueChange={setPendingArea}>
                                        <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                            <SelectValue />
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
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Hostel Type</label>
                                    <Select value={pendingHostelType} onValueChange={setPendingHostelType}>
                                        <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {hostelTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type === "All Types"
                                                        ? type
                                                        : type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Room Type */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Room Type</label>
                                <Select value={pendingRoomType} onValueChange={setPendingRoomType}>
                                    <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Room Types">All Room Types</SelectItem>
                                        <SelectItem value="AC">AC</SelectItem>
                                        <SelectItem value="Non-AC">Non-AC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sharing Type */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Sharing</label>
                                <Select value={pendingSharingType} onValueChange={setPendingSharingType}>
                                    <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Sharing Types">All Sharing Types</SelectItem>
                                        <SelectItem value="Single">Single</SelectItem>
                                        <SelectItem value="Double">Double</SelectItem>
                                        <SelectItem value="Triple">Triple</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price Range */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Price Range</label>
                                <Select value={pendingPriceRange} onValueChange={setPendingPriceRange}>
                                    <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
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
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                <Select value={pendingSortBy} onValueChange={setPendingSortBy}>
                                    <SelectTrigger className="w-full bg-white h-[42px] border-gray-300 focus:ring-2 focus:ring-blue-600 rounded-md shadow-sm">
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

                            {/* Apply / Reset */}
                            <div className="flex gap-3 mt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleResetFilters}
                                >
                                    Reset
                                </Button>
                                <SheetClose asChild>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={handleApplyFilters}
                                    >
                                        Apply Filters
                                    </Button>
                                </SheetClose>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* ═══════════ Desktop Filter bar ═══════════ */}
            <div className="hidden lg:block mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    {/* City */}
                    {cities.length > 1 && (
                        <div className="flex flex-col min-w-[160px] flex-1">
                            <label htmlFor="city-filter" className="text-sm font-medium text-gray-700 mb-1">City</label>
                            <select
                                id="city-filter"
                                value={pendingCity}
                                onChange={(e) => handleCityChange(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {cities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Area */}
                    {areas.length > 1 && (
                        <div className="flex flex-col min-w-[160px] flex-1">
                            <label htmlFor="area-filter" className="text-sm font-medium text-gray-700 mb-1">Area</label>
                            <select
                                id="area-filter"
                                value={pendingArea}
                                onChange={(e) => setPendingArea(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {areas.map((area) => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Hostel Type */}
                    {hostelTypes.length > 1 && (
                        <div className="flex flex-col min-w-[160px] flex-1">
                            <label htmlFor="type-filter" className="text-sm font-medium text-gray-700 mb-1">Hostel Type</label>
                            <select
                                id="type-filter"
                                value={pendingHostelType}
                                onChange={(e) => setPendingHostelType(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                                {hostelTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === "All Types"
                                            ? type
                                            : type.charAt(0).toUpperCase() + type.slice(1).replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Room Type */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="room-type-filter" className="text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <select
                            id="room-type-filter"
                            value={pendingRoomType}
                            onChange={(e) => setPendingRoomType(e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Room Types">All Room Types</option>
                            <option value="AC">AC</option>
                            <option value="Non-AC">Non-AC</option>
                        </select>
                    </div>

                    {/* Sharing */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="sharing-filter" className="text-sm font-medium text-gray-700 mb-1">Sharing</label>
                        <select
                            id="sharing-filter"
                            value={pendingSharingType}
                            onChange={(e) => setPendingSharingType(e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Sharing Types">All Sharing Types</option>
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Triple">Triple</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="flex flex-col min-w-[160px] flex-1">
                        <label htmlFor="price-filter" className="text-sm font-medium text-gray-700 mb-1">Price Range</label>
                        <select
                            id="price-filter"
                            value={pendingPriceRange}
                            onChange={(e) => setPendingPriceRange(e.target.value)}
                            className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                            <option value="All Prices">All Prices</option>
                            <option value="Under ₹5000">Under ₹5000</option>
                            <option value="₹5000 - ₹10000">₹5000 - ₹10000</option>
                            <option value="Above ₹10000">Above ₹10000</option>
                        </select>
                    </div>
                </div>

                {/* Sort By — full width row */}
                <div className="flex flex-col mt-4">
                    <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 mb-1">Sort By</label>
                    <select
                        id="sort-filter"
                        value={pendingSortBy}
                        onChange={(e) => setPendingSortBy(e.target.value)}
                        className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm bg-white shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <option value="Recommended">Recommended</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                        <option value="Highest Rated">Highest Rated</option>
                    </select>
                </div>

                {/* Apply Filters + Reset */}
                <div className="flex justify-end items-center gap-3 mt-3">
                    <button
                        onClick={handleResetFilters}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
                    >
                        Reset Filters
                    </button>
                    <button
                        onClick={handleApplyFilters}
                        disabled={!hasUnappliedChanges}
                        className={`text-sm font-semibold px-6 py-2 rounded-lg transition-colors ${hasUnappliedChanges
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* ═══════════ Results Grid ═══════════ */}
            {!data || filteredAndSortedResults.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl text-center border border-gray-200">
                    <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hostels found</h3>
                    <p className="text-gray-500 mt-2">
                        {initialQuery
                            ? `We couldn't find any hostels matching "${initialQuery}". Try a different search.`
                            : "We couldn't find any hostels matching your filters."}
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
                            location={
                                hostel.area_name
                                    ? `${hostel.area_name}, ${hostel.city_name}`
                                    : hostel.city_name
                            }
                            price={hostel.final_price ?? (Number(hostel.price) || 0)}
                            originalPrice={hostel.is_discounted ? Number(hostel.price) || 0 : undefined}
                            isDiscounted={!!hostel.is_discounted}
                            discountPercentage={
                                hostel.discount_percentage
                                    ? Number(hostel.discount_percentage)
                                    : undefined
                            }
                            rating={hostel.rating}
                            reviewsCount={0}
                            image={toLocalMediaPath(hostel.thumbnail)}
                            gender={hostel.hostel_type || "coed"}
                            features={[]}
                            distance=""
                            isFeatured={false}
                            isVerified={!!hostel.is_verified}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
